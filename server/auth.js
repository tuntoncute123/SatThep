import 'server-only';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { getDb } from './db';
import { HttpError } from './errors';
export const sessionCookie = 'tv_session';
export const sessionMaxAge = 8 * 60 * 60;
export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.VERCEL === '1' || process.env.COOKIE_SECURE === '1',
    maxAge: sessionMaxAge,
    path: '/',
  };
}
function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
export function adminUser() {
  return {
    name: 'Quản trị viên',
    email: process.env.ADMIN_EMAIL || 'admin@thepviet.vn',
  };
}
export async function requireAuth(request) {
  const token = request.cookies.get(sessionCookie)?.value;
  if (!token) {
    throw new HttpError(401, 'Vui lòng đăng nhập để tiếp tục.');
  }
  const db = await getDb();
  const session = await db
    .prepare('SELECT token FROM sessions WHERE token=? AND expires>?')
    .get(hashToken(token), Date.now());
  if (!session) {
    throw new HttpError(401, 'Vui lòng đăng nhập để tiếp tục.');
  }
  return adminUser();
}
export async function login(body) {
  const password =
    process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'ThepViet@2026');
  if (password.length < 12) {
    throw new Error('Set ADMIN_PASSWORD to at least 12 characters.');
  }
  const salt = randomBytes(16);
  const valid =
    typeof body?.password === 'string' &&
    body.password.length <= 256 &&
    timingSafeEqual(scryptSync(body.password, salt, 64), scryptSync(password, salt, 64));
  if (body?.email !== adminUser().email || !valid) {
    throw new HttpError(401, 'Email hoặc mật khẩu không chính xác.');
  }
  const db = await getDb();
  const token = randomBytes(32).toString('hex');
  await db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
  await db
    .prepare('INSERT INTO sessions VALUES (?,?)')
    .run(hashToken(token), Date.now() + sessionMaxAge * 1000);
  return token;
}
export async function logout(request) {
  const token = request.cookies.get(sessionCookie)?.value;
  if (token) {
    const db = await getDb();
    await db.prepare('DELETE FROM sessions WHERE token=?').run(hashToken(token));
  }
}
