'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Input, Select } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

type UserOption = { username: string; role: string };

export default function ChangePasswordPage() {
  const { isAdmin } = useSession();
  const { t } = useLang();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/users')
        .then(async (res) => {
          if (res.ok) setAllUsers((await res.json()).users || []);
        });
    }
  }, [isAdmin]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="page-header">
        <h1 className="page-title label-si">{t('මුරපදය වෙනස් කිරීම', 'Change Password')}</h1>
        <p className="page-subtitle label-si">
          {t('ඔබේ ගිණුම ආරක්ෂා කිරීමට ශක්තිමත් මුරපදයක් භාවිතා කරන්න.', 'Use a strong password to keep your account secure.')}
        </p>
      </div>
      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Card title={t('මගේ මුරපදය', 'My Password')}>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage('');
            setError('');
            const res = await fetch('/api/password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'change_own',
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
              }),
            });
            const data = await res.json();
            if (!res.ok) setError(data.error);
            else {
              setMessage(data.message);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }
          }}
        >
          <Input
            label={t('වත්මන් මුරපදය', 'Current Password')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label={t('නව මුරපදය', 'New Password')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            hint={t('අවම අක්ෂර 6 ක්', 'Minimum 6 characters')}
          />
          <Input
            label={t('නැවත ඇතුළත් කරන්න', 'Confirm Password')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">{t('වෙනස් කරන්න', 'Change Password')}</Button>
        </form>
      </Card>

      {isAdmin && (
        <Card title={t('පරිශීලක මුරපදය නැවත සකසන්න', 'Reset User Password')}>
          <form
            className="grid gap-3 md:grid-cols-[2fr_2fr_1fr]"
            onSubmit={async (e) => {
              e.preventDefault();
              setMessage('');
              setError('');
              const res = await fetch('/api/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'admin_reset',
                  target_user: targetUser,
                  admin_new_password: adminNewPassword,
                }),
              });
              const data = await res.json();
              if (res.ok) {
                setMessage(data.message);
                setAdminNewPassword('');
              } else setError(data.error);
            }}
          >
            <Select
              label={t('පරිශීලකයා', 'User')}
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              options={[
                { value: '', label: t('තෝරන්න...', 'Select...') },
                ...allUsers.map((u) => ({ value: u.username, label: `${u.username} (${u.role})` })),
              ]}
            />
            <Input
              label={t('නව මුරපදය', 'New Password')}
              type="password"
              value={adminNewPassword}
              onChange={(e) => setAdminNewPassword(e.target.value)}
              required
            />
            <div className="flex items-end">
              <Button type="submit" variant="danger" className="w-full">
                {t('නැවත සකසන්න', 'Reset')}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
