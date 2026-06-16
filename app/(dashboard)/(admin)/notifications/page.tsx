'use client';

import { useEffect, useState } from 'react';
import { Alert, Card, PageLoader } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  created_at: string;
};

export default function NotificationsPage() {
  useSession(true, true);
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setItems(data.notifications || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title label-si">{t('දැනුම්දීම්', 'Notifications')}</h1>
        <p className="page-subtitle label-si">
          {t('පරිශීලකයින්, භාණ්ඩ, තොග සහ තත්වය වෙනස්වීම් පිළිබඳ සියලු දැනුම්දීම්.', 'All alerts about users, products, stock, and status changes.')}
        </p>
      </div>

      {items.length === 0 ? (
        <Alert type="info">{t('දැනුම්දීම් නොමැත', 'No notifications')}</Alert>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="data-table-wrap custom-scrollbar">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('වර්ගය', 'Type')}</th>
                  <th>{t('විස්තරය', 'Message')}</th>
                  <th>{t('වේලාව', 'Time')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id}>
                    <td className="font-semibold">{n.type}</td>
                    <td className="label-si">{n.message}</td>
                    <td>{new Date(n.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
