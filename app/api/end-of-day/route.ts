import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const db = await getBillingDb();
    const orders = await db
      .collection('sales_orders')
      .find({ created_at: { $gte: start, $lte: end } })
      .sort({ created_at: 1 })
      .toArray();

    let total_amount = 0;
    let total_profit = 0;
    const counterMap: Record<string, number> = {};

    for (const order of orders) {
      const amt = Number(order.total_amount) || 0;
      total_amount += amt;
      total_profit += Number(order.total_profit) || 0;
      const counter = String(order.counter_no || 'Unknown');
      counterMap[counter] = (counterMap[counter] || 0) + amt;
    }

    const response = NextResponse.json({
      date: today.toISOString().slice(0, 10),
      summary: { total_amount, total_profit },
      counters: Object.entries(counterMap).map(([counter_no, amount]) => ({ counter_no, amount })),
      bills: orders.map((o) => ({
        bill_no: o.bill_no,
        time: o.created_at,
        counter_no: o.counter_no,
        cashier_name: o.cashier_name,
        total_amount: o.total_amount,
      })),
    });

    response.cookies.set('username', '', { maxAge: 0 });
    response.cookies.set('role', '', { maxAge: 0 });
    response.cookies.set('full_name', '', { maxAge: 0 });
    response.cookies.set('counter_no', '', { maxAge: 0 });

    return response;
  } catch (error) {
    console.error('POST /api/end-of-day error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
