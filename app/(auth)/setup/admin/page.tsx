'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Input } from '@/components/ui';
import { AuthLayout } from '@/components/layout';

export default function SetupAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [fullName, setFullName] = useState('Administrator');
  const [password, setPassword] = useState('');
  const [counterNo, setCounterNo] = useState('Admin Office');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    const res = await fetch('/api/setup/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, full_name: fullName, password, counter_no: counterNo }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setMessage('Admin ගිණුම සාර්ථකව සාදන ලදී! දැන් /login හරහා පිවිසෙන්න.');
    setPassword('');
  }

  return (
    <AuthLayout>
      <h1 className="text-xl font-extrabold text-primary label-si">Admin ගිණුම සාදන්න</h1>
      <p className="mt-1 text-sm text-slate-600 label-si">පළමු admin පරිශීලකයා MongoDB වෙත එක් කරන්න.</p>
      {message && <Alert type="success" className="mt-4">{message}</Alert>}
      {error && <Alert type="error" className="mt-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Input label="සම්පූර්ණ නම" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="පරිශීලක නාමය" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <Input label="මුරපදය" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input label="කවුන්ටරය" value={counterNo} onChange={(e) => setCounterNo(e.target.value)} required />
        <Button type="submit" loading={loading} className="w-full">සාදන්න</Button>
        <Button type="button" variant="secondary" className="w-full" onClick={() => router.push('/setup')}>ආපසු</Button>
      </form>
    </AuthLayout>
  );
}
