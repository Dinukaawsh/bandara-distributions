'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, FilterBar, MonthPicker } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';

export default function SalesReportPage() {
  const { user } = useSession(true, true);
  const { lang, t } = useLang();
  const { confirm, alert } = useDialog();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState({ total_sales: 0, total_profit: 0, total_bills: 0 });
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);

  const loadReport = useCallback(() => {
    fetch(`/api/sales-report?month=${month}`).then(async (res) => {
      if (res.ok) {
        const d = await res.json();
        setStats(d.stats);
        setOrders(d.orders || []);
      }
    });
  }, [month]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <h1 className="text-2xl font-extrabold label-si">{t('විකුණුම් වාර්තා', 'Sales Report')}</h1>
        <Button variant="secondary" onClick={() => window.print()}>{t('මුද්‍රණය', 'Print')}</Button>
      </div>

      <FilterBar className="no-print mb-4">
        <MonthPicker label={t('මාසය තෝරන්න', 'Select Month')} value={month} onChange={(e) => setMonth(e.target.value)} className="max-w-xs" lang={lang} />
      </FilterBar>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="!bg-primary !text-white text-center"><p className="label-si">{t('මුළු විකුණුම්', 'Total Sales')}</p><p className="text-2xl font-bold">Rs. {Number(stats.total_sales).toFixed(2)}</p></Card>
        <Card className="!bg-emerald-600 !text-white text-center"><p className="label-si">{t('ලාභය', 'Profit')}</p><p className="text-2xl font-bold">Rs. {Number(stats.total_profit).toFixed(2)}</p></Card>
        <Card className="!bg-slate-800 !text-white text-center"><p className="label-si">{t('බිල්පත්', 'Bills')}</p><p className="text-2xl font-bold">{stats.total_bills}</p></Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="data-table">
          <thead><tr>
            <th>{t('බිල් අංකය', 'Bill No')}</th><th>{t('කැෂියර්', 'Cashier')}</th><th>{t('කවුන්ටරය', 'Counter')}</th>
            <th className="text-right">{t('මුදල', 'Amount')}</th><th className="text-right">{t('ලාභය', 'Profit')}</th><th>{t('දිනය', 'Date')}</th>
          </tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={String(o.bill_no)}>
                <td>{String(o.bill_no)}</td><td>{String(o.cashier_name)}</td><td>{String(o.counter_no)}</td>
                <td className="text-right">Rs. {Number(o.total_amount).toFixed(2)}</td>
                <td className="text-right">Rs. {Number(o.total_profit).toFixed(2)}</td>
                <td>{new Date(String(o.created_at)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="no-print mt-4 text-center">
        <Button variant="danger" onClick={async () => {
          const ok = await confirm({
            title: t('පැරණි වාර්තා මකන්න', 'Clear Old Reports'),
            message: t('3 මාසකට පැරණි දත්ත මකන්නද?', 'Delete data older than 3 months?'),
          });
          if (!ok) return;
          await fetch('/api/sales-report', { method: 'DELETE' });
          loadReport();
          await alert({ title: t('සාර්ථකයි', 'Success'), message: t('දත්ත මකා දමන ලදී!', 'Data cleared!') });
        }}>{t('පැරණි වාර්තා මකන්න', 'Clear Old Reports')}</Button>
      </div>
    </div>
  );
}
