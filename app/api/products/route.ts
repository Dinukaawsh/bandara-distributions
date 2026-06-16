import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieOptions } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';
import { getSessionUser, isAdmin } from '@/lib/auth';
import { logNotification } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getBillingDb();
    const products = await db.collection('products').find({}).sort({ name: 1 }).toArray();
    const { searchParams } = new URL(request.url);

    if (searchParams.get('format') === 'list') {
      return NextResponse.json({
        products: products.map((p) => ({
          barcode: p.barcode,
          name: p.name,
          market_price: p.market_price,
          our_price: p.our_price,
          stock: p.stock,
        })),
      });
    }

    const productsMap: Record<string, {
      name: string;
      market_price: number;
      our_price: number;
      cost_price: number;
      stock_qty: number;
    }> = {};

    for (const p of products) {
      productsMap[String(p.barcode)] = {
        name: String(p.name),
        market_price: Number(p.market_price) || 0,
        our_price: Number(p.our_price) || 0,
        cost_price: Number(p.cost_price) || Number(p.our_price) * 0.95,
        stock_qty: Number(p.stock) || 0,
      };
    }

    return NextResponse.json({ products: productsMap }, { status: 200 });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized access!' }, { status: 403 });
    }

    const body = await request.json();
    const barcode = String(body.p_barcode || '').trim();
    const name = String(body.p_name || '').trim();
    const market_price = Number(body.p_market) || 0;
    const our_price = Number(body.p_our) || 0;
    const stock = Number(body.p_stock) || 0;
    const cost_price = our_price * 0.95;

    if (!barcode || !name) {
      return NextResponse.json({ error: 'Barcode and Product Name are required!' }, { status: 400 });
    }

    const db = await getBillingDb();
    const products = db.collection('products');
    const existing = await products.findOne({ barcode });
    if (existing) {
      return NextResponse.json(
        { error: 'මෙම බාර්කෝඩ් අංකය දැනටමත් භාවිතාවේ පවතී. Barcode must be unique.' },
        { status: 409 }
      );
    }

    await products.insertOne({
      barcode,
      name,
      market_price,
      our_price,
      cost_price,
      stock,
      created_at: new Date(),
    });
    await logNotification(db, 'product_added', `New product added: ${name} (${barcode})`, { barcode, name });

    return NextResponse.json({
      status: 'success',
      message: 'නව භාණ්ඩය සාර්ථකව පද්ධතියට ඇතුළත් කරන ලදී! 🎉',
      product: { barcode, name, market_price, our_price, cost_price, stock },
    });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const barcode = String(body.barcode || '').trim();
    if (!barcode) {
      return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
    }

    const db = await getBillingDb();
    await db.collection('products').updateOne(
      { barcode },
      {
        $set: {
          name: String(body.name || ''),
          market_price: Number(body.market_price) || 0,
          our_price: Number(body.our_price) || 0,
          stock: Number(body.stock) || 0,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/products error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    if (!barcode) {
      return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
    }

    const db = await getBillingDb();
    const existing = await db.collection('products').findOne({ barcode });
    await db.collection('products').deleteOne({ barcode });
    await logNotification(
      db,
      'product_deleted',
      `Product deleted: ${String(existing?.name || barcode)} (${barcode})`,
      { barcode, name: String(existing?.name || '') }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/products error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
