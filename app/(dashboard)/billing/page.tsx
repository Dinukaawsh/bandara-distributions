'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BillPreviewModal } from '@/components/billing/BillPreviewModal';
import { BillReceipt } from '@/components/billing/BillReceipt';
import { ProductSearch } from '@/components/billing/ProductSearch';
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
  const [customerSession, setCustomerSession] = useState(1);
  const [savingProduct, setSavingProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printReceipt, setPrintReceipt] = useState<{
    billNo: string;
    cashPaid: number;
    changeDue: number;
    items: BillItem[];
  } | null>(null);
  const [endOfDayReport, setEndOfDayReport] = useState<EndOfDayReport | null>(null);
  const [showEndOfDayModal, setShowEndOfDayModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    p_barcode: '', p_name: '', p_market: '0.00', p_our: '0.00', p_stock: '50',
  });

  const ln = getTranslations(lang);
  const canBill = !isAdmin;

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
  const cash = parseFloat(cashPaid) || 0;
  const balance = cash - grandTotal;
  const changeDue = cashPaid !== '' && balance >= 0 ? balance : 0;
  const amountShort = cashPaid !== '' && balance < 0 ? Math.abs(balance) : 0;

  const addProductToBill = useCallback((code: string, quantity = parseFloat(qty) || 1) => {
    const trimmed = code.trim();
    if (!trimmed) return false;
    const prod = productsDb[trimmed];
    if (!prod) {
      setScanResult(ln.product_not_found);
      return false;
    }
    setBillItems((prev) => {
      const existing = prev.find((i) => i.barcode === trimmed);
      const marketPrice = Number(prod.market_price) || 0;
      const ourPrice = Number(prod.our_price) || 0;
      const costPrice = Number(prod.cost_price) || ourPrice * 0.95;
      if (existing) {
        return prev.map((i) =>
          i.barcode === trimmed
            ? {
                ...i,
                qty: i.qty + quantity,
                total: (i.qty + quantity) * ourPrice,
                totalProfit: (i.qty + quantity) * (ourPrice - costPrice),
              }
            : i
        );
      }
      return [
        ...prev,
        {
          barcode: trimmed,
          name: prod.name,
          marketPrice,
          ourPrice,
          qty: quantity,
          total: ourPrice * quantity,
          totalProfit: (ourPrice - costPrice) * quantity,
        },
      ];
    });
    setScanResult(`${ln.added}: ${prod.name}`);
    setBarcode('');
    setQty('1');
    setTimeout(() => barcodeRef.current?.focus(), 50);
    return true;
  }, [productsDb, qty, ln]);

  const processBilling = useCallback(() => {
    addProductToBill(barcode);
  }, [addProductToBill, barcode]);

  const startNewCustomer = async () => {
    if (billItems.length > 0) {
      const ok = await confirm({
        title: t('නව ගනුදෙනුකරු', 'New Customer'),
        message: t('වත්මන් බිල මකා නව සැසියක් ආරම්භ කරන්නද?', 'Clear current bill and start a new customer session?'),
        confirmVariant: 'warning',
      });
      if (!ok) return;
    }
    setBillItems([]);
    setCashPaid('');
    setScanResult('');
    setBarcode('');
    setQty('1');
    setBillNo('');
    setCustomerSession((s) => s + 1);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const resetAfterSale = () => {
    setBillItems([]);
    setCashPaid('');
    setScanResult('');
    setBarcode('');
    setQty('1');
    setBillNo('');
    setCustomerSession((s) => s + 1);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const openPreview = async () => {
    if (!billItems.length) {
      await alert({ title: t('දැනුම්දීම', 'Notice'), message: ln.add_products_first });
      return;
    }
    if (!cashPaid || cash < grandTotal) {
      await alert({ title: t('දැනුම්දීම', 'Notice'), message: ln.insufficient_payment });
      return;
    }
    setLiveDateTime();
    setShowPreview(true);
  };

  const confirmPrintAndSave = async () => {
    setPrinting(true);
    setLiveDateTime();
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_amount: grandTotal,
        total_profit: billItems.reduce((s, i) => s + i.totalProfit, 0),
        cash_paid: cash,
        change_given: changeDue,
        cashier_name: user?.full_name || user?.username,
        cashier_username: user?.username,
        counter_no: user?.counter_no || 'Counter 1',
        bill_items: billItems,
      }),
    });
    const data = await res.json();
    setPrinting(false);
    if (data.status !== 'success') {
      await alert({ title: t('දෝෂය', 'Error'), message: String(data.message) });
      return;
    }
    setBillNo(data.bill_no);
    setPrintReceipt({
      billNo: data.bill_no,
      cashPaid: cash,
      changeDue,
      items: [...billItems],
    });
    setShowPreview(false);
    setTimeout(() => {
      window.print();
      setPrintReceipt(null);
      resetAfterSale();
    }, 150);
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
      setProductsDb((p) => ({
        ...p,
        [data.product.barcode]: {
          name: data.product.name,
          market_price: data.product.market_price,
          our_price: data.product.our_price,
          cost_price: data.product.cost_price,
          stock_qty: data.product.stock,
        },
      }));
      setAdminForm({ p_barcode: '', p_name: '', p_market: '0.00', p_our: '0.00', p_stock: '50' });
    } else {
      await alert({ title: t('දෝෂය', 'Error'), message: String(data.error || data.message) });
    }
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
    } else {
      const data = await res.json();
      await alert({ title: t('දෝෂය', 'Error'), message: data.error || 'Failed' });
    }
  };

  const closeEndOfDay = () => {
    setShowEndOfDayModal(false);
    setEndOfDayReport(null);
    router.push('/login');
  };

  if (sessionLoading || loading) return <PageLoader />;

  return (
    <div>
      {canBill && user && (
        <div className="cashier-banner no-print mb-4">
          <div className="cashier-banner-grid">
            <div>
              <p className="cashier-banner-label label-si">{ln.cashier_label}</p>
              <p className="cashier-banner-value label-si">{user.full_name}</p>
            </div>
            <div>
              <p className="cashier-banner-label label-si">{ln.counter_label}</p>
              <p className="cashier-banner-value">{user.counter_no}</p>
            </div>
            <div>
              <p className="cashier-banner-label label-si">{ln.session_no}</p>
              <p className="cashier-banner-value">#{customerSession}</p>
            </div>
            <div>
              <p className="cashier-banner-label label-si">{t('තත්වය', 'Status')}</p>
              <span className={user.availability_status === 'busy' ? 'badge-warning' : 'badge-stock'}>
                {user.availability_status === 'busy' ? ln.status_busy : ln.status_available}
              </span>
            </div>
          </div>
          <div className="cashier-banner-actions">
            <Button
              variant={user.availability_status === 'busy' ? 'success' : 'secondary'}
              className="w-full sm:w-auto"
              onClick={async () => {
                const res = await fetch('/api/users/status', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'available' }),
                });
                if (res.ok) window.location.reload();
              }}
            >
              {ln.set_available}
            </Button>
            <Button
              variant={user.availability_status === 'busy' ? 'secondary' : 'warning'}
              className="w-full sm:w-auto"
              onClick={async () => {
                const res = await fetch('/api/users/status', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'busy' }),
                });
                if (res.ok) window.location.reload();
              }}
            >
              {ln.set_busy}
            </Button>
            <Button variant="secondary" onClick={startNewCustomer} className="w-full sm:w-auto">
              {ln.new_customer}
            </Button>
          </div>
        </div>
      )}

      <div className={`grid gap-4 ${isAdmin ? 'lg:grid-cols-3' : ''}`}>
        {isAdmin && (
          <Card title={ln.add_product} className="no-print lg:sticky lg:top-20 lg:self-start border-t-4 border-t-primary">
            <Alert type="info" className="mb-4 label-si">{ln.admin_billing_notice}</Alert>
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

        {canBill && (
          <Card className="border-t-4 border-t-primary">
            <div className="text-center mb-4 no-print">
              <h2 className="text-2xl font-extrabold label-si">{store.store_name}</h2>
              <p className="text-sm text-slate-600 label-si">{store.address}<br />{store.phone}</p>
            </div>

            {scanResult && (
              <Alert type={scanResult.includes(ln.added) ? 'success' : 'error'} className="no-print mb-3">
                {scanResult}
              </Alert>
            )}

            <div className="no-print space-y-3 mb-4">
              <Input
                ref={barcodeRef}
                label={ln.scan_barcode}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); processBilling(); } }}
                placeholder={ln.scan_placeholder}
                autoFocus
              />
              <ProductSearch
                products={productsDb}
                onSelect={(code) => addProductToBill(code)}
              />
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input
                  label={ln.qty}
                  type="number"
                  step="any"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); processBilling(); } }}
                />
                <div className="flex items-end">
                  <Button size="lg" onClick={processBilling} className="w-full">{ln.add}</Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between rounded-lg bg-slate-100 p-3 text-sm mb-3 no-print">
              <span className="label-si">
                {ln.bill_no}{' '}
                <strong className={!billNo ? 'text-primary' : ''}>{billNo || ln.auto_bill}</strong>
              </span>
              <div className="flex items-center gap-2">
                {billItems.length > 0 && (
                  <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => setShowItemsModal(true)}>
                    {t('භාණ්ඩ බලන්න', 'View Items')} ({billItems.length})
                  </Button>
                )}
                <div className="text-right label-si">
                  <div>{ln.date} <strong>{billDate}</strong></div>
                  <div>{ln.time} <strong>{billTime}</strong></div>
                </div>
              </div>
            </div>

            {billItems.length > 0 ? (
              <div className="no-print data-table-wrap custom-scrollbar mb-4">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left label-si">{ln.item_title}</th>
                      <th className="text-right label-si">{ln.our_price}</th>
                      <th className="text-right label-si">{ln.total_col}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => (
                      <tr key={item.barcode}>
                        <td className="font-bold label-si">{item.qty} x {item.name}</td>
                        <td className="text-right">{item.ourPrice.toFixed(2)}</td>
                        <td className="text-right font-bold">{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-print text-center text-slate-500 py-8 label-si">
                {t('භාණ්ඩ ස්කෑන් කරන්න හෝ සොයා තෝරන්න', 'Scan or search products to add')}
              </p>
            )}

            {billItems.length > 0 && (
              <div className="no-print billing-payment-panel">
                <h3 className="billing-payment-title label-si">{ln.payment_section}</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="billing-payment-box billing-payment-total">
                    <p className="billing-payment-label label-si">{ln.total}</p>
                    <p className="billing-payment-value">LKR {grandTotal.toFixed(2)}</p>
                  </div>
                  <div className="billing-payment-box">
                    <Input
                      label={ln.customer_paid}
                      type="number"
                      step="any"
                      min="0"
                      value={cashPaid}
                      onChange={(e) => setCashPaid(e.target.value)}
                      className="!text-2xl !text-center !font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  <div className={`billing-payment-box billing-payment-change ${amountShort > 0 ? 'billing-payment-short' : ''}`}>
                    <p className="billing-payment-label label-si">
                      {amountShort > 0 ? ln.amount_due : ln.change_return}
                    </p>
                    <p className="billing-payment-value">
                      {cashPaid === ''
                        ? '—'
                        : amountShort > 0
                          ? `LKR ${amountShort.toFixed(2)}`
                          : `LKR ${changeDue.toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button variant="success" size="lg" className="flex-1" onClick={openPreview}>
                    {ln.complete_sale}
                  </Button>
                  <Button variant="danger" size="lg" onClick={startNewCustomer}>{ln.new_customer}</Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {!canBill && (
          <Card className="border-t-4 border-t-primary">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold label-si">{store.store_name}</h2>
              <p className="text-sm text-slate-600 label-si">{store.address}<br />{store.phone}</p>
            </div>

            <Alert type="info" className="mb-4 label-si">
              {t('Admin භූමිකාවට බිල්පත් සම්පූර්ණ කිරීම අක්‍රියයි.', 'Billing checkout is disabled for Admin role.')}
            </Alert>

            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('භාණ්ඩ ගණන', 'Products')}</p>
                <p className="text-2xl font-extrabold text-primary">{Object.keys(productsDb).length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('දිනය', 'Date')}</p>
                <p className="text-lg font-extrabold text-slate-800">{billDate}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('වේලාව', 'Time')}</p>
                <p className="text-lg font-extrabold text-slate-800">{billTime}</p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
              <p className="mb-3 text-sm font-semibold label-si">
                {t('ඔබට කළ හැකි දේ:', 'What you can do from here:')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => router.push('/settings/products')}>
                  {t('භාණ්ඩ කළමනාකරණයට යන්න', 'Go to Product Management')}
                </Button>
                <Button variant="secondary" onClick={() => router.push('/sales-report')}>
                  {t('විකුණුම් වාර්තාවට යන්න', 'Go to Sales Report')}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {isAdmin && (
        <div className="no-print mt-4">
          <Button variant="warning" className="w-full" onClick={handleEndOfDay}>
            {ln.end_of_day}
          </Button>
        </div>
      )}

      {/* Hidden print receipt */}
      {printReceipt && (
        <div className="billing-print-area print-only">
          <BillReceipt
            lang={lang}
            store={store}
            billNo={printReceipt.billNo}
            billDate={billDate}
            billTime={billTime}
            cashierName={user?.full_name || user?.username || ''}
            counterNo={user?.counter_no || ''}
            items={printReceipt.items}
            grandTotal={printReceipt.items.reduce((s, i) => s + i.total, 0)}
            cashPaid={printReceipt.cashPaid}
            changeDue={printReceipt.changeDue}
          />
        </div>
      )}

      <BillPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirmPrint={confirmPrintAndSave}
        printing={printing}
        store={store}
        billNo={billNo || ln.auto_bill}
        billDate={billDate}
        billTime={billTime}
        cashierName={user?.full_name || user?.username || ''}
        counterNo={user?.counter_no || ''}
        items={billItems}
        grandTotal={grandTotal}
        cashPaid={cash}
        changeDue={changeDue}
      />

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
              <th className="text-right">{ln.our_price}</th>
              <th className="text-right">{ln.total_col}</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item) => (
              <tr key={item.barcode}>
                <td className="label-si font-bold">{item.qty} x {item.name}</td>
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

