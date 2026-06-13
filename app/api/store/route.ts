import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { DEFAULT_STORE, getBillingDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getBillingDb();
    const store = await db.collection('store_details').findOne({ id: 1 });
    return NextResponse.json({
      store: store
        ? {
            store_name: store.store_name,
            address: store.address,
            phone: store.phone,
          }
        : DEFAULT_STORE,
    });
  } catch (error) {
    console.error('GET /api/store error:', error);
    return NextResponse.json({ error: 'Failed to load store' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const db = await getBillingDb();
    await db.collection('store_details').updateOne(
      { id: 1 },
      {
        $set: {
          store_name: String(body.store_name || ''),
          address: String(body.address || ''),
          phone: String(body.phone || ''),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Store details updated successfully!' });
  } catch (error) {
    console.error('PUT /api/store error:', error);
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}
