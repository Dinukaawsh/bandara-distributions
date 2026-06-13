'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Input, Modal, SearchBar, Select } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';

type Product = { barcode: string; name: string; market_price: number; our_price: number; stock: number };

export default function SettingsProductsPage() {
  useSession(true, true);
  const { t } = useLang();
  const { confirm } = useDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [flash, setFlash] = useState('');

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const res = await fetch('/api/products?format=list');
    if (res.ok) setProducts((await res.json()).products || []);
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold label-si">{t('භාණ්ඩ කළමනාකරණය', 'Product Management')}</h1>
      {flash === 'updated' && <Alert type="success" className="mb-3">{t('යාවත්කාලීන විය!', 'Updated!')}</Alert>}
      {flash === 'deleted' && <Alert type="error" className="mb-3">{t('මකා දමන ලදී!', 'Deleted!')}</Alert>}
      <SearchBar value={search} onChange={setSearch} placeholder={t('නම හෝ බාර්කෝඩ් මඟින් සොයන්න...', 'Search by name or barcode...')} className="mb-4" />
      <Card className="overflow-x-auto custom-scrollbar p-0">
        <table className="data-table">
          <thead><tr>
            <th className="label-si">{t('බාර්කෝඩ්', 'Barcode')}</th>
            <th className="label-si">{t('නම', 'Name')}</th>
            <th className="text-right label-si">{t('වෙළඳපොල මිල', 'Market')}</th>
            <th className="text-right label-si">{t('අපේ මිල', 'Our Price')}</th>
            <th className="text-center label-si">{t('තොගය', 'Stock')}</th>
            <th className="text-center label-si">{t('ක්‍රියා', 'Action')}</th>
          </tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.barcode}>
                <td>{p.barcode}</td>
                <td className="font-bold label-si">{p.name}</td>
                <td className="text-right">Rs. {Number(p.market_price).toFixed(2)}</td>
                <td className="text-right">Rs. {Number(p.our_price).toFixed(2)}</td>
                <td className="text-center"><span className={p.stock <= 0 ? 'badge-danger' : 'badge-stock'}>{p.stock}</span></td>
                <td className="text-center space-x-2">
                  <Button variant="warning" className="!py-1.5 !text-xs" onClick={() => setEditProduct({ ...p })}>{t('සංස්කරණය', 'Edit')}</Button>
                  <Button variant="danger" className="!py-1.5 !text-xs" onClick={async () => {
                    const ok = await confirm({
                      title: t('භාණ්ඩය මකන්න', 'Delete Product'),
                      message: t('මකා දමන්නද?', 'Delete?'),
                    });
                    if (!ok) return;
                    await fetch(`/api/products?barcode=${encodeURIComponent(p.barcode)}`, { method: 'DELETE' });
                    setFlash('deleted'); loadProducts();
                  }}>{t('මකන්න', 'Delete')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title={t('භාණ්ඩය සංස්කරණය', 'Edit Product')}
        footerSplit
        footer={<>
          <Button variant="secondary" className="w-full" onClick={() => setEditProduct(null)}>{t('වසන්න', 'Close')}</Button>
          <Button className="w-full" onClick={async () => {
          if (!editProduct) return;
          await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barcode: editProduct.barcode, name: editProduct.name, market_price: editProduct.market_price, our_price: editProduct.our_price, stock: editProduct.stock }) });
          setEditProduct(null); setFlash('updated'); loadProducts();
        }}>{t('සේව් කරන්න', 'Save')}</Button>
        </>}>
        {editProduct && (
          <div className="space-y-3">
            <Input label={t('නම', 'Name')} value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
            <Input label={t('වෙළඳපොල මිල', 'Market Price')} type="number" step="any" value={editProduct.market_price} onChange={(e) => setEditProduct({ ...editProduct, market_price: Number(e.target.value) })} />
            <Input label={t('අපේ මිල', 'Our Price')} type="number" step="any" value={editProduct.our_price} onChange={(e) => setEditProduct({ ...editProduct, our_price: Number(e.target.value) })} />
            <Input label={t('තොගය', 'Stock')} type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} />
          </div>
        )}
      </Modal>
    </div>
  );
}
