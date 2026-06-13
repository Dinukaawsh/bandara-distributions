'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EndOfDayModal, type EndOfDayReport } from '@/components/modals/EndOfDayModal';
import { Alert, Button, Card, Input, Modal, PageLoader } from '@/components/ui';
import { useDialog } from '@/hooks/useDialog';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';
import { getTranslations } from '@/lib/translations';

type ProductDb = Record<string, {
  name: string;
  market_price: number;
  our_price: number;
  cost_price: number;
  stock_qty: number;
}>;

type BillItem = {
  barcode: string;
  name: string;
  marketPrice: number;
  ourPrice: number;
  qty: number;
  total: number;
  totalProfit: number;
};

type StoreInfo = { store_name: string; address: string; phone: string };

export default function BillingPage() {
  const router = useRouter();
  const { user, loading: sessionLoading, isAdmin } = useSession();
  const { lang, t } = useLang();
  const { confirm, alert } = useDialog();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [productsDb, setProductsDb] = useState<ProductDb>({});
  const [store, setStore] = useState<StoreInfo>({
    store_name: 'BANDARA STORE',
    address: 'මැදවෙල, මන්දාරම්නුවර',
    phone: 'දු.ක: 0729484858 / 0759335156',
  });
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [qty, setQty] = useState('1');
  const [cashPaid, setCashPaid] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState('--/--/----');
  const [billTime, setBillTime] = useState('--:--:--');
  const [savingProduct, setSavingProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [endOfDayReport, setEndOfDayReport] = useState<EndOfDayReport | null>(null);
  const [showEndOfDayModal, setShowEndOfDayModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    p_barcode: '', p_name: '', p_market: '0.00', p_our: '0.00', p_stock: '50',
  });

  const ln = getTranslations(lang);

  const setLiveDateTime = useCallback(() => {
    const now = new Date();
    setBillDate(`${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`);
    setBillTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    async function loadData() {
      const [productsRes, storeRes] = await Promise.all([fetch('/api/products'), fetch('/api/store')]);
      if (productsRes.ok) setProductsDb((await productsRes.json()).products || {});
      if (storeRes.ok) setStore((await storeRes.json()).store);
      setLoading(false);
      setLiveDateTime();
    }
    loadData();
  }, [sessionLoading, setLiveDateTime]);

  const grandTotal = billItems.reduce((s, i) => s + i.total, 0);
  const totalQty = billItems.reduce((s, i) => s + i.qty, 0);
  const totalSavings = billItems.reduce((s, i) => s + (i.marketPrice > i.ourPrice ? (i.marketPrice - i.ourPrice) * i.qty : 0), 0);
  const cash = parseFloat(cashPaid) || 0;
  const balance = cash - grandTotal;

  const processBilling = useCallback(() => {
    const code = barcode.trim();
    const quantity = parseFloat(qty) || 1;
    if (!code) { barcodeRef.current?.focus(); return; }
    const prod = productsDb[code];
    if (!prod) { setScanResult(ln.product_not_found); barcodeRef.current?.select(); return; }
    setBillItems((prev) => {
      const existing = prev.find((i) => i.barcode === code);
      const marketPrice = Number(prod.market_price) || 0;
      const ourPrice = Number(prod.our_price) || 0;
      const costPrice = Number(prod.cost_price) || ourPrice * 0.95;
      if (existing) {
        return prev.map((i) => i.barcode === code ? { ...i, qty: i.qty + quantity, total: (i.qty + quantity) * ourPrice, totalProfit: (i.qty + quantity) * (ourPrice - costPrice) } : i);
      }
      return [...prev, { barcode: code, name: prod.name, marketPrice, ourPrice, qty: quantity, total: ourPrice * quantity, totalProfit: (ourPrice - costPrice) * quantity }];
    });
    setScanResult(`${ln.added}: ${prod.name}`);
    setBarcode(''); setQty('1');
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }, [barcode, qty, productsDb, ln]);

  const resetBill = async (isAuto = false) => {
    if (!isAuto) {
      const ok = await confirm({
        title: t('බිල මකන්න', 'Clear Bill'),
        message: ln.clear_confirm,
        confirmVariant: 'danger',
      });
      if (!ok) return;
    }
    setBillItems([]); setCashPaid(''); setScanResult(''); setBarcode(''); setQty('1'); setBillNo('');
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const triggerPrint = async () => {
    if (!billItems.length) {
      await alert({ title: t('දැනුම්දීම', 'Notice'), message: ln.add_products_first });
      return;
    }
    setLiveDateTime();
    const res = await fetch('/api/bills', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_amount: grandTotal, total_profit: billItems.reduce((s, i) => s + i.totalProfit, 0), cashier_name: user?.full_name || user?.username, counter_no: user?.counter_no || 'Counter 1', bill_items: billItems }),
    });
    const data = await res.json();
    if (data.status === 'success') { setBillNo(data.bill_no); window.print(); resetBill(true); }
    else await alert({ title: t('දෝෂය', 'Error'), message: String(data.message) });
  };

  const saveProduct = async () => {
    if (!adminForm.p_barcode.trim() || !adminForm.p_name.trim()) {
      await alert({ title: t('දැනුම්දීම', 'Notice'), message: ln.barcode_name_required });
      return;
    }
    setSavingProduct(true);
    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adminForm) });
    const data = await res.json();
    setSavingProduct(false);
    if (data.status === 'success') {
      await alert({ title: t('සාර්ථකයි', 'Success'), message: String(data.message) });
      setProductsDb((p) => ({ ...p, [data.product.barcode]: { name: data.product.name, market_price: data.product.market_price, our_price: data.product.our_price, cost_price: data.product.cost_price, stock_qty: data.product.stock } }));
      setAdminForm({ p_barcode: '', p_name: '', p_market: '0.00', p_our: '0.00', p_stock: '50' });
    } else await alert({ title: t('දෝෂය', 'Error'), message: String(data.error || data.message) });
  };

  const handleEndOfDay = async () => {
    const ok = await confirm({
      title: ln.end_of_day,
      message: ln.end_of_day_confirm,
      confirmVariant: 'warning',
    });
    if (!ok) return;
    const res = await fetch('/api/end-of-day', { method: 'POST' });
    if (res.ok) {
      setEndOfDayReport(await res.json());
      setShowEndOfDayModal(true);
    }
  };

  const closeEndOfDay = () => {
    setShowEndOfDayModal(false);
    setEndOfDayReport(null);
    router.push('/login');
  };

  if (sessionLoading || loading) return <PageLoader />;

  return (
    <div className="billing-print-area">
      <div className={`grid gap-4 ${isAdmin ? 'lg:grid-cols-3' : ''}`}>
        {isAdmin && (
          <Card title={ln.add_product} className="no-print lg:sticky lg:top-20 lg:self-start border-t-4 border-t-primary">
            <div className="space-y-3">
              <Input label={ln.barcode_lbl} value={adminForm.p_barcode} onChange={(e) => setAdminForm({ ...adminForm, p_barcode: e.target.value })} />
              <Input label={ln.p_name} value={adminForm.p_name} onChange={(e) => setAdminForm({ ...adminForm, p_name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input label={ln.market_price_lbl} type="number" step="any" value={adminForm.p_market} onChange={(e) => setAdminForm({ ...adminForm, p_market: e.target.value })} />
                <Input label={ln.our_price_lbl} type="number" step="any" value={adminForm.p_our} onChange={(e) => setAdminForm({ ...adminForm, p_our: e.target.value })} />
              </div>
              <Input label={ln.stock_qty} type="number" value={adminForm.p_stock} onChange={(e) => setAdminForm({ ...adminForm, p_stock: e.target.value })} />
              <Button onClick={saveProduct} loading={savingProduct} className="w-full">{ln.save_btn}</Button>
            </div>
          </Card>
        )}

        <Card className={`${isAdmin ? 'lg:col-span-2' : ''} border-t-4 border-t-primary`}>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-extrabold label-si">{store.store_name}</h2>
            <p className="text-sm text-slate-600 label-si">{store.address}<br />{store.phone}</p>
          </div>

          {scanResult && <Alert type={scanResult.includes(ln.added) ? 'success' : 'error'}>{scanResult}</Alert>}

          <div className="no-print grid gap-3 md:grid-cols-[2fr_1fr_auto] mb-4">
            <Input ref={barcodeRef} label={ln.scan_barcode} value={barcode} onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); processBilling(); } }} placeholder={ln.scan_placeholder} autoFocus />
            <Input label={ln.qty} type="number" step="any" value={qty} onChange={(e) => setQty(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); processBilling(); } }} />
            <div className="flex items-end"><Button size="lg" onClick={processBilling} className="w-full">{ln.add}</Button></div>
          </div>

          <div className="flex justify-between rounded-lg bg-slate-100 p-3 text-sm mb-3 no-print">
            <span className="label-si">{ln.bill_no} <strong className={!billNo ? 'text-primary' : ''}>{billNo || ln.auto_bill}</strong></span>
            <div className="flex items-center gap-2">
              {billItems.length > 0 && (
                <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => setShowItemsModal(true)}>
                  {t('භාණ්ඩ බලන්න', 'View Items')} ({billItems.length})
                </Button>
              )}
              <div className="text-right label-si"><div>{ln.date} <strong>{billDate}</strong></div><div>{ln.time} <strong>{billTime}</strong></div></div>
            </div>
          </div>

          <div className="flex justify-between rounded-lg bg-slate-100 p-3 text-sm mb-3 print-only">
            <span className="label-si">{ln.bill_no} <strong>{billNo || ln.auto_bill}</strong></span>
            <div className="text-right label-si"><div>{ln.date} <strong>{billDate}</strong></div><div>{ln.time} <strong>{billTime}</strong></div></div>
          </div>

          <table className="data-table mb-4">
            <thead><tr>
              <th className="label-si">{ln.item_title}</th>
              <th className="text-right label-si">{ln.market_price}</th>
              <th className="text-right label-si">{ln.our_price}</th>
              <th className="text-right label-si">{ln.total_col}</th>
            </tr></thead>
            <tbody>
              {billItems.map((item) => (
                <tr key={item.barcode}>
                  <td className="font-bold label-si">{item.qty} x {item.name}</td>
                  <td className="text-right">{item.marketPrice.toFixed(2)}</td>
                  <td className="text-right">{item.ourPrice.toFixed(2)}</td>
                  <td className="text-right font-bold">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="print-only space-y-1 text-sm">
            <div className="flex justify-between label-si"><span>{ln.items}</span><span>{totalQty}</span></div>
            <div className="flex justify-between font-bold border-t border-dashed pt-1 label-si"><span>{ln.total}</span><span>Rs. {grandTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-emerald-700 label-si"><span>{ln.paid}</span><span>Rs. {cash.toFixed(2)}</span></div>
            <div className="flex justify-between text-red-600 label-si"><span>{ln.balance_short}</span><span>Rs. {Math.max(balance, 0).toFixed(2)}</span></div>
          </div>

          <div className="no-print space-y-3">
            <div className="text-right space-y-1 label-si">
              <p className="font-bold">{ln.total} Rs. {grandTotal.toFixed(2)}</p>
              <p className="text-emerald-700">{ln.paid} Rs. {cash.toFixed(2)}</p>
              <p className="text-red-600">{ln.balance_short} Rs. {balance >= 0 ? balance.toFixed(2) : '0.00'}</p>
            </div>
            <Input label={`# ${ln.cash_paid}`} type="number" step="any" value={cashPaid} onChange={(e) => setCashPaid(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); triggerPrint(); } }} className="!text-2xl !text-center !font-bold" />
            <div className="flex gap-3">
              <Button variant="success" size="lg" className="flex-1" onClick={triggerPrint}>{ln.print}</Button>
              <Button variant="danger" size="lg" onClick={() => resetBill(false)}>{ln.clear}</Button>
            </div>
          </div>

          <p className="print-only text-center text-xs mt-3 label-si">{ln.thank_you}<br />Software by: TMsoftware</p>
        </Card>
      </div>

      <div className="no-print mt-4">
        <Button variant="warning" className="w-full" onClick={handleEndOfDay}>
          {ln.end_of_day}
        </Button>
      </div>

      <Modal
        open={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        title={t('බිල් භාණ්ඩ', 'Bill Items')}
        size="lg"
        footer={
          <Button className="w-full" onClick={() => setShowItemsModal(false)}>
            {t('වසන්න', 'Close')}
          </Button>
        }
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>{ln.item_title}</th>
              <th className="text-right">{ln.market_price}</th>
              <th className="text-right">{ln.our_price}</th>
              <th className="text-right">{ln.total_col}</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item) => (
              <tr key={item.barcode}>
                <td className="label-si font-bold">{item.qty} x {item.name}</td>
                <td className="text-right">{item.marketPrice.toFixed(2)}</td>
                <td className="text-right">{item.ourPrice.toFixed(2)}</td>
                <td className="text-right font-bold">{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>

      <EndOfDayModal
        open={showEndOfDayModal}
        report={endOfDayReport}
        onClose={closeEndOfDay}
        onPrint={() => window.print()}
      />
    </div>
  );
}
