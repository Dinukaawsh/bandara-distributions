import { NextRequest, NextResponse } from 'next/server';
import { getBillingDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const setupSecret = process.env.SETUP_SECRET?.trim();
    if (!setupSecret) {
      return NextResponse.json(
        { error: 'Setup is disabled. Add SETUP_SECRET to your .env file first.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, full_name, password, counter_no } = body;

    if (!username || !full_name || !password || !counter_no) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const db = await getBillingDb();
    const users = db.collection('users');

    const userCount = await users.countDocuments();
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Setup already completed. Use /login to sign in.' },
        { status: 403 }
      );
    }

    const existing = await users.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: 'Admin user already exists.' }, { status: 409 });
    }

    await users.insertOne({
      username,
      full_name,
      password,
      role: 'Admin',
      counter_no,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Admin setup error:', error);
    const message = error instanceof Error ? error.message : 'Unable to create admin user.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
