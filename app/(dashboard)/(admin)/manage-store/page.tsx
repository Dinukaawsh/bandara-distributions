'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Input } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

export default function ManageStorePage() {
  useSession(true, true);
  const { t } = useLang();
  const [store, setStore] = useState({ store_name: '', address: '', phone: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/store').then(async (res) => { if (res.ok) setStore((await res.json()).store); });
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-4 text-center text-2xl font-extrabold label-si">{t('ආයතන විස්තර', 'Store Details')}</h1>
      <Card className="mx-auto max-w-xl">
        {message && <Alert type="success" className="mb-4">{message}</Alert>}
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch('/api/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(store) });
          if (res.ok) {
            setMessage(t('සාර්ථකව යාවත්කාලීන විය!', 'Updated successfully!'));
            window.dispatchEvent(new Event('store-updated'));
          }
        }}>
          <Input label={t('ආයතනයේ නම', 'Store Name')} value={store.store_name} onChange={(e) => setStore({ ...store, store_name: e.target.value })} required />
          <Input label={t('ලිපිනය', 'Address')} value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} required />
          <Input label={t('දුරකථන අංකය', 'Phone')} value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} required />
          <Button type="submit" className="w-full">{t('සේව් කරන්න', 'Save Changes')}</Button>
        </form>
      </Card>
    </div>
  );
}
