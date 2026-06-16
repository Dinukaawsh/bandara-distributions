'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Card, PageLoader } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

type DashboardData = {
  stats: {
    total_sales_all_time: number;
    total_profit_all_time: number;
    total_bills: number;
    total_products: number;
    today_sales: number;
    today_profit: number;
    today_bills: number;
    cashiers_total: number;
    cashiers_available: number;
  };
  sales_by_day: Array<{ date: string; sales: number; profit: number }>;
  counter_sales_today: Array<{ counter_no: string; amount: number }>;
  cashier_statuses: Array<{ full_name: string; counter_no: string; availability_status: 'available' | 'busy' }>;
};

export default function AdminDashboardPage() {
  useSession(true, true);
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/overview')
      .then(async (res) => {
        if (res.ok) setData(await res.json());
      })
      .finally(() => setLoading(false));
  }, []);

  const maxDailySales = useMemo(() => {
    if (!data?.sales_by_day?.length) return 1;
    return Math.max(...data.sales_by_day.map((d) => d.sales), 1);
  }, [data]);

  const maxCounterSales = useMemo(() => {
    if (!data?.counter_sales_today?.length) return 1;
    return Math.max(...data.counter_sales_today.map((d) => d.amount), 1);
  }, [data]);

  if (loading) return <PageLoader />;
  if (!data) return <Alert type="error">{t('???? ????? ?????????', 'Failed to load dashboard data')}</Alert>;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title label-si">{t('??????? ????????', 'Admin Dashboard')}</h1>
        <p className="page-subtitle label-si">
          {t('???? ?????? ????, ?? ??? ???????? ?? ??????? ???????', 'Overall business metrics, today progress, and cashier status')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('?? ????????', 'Today Sales')}</p>
          <p className="dashboard-metric-value">LKR {Number(data.stats.today_sales).toFixed(2)}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('?? ????', 'Today Profit')}</p>
          <p className="dashboard-metric-value">LKR {Number(data.stats.today_profit).toFixed(2)}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('?? ???????', 'Today Bills')}</p>
          <p className="dashboard-metric-value">{data.stats.today_bills}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('??? ?? ???? ???????', 'Available Cashiers')}</p>
          <p className="dashboard-metric-value">{data.stats.cashiers_available} / {data.stats.cashiers_total}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title={t('?????? ??? 7 ????????', 'Last 7 Days Sales')}>
          <div className="space-y-2">
            {data.sales_by_day.map((row) => {
              const pct = Math.max(4, (row.sales / maxDailySales) * 100);
              return (
                <div key={row.date} className="dashboard-bar-row">
                  <div className="dashboard-bar-label">{row.date}</div>
                  <div className="dashboard-bar-track">
                    <div className="dashboard-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="dashboard-bar-value">LKR {row.sales.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title={t('?? ??????? ????????', 'Counter Sales Today')}>
          <div className="space-y-2">
            {data.counter_sales_today.length === 0 ? (
              <p className="text-sm text-slate-500 label-si">{t('?? ???????? ?????', 'No sales today')}</p>
            ) : data.counter_sales_today.map((row) => {
              const pct = Math.max(5, (row.amount / maxCounterSales) * 100);
              return (
                <div key={row.counter_no} className="dashboard-bar-row">
                  <div className="dashboard-bar-label">{row.counter_no}</div>
                  <div className="dashboard-bar-track">
                    <div className="dashboard-bar-fill dashboard-bar-fill-alt" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="dashboard-bar-value">LKR {row.amount.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t('??????? ???????', 'Cashier Status')}>
          <div className="space-y-2">
            {data.cashier_statuses.map((c) => (
              <div key={`${c.full_name}-${c.counter_no}`} className="dashboard-status-row">
                <div>
                  <p className="font-semibold label-si">{c.full_name}</p>
                  <p className="text-xs text-slate-500">{c.counter_no}</p>
                </div>
                <span className={c.availability_status === 'busy' ? 'badge-warning' : 'badge-stock'}>
                  {c.availability_status === 'busy' ? t('?????????', 'Busy') : t('??? ?? ???', 'Available')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t('???? ?????? ???????', 'Overall Summary')}>
          <div className="space-y-2 text-sm">
            <div className="dashboard-summary-row"><span>{t('???? ???????? (????? ????)', 'Total Sales (All Time)')}</span><strong>LKR {data.stats.total_sales_all_time.toFixed(2)}</strong></div>
            <div className="dashboard-summary-row"><span>{t('???? ???? (????? ????)', 'Total Profit (All Time)')}</span><strong>LKR {data.stats.total_profit_all_time.toFixed(2)}</strong></div>
            <div className="dashboard-summary-row"><span>{t('???? ???????', 'Total Bills')}</span><strong>{data.stats.total_bills}</strong></div>
            <div className="dashboard-summary-row"><span>{t('???? ?????', 'Total Products')}</span><strong>{data.stats.total_products}</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

