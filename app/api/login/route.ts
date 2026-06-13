import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieOptions } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password, requireAdmin } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = await getBillingDb();
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check password (in production, use bcrypt or similar)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    if (requireAdmin && String(user.role).toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        user: {
          username: user.username,
          role: user.role || 'cashier',
          full_name: user.full_name || user.username,
          counter_no: user.counter_no || 'Counter 1',
        },
      },
      { status: 200 }
    );

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set('username', user.username, cookieOpts);
    response.cookies.set('role', user.role || 'cashier', cookieOpts);
    response.cookies.set('full_name', user.full_name || user.username, cookieOpts);
    response.cookies.set('counter_no', user.counter_no || 'Counter 1', cookieOpts);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'System Error: පද්ධතියට සම්බන්ධ වීමේ දෝෂයක් ඇත. කරුණාකර Administrator අමතන්න.' },
      { status: 500 }
    );
  }
}
