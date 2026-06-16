'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BillReceipt } from '@/components/billing/BillReceipt';
import { BillViewModal } from '@/components/billing/BillViewModal';
import { Alert, Button, Card, Checkbox, DatePicker, FilterBar, MonthPicker, Select } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';

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

export default function SalesReportPage() {
  useSession(true, true);
  const { lang, t } = useLang();
  const { confirm, alert } = useDialog();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date().toISOString().slice(0, 7) + '-01';
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(today);
  const [useDateRange, setUseDateRange] = useState(false);
  const [cashierFilter, setCashierFilter] = useState('');
  const [counterFilter, setCounterFilter] = useState('');
  const [stats, setStats] = useState({ total_sales: 0, total_profit: 0, total_bills: 0 });
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ cashiers: string[]; counters: string[] }>({ cashiers: [], counters: [] });
  const [store, setStore] = useState({ store_name: 'BANDARA STORE', address: '', phone: '' });
  const [openBill, setOpenBill] = useState<BillDetails | null>(null);

  useEffect(() => {
    fetch('/api/store').then(async (res) => {
      if (res.ok) setStore((await res.json()).store);
    });
  }, []);

  const loadReport = useCallback(() => {
    const params = new URLSearchParams();
    if (useDateRange) {
      params.set('from', dateFrom);
      params.set('to', dateTo);
    } else {
      params.set('month', month);
    }
    if (cashierFilter) params.set('cashier', cashierFilter);
    if (counterFilter) params.set('counter', counterFilter);

    fetch(`/api/sales-report?${params}`).then(async (res) => {
      if (res.ok) {
        const d = await res.json();
        setStats(d.stats);
        setOrders(d.orders || []);
        setFilterOptions(d.filters || { cashiers: [], counters: [] });
        setSelectedBills([]);
      }
    });
  }, [month, dateFrom, dateTo, useDateRange, cashierFilter, counterFilter]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const cashierOptions = useMemo(
    () => [{ value: '', label: t('සියල්ල', 'All') }, ...filterOptions.cashiers.map((c) => ({ value: c, label: c }))],
    [filterOptions.cashiers, t]
  );
  const counterOptions = useMemo(
    () => [{ value: '', label: t('සියල්ල', 'All') }, ...filterOptions.counters.map((c) => ({ value: c, label: c }))],
    [filterOptions.counters, t]
  );
  const allSelected = orders.length > 0 && selectedBills.length === orders.length;

  return (
    <div className="sales-report-page">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <h1 className="text-2xl font-extrabold label-si">{t('විකුණුම් වාර්තා', 'Sales Report')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>{t('මුද්‍රණය', 'Print')}</Button>
          <Button variant="primary" onClick={() => window.print()}>{t('PDF බාගත කරන්න', 'Download PDF')}</Button>
        </div>
      </div>

      <FilterBar className="no-print mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold label-si">
            <input type="checkbox" checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)} />
            {t('දින පරාසය', 'Date Range')}
          </label>
          {useDateRange ? (
            <>
              <DatePicker label={t('දිනය සිට', 'From Date')} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="max-w-xs" />
              <DatePicker label={t('දිනය දක්වා', 'To Date')} value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="max-w-xs" />
            </>
          ) : (
            <MonthPicker label={t('මාසය තෝරන්න', 'Select Month')} value={month} onChange={(e) => setMonth(e.target.value)} className="max-w-xs" lang={lang} />
          )}
          <Select label={t('කැෂියර්', 'Cashier')} value={cashierFilter} onChange={(e) => setCashierFilter(e.target.value)} options={cashierOptions} className="min-w-[160px]" />
          <Select label={t('කවුන්ටරය', 'Counter')} value={counterFilter} onChange={(e) => setCounterFilter(e.target.value)} options={counterOptions} className="min-w-[160px]" />
          <Button onClick={loadReport}>{t('සොයන්න', 'Search')}</Button>
          <Button
            variant="danger"
            disabled={selectedBills.length === 0}
            onClick={async () => {
              if (selectedBills.length === 0) return;
              const ok = await confirm({ title: t('තෝරාගත් බිල්පත් මකන්න', 'Delete Selected Bills'), message: t('තෝරාගත් බිල්පත් මකා දමන්නද?', 'Delete selected bills?') });
              if (!ok) return;
              await fetch(`/api/sales-report?bill_nos=${encodeURIComponent(selectedBills.join(','))}`, { method: 'DELETE' });
              loadReport();
            }}
          >
            {t('තෝරාගත් දේ මකන්න', 'Delete Selected')}
          </Button>
        </div>
      </FilterBar>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="!bg-primary !text-white text-center"><p className="label-si">{t('මුළු විකුණුම්', 'Total Sales')}</p><p className="text-2xl font-bold">LKR {Number(stats.total_sales).toFixed(2)}</p></Card>
        <Card className="!bg-emerald-600 !text-white text-center"><p className="label-si">{t('ලාභය', 'Profit')}</p><p className="text-2xl font-bold">LKR {Number(stats.total_profit).toFixed(2)}</p></Card>
        <Card className="!bg-slate-800 !text-white text-center"><p className="label-si">{t('බිල්පත්', 'Bills')}</p><p className="text-2xl font-bold">{stats.total_bills}</p></Card>
      </div>

      <Alert type="info" className="mb-4 label-si">
        {t('ලාභය ගණනය කරන්නේ එක් එක් භාණ්ඩයට (අපේ මිල - පිරිවැය) × ප්‍රමාණය ලෙසයි. වාර්තාවේ මුළු ලාභය = සියලු බිල් වල ලාභ එකතුව.', 'Profit is calculated per item as (selling price - cost price) x quantity. Total report profit is the sum of profit across all bills.')}
      </Alert>

      <Card className="overflow-hidden p-0">
        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table !table-auto">
            <thead>
              <tr>
                <th className="text-center"><Checkbox checked={allSelected} onChange={(checked) => setSelectedBills(checked ? orders.map((o) => String(o.bill_no)) : [])} /></th>
                <th className="text-left">{t('බිල් අංකය', 'Bill No')}</th>
                <th className="text-left">{t('කැෂියර්', 'Cashier')}</th>
                <th className="text-left">{t('කවුන්ටරය', 'Counter')}</th>
                <th className="text-right">{t('මුදල', 'Amount')}</th>
                <th className="text-right">{t('ගෙවූ', 'Paid')}</th>
                <th className="text-right">{t('ආපසු', 'Change')}</th>
                <th className="text-right">{t('ලාභය', 'Profit')}</th>
                <th className="text-center">{t('ක්‍රියා', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-slate-500 label-si">{t('වාර්තා නැත', 'No records found')}</td></tr>
              ) : orders.map((o) => (
                <tr key={String(o.bill_no)}>
                  <td className="text-center"><Checkbox checked={selectedBills.includes(String(o.bill_no))} onChange={(checked) => {
                    const key = String(o.bill_no);
                    setSelectedBills((prev) => checked ? [...prev, key] : prev.filter((k) => k !== key));
                  }} /></td>
                  <td className="whitespace-nowrap">{String(o.bill_no)}</td>
                  <td className="label-si whitespace-nowrap">{String(o.cashier_name)}</td>
                  <td className="whitespace-nowrap">{String(o.counter_no)}</td>
                  <td className="text-right whitespace-nowrap">LKR {Number(o.total_amount).toFixed(2)}</td>
                  <td className="text-right whitespace-nowrap">LKR {Number(o.cash_paid || 0).toFixed(2)}</td>
                  <td className="text-right whitespace-nowrap">LKR {Number(o.change_given || 0).toFixed(2)}</td>
                  <td className="text-right whitespace-nowrap">LKR {Number(o.total_profit).toFixed(2)}</td>
                  <td className="text-center whitespace-nowrap">
                    <Button
                      variant="secondary"
                      className="!py-1.5 !text-xs"
                      onClick={async () => {
                        const billNo = String(o.bill_no);
                        const res = await fetch(`/api/bills?bill_no=${encodeURIComponent(billNo)}`);
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
      </Card>

      <div className="no-print mt-4 text-center">
        <Button variant="danger" onClick={async () => {
          const ok = await confirm({ title: t('පැරණි වාර්තා මකන්න', 'Clear Old Reports'), message: t('3 මාසකට පැරණි දත්ත මකන්නද?', 'Delete data older than 3 months?') });
          if (!ok) return;
          await fetch('/api/sales-report', { method: 'DELETE' });
          loadReport();
          await alert({ title: t('සාර්ථකයි', 'Success'), message: t('දත්ත මකා දමන ලදී!', 'Data cleared!') });
        }}>{t('පැරණි වාර්තා මකන්න', 'Clear Old Reports')}</Button>
      </div>

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
