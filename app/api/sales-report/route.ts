import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const cashier = searchParams.get('cashier')?.trim() || '';
    const counter = searchParams.get('counter')?.trim() || '';

    let start: Date;
    let end: Date;

    if (from && to) {
      start = new Date(`${from}T00:00:00`);
      end = new Date(`${to}T23:59:59.999`);
    } else {
      const monthVal = month || new Date().toISOString().slice(0, 7);
      start = new Date(`${monthVal}-01T00:00:00`);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const filter: Record<string, unknown> = {
      created_at: { $gte: start, $lte: end },
    };
    if (cashier) filter.cashier_name = cashier;
    if (counter) filter.counter_no = counter;

    const db = await getBillingDb();
    const orders = await db
      .collection('sales_orders')
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();

    let total_sales = 0;
    let total_profit = 0;
    for (const order of orders) {
      total_sales += Number(order.total_amount) || 0;
      total_profit += Number(order.total_profit) || 0;
    }

    const cashiers = await db.collection('sales_orders').distinct('cashier_name');
    const counters = await db.collection('sales_orders').distinct('counter_no');

    return NextResponse.json({
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
      stats: {
        total_sales,
        total_profit,
        total_bills: orders.length,
      },
      filters: {
        cashiers: cashiers.filter(Boolean).sort(),
        counters: counters.filter(Boolean).sort(),
      },
      orders: orders.map((o) => ({
        bill_no: o.bill_no,
        cashier_name: o.cashier_name,
        cashier_username: o.cashier_username,
        counter_no: o.counter_no,
        total_amount: o.total_amount,
        total_profit: o.total_profit,
        cash_paid: o.cash_paid,
        change_given: o.change_given,
        created_at: o.created_at,
      })),
    });
  } catch (error) {
    console.error('GET /api/sales-report error:', error);
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const db = await getBillingDb();
    const oldOrders = await db
      .collection('sales_orders')
      .find({ created_at: { $lt: threeMonthsAgo } })
      .project({ bill_no: 1 })
      .toArray();

    const billNos = oldOrders.map((o) => o.bill_no);
    if (billNos.length > 0) {
      await db.collection('sales_items').deleteMany({ bill_no: { $in: billNos } });
      await db.collection('sales_orders').deleteMany({ bill_no: { $in: billNos } });
    }

    return NextResponse.json({ success: true, deleted: billNos.length });
  } catch (error) {
    console.error('DELETE /api/sales-report error:', error);
    return NextResponse.json({ error: 'Failed to clear old data' }, { status: 500 });
  }
}
