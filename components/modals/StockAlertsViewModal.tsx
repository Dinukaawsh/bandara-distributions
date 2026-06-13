'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useLang } from '@/hooks/useLang';

type StockAlertsViewModalProps = {
  open: boolean;
  onClose: () => void;
};

export function StockAlertsViewModal({ open, onClose }: StockAlertsViewModalProps) {
  const { t } = useLang();
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/stock-alerts')
      .then(async (res) => {
        if (res.ok) setProducts((await res.json()).products || []);
      })
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('අඩු තොග දැනුම්දීම්', 'Low Stock Alerts')}
      size="lg"
      footer={
        <Button className="w-full" onClick={onClose}>
          {t('වසන්න', 'Close')}
        </Button>
      }
    >
      {loading ? (
        <p className="text-center text-sm text-slate-500 label-si">{t('පූරණය වෙමින්...', 'Loading...')}</p>
      ) : products.length === 0 ? (
        <p className="text-center font-bold text-emerald-700 label-si">
          {t('සියලු තොග සතුටුදායකයි!', 'All stock levels are good!')}
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('බාර්කෝඩ්', 'Barcode')}</th>
              <th>{t('භාණ්ඩය', 'Product')}</th>
              <th className="text-right">{t('මිල', 'Price')}</th>
              <th className="text-center">{t('තොගය', 'Stock')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={String(p.barcode)}>
                <td className="font-mono">{String(p.barcode)}</td>
                <td className="label-si font-bold">{String(p.name)}</td>
                <td className="text-right">Rs. {Number(p.our_price).toFixed(2)}</td>
                <td className="text-center">
                  <span className={Number(p.stock) <= 0 ? 'badge-danger' : 'badge-warning'}>
                    {String(p.stock)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}
