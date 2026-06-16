'use client';

import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useLang } from '@/hooks/useLang';
import { BillReceipt, type ReceiptItem } from './BillReceipt';

type BillPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  printing?: boolean;
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

export function BillPreviewModal({
  open,
  onClose,
  onConfirmPrint,
  printing,
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
}: BillPreviewModalProps) {
  const { lang, t } = useLang();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('බිල්පත් පෙරදසුන', 'Bill Preview')}
      size="lg"
      footerSplit
      footer={
        <>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            {t('ආපසු', 'Back')}
          </Button>
          <Button className="w-full" onClick={onConfirmPrint} loading={printing}>
            {t('මුද්‍රණය කර සම්පූර්ණ කරන්න', 'Print & Complete')}
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <BillReceipt
          lang={lang}
          store={store}
          billNo={billNo}
          billDate={billDate}
          billTime={billTime}
          cashierName={cashierName}
          counterNo={counterNo}
          items={items}
          grandTotal={grandTotal}
          cashPaid={cashPaid}
          changeDue={changeDue}
        />
      </div>
    </Modal>
  );
}
