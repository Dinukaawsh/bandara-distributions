'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { BillReceipt, type ReceiptItem } from './BillReceipt';

type BillViewModalProps = {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
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
};

export function BillViewModal(props: BillViewModalProps) {
  const { t, lang } = useLang();
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={t('බිල්පත් විස්තර', 'Bill Details')}
      size="lg"
      footerSplit
      footer={
        <>
          <Button variant="secondary" className="w-full" onClick={props.onClose}>
            {t('වසන්න', 'Close')}
          </Button>
          <Button className="w-full" onClick={props.onPrint}>
            {t('මුද්‍රණය', 'Print')}
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <BillReceipt
          lang={lang}
          store={props.store}
          billNo={props.billNo}
          billDate={props.billDate}
          billTime={props.billTime}
          cashierName={props.cashierName}
          counterNo={props.counterNo}
          items={props.items}
          grandTotal={props.grandTotal}
          cashPaid={props.cashPaid}
          changeDue={props.changeDue}
        />
      </div>
    </Modal>
  );
}
