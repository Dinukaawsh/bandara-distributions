import { cookies } from 'next/headers';
import { getBillingDb } from '@/lib/db';
import { getSessionCookieName, signToken, verifyToken } from '@/lib/jwt';

export type SessionUser = {
  username: string;
  role: string;
  full_name: string;
  counter_no: string;
  availability_status: 'available' | 'busy';
  lang: 'si' | 'en';
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24,
  path: '/',
};

export function getSessionCookieOptions() {
  return COOKIE_OPTIONS;
}

export async function createSessionCookie(user: {
  username: string;
  role: string;
  full_name: string;
  counter_no: string;
}) {
  const token = await signToken({
    sub: user.username,
    role: user.role || 'cashier',
    full_name: user.full_name || user.username,
    counter_no: user.counter_no || 'Counter 1',
  });
  return { name: getSessionCookieName(), value: token, options: COOKIE_OPTIONS };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (!token) {
    return getLegacySessionUser(cookieStore);
  }

  const payload = await verifyToken(token);
  if (!payload) return null;

  const db = await getBillingDb();
  const dbUser = await db.collection('users').findOne(
    { username: payload.sub },
    { projection: { username: 1, role: 1, full_name: 1, counter_no: 1, availability_status: 1 } }
  );

  if (!dbUser) return null;

  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'si';
  const status = dbUser.availability_status === 'busy' ? 'busy' : 'available';

  return {
    username: dbUser.username,
    role: String(dbUser.role || 'cashier'),
    full_name: String(dbUser.full_name || dbUser.username),
    counter_no: String(dbUser.counter_no || 'Counter 1'),
    availability_status: status,
    lang,
  };
}

/** @deprecated Legacy cookie session — removed after migration */
async function getLegacySessionUser(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<SessionUser | null> {
  const username = cookieStore.get('username')?.value;
  if (!username) return null;

  const db = await getBillingDb();
  const dbUser = await db.collection('users').findOne({ username });
  if (!dbUser) return null;

  return {
    username: dbUser.username,
    role: String(dbUser.role || cookieStore.get('role')?.value || 'cashier'),
    full_name: String(dbUser.full_name || username),
    counter_no: String(dbUser.counter_no || cookieStore.get('counter_no')?.value || 'Counter 1'),
    availability_status: dbUser.availability_status === 'busy' ? 'busy' : 'available',
    lang: cookieStore.get('lang')?.value === 'en' ? 'en' : 'si',
  };
}

export function isAdmin(role: string) {
  return role.toLowerCase() === 'admin';
}

export function clearAllAuthCookies(response: { cookies: { set: (name: string, value: string, options?: object) => void } }) {
  const expired = { maxAge: 0, path: '/' };
  const names = [getSessionCookieName(), 'username', 'role', 'full_name', 'counter_no'];
  for (const name of names) {
    response.cookies.set(name, '', expired);
  }
}
