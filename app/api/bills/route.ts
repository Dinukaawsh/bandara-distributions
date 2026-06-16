import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

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
      await db.collection('products').updateOne(
        { barcode: String(item.barcode) },
        { $inc: { stock: -Number(item.qty) } }
      );
    }

    return NextResponse.json({ status: 'success', bill_no, message: 'Saved!' });
  } catch (error) {
    console.error('POST /api/bills error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to save bill' }, { status: 500 });
  }
}
