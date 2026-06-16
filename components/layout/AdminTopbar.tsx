'use client';

import { useRouter } from 'next/navigation';
import { Button, LanguageSelect } from '@/components/ui';
import { useDialog } from '@/hooks/useDialog';
import type { SessionUser } from '@/hooks/useSession';
import type { Lang } from '@/lib/translations';

type AdminTopbarProps = {
  user: SessionUser;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onMenuClick: () => void;
  title?: string;
};

export function AdminTopbar({ user, lang, onLangChange, onMenuClick, title }: AdminTopbarProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const isAdmin = user.role.toLowerCase() === 'admin';
  const isBusy = user.availability_status === 'busy';

  async function handleLogout() {
    const ok = await confirm({
      title: lang === 'si' ? 'ලොග් අවුට් කරන්නද?' : 'Log out?',
      message:
        lang === 'si'
          ? 'ඔබට පද්ධතියෙන් ඉවත් වීමට අවශ්‍ය බව විශ්වාසද?'
          : 'Are you sure you want to log out?',
      confirmLabel: lang === 'si' ? 'ලොග් අවුට්' : 'Logout',
      cancelLabel: lang === 'si' ? 'අවලංගු' : 'Cancel',
      confirmVariant: 'danger',
    });
    if (!ok) return;
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function changeLang(newLang: Lang) {
    onLangChange(newLang);
    await fetch('/api/lang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: newLang }),
    });
  }

  return (
    <header className="admin-topbar no-print">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="btn-ghost !px-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-black label-si truncate">
            {title || (lang === 'si' ? 'බිල්පත් පද්ධතිය' : 'Billing System')}
          </h1>
          <p className="text-xs text-slate-500 truncate">
            {user.full_name} · {user.counter_no}
          </p>
        </div>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-topbar-badges">
          <span className={isAdmin ? 'badge-admin' : 'badge-cashier'}>
            {isAdmin ? (lang === 'si' ? 'පරිපාලක' : 'Admin') : (lang === 'si' ? 'කැෂියර්' : 'Cashier')}
          </span>
          {!isAdmin && (
            <span className={isBusy ? 'badge-warning' : 'badge-stock'}>
              {isBusy ? (lang === 'si' ? 'කාර්යබහුල' : 'Busy') : (lang === 'si' ? 'ලබා ගත හැක' : 'Available')}
            </span>
          )}
        </div>
        <div className="admin-topbar-controls">
          <div className="admin-topbar-lang">
            <LanguageSelect value={lang} onChange={changeLang} />
          </div>
          <Button variant="danger" onClick={handleLogout} className="admin-topbar-logout !py-2 !text-xs">
            {lang === 'si' ? 'ලොග් අවුට්' : 'Logout'}
          </Button>
        </div>
      </div>
    </header>
  );
}
