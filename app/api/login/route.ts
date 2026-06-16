import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';
import { hashPassword, isPasswordHashed, verifyPassword } from '@/lib/password';

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOCKOUT_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, requireAdmin } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`${clientIp}:${username}`)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const db = await getBillingDb();
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const storedPassword = String(user.password || '');
    const valid = await verifyPassword(password, storedPassword);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    if (!isPasswordHashed(storedPassword)) {
      await db.collection('users').updateOne(
        { username },
        { $set: { password: await hashPassword(password) } }
      );
    }

    if (requireAdmin && String(user.role).toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const sessionUser = {
      username: user.username,
      role: user.role || 'cashier',
      full_name: user.full_name || user.username,
      counter_no: user.counter_no || 'Counter 1',
    };

    const response = NextResponse.json({ success: true, user: sessionUser }, { status: 200 });

    const sessionCookie = await createSessionCookie(sessionUser);
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'System Error: පද්ධතියට සම්බන්ධ වීමේ දෝෂයක් ඇත. කරුණාකර Administrator අමතන්න.' },
      { status: 500 }
    );
  }
}
