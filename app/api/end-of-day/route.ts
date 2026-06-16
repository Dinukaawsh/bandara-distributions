import { NextResponse } from 'next/server';
import { clearAllAuthCookies, getSessionUser, isAdmin } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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
    const counterMap: Record<string, { amount: number; profit: number; bills: number }> = {};
    const cashierMap: Record<string, { counter_no: string; amount: number; profit: number; bills: number }> = {};

    for (const order of orders) {
      const amt = Number(order.total_amount) || 0;
      const profit = Number(order.total_profit) || 0;
      total_amount += amt;
      total_profit += profit;

      const counter = String(order.counter_no || 'Unknown');
      if (!counterMap[counter]) counterMap[counter] = { amount: 0, profit: 0, bills: 0 };
      counterMap[counter].amount += amt;
      counterMap[counter].profit += profit;
      counterMap[counter].bills += 1;

      const cashier = String(order.cashier_name || 'Unknown');
      if (!cashierMap[cashier]) {
        cashierMap[cashier] = {
          counter_no: String(order.counter_no || ''),
          amount: 0,
          profit: 0,
          bills: 0,
        };
      }
      cashierMap[cashier].amount += amt;
      cashierMap[cashier].profit += profit;
      cashierMap[cashier].bills += 1;
    }

    const response = NextResponse.json({
      date: today.toISOString().slice(0, 10),
      summary: { total_amount, total_profit, total_bills: orders.length },
      counters: Object.entries(counterMap).map(([counter_no, data]) => ({
        counter_no,
        ...data,
      })),
      cashiers: Object.entries(cashierMap).map(([cashier_name, data]) => ({
        cashier_name,
        ...data,
      })),
      bills: orders.map((o) => ({
        bill_no: o.bill_no,
        time: o.created_at,
        counter_no: o.counter_no,
        cashier_name: o.cashier_name,
        total_amount: o.total_amount,
        cash_paid: o.cash_paid,
        change_given: o.change_given,
      })),
    });

    clearAllAuthCookies(response);
    return response;
  } catch (error) {
    console.error('POST /api/end-of-day error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
