'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Input, Modal, SearchBar } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
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
  const { t } = useLang();
  const { confirm } = useDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ProductForm>({
    barcode: '', name: '', market_price: '0', our_price: '0', stock: '0',
  });
  const [flash, setFlash] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const res = await fetch('/api/products?format=list');
    if (res.ok) setProducts((await res.json()).products || []);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="page-title label-si">{t('????? ?????????', 'Product Management')}</h1>
          <Button onClick={() => setShowCreate(true)}>{t('?? ????????', 'Add Product')}</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('???? ?????', 'Total Products')}</p><p className="dashboard-metric-value">{metrics.total}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('??? ???', 'Low Stock')}</p><p className="dashboard-metric-value">{metrics.lowStock}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('??? ????', 'Out of Stock')}</p><p className="dashboard-metric-value">{metrics.noStock}</p></Card>
        <Card className="dashboard-metric-card"><p className="dashboard-metric-label">{t('???????? ???', 'Avg Price')}</p><p className="dashboard-metric-value">LKR {metrics.avgPrice.toFixed(2)}</p></Card>
      </div>

      {flash === 'updated' && <Alert type="success" className="mb-3">{t('?????????? ???!', 'Updated!')}</Alert>}
      {flash === 'deleted' && <Alert type="error" className="mb-3">{t('??? ??? ???!', 'Deleted!')}</Alert>}
      {flash === 'created' && <Alert type="success" className="mb-3">{t('?????? ??? ??? ???!', 'Product added!')}</Alert>}
      {createError && <Alert type="error" className="mb-3">{createError}</Alert>}

      <SearchBar value={search} onChange={setSearch} placeholder={t('?? ?? ???????? ????? ??????...', 'Search by name or barcode...')} className="mb-2" />
      <Card className="overflow-hidden p-0">
        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table">
            <colgroup>
              <col className="col-barcode" />
              <col className="col-name" />
              <col className="col-price" />
              <col className="col-price" />
              <col className="col-stock" />
              <col className="col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left label-si">{t('????????', 'Barcode')}</th>
                <th className="text-left label-si">{t('??', 'Name')}</th>
                <th className="text-right label-si">{t('??????? ???', 'Market')}</th>
                <th className="text-right label-si">{t('??? ???', 'Our Price')}</th>
                <th className="text-center label-si">{t('????', 'Stock')}</th>
                <th className="text-center label-si">{t('???????', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-500 label-si py-8">{t('????? ???', 'No products found')}</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.barcode}>
                  <td className="font-mono text-left">{p.barcode}</td>
                  <td className="font-bold label-si text-left">{p.name}</td>
                  <td className="text-right whitespace-nowrap">LKR {Number(p.market_price).toFixed(2)}</td>
                  <td className="text-right whitespace-nowrap">LKR {Number(p.our_price).toFixed(2)}</td>
                  <td className="text-center"><span className={p.stock <= 0 ? 'badge-danger' : 'badge-stock'}>{p.stock}</span></td>
                  <td className="cell-actions">
                    <div className="cell-actions-inner">
                      <Button variant="warning" className="!py-1.5 !text-xs" onClick={() => setEditProduct({ ...p })}>{t('????????', 'Edit')}</Button>
                      <Button variant="danger" className="!py-1.5 !text-xs" onClick={async () => {
                        const ok = await confirm({ title: t('?????? ?????', 'Delete Product'), message: t('??? ???????', 'Delete?') });
                        if (!ok) return;
                        await fetch(`/api/products?barcode=${encodeURIComponent(p.barcode)}`, { method: 'DELETE' });
                        setFlash('deleted');
                        loadProducts();
                      }}>{t('?????', 'Delete')}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('?? ???????? ??? ?????', 'Add New Product')} footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setShowCreate(false)}>{t('?????', 'Close')}</Button>
        <Button className="w-full" onClick={async () => {
          setCreateError('');
          const payload = {
            p_barcode: createForm.barcode,
            p_name: createForm.name,
            p_market: createForm.market_price,
            p_our: createForm.our_price,
            p_stock: createForm.stock,
          };
          const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const data = await res.json();
          if (!res.ok) {
            setCreateError(String(data.error || t('දෝෂයක් ඇත', 'Something went wrong')));
            return;
          }
          setShowCreate(false);
          setCreateForm({ barcode: '', name: '', market_price: '0', our_price: '0', stock: '0' });
          setFlash('created');
          loadProducts();
        }}>{t('??? ?????', 'Add')}</Button>
      </>}>
        <div className="space-y-3">
          <Input label={t('????????', 'Barcode')} value={createForm.barcode} onChange={(e) => setCreateForm((f) => ({ ...f, barcode: e.target.value }))} />
          <Input label={t('??', 'Name')} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label={t('??????? ???', 'Market Price')} type="number" step="any" value={createForm.market_price} onChange={(e) => setCreateForm((f) => ({ ...f, market_price: e.target.value }))} />
          <Input label={t('??? ???', 'Our Price')} type="number" step="any" value={createForm.our_price} onChange={(e) => setCreateForm((f) => ({ ...f, our_price: e.target.value }))} />
          <Input label={t('????', 'Stock')} type="number" value={createForm.stock} onChange={(e) => setCreateForm((f) => ({ ...f, stock: e.target.value }))} />
        </div>
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title={t('?????? ????????', 'Edit Product')} footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setEditProduct(null)}>{t('?????', 'Close')}</Button>
        <Button className="w-full" onClick={async () => {
          if (!editProduct) return;
          await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barcode: editProduct.barcode, name: editProduct.name, market_price: editProduct.market_price, our_price: editProduct.our_price, stock: editProduct.stock }) });
          setEditProduct(null);
          setFlash('updated');
          loadProducts();
        }}>{t('???? ?????', 'Save')}</Button>
      </>}>
        {editProduct && (
          <div className="space-y-3">
            <Input label={t('??', 'Name')} value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
            <Input label={t('??????? ???', 'Market Price')} type="number" step="any" value={editProduct.market_price} onChange={(e) => setEditProduct({ ...editProduct, market_price: Number(e.target.value) })} />
            <Input label={t('??? ???', 'Our Price')} type="number" step="any" value={editProduct.our_price} onChange={(e) => setEditProduct({ ...editProduct, our_price: Number(e.target.value) })} />
            <Input label={t('????', 'Stock')} type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} />
          </div>
        )}
      </Modal>
    </div>
  );
}
