import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await getBillingDb();
    const users = await db.collection('users').find({}).toArray();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { username, full_name, password, role, counter_no } = body;

    if (!username || !full_name || !password || !role || !counter_no) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const db = await getBillingDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'මෙම Username එක දැනටමත් පද්ධතියේ ඇත!' }, { status: 409 });
    }

    await usersCollection.insertOne({
      username,
      full_name,
      password,
      role,
      counter_no,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Unable to create user.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const old_username = String(body.old_username || '');
    const new_username = String(body.username || '');
    if (!old_username || !new_username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const db = await getBillingDb();
    await db.collection('users').updateOne(
      { username: old_username },
      {
        $set: {
          username: new_username,
          full_name: String(body.full_name || ''),
          password: String(body.password || ''),
          role: String(body.role || 'Cashier'),
          counter_no: String(body.counter_no || 'Counter 1'),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json({ error: 'Unable to update user.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    if (!username || username.toLowerCase() === 'admin') {
      return NextResponse.json({ error: 'Cannot delete this user' }, { status: 400 });
    }

    const db = await getBillingDb();
    await db.collection('users').deleteOne({ username });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json({ error: 'Unable to delete user.' }, { status: 500 });
  }
}
