'use client';

import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useLang } from '@/hooks/useLang';

export type EndOfDayReport = {
  date: string;
  summary: { total_amount: number; total_profit: number; total_bills?: number };
  counters: Array<{ counter_no: string; amount: number; profit?: number; bills?: number }>;
  cashiers: Array<{
    cashier_name: string;
    counter_no: string;
    amount: number;
    profit?: number;
    bills?: number;
  }>;
  bills: Array<{
    bill_no: string | number;
    time: string;
    counter_no: string;
    cashier_name: string;
    total_amount: number;
    cash_paid?: number;
    change_given?: number;
  }>;
};

type EndOfDayModalProps = {
  open: boolean;
  report: EndOfDayReport | null;
  onClose: () => void;
  onPrint: () => void;
};

export function EndOfDayModal({ open, report, onClose, onPrint }: EndOfDayModalProps) {
  const { t } = useLang();
  if (!report) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('දෛනික විකුණුම් සාරාංශය', 'Daily Sales Summary')}
      size="xl"
      footerSplit
      footer={
        <>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            {t('වසන්න', 'Close')}
          </Button>
          <Button className="w-full" onClick={onPrint}>
            {t('මුද්‍රණය', 'Print')}
          </Button>
        </>
      }
    >
      <div className="end-of-day-report space-y-4 text-sm text-black">
        <div className="text-center">
          <p className="text-xl font-bold">BANDARA STORE</p>
          <p className="label-si text-slate-600">
            {t('දිනය', 'Date')}: {report.date}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-slate-50 p-4 grid gap-2 sm:grid-cols-3">
          <p><strong>{t('මුළු විකුණුම්', 'Total Sales')}:</strong> LKR {Number(report.summary.total_amount).toFixed(2)}</p>
          <p><strong>{t('මුළු ලාභය', 'Total Profit')}:</strong> LKR {Number(report.summary.total_profit).toFixed(2)}</p>
          <p><strong>{t('බිල්පත්', 'Bills')}:</strong> {report.summary.total_bills ?? report.bills.length}</p>
        </div>

        <div>
          <h3 className="font-bold mb-2 label-si">{t('කවුන්ටර සාරාංශය', 'Counter Summary')}</h3>
          <div className="data-table-wrap custom-scrollbar">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('කවුන්ටරය', 'Counter')}</th>
                  <th className="text-right">{t('බිල්පත්', 'Bills')}</th>
                  <th className="text-right">{t('මුදල', 'Amount')}</th>
                  <th className="text-right">{t('ලාභය', 'Profit')}</th>
                </tr>
              </thead>
              <tbody>
                {report.counters.map((c) => (
                  <tr key={c.counter_no}>
                    <td>{c.counter_no}</td>
                    <td className="text-right">{c.bills ?? '—'}</td>
                    <td className="text-right">LKR {Number(c.amount).toFixed(2)}</td>
                    <td className="text-right">LKR {Number(c.profit || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2 label-si">{t('කැෂියර් සාරාංශය', 'Cashier Summary')}</h3>
          <div className="data-table-wrap custom-scrollbar">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('කැෂියර්', 'Cashier')}</th>
                  <th>{t('කවුන්ටරය', 'Counter')}</th>
                  <th className="text-right">{t('බිල්පත්', 'Bills')}</th>
                  <th className="text-right">{t('මුදල', 'Amount')}</th>
                  <th className="text-right">{t('ලාභය', 'Profit')}</th>
                </tr>
              </thead>
              <tbody>
                {(report.cashiers || []).map((c) => (
                  <tr key={`${c.cashier_name}-${c.counter_no}`}>
                    <td className="label-si">{c.cashier_name}</td>
                    <td>{c.counter_no}</td>
                    <td className="text-right">{c.bills ?? '—'}</td>
                    <td className="text-right">LKR {Number(c.amount).toFixed(2)}</td>
                    <td className="text-right">LKR {Number(c.profit || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('බිල් අංකය', 'Bill')}</th>
                <th>{t('වේලාව', 'Time')}</th>
                <th>{t('කවුන්ටරය', 'Counter')}</th>
                <th>{t('කැෂියර්', 'Cashier')}</th>
                <th className="text-right">{t('මුදල', 'Amount')}</th>
                <th className="text-right">{t('ආපසු', 'Change')}</th>
              </tr>
            </thead>
            <tbody>
              {report.bills.map((b) => (
                <tr key={String(b.bill_no)}>
                  <td>{String(b.bill_no)}</td>
                  <td>{new Date(String(b.time)).toLocaleTimeString()}</td>
                  <td>{String(b.counter_no)}</td>
                  <td className="label-si">{String(b.cashier_name)}</td>
                  <td className="text-right">{Number(b.total_amount).toFixed(2)}</td>
                  <td className="text-right">{Number(b.change_given || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-red-600 label-si">
          {t('වාර්තාව බලා අවසන් කළ පසු ලොග් අවුට් වේ.', 'You will be logged out after closing this report.')}
        </p>
      </div>
    </Modal>
  );
}

