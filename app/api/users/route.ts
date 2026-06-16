import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { validateUserAssignment } from '@/lib/user-validation';

const USER_PROJECTION = {
  projection: { password: 0 },
};

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await getBillingDb();
    const users = await db.collection('users').find({}, USER_PROJECTION).toArray();
    return NextResponse.json({
      users: users.map((u) => ({
        username: u.username,
        full_name: u.full_name,
        role: u.role,
        counter_no: u.counter_no,
        availability_status: u.availability_status === 'busy' ? 'busy' : 'available',
      })),
    }, { status: 200 });
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

    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 });
    }

    const db = await getBillingDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: '??? Username ?? ??????? ???????? ??!' }, { status: 409 });
    }

    const allUsers = await usersCollection.find({}).toArray();
    const assignmentError = validateUserAssignment(role, counter_no, allUsers);
    if (assignmentError) {
      return NextResponse.json({ error: assignmentError }, { status: 409 });
    }

    const isCashier = String(role).toLowerCase() !== 'admin';

    await usersCollection.insertOne({
      username,
      full_name,
      password: await hashPassword(password),
      role,
      counter_no,
      availability_status: isCashier ? 'available' : undefined,
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

    const role = String(body.role || 'Cashier');
    const counter_no = String(body.counter_no || 'Counter 1');

    const db = await getBillingDb();
    const allUsers = await db.collection('users').find({}).toArray();
    const assignmentError = validateUserAssignment(role, counter_no, allUsers, old_username);
    if (assignmentError) {
      return NextResponse.json({ error: assignmentError }, { status: 409 });
    }

    const update: Record<string, string | undefined> = {
      username: new_username,
      full_name: String(body.full_name || ''),
      role,
      counter_no,
      availability_status: role.toLowerCase() === 'admin' ? undefined : 'available',
    };

    const newPassword = String(body.password || '').trim();
    if (newPassword) {
      const strengthError = validatePasswordStrength(newPassword);
      if (strengthError) {
        return NextResponse.json({ error: strengthError }, { status: 400 });
      }
      update.password = await hashPassword(newPassword);
    }

    await db.collection('users').updateOne({ username: old_username }, {
      $set: update,
      ...(role.toLowerCase() === 'admin' ? { $unset: { availability_status: '' } } : {}),
    });

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
