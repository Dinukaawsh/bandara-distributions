'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Input, LanguageSelect } from '@/components/ui';
import { AuthLayout } from '@/components/layout';

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'si'>('si');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const txt = {
    si: { title: 'බිල්පත් පද්ධතියට ඇතුල් වන්න', user: 'පරිශීලක නාමය:', pass: 'මුරපදය:', btn: 'ඇතුල් වන්න 🔓' },
    en: { title: 'Billing System Login', user: 'Username:', pass: 'Password:', btn: 'Log In 🔓' },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await fetch('/api/lang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang }) });
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error === 'User not found' ? (lang === 'si' ? 'පරිශීලකයා හමු නොවීය!' : 'User not found!') : data.error === 'Incorrect password' ? (lang === 'si' ? 'මුරපදය වැරදියි!' : 'Incorrect password!') : data.error);
        setLoading(false);
        return;
      }
      router.push('/billing');
    } catch {
      setErrorMsg(lang === 'si' ? 'සම්බන්ධතා දෝෂයක්' : 'Connection error');
      setLoading(false);
    }
  }

  return (
    <AuthLayout langToggle={<LanguageSelect value={lang} onChange={setLang} />}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-primary tracking-wide">BANDARA STORE</h1>
        <p className="text-slate-600 label-si mt-1">{txt[lang].title}</p>
      </div>
      {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={txt[lang].user} value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus autoComplete="off" />
        <Input label={txt[lang].pass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        <Button type="submit" loading={loading} className="w-full">{txt[lang].btn}</Button>
      </form>
    </AuthLayout>
  );
}
