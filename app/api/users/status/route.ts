import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, isAdmin } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';
import { logNotification } from '@/lib/notifications';

const VALID_STATUSES = new Set(['available', 'busy']);

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const status = String(body.status || '').toLowerCase();
    const targetUsername = String(body.username || user.username);

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (targetUsername !== user.username && !isAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await getBillingDb();
    const target = await db.collection('users').findOne({ username: targetUsername });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (isAdmin(String(target.role)) && targetUsername === user.username) {
      return NextResponse.json({ error: 'Status toggle is for cashiers only' }, { status: 400 });
    }

    await db.collection('users').updateOne(
      { username: targetUsername },
      { $set: { availability_status: status, status_updated_at: new Date() } }
    );
    if (status === 'busy') {
      await logNotification(db, 'cashier_unavailable', `Cashier marked unavailable: ${targetUsername}`, {
        username: targetUsername,
      });
    }

    return NextResponse.json({ success: true, username: targetUsername, availability_status: status });
  } catch (error) {
    console.error('PATCH /api/users/status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
