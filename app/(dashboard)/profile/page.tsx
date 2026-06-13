'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Input, Select } from '@/components/ui';
import { counterOptions, useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

export default function ProfilePage() {
  useSession();
  const { t, lang } = useLang();
  const [loginUsername, setLoginUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [counterNo, setCounterNo] = useState('Counter 1');
  const [password, setPassword] = useState('');
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
      setPassword(d.password || '');
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t('යාවත්කාලීන කිරීම අසාර්ථකයි', 'Update failed'));
      return;
    }
    setMessage(t('ප්‍රොෆයිල් යාවත්කාලීන විය!', 'Profile updated!'));
  }, [loginUsername, displayName, counterNo, password, t]);

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-2xl font-extrabold label-si">{t('මගේ ගිණුම', 'My Profile')}</h1>
      <Card>
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
          <Select label={t('කවුන්ටරය', 'Counter')} value={counterNo} onChange={(e) => setCounterNo(e.target.value)} options={counters} />
          <Input label={t('මුරපදය', 'Password')} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full">{t('යාවත්කාලීන කරන්න', 'Update Profile')}</Button>
        </form>
      </Card>
    </div>
  );
}
