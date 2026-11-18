import 'server-only';
import { z } from 'zod';
import { getDb } from './db';
import { short, phone } from './schemas';
const settingsSchema = z.object({
  name: short,
  tagline: short,
  phone,
  email: z.email(),
  address: short,
  hours: short,
  intro: z.string().min(10).max(1000),
  years: z.string().min(1).max(15),
  projects: z.string().min(1).max(15),
  partners: z.string().min(1).max(15),
  capacity: z.string().min(1).max(15),
});
export async function updateSettings(body) {
  const data = settingsSchema.parse(body);
  const db = await getDb();
  await db.prepare('UPDATE settings SET data=? WHERE id=1').run(JSON.stringify(data));
  return data;
}
