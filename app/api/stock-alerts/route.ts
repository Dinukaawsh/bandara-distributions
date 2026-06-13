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
    const products = await db
      .collection('products')
      .find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .toArray();

    return NextResponse.json({
      products: products.map((p) => ({
        barcode: p.barcode,
        name: p.name,
        our_price: p.our_price,
        stock: p.stock,
      })),
    });
  } catch (error) {
    console.error('GET /api/stock-alerts error:', error);
    return NextResponse.json({ error: 'Failed to load stock alerts' }, { status: 500 });
  }
}
