import 'server-only';
import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { schema, seedStatements } from './database-schema';

function databaseConfig() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    if (!/^(libsql|https):\/\//.test(url)) {
      throw new Error('TURSO_DATABASE_URL must use libsql:// or https://.');
    }
    if (!process.env.TURSO_AUTH_TOKEN) {
      throw new Error('Set TURSO_AUTH_TOKEN for the hosted database.');
    }
    return { url, authToken: process.env.TURSO_AUTH_TOKEN };
  }

  if (process.env.VERCEL === '1') {
    throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel Environment Variables.');
  }
  const directory = resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || 'data');
  mkdirSync(directory, { recursive: true });
  return { url: pathToFileURL(resolve(directory, 'thepviet.sqlite')).href, timeout: 5000 };
}

// Keep SQL callers independent of the local/remote driver and return plain RSC-safe rows.
function queries(executor, schedule) {
  return {
    batch(statements) {
      return schedule(() => {
        return executor.batch(statements);
      });
    },
    prepare(sql) {
      return {
        async all(...args) {
          const result = await schedule(() => {
            return executor.execute({ sql, args });
          });
          return result.rows.map((row) => {
            return Object.fromEntries(
              result.columns.map((column) => {
                return [column, row[column]];
              }),
            );
          });
        },
        async get(...args) {
          const rows = await this.all(...args);
          return rows[0];
        },
        async run(...args) {
          const result = await schedule(() => {
            return executor.execute({ sql, args });
          });
          return { changes: result.rowsAffected, lastInsertRowid: result.lastInsertRowid };
        },
      };
    },
  };
}

async function openDatabase() {
  const client = createClient(databaseConfig());
  try {
    if (client.protocol === 'file') {
      await client.execute('PRAGMA journal_mode=WAL');
    }
    await client.batch(schema, 'write');
    // Serialize first-time initialization across cold starts; a failed seed rolls back fully.
    const transaction = await client.transaction('write');
    try {
      const settings = await transaction.execute('SELECT id FROM settings WHERE id=1');
      if (!settings.rows.length) {
        await transaction.batch(seedStatements());
      }
      await transaction.commit();
    } catch (error) {
      if (!transaction.closed) {
        await transaction.rollback();
      }
      throw error;
    } finally {
      transaction.close();
    }
  } catch (error) {
    client.close();
    throw error;
  }

  // Local SQLite calls are synchronous underneath. Queue whole transactions so another
  // request cannot block the event loop waiting for a lock held by this same process.
  let pending = Promise.resolve();
  function schedule(operation) {
    if (client.protocol !== 'file') {
      return operation();
    }
    const result = pending.then(operation);
    pending = result.catch(() => {
      // The next queued operation must still run after a failed request.
    });
    return result;
  }
  return {
    ...queries(client, schedule),
    transaction(operation) {
      return schedule(async () => {
        const transaction = await client.transaction('write');
        try {
          const result = await operation(
            queries(transaction, (query) => {
              return query();
            }),
          );
          await transaction.commit();
          return result;
        } catch (error) {
          if (!transaction.closed) {
            await transaction.rollback();
          }
          throw error;
        } finally {
          transaction.close();
        }
      });
    },
  };
}

export function getDb() {
  const key = Symbol.for('thepviet.database.async');
  if (!globalThis[key]) {
    globalThis[key] = openDatabase().catch((error) => {
      delete globalThis[key];
      throw error;
    });
  }
  return globalThis[key];
}
