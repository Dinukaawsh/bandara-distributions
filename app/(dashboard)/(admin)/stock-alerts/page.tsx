'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Checkbox } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';
import { useDialog } from '@/hooks/useDialog';

export default function StockAlertsPage() {
  useSession(true, true);
  const { t } = useLang();
  const { confirm } = useDialog();
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/stock-alerts').then(async (res) => { if (res.ok) setProducts((await res.json()).products || []); });
  }, []);

  const allSelected = products.length > 0 && selected.length === products.length;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold label-si">{t('අඩු තොග දැනුම්දීම්', 'Low Stock Alerts')}</h1>
      <Alert type="info" className="mb-4 label-si">{t('තොගය 5.000 කට අඩු භාණ්ඩ මෙහි පෙන්වයි.', 'Items with stock at or below 5.000 are shown here.')}</Alert>
      <div className="mb-3 no-print">
        <Button
          variant="danger"
          disabled={selected.length === 0}
          onClick={async () => {
            const ok = await confirm({
              title: t('තෝරාගත් භාණ්ඩ මකන්න', 'Delete Selected Products'),
              message: t('තෝරාගත් භාණ්ඩ මකා දමන්නද?', 'Delete selected products?'),
            });
            if (!ok) return;
            await Promise.all(
              selected.map((barcode) =>
                fetch(`/api/products?barcode=${encodeURIComponent(barcode)}`, { method: 'DELETE' })
              )
            );
            setSelected([]);
            const res = await fetch('/api/stock-alerts');
            if (res.ok) setProducts((await res.json()).products || []);
          }}
        >
          {t('තෝරාගත් දේ මකන්න', 'Delete Selected')}
        </Button>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table">
            <colgroup>
              <col className="col-barcode" />
              <col className="col-product" />
              <col className="col-price-lg" />
              <col className="col-stock" />
            </colgroup>
            <thead>
              <tr>
                <th className="text-center">
                  <Checkbox
                    checked={allSelected}
                    onChange={(checked) => {
                      setSelected(checked ? products.map((p) => String(p.barcode)) : []);
                    }}
                  />
                </th>
                <th className="text-left label-si">{t('බාර්කෝඩ්', 'Barcode')}</th>
                <th className="text-left label-si">{t('භාණ්ඩය', 'Product')}</th>
                <th className="text-right label-si">{t('මිල', 'Price')}</th>
                <th className="text-center label-si">{t('තොගය', 'Stock')}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-emerald-700 font-bold label-si py-8">
                    {t('සියලු තොග සතුටුදායකයි!', 'All stock levels are good!')}
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={String(p.barcode)}>
                  <td className="text-center">
                    <Checkbox
                      checked={selected.includes(String(p.barcode))}
                      onChange={(checked) => {
                        const key = String(p.barcode);
                        setSelected((prev) => (checked ? [...prev, key] : prev.filter((k) => k !== key)));
                      }}
                    />
                  </td>
                  <td className="font-mono text-left">{String(p.barcode)}</td>
                  <td className="font-bold label-si text-left">{String(p.name)}</td>
                  <td className="text-right whitespace-nowrap">LKR {Number(p.our_price).toFixed(2)}</td>
                  <td className="text-center">
                    <span className={Number(p.stock) <= 0 ? 'badge-danger' : 'badge-warning'}>{String(p.stock)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

