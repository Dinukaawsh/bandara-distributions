import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const db = await getBillingDb();
    const notifications = await db.collection('notifications').find({}).sort({ created_at: -1 }).limit(300).toArray();
    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: String(n._id),
        type: String(n.type || ''),
        message: String(n.message || ''),
        created_at: n.created_at,
      })),
    });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}
