'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Input, Modal, Select } from '@/components/ui';
import { roleOptions, useLang } from '@/hooks/useLang';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';
import {
  counterOptionsForRole,
  defaultCounterForRole,
  getTakenCashierCounters,
  isAdminRole,
} from '@/lib/counters';

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
  return <span className={busy ? 'badge-warning' : 'badge-stock'}>{busy ? t('', '') : t('', '')}</span>;
}

function UserTable({
  users,
  t,
  onEdit,
  onDelete,
  showStatus,
}: {
  users: User[];
  t: (si: string, en: string) => string;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  showStatus?: boolean;
}) {
  if (users.length === 0) return <p className="py-6 text-center text-sm text-slate-500 label-si">{t('', '')}</p>;

  return (
    <div className="data-table-wrap custom-scrollbar">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-left label-si">{t('', '')}</th>
            <th className="text-left">{t('', '')}</th>
            <th className="text-left">{t('', '')}</th>
            {showStatus && <th className="text-center">{t('', '')}</th>}
            <th className="text-center">{t('', '')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.username}>
              <td className="label-si font-semibold">{u.full_name}</td>
              <td>{u.username}</td>
              <td>{u.counter_no}</td>
              {showStatus && <td className="text-center"><StatusBadge status={u.availability_status} t={t} /></td>}
              <td className="cell-actions">
                <div className="cell-actions-inner">
                  {u.username.toLowerCase() === 'admin' ? (
                    <span className="text-slate-400 text-xs label-si">{t('', '')}</span>
                  ) : (
                    <>
                      <Button variant="warning" className="!py-1 !text-xs" onClick={() => onEdit(u)}>{t('', '')}</Button>
                      <Button variant="danger" className="!py-1 !text-xs" onClick={() => onDelete(u)}>{t('', '')}</Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

  const roles = useMemo(() => roleOptions(lang), [lang]);
  const takenCounters = useMemo(() => getTakenCashierCounters(users), [users]);
  const editTakenCounters = useMemo(() => (editUser ? getTakenCashierCounters(users, editUser.username) : []), [users, editUser]);

  const counters = useMemo(() => counterOptionsForRole(lang, role, takenCounters), [lang, role, takenCounters]);
  const editCounters = useMemo(() => (editUser ? counterOptionsForRole(lang, editUser.role, editTakenCounters, editUser.counter_no) : []), [lang, editUser, editTakenCounters]);

  const admins = useMemo(() => users.filter((u) => isAdminRole(u.role)), [users]);
  const cashiers = useMemo(() => users.filter((u) => !isAdminRole(u.role)), [users]);

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { setCounterNo(defaultCounterForRole(role, takenCounters)); }, [role, takenCounters]);

  async function fetchUsers() {
    const res = await fetch('/api/users');
    if (res.ok) setUsers((await res.json()).users || []);
  }

  async function handleDelete(u: User) {
    const ok = await confirm({ title: t('', ''), message: t('', '') });
    if (!ok) return;
    await fetch(`/api/users?username=${encodeURIComponent(u.username)}`, { method: 'DELETE' });
    setMessage(t('', ''));
    fetchUsers();
  }

  return (
    <div className="manage-users-page space-y-4">
      <div className="page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="page-title label-si">{t('', '')}</h1>
            <p className="page-subtitle label-si">{t('', '')}</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>{t('', '')}</Button>
        </div>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Card title={t('', '')} className="overflow-hidden p-0 sm:p-0">
        <UserTable users={admins} t={t} onEdit={setEditUser} onDelete={handleDelete} />
      </Card>

      <Card title={t('', '')} className="overflow-hidden p-0 sm:p-0">
        <UserTable users={cashiers} t={t} showStatus onEdit={setEditUser} onDelete={handleDelete} />
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('', '')} footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setShowCreate(false)}>{t('', '')}</Button>
        <Button className="w-full" onClick={async () => {
          setMessage(''); setError('');
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, full_name: fullName, password, role, counter_no: counterNo }),
          });
          const data = await res.json();
          if (!res.ok) { setError(data.error); return; }
          setMessage(t('', ''));
          setUsername(''); setFullName(''); setPassword('');
          setShowCreate(false);
          fetchUsers();
        }}>{t('', '')}</Button>
      </>}>
        <div className="space-y-3">
          <Input label={t('', '')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label={t('', '')} value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label={t('', '')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Select label={t('', '')} value={role} onChange={(e) => setRole(e.target.value)} options={roles} />
          <Select label={t('', '')} value={counterNo} onChange={(e) => setCounterNo(e.target.value)} options={counters} />
          {role.toLowerCase() === 'admin' && <p className="text-xs text-slate-500 label-si">{t('', '')}</p>}
        </div>
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={t('', '')} footerSplit footer={<>
        <Button variant="secondary" className="w-full" onClick={() => setEditUser(null)}>{t('', '')}</Button>
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
          setMessage(t('', ''));
          fetchUsers();
        }}>{t('', '')}</Button>
      </>}>
        {editUser && (
          <div className="space-y-3">
            <Input label={t('', '')} value={editUser.full_name} onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })} />
            <Input label={t('', '')} value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
            <Input label={t('', '')} type="password" value={editUser.password || ''} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} hint={t('', '')} />
            <Select
              label={t('', '')}
              value={editUser.role}
              onChange={(e) => {
                const newRole = e.target.value;
                const opts = counterOptionsForRole(lang, newRole, editTakenCounters, editUser.counter_no);
                const validCounter = opts.some((o) => o.value === editUser.counter_no);
                setEditUser({ ...editUser, role: newRole, counter_no: validCounter ? editUser.counter_no : defaultCounterForRole(newRole, editTakenCounters) });
              }}
              options={roles}
            />
            <Select label={t('', '')} value={editUser.counter_no} onChange={(e) => setEditUser({ ...editUser, counter_no: e.target.value })} options={editCounters} />
          </div>
        )}
      </Modal>
    </div>
  );
}

