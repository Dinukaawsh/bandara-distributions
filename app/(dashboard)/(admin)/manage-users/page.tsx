'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Input, Modal, Select } from '@/components/ui';
import { roleOptions, useLang } from '@/hooks/useLang';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';
import { counterOptionsForRole, defaultCounterForRole } from '@/lib/counters';

type User = { username: string; full_name: string; role: string; counter_no: string; password?: string };

export default function ManageUsersPage() {
  useSession(true, true);
  const { lang, t } = useLang();
  const { confirm } = useDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cashier');
  const [counterNo, setCounterNo] = useState('Counter 1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);

  const roles = useMemo(() => roleOptions(lang), [lang]);
  const counters = useMemo(() => counterOptionsForRole(lang, role), [lang, role]);
  const editCounters = useMemo(
    () => (editUser ? counterOptionsForRole(lang, editUser.role) : []),
    [lang, editUser]
  );

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    setCounterNo(defaultCounterForRole(role));
  }, [role]);

  async function fetchUsers() {
    const res = await fetch('/api/users');
    if (res.ok) setUsers((await res.json()).users || []);
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold label-si">{t('පරිශීලක කළමනාකරණය', 'User Accounts')}</h1>
      {message && <Alert type="success" className="mb-3">{message}</Alert>}
      {error && <Alert type="error" className="mb-3">{error}</Alert>}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={t('නව පරිශීලකයා', 'Add New User')}>
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault(); setMessage(''); setError('');
            const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, full_name: fullName, password, role, counter_no: counterNo }) });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setMessage(t('ගිණුම සාදන ලදී!', 'Account created!'));
            setUsername(''); setFullName(''); setPassword(''); fetchUsers();
          }}>
            <Input label={t('නම', 'Full Name')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label={t('පරිශීලක නාමය', 'Username')} value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input label={t('මුරපදය', 'Password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Select label={t('භූමිකාව', 'Role')} value={role} onChange={(e) => setRole(e.target.value)} options={roles} />
            <Select label={t('කවුන්ටරය', 'Counter')} value={counterNo} onChange={(e) => setCounterNo(e.target.value)} options={counters} />
            <Button type="submit" className="w-full">{t('ගිණුම සාදන්න', 'Create Account')}</Button>
          </form>
        </Card>

        <Card title={t('පවතින පරිශීලකයින්', 'Current Users')} className="lg:col-span-2 overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th className="label-si">{t('නම', 'Name')}</th><th>{t('පරිශීලක නාමය', 'Username')}</th><th>{t('භූමිකාව', 'Role')}</th><th>{t('කවුන්ටරය', 'Counter')}</th><th>{t('ක්‍රියා', 'Action')}</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username}>
                  <td className="label-si">{u.full_name}</td><td>{u.username}</td><td>{u.role}</td><td>{u.counter_no}</td>
                  <td className="space-x-2">
                    {u.username.toLowerCase() === 'admin' ? <span className="text-slate-400 label-si">{t('ආරක්ෂිත', 'Protected')}</span> : (
                      <>
                        <Button variant="warning" className="!py-1 !text-xs" onClick={() => setEditUser({ ...u, password: '' })}>{t('සංස්කරණය', 'Edit')}</Button>
                        <Button variant="danger" className="!py-1 !text-xs" onClick={async () => {
                          const ok = await confirm({
                            title: t('පරිශීලකයා මකන්න', 'Delete User'),
                            message: t('මකා දමන්නද?', 'Delete?'),
                          });
                          if (!ok) return;
                          await fetch(`/api/users?username=${encodeURIComponent(u.username)}`, { method: 'DELETE' });
                          setMessage(t('මකා දමන ලදී!', 'Deleted!')); fetchUsers();
                        }}>{t('මකන්න', 'Delete')}</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={t('පරිශීලකයා සංස්කරණය', 'Edit User')}
        footerSplit
        footer={<>
          <Button variant="secondary" className="w-full" onClick={() => setEditUser(null)}>{t('වසන්න', 'Close')}</Button>
          <Button className="w-full" onClick={async () => {
          if (!editUser) return;
          await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ old_username: editUser.username, username: editUser.username, full_name: editUser.full_name, password: editUser.password, role: editUser.role, counter_no: editUser.counter_no }) });
          setEditUser(null); setMessage(t('යාවත්කාලීන විය!', 'Updated!')); fetchUsers();
        }}>{t('සේව් කරන්න', 'Save')}</Button>
        </>}>
        {editUser && (
          <div className="space-y-3">
            <Input label={t('නම', 'Name')} value={editUser.full_name} onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })} />
            <Input label={t('පරිශීලක නාමය', 'Username')} value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
            <Input label={t('මුරපදය', 'Password')} type="password" value={editUser.password || ''} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} hint={t('හිස්ව තැබුවහොත් පවතින මුරපදය රඳවා ගනී', 'Leave blank to keep current password')} />
            <Select
              label={t('භූමිකාව', 'Role')}
              value={editUser.role}
              onChange={(e) => {
                const newRole = e.target.value;
                const opts = counterOptionsForRole(lang, newRole);
                const validCounter = opts.some((o) => o.value === editUser.counter_no);
                setEditUser({
                  ...editUser,
                  role: newRole,
                  counter_no: validCounter ? editUser.counter_no : defaultCounterForRole(newRole),
                });
              }}
              options={roles}
            />
            <Select label={t('කවුන්ටරය', 'Counter')} value={editUser.counter_no} onChange={(e) => setEditUser({ ...editUser, counter_no: e.target.value })} options={editCounters} />
          </div>
        )}
      </Modal>
    </div>
  );
}
