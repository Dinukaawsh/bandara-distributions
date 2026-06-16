'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart } from '@/components/dashboard/BarChart';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { LineChart } from '@/components/dashboard/LineChart';
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
  today_highlights?: {
    top_cashier?: { name: string; amount: number } | null;
    top_item?: { barcode: string; name: string; qty: number } | null;
  };
};

const COUNTER_COLORS = ['#1d4ed8', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#4f46e5'];

function shortDate(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

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

  const chartLabels = useMemo(
    () => (data?.sales_by_day || []).map((row) => shortDate(row.date)),
    [data]
  );

  const moneyShort = useMemo(
    () => (value: number) => {
      if (value >= 1000000) return `LKR ${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `LKR ${(value / 1000).toFixed(0)}k`;
      return `LKR ${Math.round(value)}`;
    },
    []
  );

  const cashierStatusSlices = useMemo(() => {
    if (!data) return [];
    const busy = data.cashier_statuses.filter((c) => c.availability_status === 'busy').length;
    const available = data.cashier_statuses.length - busy;
    return [
      { label: t('ලබා ගත හැක', 'Available'), value: available, color: '#059669' },
      { label: t('කාර්යබහුල', 'Busy'), value: busy, color: '#d97706' },
    ];
  }, [data, t]);

  const counterSlices = useMemo(
    () =>
      (data?.counter_sales_today || []).map((row, index) => ({
        label: row.counter_no,
        value: row.amount,
        color: COUNTER_COLORS[index % COUNTER_COLORS.length],
      })),
    [data]
  );

  if (loading) return <PageLoader />;
  if (!data) return <Alert type="error">{t('ඩෑෂ්බෝඩ් දත්ත පූරණය අසාර්ථකයි', 'Failed to load dashboard data')}</Alert>;

  const totalCounterSales = data.counter_sales_today.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title label-si">{t('පරිපාලක ඩෑෂ්බෝඩ්', 'Admin Dashboard')}</h1>
        <p className="page-subtitle label-si">
          {t('මුළු ව්‍යාපාර දත්ත, අද දින ප්‍රගතිය සහ කැෂියර් තත්වය', 'Overall business metrics, today progress, and cashier status')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද විකුණුම්', 'Today Sales')}</p>
          <p className="dashboard-metric-value">LKR {Number(data.stats.today_sales).toFixed(2)}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද ලාභය', 'Today Profit')}</p>
          <p className="dashboard-metric-value">LKR {Number(data.stats.today_profit).toFixed(2)}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද බිල්පත්', 'Today Bills')}</p>
          <p className="dashboard-metric-value">{data.stats.today_bills}</p>
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('ලබා ගත හැකි කැෂියර්', 'Available Cashiers')}</p>
          <p className="dashboard-metric-value">{data.stats.cashiers_available} / {data.stats.cashiers_total}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද වැඩිපුර විකුණුම් කළ කැෂියර්', 'Top Cashier Today')}</p>
          {data.today_highlights?.top_cashier ? (
            <>
              <p className="text-lg font-bold label-si">{data.today_highlights.top_cashier.name}</p>
              <p className="dashboard-metric-value">LKR {Number(data.today_highlights.top_cashier.amount).toFixed(2)}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500 label-si">{t('දත්ත නොමැත', 'No data')}</p>
          )}
        </Card>
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('අද වැඩිපුර විකිණුණු භාණ්ඩය', 'Top Selling Item Today')}</p>
          {data.today_highlights?.top_item ? (
            <>
              <p className="text-lg font-bold label-si">{data.today_highlights.top_item.name}</p>
              <p className="text-sm text-slate-500">{data.today_highlights.top_item.barcode}</p>
              <p className="dashboard-metric-value">{data.today_highlights.top_item.qty}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500 label-si">{t('දත්ත නොමැත', 'No data')}</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t('පසුගිය දින 7 විකුණුම් සහ ලාභය', 'Last 7 Days Sales & Profit')}>
          <BarChart
            labels={chartLabels}
            series={[
              {
                label: t('විකුණුම්', 'Sales'),
                color: '#1d4ed8',
                values: data.sales_by_day.map((row) => row.sales),
              },
              {
                label: t('ලාභය', 'Profit'),
                color: '#059669',
                values: data.sales_by_day.map((row) => row.profit),
              },
            ]}
            formatValue={moneyShort}
          />
        </Card>

        <Card title={t('විකුණුම් ප්‍රවණතාව', 'Sales Trend')}>
          <LineChart
            labels={chartLabels}
            values={data.sales_by_day.map((row) => row.sales)}
            formatValue={moneyShort}
          />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t('අද කවුන්ටර විකුණුම් වෙන් කිරීම', 'Today Counter Sales Split')}>
          {counterSlices.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 label-si">{t('අද විකුණුම් නොමැත', 'No sales today')}</p>
          ) : (
            <DonutChart
              slices={counterSlices}
              centerValue={moneyShort(totalCounterSales)}
              centerLabel={t('මුළු විකුණුම්', 'Total Sales')}
              formatValue={(value) => `LKR ${value.toFixed(2)}`}
            />
          )}
        </Card>

        <Card title={t('කැෂියර් තත්ත්ව වෙන් කිරීම', 'Cashier Status Split')}>
          {data.cashier_statuses.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 label-si">{t('කැෂියර්වරු නැත', 'No cashiers')}</p>
          ) : (
            <DonutChart
              slices={cashierStatusSlices}
              centerValue={String(data.cashier_statuses.length)}
              centerLabel={t('කැෂියර්', 'Cashiers')}
            />
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t('කැෂියර් තත්ත්වය', 'Cashier Status')}>
          <div className="space-y-2">
            {data.cashier_statuses.map((c) => (
              <div key={`${c.full_name}-${c.counter_no}`} className="dashboard-status-row">
                <div>
                  <p className="font-semibold label-si">{c.full_name}</p>
                  <p className="text-xs text-slate-500">{c.counter_no}</p>
                </div>
                <span className={c.availability_status === 'busy' ? 'badge-warning' : 'badge-stock'}>
                  {c.availability_status === 'busy' ? t('කාර්යබහුල', 'Busy') : t('ලබා ගත හැක', 'Available')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t('මුළු පද්ධති සාරාංශය', 'Overall Summary')}>
          <div className="space-y-2 text-sm">
            <div className="dashboard-summary-row"><span>{t('මුළු විකුණුම් (සියලු කාලය)', 'Total Sales (All Time)')}</span><strong>LKR {data.stats.total_sales_all_time.toFixed(2)}</strong></div>
            <div className="dashboard-summary-row"><span>{t('මුළු ලාභය (සියලු කාලය)', 'Total Profit (All Time)')}</span><strong>LKR {data.stats.total_profit_all_time.toFixed(2)}</strong></div>
            <div className="dashboard-summary-row"><span>{t('මුළු බිල්පත්', 'Total Bills')}</span><strong>{data.stats.total_bills}</strong></div>
            <div className="dashboard-summary-row"><span>{t('මුළු භාණ්ඩ', 'Total Products')}</span><strong>{data.stats.total_products}</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
