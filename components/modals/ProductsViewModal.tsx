'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useLang } from '@/hooks/useLang';

type Product = {
  barcode: string;
  name: string;
  market_price: number;
  our_price: number;
  stock: number;
};

type ProductsViewModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ProductsViewModal({ open, onClose }: ProductsViewModalProps) {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/products?format=list')
      .then(async (res) => {
        if (res.ok) setProducts((await res.json()).products || []);
      })
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('භාණ්ඩ ලැයිස්තුව', 'Product List')}
      size="xl"
      footer={
        <Button className="w-full" onClick={onClose}>
          {t('වසන්න', 'Close')}
        </Button>
      }
    >
      {loading ? (
        <p className="text-center text-sm text-slate-500 label-si">{t('පූරණය වෙමින්...', 'Loading...')}</p>
      ) : (
        <div className="data-table-wrap custom-scrollbar">
        <table className="data-table">
          <colgroup>
            <col className="col-barcode" />
            <col className="col-name" />
            <col className="col-price" />
            <col className="col-price" />
            <col className="col-stock" />
          </colgroup>
          <thead>
            <tr>
              <th className="text-left">{t('බාර්කෝඩ්', 'Barcode')}</th>
              <th className="text-left">{t('නම', 'Name')}</th>
              <th className="text-right">{t('වෙළඳපොල මිල', 'Market')}</th>
              <th className="text-right">{t('අපේ මිල', 'Our Price')}</th>
              <th className="text-center">{t('තොගය', 'Stock')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.barcode}>
                <td className="font-mono text-left">{p.barcode}</td>
                <td className="label-si font-bold text-left">{p.name}</td>
                <td className="text-right whitespace-nowrap">LKR {Number(p.market_price).toFixed(2)}</td>
                <td className="text-right whitespace-nowrap">LKR {Number(p.our_price).toFixed(2)}</td>
                <td className="text-center">
                  <span className={p.stock <= 0 ? 'badge-danger' : 'badge-stock'}>{p.stock}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </Modal>
  );
}

