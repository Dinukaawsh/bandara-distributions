'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Card, PageLoader } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

type MyDayData = {
  date: string;
  cashier: { username: string; full_name: string; counter_no: string };
  stats: { total_sales: number; total_profit: number; total_bills: number };
  orders: Array<{
    bill_no: string;
    total_amount: number;
    total_profit: number;
    created_at: string;
  }>;
};

export default function MyDayPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const { t, lang } = useLang();
  const [data, setData] = useState<MyDayData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (user?.role?.toLowerCase() === 'admin') {
      router.push('/dashboard');
      return;
    }

    fetch('/api/my-sales/today')
      .then(async (res) => {
        if (res.ok) setData(await res.json());
      })
      .finally(() => setPageLoading(false));
  }, [loading, user, router]);

  const moneyLabel = lang === 'si' ? 'රුපියල්' : 'LKR';

  if (loading || pageLoading) return <PageLoader />;
  if (!data) return <Alert type="error">{t('අද දින දත්ත නොමැත', 'No daily data available')}</Alert>;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title label-si">{t('මගේ අද විකුණුම්', 'My Daily Sales')}</h1>
        <p className="page-subtitle label-si">
          {t('අද දින වාර්තාව පමණි - ඉතිහාසය නොපෙන්වයි', 'Today only - no history shown')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('කැෂියර්', 'Cashier')}</p>
          <p className="text-base font-bold label-si">{data.cashier.full_name}</p>
          <p className="text-xs text-slate-500">{data.cashier.counter_no}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද විකුණුම්', 'Today Sales')}</p>
          <p className="dashboard-metric-value">{moneyLabel} {data.stats.total_sales.toFixed(2)}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද ලාභය', 'Today Profit')}</p>
          <p className="dashboard-metric-value">{moneyLabel} {data.stats.total_profit.toFixed(2)}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද බිල්පත්', 'Today Bills')}</p>
          <p className="dashboard-metric-value">{data.stats.total_bills}</p>
        </Card>
      </div>

      <Card title={t('අද මගේ බිල්පත්', 'My Bills Today')}>
        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('බිල් අංකය', 'Bill No')}</th>
                <th className="text-right">{t('මුදල', 'Amount')}</th>
                <th className="text-right">{t('ලාභය', 'Profit')}</th>
                <th>{t('වේලාව', 'Time')}</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500 label-si">
                    {t('අද බිල්පත් නොමැත', 'No bills for today')}
                  </td>
                </tr>
              ) : data.orders.map((o) => (
                <tr key={o.bill_no}>
                  <td>{o.bill_no}</td>
                  <td className="text-right">{moneyLabel} {Number(o.total_amount).toFixed(2)}</td>
                  <td className="text-right">{moneyLabel} {Number(o.total_profit).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
