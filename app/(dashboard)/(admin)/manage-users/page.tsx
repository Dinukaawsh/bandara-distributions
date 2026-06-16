'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Checkbox, Input, Modal, Select } from '@/components/ui';
import { roleOptions, useLang } from '@/hooks/useLang';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';
import { counterOptionsForRole, defaultCounterForRole, getTakenCashierCounters, isAdminRole } from '@/lib/counters';

type User = {
  username: string;
  full_name: string;
  role: string;
  counter_no: string;
  availability_status?: 'available' | 'busy';
  password?: string;
};

function StatusBadge({ status, t }: { status?: string; t: (si: string, en: string) => string }) {
  const busy = status === 'busy';
  return <span className={busy ? 'badge-warning' : 'badge-stock'}>{busy ? t('Busy', 'Busy') : t('Available', 'Available')}</span>;
}

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
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const roles = useMemo(() => roleOptions(lang), [lang]);
  const takenCounters = useMemo(() => getTakenCashierCounters(users), [users]);
  const editTakenCounters = useMemo(() => (editUser ? getTakenCashierCounters(users, editUser.username) : []), [users, editUser]);
  const counters = useMemo(() => counterOptionsForRole(lang, role, takenCounters), [lang, role, takenCounters]);
  const editCounters = useMemo(() => (editUser ? counterOptionsForRole(lang, editUser.role, editTakenCounters, editUser.counter_no) : []), [lang, editUser, editTakenCounters]);

  const admins = useMemo(() => users.filter((u) => isAdminRole(u.role)), [users]);
  const cashiers = useMemo(() => users.filter((u) => !isAdminRole(u.role)), [users]);
  const nonProtected = useMemo(() => users.filter((u) => u.username.toLowerCase() !== 'admin'), [users]);
  const allSelected = nonProtected.length > 0 && nonProtected.every((u) => selectedUsers.includes(u.username));

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { setCounterNo(defaultCounterForRole(role, takenCounters)); }, [role, takenCounters]);

  async function fetchUsers() {
    const res = await fetch('/api/users');
    if (res.ok) {
      setUsers((await res.json()).users || []);
      setSelectedUsers([]);
    }
  }

  async function handleDelete(userName: string) {
    const ok = await confirm({ title: t('Delete User', 'Delete User'), message: t('Delete this user?', 'Delete this user?') });
    if (!ok) return;
    await fetch(`/api/users?username=${encodeURIComponent(userName)}`, { method: 'DELETE' });
    setMessage(t('Deleted!', 'Deleted!'));
    fetchUsers();
  }

  return (
    <div className="manage-users-page space-y-4">
      <div className="page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="page-title label-si">{t('User Accounts', 'User Accounts')}</h1>
            <p className="page-subtitle label-si">{t('Manage administrators and cashiers separately.', 'Manage administrators and cashiers separately.')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={selectedUsers.length === 0}
              onClick={async () => {
                const ok = await confirm({ title: t('Delete Selected Users', 'Delete Selected Users'), message: t('Delete selected users?', 'Delete selected users?') });
                if (!ok) return;
                await Promise.all(selectedUsers.map((u) => fetch(`/api/users?username=${encodeURIComponent(u)}`, { method: 'DELETE' })));
                setMessage(t('Deleted!', 'Deleted!'));
                fetchUsers();
              }}
            >
              {t('Delete Selected', 'Delete Selected')}
            </Button>
            <Button onClick={() => setShowCreate(true)}>{t('Create User', 'Create User')}</Button>
          </div>
        </div>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Card className="overflow-hidden p-0 sm:p-0" title={t('All Users', 'All Users')}>
        <div className="data-table-wrap custom-scrollbar">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-center"><Checkbox checked={allSelected} onChange={(checked) => setSelectedUsers(checked ? nonProtected.map((u) => u.username) : [])} /></th>
                <th className="text-left">{t('Name', 'Name')}</th>
                <th className="text-left">{t('Username', 'Username')}</th>
                <th className="text-left">{t('Role', 'Role')}</th>
                <th className="text-left">{t('Counter', 'Counter')}</th>
                <th className="text-center">{t('Status', 'Status')}</th>
                <th className="text-center">{t('Action', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-sm text-slate-500">{t('No users', 'No users')}</td></tr>
              ) : users.map((u) => (
                <tr key={u.username}>
                  <td className="text-center">
                    {u.username.toLowerCase() === 'admin' ? '—' : (
                      <Checkbox checked={selectedUsers.includes(u.username)} onChange={(checked) => setSelectedUsers((prev) => checked ? [...prev, u.username] : prev.filter((x) => x !== u.username))} />
                    )}
                  </td>
                  <td className="label-si font-semibold">{u.full_name}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.counter_no}</td>
                  <td className="text-center">{isAdminRole(u.role) ? '—' : <StatusBadge status={u.availability_status} t={t} />}</td>
                  <td className="cell-actions">
                    <div className="cell-actions-inner">
                      {u.username.toLowerCase() === 'admin' ? (
                        <span className="text-slate-400 text-xs">{t('Protected', 'Protected')}</span>
                      ) : (
                        <>
                          <Button variant="warning" className="!py-1 !text-xs" onClick={() => setEditUser(u)}>{t('Edit', 'Edit')}</Button>
                          <Button variant="danger" className="!py-1 !text-xs" onClick={() => handleDelete(u.username)}>{t('Delete', 'Delete')}</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={t('Administrators', 'Administrators')}><p className="text-sm">{admins.length}</p></Card>
      <Card title={t('Cashiers', 'Cashiers')}><p className="text-sm">{cashiers.length}</p></Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('Add New User', 'Add New User')} size="lg" footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setShowCreate(false)}>{t('Close', 'Close')}</Button>
        <Button className="w-full" onClick={async () => {
          setMessage(''); setError('');
          const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, full_name: fullName, password, role, counter_no: counterNo }) });
          const data = await res.json();
          if (!res.ok) { setError(data.error); return; }
          setMessage(t('Account created!', 'Account created!'));
          setUsername(''); setFullName(''); setPassword('');
          setShowCreate(false);
          fetchUsers();
        }}>{t('Create Account', 'Create Account')}</Button>
      </>}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={t('Full Name', 'Full Name')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label={t('Username', 'Username')} value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label={t('Password', 'Password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Select label={t('Role', 'Role')} value={role} onChange={(e) => setRole(e.target.value)} options={roles} />
          <Select label={t('Counter', 'Counter')} value={counterNo} onChange={(e) => setCounterNo(e.target.value)} options={counters} />
        </div>
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={t('Edit User', 'Edit User')} size="lg" footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setEditUser(null)}>{t('Close', 'Close')}</Button>
        <Button className="w-full" onClick={async () => {
          if (!editUser) return;
          setError('');
          const res = await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              old_username: editUser.username,
              username: editUser.username,
              full_name: editUser.full_name,
              password: editUser.password,
              role: editUser.role,
              counter_no: editUser.counter_no,
            }),
          });
          const data = await res.json();
          if (!res.ok) { setError(data.error); return; }
          setEditUser(null);
          setMessage(t('Updated!', 'Updated!'));
          fetchUsers();
        }}>{t('Save', 'Save')}</Button>
      </>}>
        {editUser && (
          <div className="grid gap-3 md:grid-cols-2">
            <Input label={t('Name', 'Name')} value={editUser.full_name} onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })} />
            <Input label={t('Username', 'Username')} value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
            <Input label={t('Password', 'Password')} type="password" value={editUser.password || ''} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} hint={t('Leave blank to keep current password', 'Leave blank to keep current password')} />
            <Select
              label={t('Role', 'Role')}
              value={editUser.role}
              onChange={(e) => {
                const newRole = e.target.value;
                const opts = counterOptionsForRole(lang, newRole, editTakenCounters, editUser.counter_no);
                const validCounter = opts.some((o) => o.value === editUser.counter_no);
                setEditUser({ ...editUser, role: newRole, counter_no: validCounter ? editUser.counter_no : defaultCounterForRole(newRole, editTakenCounters) });
              }}
              options={roles}
            />
            <Select label={t('Counter', 'Counter')} value={editUser.counter_no} onChange={(e) => setEditUser({ ...editUser, counter_no: e.target.value })} options={editCounters} />
          </div>
        )}
      </Modal>
    </div>
  );
}

