'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Checkbox, Input, Modal, Pagination, SearchBar } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { usePagination } from '@/hooks/usePagination';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';

type Product = { barcode: string; name: string; market_price: number; our_price: number; stock: number };

type ProductForm = {
  barcode: string;
  name: string;
  market_price: string;
  our_price: string;
  stock: string;
};

export default function SettingsProductsPage() {
  useSession(true, true);
  const { t, lang } = useLang();
  const { confirm } = useDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ProductForm>({ barcode: '', name: '', market_price: '0', our_price: '0', stock: '0' });
  const [flash, setFlash] = useState('');
  const [createError, setCreateError] = useState('');
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]);
  const moneyLabel = lang === 'si' ? 'රුපියල්' : 'LKR';

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const res = await fetch('/api/products?format=list');
    if (res.ok) {
      setProducts((await res.json()).products || []);
      setSelectedBarcodes([]);
    }
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.toLowerCase().includes(search.toLowerCase()));
  const {
    paginatedItems,
    page,
    setPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(filtered, undefined, search);
  const allSelected = filtered.length > 0 && filtered.every((p) => selectedBarcodes.includes(p.barcode));

  const metrics = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((p) => p.stock <= 5).length;
    const noStock = products.filter((p) => p.stock <= 0).length;
    const avgPrice = total ? products.reduce((s, p) => s + Number(p.our_price), 0) / total : 0;
    return { total, lowStock, noStock, avgPrice };
  }, [products]);

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="page-title label-si">{t('භාණ්ඩ කළමනාකරණය', 'Product Management')}</h1>
          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={selectedBarcodes.length === 0}
              onClick={async () => {
                const ok = await confirm({ title: t('තෝරාගත් භාණ්ඩ මකන්න', 'Delete Selected Products'), message: t('තෝරාගත් භාණ්ඩ මකා දමන්නද?', 'Delete selected products?') });
                if (!ok) return;
                await Promise.all(selectedBarcodes.map((code) => fetch(`/api/products?barcode=${encodeURIComponent(code)}`, { method: 'DELETE' })));
                setFlash('deleted');
                loadProducts();
              }}
            >
              {t('තෝරාගත් දේ මකන්න', 'Delete Selected')}
            </Button>
            <Button onClick={() => setShowCreate(true)}>{t('භාණ්ඩයක් එක් කරන්න', 'Add Product')}</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('මුළු භාණ්ඩ', 'Total Products')}</p><p className="dashboard-metric-value">{metrics.total}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('අඩු තොග', 'Low Stock')}</p><p className="dashboard-metric-value">{metrics.lowStock}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('තොග නැති', 'Out of Stock')}</p><p className="dashboard-metric-value">{metrics.noStock}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('සාමාන්‍ය මිල', 'Avg Price')}</p><p className="dashboard-metric-value">{moneyLabel} {metrics.avgPrice.toFixed(2)}</p></Card>
      </div>

      {flash === 'updated' && <Alert type="success">{t('යාවත්කාලීන විය!', 'Updated!')}</Alert>}
      {flash === 'deleted' && <Alert type="error">{t('මකා දමන ලදී!', 'Deleted!')}</Alert>}
      {flash === 'created' && <Alert type="success">{t('භාණ්ඩය එක් කරන ලදී!', 'Product added!')}</Alert>}
      {createError && <Alert type="error">{createError}</Alert>}

      <SearchBar value={search} onChange={setSearch} placeholder={t('නම හෝ බාර්කෝඩ් මඟින් සොයන්න...', 'Search by name or barcode...')} className="mb-2" />

      <Card className="overflow-hidden p-0">
        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-center"><Checkbox checked={allSelected} onChange={(checked) => {
                  const keys = filtered.map((p) => p.barcode);
                  setSelectedBarcodes(checked ? Array.from(new Set([...selectedBarcodes, ...keys])) : selectedBarcodes.filter((k) => !keys.includes(k)));
                }} /></th>
                <th className="text-left">{t('බාර්කෝඩ්', 'Barcode')}</th>
                <th className="text-left">{t('නම', 'Name')}</th>
                <th className="text-right">{t('වෙළඳපොල මිල', 'Market')}</th>
                <th className="text-right">{t('අපේ මිල', 'Our Price')}</th>
                <th className="text-center">{t('තොගය', 'Stock')}</th>
                <th className="text-center">{t('ක්‍රියා', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-500 py-8">{t('No products found', 'No products found')}</td></tr>
              ) : paginatedItems.map((p) => (
                <tr key={p.barcode}>
                  <td className="text-center"><Checkbox checked={selectedBarcodes.includes(p.barcode)} onChange={(checked) => setSelectedBarcodes((prev) => checked ? [...prev, p.barcode] : prev.filter((v) => v !== p.barcode))} /></td>
                  <td className="font-mono">{p.barcode}</td>
                  <td className="font-bold label-si">{p.name}</td>
                  <td className="text-right">{moneyLabel} {Number(p.market_price).toFixed(2)}</td>
                  <td className="text-right">{moneyLabel} {Number(p.our_price).toFixed(2)}</td>
                  <td className="text-center"><span className={p.stock <= 0 ? 'badge-danger' : 'badge-stock'}>{p.stock}</span></td>
                  <td className="cell-actions">
                    <div className="cell-actions-inner">
                      <Button variant="warning" className="!py-1.5 !text-xs" onClick={() => setEditProduct({ ...p })}>{t('Edit', 'Edit')}</Button>
                      <Button variant="danger" className="!py-1.5 !text-xs" onClick={async () => {
                        const ok = await confirm({ title: t('Delete Product', 'Delete Product'), message: t('Delete this product?', 'Delete this product?') });
                        if (!ok) return;
                        await fetch(`/api/products?barcode=${encodeURIComponent(p.barcode)}`, { method: 'DELETE' });
                        setFlash('deleted');
                        loadProducts();
                      }}>{t('Delete', 'Delete')}</Button>
                    </div>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('Add New Product', 'Add New Product')} size="lg" footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setShowCreate(false)}>{t('Close', 'Close')}</Button>
        <Button className="w-full" onClick={async () => {
          setCreateError('');
          const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            p_barcode: createForm.barcode,
            p_name: createForm.name,
            p_market: createForm.market_price,
            p_our: createForm.our_price,
            p_stock: createForm.stock,
          })});
          const data = await res.json();
          if (!res.ok) { setCreateError(String(data.error || 'Something went wrong')); return; }
          setShowCreate(false);
          setCreateForm({ barcode: '', name: '', market_price: '0', our_price: '0', stock: '0' });
          setFlash('created');
          loadProducts();
        }}>{t('Add', 'Add')}</Button>
      </>}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={t('Barcode', 'Barcode')} value={createForm.barcode} onChange={(e) => setCreateForm((f) => ({ ...f, barcode: e.target.value }))} />
          <Input label={t('Name', 'Name')} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label={t('Market Price', 'Market Price')} type="number" step="any" value={createForm.market_price} onChange={(e) => setCreateForm((f) => ({ ...f, market_price: e.target.value }))} />
          <Input label={t('Our Price', 'Our Price')} type="number" step="any" value={createForm.our_price} onChange={(e) => setCreateForm((f) => ({ ...f, our_price: e.target.value }))} />
          <Input label={t('Stock', 'Stock')} type="number" value={createForm.stock} onChange={(e) => setCreateForm((f) => ({ ...f, stock: e.target.value }))} />
        </div>
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title={t('Edit Product', 'Edit Product')} size="lg" footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setEditProduct(null)}>{t('Close', 'Close')}</Button>
        <Button className="w-full" onClick={async () => {
          if (!editProduct) return;
          await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editProduct) });
          setEditProduct(null);
          setFlash('updated');
          loadProducts();
        }}>{t('Save', 'Save')}</Button>
      </>}>
        {editProduct && (
          <div className="grid gap-3 md:grid-cols-2">
            <Input label={t('Name', 'Name')} value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
            <Input label={t('Market Price', 'Market Price')} type="number" step="any" value={editProduct.market_price} onChange={(e) => setEditProduct({ ...editProduct, market_price: Number(e.target.value) })} />
            <Input label={t('Our Price', 'Our Price')} type="number" step="any" value={editProduct.our_price} onChange={(e) => setEditProduct({ ...editProduct, our_price: Number(e.target.value) })} />
            <Input label={t('Stock', 'Stock')} type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} />
          </div>
        )}
      </Modal>
    </div>
  );
}
