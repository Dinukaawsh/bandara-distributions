'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Card, Input, Select } from '@/components/ui';
import { counterOptions, useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';
import { isAdminRole } from '@/lib/counters';

export default function ProfilePage() {
  const { user } = useSession();
  const { t, lang } = useLang();
  const [loginUsername, setLoginUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [counterNo, setCounterNo] = useState('Counter 1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const counters = useMemo(() => counterOptions(lang), [lang]);

  useEffect(() => {
    fetch('/api/profile').then(async (res) => {
      if (!res.ok) return;
      const d = await res.json();
      setLoginUsername(d.username);
      setDisplayName(d.full_name || d.username);
      setCounterNo(d.counter_no);
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage('');
      setError('');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          full_name: displayName,
          counter_no: counterNo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('යාවත්කාලීන කිරීම අසාර්ථකයි', 'Update failed'));
        return;
      }
      setMessage(t('ප්‍රොෆයිල් යාවත්කාලීන විය!', 'Profile updated!'));
    },
    [loginUsername, displayName, counterNo, t]
  );

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="page-header">
        <h1 className="page-title label-si">{t('මගේ ගිණුම', 'My Profile')}</h1>
        <p className="page-subtitle label-si">
          {t('බිල්පතේ පෙනෙන නම සහ කවුන්ටරය යාවත්කාලීන කරන්න.', 'Update your invoice name and counter.')}
        </p>
      </div>
      <Card className="mx-auto w-full">
        {message && <Alert type="success" className="mb-4">{message}</Alert>}
        {error && <Alert type="error" className="mb-4">{error}</Alert>}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            label={t('පරිශීලක නාමය (ලොග්ඉන්)', 'Login Username')}
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
          />
          <Input
            label={t('බිල්පතේ නම', 'Name on Invoice')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            hint={t('*බිල්පතේ මුද්‍රණය වන නම', '*Printed on invoice')}
          />
          <Select
            label={t('කවුන්ටරය', 'Counter')}
            value={counterNo}
            onChange={(e) => setCounterNo(e.target.value)}
            options={counters}
            disabled={!isAdminRole(user?.role || '')}
          />
          {!isAdminRole(user?.role || '') && (
            <p className="text-xs text-slate-500 label-si">
              {t('කැෂියර් කවුන්ටරය වෙනස් කළ හැක්කේ පරිපාලකයාට පමණි.', 'Only Admin can change cashier counter assignment.')}
            </p>
          )}
          <Button type="submit" className="w-full">{t('යාවත්කාලීන කරන්න', 'Update Profile')}</Button>
        </form>
        <p className="mt-4 text-sm text-slate-500 label-si">
          {t('මුරපදය වෙනස් කිරීමට', 'To change your password')}{' '}
          <Link href="/change-password" className="font-semibold text-primary hover:underline">
            {t('මෙතන ක්ලික් කරන්න', 'click here')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
