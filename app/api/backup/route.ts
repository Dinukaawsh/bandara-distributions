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
    const [users, products, store, orders, items] = await Promise.all([
      db.collection('users').find({}, { projection: { password: 0 } }).toArray(),
      db.collection('products').find({}).toArray(),
      db.collection('store_details').find({}).toArray(),
      db.collection('sales_orders').find({}).toArray(),
      db.collection('sales_items').find({}).toArray(),
    ]);

    const backup = {
      exported_at: new Date().toISOString(),
      users,
      products,
      store_details: store,
      sales_orders: orders,
      sales_items: items,
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bandara-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('GET /api/backup error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}
