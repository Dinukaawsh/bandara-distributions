'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Input, Select } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

export default function ChangePasswordPage() {
  const { isAdmin } = useSession();
  const { t } = useLang();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [allUsers, setAllUsers] = useState<Array<{ username: string; role: string; password: string }>>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_users' }) })
        .then(async (res) => { if (res.ok) setAllUsers((await res.json()).users || []); });
    }
  }, [isAdmin]);

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-extrabold label-si">{t('මුරපදය වෙනස් කිරීම', 'Change Password')}</h1>
      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Card title={t('මගේ මුරපදය', 'My Password')}>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault(); setMessage(''); setError('');
          const res = await fetch('/api/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'change_own', current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword }) });
          const data = await res.json();
          if (!res.ok) setError(data.error); else { setMessage(data.message); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
        }}>
          <Input label={t('වත්මන් මුරපදය', 'Current Password')} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label={t('නව මුරපදය', 'New Password')} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label={t('නැවත ඇතුළත් කරන්න', 'Confirm Password')} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" className="w-full">{t('වෙනස් කරන්න', 'Change Password')}</Button>
        </form>
      </Card>

      {isAdmin && (
        <Card title={t('පරිපාලක පැනලය', 'Admin Panel')}>
          <form className="mb-4 grid gap-2 md:grid-cols-[2fr_2fr_1fr]" onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch('/api/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'admin_reset', target_user: targetUser, admin_new_password: adminNewPassword }) });
            const data = await res.json();
            if (res.ok) setMessage(data.message); else setError(data.error);
          }}>
            <Select label={t('පරිශීලකයා', 'User')} value={targetUser} onChange={(e) => setTargetUser(e.target.value)} options={[{ value: '', label: t('තෝරන්න...', 'Select...') }, ...allUsers.map((u) => ({ value: u.username, label: `${u.username} (${u.role})` }))]} />
            <Input label={t('නව මුරපදය', 'New Password')} value={adminNewPassword} onChange={(e) => setAdminNewPassword(e.target.value)} required />
            <div className="flex items-end"><Button type="submit" variant="danger" className="w-full">{t('නැවත සකසන්න', 'Reset')}</Button></div>
          </form>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>{t('පරිශීලක නාමය', 'Username')}</th><th>{t('භූමිකාව', 'Role')}</th><th>{t('මුරපදය', 'Password')}</th></tr></thead>
              <tbody>{allUsers.map((u) => (<tr key={u.username}><td>{u.username}</td><td>{u.role}</td><td className="font-mono text-emerald-700">{u.password}</td></tr>))}</tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
