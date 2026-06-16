import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getBillingDb();
    const dbUser = await db.collection('users').findOne(
      { username: user.username },
      { projection: { username: 1, full_name: 1, counter_no: 1, role: 1 } }
    );
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      username: dbUser.username,
      full_name: dbUser.full_name,
      counter_no: dbUser.counter_no,
      role: dbUser.role,
    });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const newUsername = String(body.username || '').trim();
    const full_name = String(body.full_name || body.username || '').trim();
    const counter_no = String(body.counter_no || user.counter_no);

    if (!newUsername) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const db = await getBillingDb();
    await db.collection('users').updateOne(
      { username: user.username },
      { $set: { username: newUsername, full_name, counter_no } }
    );

    const response = NextResponse.json({ success: true, username: newUsername, full_name, counter_no });

    const sessionCookie = await createSessionCookie({
      username: newUsername,
      role: user.role,
      full_name,
      counter_no,
    });
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

    return response;
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
