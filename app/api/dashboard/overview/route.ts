import { NextResponse } from 'next/server';
import { getSessionUser, isAdmin } from '@/lib/auth';
import { getBillingDb } from '@/lib/db';

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await getBillingDb();
    const now = new Date();

    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [totalBills, totalSalesAgg, totalProfitAgg, todayOrders, users, products] = await Promise.all([
      db.collection('sales_orders').countDocuments(),
      db.collection('sales_orders').aggregate([{ $group: { _id: null, v: { $sum: '$total_amount' } } }]).toArray(),
      db.collection('sales_orders').aggregate([{ $group: { _id: null, v: { $sum: '$total_profit' } } }]).toArray(),
      db.collection('sales_orders').find({ created_at: { $gte: startToday, $lte: endToday } }).toArray(),
      db.collection('users').find({}, { projection: { role: 1, availability_status: 1, full_name: 1, counter_no: 1 } }).toArray(),
      db.collection('products').countDocuments(),
    ]);

    const salesByDay: Array<{ date: string; sales: number; profit: number }> = [];
    const last7start = new Date(now);
    last7start.setDate(last7start.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(last7start);
      d.setDate(last7start.getDate() + i);
      const key = ymd(d);
      const dayStart = new Date(`${key}T00:00:00`);
      const dayEnd = new Date(`${key}T23:59:59.999`);
      const dayOrders = await db.collection('sales_orders').find({ created_at: { $gte: dayStart, $lte: dayEnd } }).toArray();
      salesByDay.push({
        date: key,
        sales: dayOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
        profit: dayOrders.reduce((s, o) => s + (Number(o.total_profit) || 0), 0),
      });
    }

    const counterMap: Record<string, number> = {};
    for (const o of todayOrders) {
      const c = String(o.counter_no || 'Unknown');
      counterMap[c] = (counterMap[c] || 0) + (Number(o.total_amount) || 0);
    }

    const cashiers = users.filter((u) => String(u.role || '').toLowerCase() !== 'admin');
    const availableCashiers = cashiers.filter((u) => u.availability_status !== 'busy').length;

    return NextResponse.json({
      stats: {
        total_sales_all_time: Number(totalSalesAgg[0]?.v || 0),
        total_profit_all_time: Number(totalProfitAgg[0]?.v || 0),
        total_bills: totalBills,
        total_products: products,
        today_sales: todayOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
        today_profit: todayOrders.reduce((s, o) => s + (Number(o.total_profit) || 0), 0),
        today_bills: todayOrders.length,
        cashiers_total: cashiers.length,
        cashiers_available: availableCashiers,
      },
      sales_by_day: salesByDay,
      counter_sales_today: Object.entries(counterMap)
        .map(([counter_no, amount]) => ({ counter_no, amount }))
        .sort((a, b) => b.amount - a.amount),
      cashier_statuses: cashiers.map((c) => ({
        full_name: c.full_name,
        counter_no: c.counter_no,
        availability_status: c.availability_status === 'busy' ? 'busy' : 'available',
      })),
    });
  } catch (error) {
    console.error('GET /api/dashboard/overview error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard overview' }, { status: 500 });
  }
}
