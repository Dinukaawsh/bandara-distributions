'use client';

import type { Lang } from '@/lib/translations';
import { getTranslations } from '@/lib/translations';

export type ReceiptItem = {
  barcode: string;
  name: string;
  marketPrice: number;
  ourPrice: number;
  qty: number;
  total: number;
};

type BillReceiptProps = {
  lang: Lang;
  store: { store_name: string; address: string; phone: string };
  billNo: string;
  billDate: string;
  billTime: string;
  cashierName: string;
  counterNo: string;
  items: ReceiptItem[];
  grandTotal: number;
  cashPaid: number;
  changeDue: number;
  className?: string;
};

export function BillReceipt({
  lang,
  store,
  billNo,
  billDate,
  billTime,
  cashierName,
  counterNo,
  items,
  grandTotal,
  cashPaid,
  changeDue,
  className = '',
}: BillReceiptProps) {
  const ln = getTranslations(lang);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className={`bill-receipt ${className}`}>
      <div className="text-center mb-3">
        <h2 className="text-lg font-extrabold label-si">{store.store_name}</h2>
        <p className="text-xs text-slate-600 label-si">{store.address}</p>
        <p className="text-xs text-slate-600">{store.phone}</p>
      </div>

      <div className="bill-receipt-meta label-si text-xs space-y-0.5 mb-3">
        <div className="flex justify-between"><span>{ln.bill_no}</span><strong>{billNo}</strong></div>
        <div className="flex justify-between"><span>{ln.date}</span><span>{billDate}</span></div>
        <div className="flex justify-between"><span>{ln.time}</span><span>{billTime}</span></div>
        <div className="flex justify-between"><span>{ln.cashier_label}</span><span>{cashierName}</span></div>
        <div className="flex justify-between"><span>{ln.counter_label}</span><span>{counterNo}</span></div>
      </div>

      <table className="bill-receipt-table w-full text-xs mb-3">
        <thead>
          <tr>
            <th className="text-left label-si">{ln.item_title}</th>
            <th className="text-right">{ln.total_col}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.barcode}>
              <td className="label-si py-1">
                {item.qty} x {item.name}
                <div className="text-[10px] text-slate-500">@ LKR {item.ourPrice.toFixed(2)}</div>
              </td>
              <td className="text-right font-bold py-1">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bill-receipt-totals text-xs space-y-1 border-t border-dashed border-slate-400 pt-2 label-si">
        <div className="flex justify-between"><span>{ln.items}</span><span>{totalQty}</span></div>
        <div className="flex justify-between font-bold text-sm"><span>{ln.total}</span><span>LKR {grandTotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-emerald-700"><span>{ln.customer_paid}</span><span>LKR {cashPaid.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-red-600"><span>{ln.change_return}</span><span>LKR {changeDue.toFixed(2)}</span></div>
      </div>

      <p className="text-center text-[10px] mt-4 label-si">{ln.thank_you}</p>
    </div>
  );
}

