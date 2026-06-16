'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BillReceipt } from '@/components/billing/BillReceipt';
import { BillViewModal } from '@/components/billing/BillViewModal';
import { Alert, Button, Card, PageLoader, Pagination } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { usePagination } from '@/hooks/usePagination';
import { useSession } from '@/hooks/useSession';

type BillRow = {
  bill_no: string;
  total_amount: number;
  total_profit: number;
  created_at: string;
};

type MyDayData = {
  date: string;
  cashier: { username: string; full_name: string; counter_no: string };
  stats: { total_sales: number; total_profit: number; total_bills: number };
  orders: BillRow[];
};

type BillDetails = {
  bill_no: string;
  cashier_name: string;
  counter_no: string;
  total_amount: number;
  cash_paid: number;
  change_given: number;
  created_at: string;
  items: Array<{ barcode: string; name: string; qty: number; ourPrice: number; total: number }>;
};

export default function MyDayPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const { t, lang } = useLang();
  const [data, setData] = useState<MyDayData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [store, setStore] = useState({ store_name: 'BANDARA STORE', address: '', phone: '' });
  const [openBill, setOpenBill] = useState<BillDetails | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user?.role?.toLowerCase() === 'admin') {
      router.push('/dashboard');
      return;
    }

    Promise.all([fetch('/api/my-sales/today'), fetch('/api/store')])
      .then(async ([salesRes, storeRes]) => {
        if (salesRes.ok) setData(await salesRes.json());
        if (storeRes.ok) setStore((await storeRes.json()).store);
      })
      .finally(() => setPageLoading(false));
  }, [loading, user, router]);

  const moneyLabel = lang === 'si' ? 'රුපියල්' : 'LKR';
  const {
    paginatedItems: paginatedOrders,
    page,
    setPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(data?.orders || []);

  if (loading || pageLoading) return <PageLoader />;
  if (!data) return <Alert type="error">{t('අද දින දත්ත නොමැත', 'No daily data available')}</Alert>;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title label-si">{t('මගේ අද විකුණුම්', 'My Daily Sales')}</h1>
        <p className="page-subtitle label-si">{t('අද දින වාර්තාව පමණි - ඉතිහාසය නොපෙන්වයි', 'Today only - no history shown')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-metric-card">
          <p className="dashboard-metric-label">{t('කැෂියර්', 'Cashier')}</p>
          <p className="text-base font-bold label-si">{data.cashier.full_name}</p>
          <p className="text-xs text-slate-500">{data.cashier.counter_no}</p>
        </Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('අද විකුණුම්', 'Today Sales')}</p><p className="dashboard-metric-value">{moneyLabel} {data.stats.total_sales.toFixed(2)}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('අද ලාභය', 'Today Profit')}</p><p className="dashboard-metric-value">{moneyLabel} {data.stats.total_profit.toFixed(2)}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('අද බිල්පත්', 'Today Bills')}</p><p className="dashboard-metric-value">{data.stats.total_bills}</p></Card>
      </div>

      <Card title={t('අද මගේ බිල්පත්', 'My Bills Today')}>
        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table !table-auto">
            <thead>
              <tr>
                <th className="text-left">{t('බිල් අංකය', 'Bill No')}</th>
                <th className="text-right">{t('මුදල', 'Amount')}</th>
                <th className="text-right">{t('ලාභය', 'Profit')}</th>
                <th className="text-left">{t('වේලාව', 'Time')}</th>
                <th className="text-center">{t('ක්‍රියා', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500 label-si">{t('අද බිල්පත් නොමැත', 'No bills for today')}</td></tr>
              ) : paginatedOrders.map((o) => (
                <tr key={o.bill_no}>
                  <td className="whitespace-nowrap">{o.bill_no}</td>
                  <td className="text-right whitespace-nowrap">{moneyLabel} {Number(o.total_amount).toFixed(2)}</td>
                  <td className="text-right whitespace-nowrap">{moneyLabel} {Number(o.total_profit).toFixed(2)}</td>
                  <td className="whitespace-nowrap">{new Date(o.created_at).toLocaleTimeString()}</td>
                  <td className="text-center">
                    <Button
                      variant="secondary"
                      className="!py-1.5 !text-xs"
                      onClick={async () => {
                        const res = await fetch(`/api/bills?bill_no=${encodeURIComponent(o.bill_no)}`);
                        if (!res.ok) return;
                        const d = await res.json();
                        setOpenBill(d.bill || null);
                      }}
                    >
                      {t('බලන්න', 'View')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </Card>

      <BillViewModal
        open={!!openBill}
        onClose={() => setOpenBill(null)}
        onPrint={() => window.print()}
        store={store}
        billNo={openBill?.bill_no || ''}
        billDate={openBill ? new Date(openBill.created_at).toLocaleDateString() : ''}
        billTime={openBill ? new Date(openBill.created_at).toLocaleTimeString() : ''}
        cashierName={openBill?.cashier_name || ''}
        counterNo={openBill?.counter_no || ''}
        items={(openBill?.items || []).map((i) => ({ ...i, marketPrice: i.ourPrice }))}
        grandTotal={Number(openBill?.total_amount || 0)}
        cashPaid={Number(openBill?.cash_paid || 0)}
        changeDue={Number(openBill?.change_given || 0)}
      />

      {openBill && (
        <div className="billing-print-area print-only">
          <BillReceipt
            lang={lang}
            store={store}
            billNo={openBill.bill_no}
            billDate={new Date(openBill.created_at).toLocaleDateString()}
            billTime={new Date(openBill.created_at).toLocaleTimeString()}
            cashierName={openBill.cashier_name}
            counterNo={openBill.counter_no}
            items={openBill.items.map((i) => ({ ...i, marketPrice: i.ourPrice }))}
            grandTotal={Number(openBill.total_amount || 0)}
            cashPaid={Number(openBill.cash_paid || 0)}
            changeDue={Number(openBill.change_given || 0)}
          />
        </div>
      )}
    </div>
  );
}
