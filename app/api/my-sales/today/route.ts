import { NextResponse } from 'next/server';
import { getSessionUser, isAdmin } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (isAdmin(user.role)) {
      return NextResponse.json({ error: 'Admins cannot use this endpoint' }, { status: 403 });
    }

    const db = await getBillingDb();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const orders = await db
      .collection('sales_orders')
      .find({
        created_at: { $gte: start, $lte: end },
        cashier_username: user.username,
      })
      .sort({ created_at: -1 })
      .toArray();

    const total_sales = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
    const total_profit = orders.reduce((s, o) => s + (Number(o.total_profit) || 0), 0);

    return NextResponse.json({
      date: start.toISOString().slice(0, 10),
      cashier: {
        username: user.username,
        full_name: user.full_name,
        counter_no: user.counter_no,
      },
      stats: {
        total_sales,
        total_profit,
        total_bills: orders.length,
      },
      orders: orders.map((o) => ({
        bill_no: o.bill_no,
        total_amount: o.total_amount,
        total_profit: o.total_profit,
        cash_paid: o.cash_paid,
        change_given: o.change_given,
        created_at: o.created_at,
      })),
    });
  } catch (error) {
    console.error('GET /api/my-sales/today error:', error);
    return NextResponse.json({ error: 'Failed to load daily sales' }, { status: 500 });
  }
}
