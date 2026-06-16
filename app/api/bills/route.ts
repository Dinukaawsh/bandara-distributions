import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';
import { logNotification } from '@/lib/notifications';

type BillItem = {
  barcode: string;
  name: string;
  qty: number;
  ourPrice: number;
  total: number;
  totalProfit?: number;
};

async function generateBillNo(db: Awaited<ReturnType<typeof getBillingDb>>) {
  const last = await db
    .collection('sales_orders')
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  let nextNo = 1;
  if (last.length > 0 && last[0].bill_no) {
    const digits = String(last[0].bill_no).replace(/[^0-9]/g, '');
    nextNo = parseInt(digits, 10) + 1;
  }

  return `IN-${String(nextNo).padStart(7, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Not authenticated' }, { status: 401 });
    }

    if (user.role.toLowerCase() === 'admin') {
      return NextResponse.json({ status: 'error', message: 'Admins cannot process bills' }, { status: 403 });
    }

    const body = await request.json();
    const total_amount = Number(body.total_amount) || 0;
    const total_profit = Number(body.total_profit) || 0;
    const cash_paid = Number(body.cash_paid) || 0;
    const change_given = Number(body.change_given) || 0;
    const cashier_name = String(body.cashier_name || user.full_name);
    const cashier_username = String(body.cashier_username || user.username);
    const counter_no = String(body.counter_no || user.counter_no);
    const bill_items: BillItem[] = Array.isArray(body.bill_items) ? body.bill_items : [];

    if (bill_items.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No items found in the bill' }, { status: 400 });
    }

    if (cash_paid < total_amount) {
      return NextResponse.json({ status: 'error', message: 'Insufficient payment' }, { status: 400 });
    }

    const db = await getBillingDb();
    const products = db.collection('products');
    for (const item of bill_items) {
      const barcode = String(item.barcode);
      const qty = Number(item.qty) || 0;
      const product = await products.findOne({ barcode });
      const stock = Number(product?.stock || 0);
      if (!product || stock <= 0) {
        return NextResponse.json({ status: 'error', message: `${item.name} is out of stock` }, { status: 400 });
      }
      if (qty > stock) {
        return NextResponse.json({ status: 'error', message: `${item.name} stock available is only ${stock}` }, { status: 400 });
      }
    }

    const bill_no = await generateBillNo(db);

    await db.collection('sales_orders').insertOne({
      bill_no,
      total_amount,
      total_profit,
      cash_paid,
      change_given,
      cashier_name,
      cashier_username,
      counter_no,
      bill_items,
      created_at: new Date(),
    });

    const salesItems = bill_items.map((item) => ({
      bill_no,
      barcode: String(item.barcode),
      product_name: String(item.name),
      qty: Number(item.qty),
      our_price: Number(item.ourPrice),
      total: Number(item.total),
    }));

    await db.collection('sales_items').insertMany(salesItems);

    for (const item of bill_items) {
      const barcode = String(item.barcode);
      const qty = Number(item.qty);
      const productBefore = await products.findOne({ barcode });
      await products.updateOne({ barcode }, { $inc: { stock: -qty } });
      const productAfter = await products.findOne({ barcode });
      if (Number(productAfter?.stock || 0) <= 0) {
        await logNotification(
          db,
          'stock_out',
          `Stock out alert: ${String(item.name)} is now out of stock`,
          { barcode, product_name: String(item.name), cashier_username }
        );
      } else if (Number(productBefore?.stock || 0) > 0 && Number(productAfter?.stock || 0) <= 3) {
        await logNotification(
          db,
          'stock_out',
          `Low stock alert: ${String(item.name)} has only ${Number(productAfter?.stock || 0)} left`,
          { barcode, product_name: String(item.name), cashier_username }
        );
      }
    }

    return NextResponse.json({ status: 'success', bill_no, message: 'Saved!' });
  } catch (error) {
    console.error('POST /api/bills error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to save bill' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const billNo = String(searchParams.get('bill_no') || '').trim();
    if (!billNo) {
      return NextResponse.json({ error: 'bill_no required' }, { status: 400 });
    }

    const db = await getBillingDb();
    const order = await db.collection('sales_orders').findOne({ bill_no: billNo });
    if (!order) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    if (String(user.role).toLowerCase() !== 'admin' && String(order.cashier_username) !== user.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let items = Array.isArray(order.bill_items) ? order.bill_items : [];
    if (!items.length) {
      const salesItems = await db.collection('sales_items').find({ bill_no: billNo }).toArray();
      items = salesItems.map((i) => ({
        barcode: i.barcode,
        name: i.product_name,
        qty: Number(i.qty) || 0,
        ourPrice: Number(i.our_price) || 0,
        total: Number(i.total) || 0,
      }));
    }

    return NextResponse.json({
      bill: {
        bill_no: order.bill_no,
        cashier_name: order.cashier_name,
        counter_no: order.counter_no,
        total_amount: Number(order.total_amount) || 0,
        cash_paid: Number(order.cash_paid) || 0,
        change_given: Number(order.change_given) || 0,
        created_at: order.created_at,
        items,
      },
    });
  } catch (error) {
    console.error('GET /api/bills error:', error);
    return NextResponse.json({ error: 'Failed to load bill' }, { status: 500 });
  }
}
