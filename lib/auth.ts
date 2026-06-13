import { cookies } from 'next/headers';

export type SessionUser = {
  username: string;
  role: string;
  full_name: string;
  counter_no: string;
  lang: 'si' | 'en';
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24,
};

export function getSessionCookieOptions() {
  return COOKIE_OPTIONS;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value;
  if (!username) return null;

  return {
    username,
    role: cookieStore.get('role')?.value || 'cashier',
    full_name: cookieStore.get('full_name')?.value || username,
    counter_no: cookieStore.get('counter_no')?.value || 'Counter 1',
    lang: cookieStore.get('lang')?.value === 'en' ? 'en' : 'si',
  };
}

export function isAdmin(role: string) {
  return role.toLowerCase() === 'admin';
}
