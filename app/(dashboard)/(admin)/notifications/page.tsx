'use client';

import { useEffect, useState } from 'react';
import {
  HiOutlineBellAlert,
  HiOutlineCheckCircle,
  HiOutlineNoSymbol,
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlineUserPlus,
} from 'react-icons/hi2';
import { MdOutlineInventory2, MdOutlinePointOfSale } from 'react-icons/md';
import { Alert, Card, PageLoader, Pagination } from '@/components/ui';
import { useLang } from '@/hooks/useLang';
import { usePagination } from '@/hooks/usePagination';
import { useSession } from '@/hooks/useSession';
import type { Lang } from '@/lib/translations';

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  created_at: string;
};

type TypeStyle = {
  icon: React.ReactNode;
  labelSi: string;
  labelEn: string;
  accent: string;
  iconBg: string;
  badgeClass: string;
};

const TYPE_STYLES: Record<string, TypeStyle> = {
  user_registered: {
    icon: <HiOutlineUserPlus className="text-lg" />,
    labelSi: 'නව පරිශීලකයා',
    labelEn: 'New User',
    accent: 'border-l-sky-500',
    iconBg: 'bg-sky-100 text-sky-700',
    badgeClass: 'badge-stock',
  },
  user_disabled: {
    icon: <HiOutlineNoSymbol className="text-lg" />,
    labelSi: 'පරිශීලකයා අක්‍රිය',
    labelEn: 'User Disabled',
    accent: 'border-l-red-500',
    iconBg: 'bg-red-100 text-red-700',
    badgeClass: 'badge-danger',
  },
  user_enabled: {
    icon: <HiOutlineCheckCircle className="text-lg" />,
    labelSi: 'පරිශීලකයා සක්‍රිය',
    labelEn: 'User Enabled',
    accent: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-700',
    badgeClass: 'badge-stock',
  },
  product_added: {
    icon: <MdOutlineInventory2 className="text-lg" />,
    labelSi: 'නව භාණ්ඩය',
    labelEn: 'Product Added',
    accent: 'border-l-indigo-500',
    iconBg: 'bg-indigo-100 text-indigo-700',
    badgeClass: 'badge-cashier',
  },
  product_deleted: {
    icon: <HiOutlineTrash className="text-lg" />,
    labelSi: 'භාණ්ඩය මකා දමන ලදී',
    labelEn: 'Product Deleted',
    accent: 'border-l-orange-500',
    iconBg: 'bg-orange-100 text-orange-700',
    badgeClass: 'badge-warning',
  },
  cashier_unavailable: {
    icon: <MdOutlinePointOfSale className="text-lg" />,
    labelSi: 'කැෂියර් නොමැත',
    labelEn: 'Cashier Unavailable',
    accent: 'border-l-amber-500',
    iconBg: 'bg-amber-100 text-amber-800',
    badgeClass: 'badge-warning',
  },
  stock_out: {
    icon: <HiOutlineShoppingBag className="text-lg" />,
    labelSi: 'තොගය අවසන්',
    labelEn: 'Stock Out',
    accent: 'border-l-rose-500',
    iconBg: 'bg-rose-100 text-rose-700',
    badgeClass: 'badge-danger',
  },
};

const DEFAULT_TYPE_STYLE: TypeStyle = {
  icon: <HiOutlineBellAlert className="text-lg" />,
  labelSi: 'දැනුම්දීම',
  labelEn: 'Alert',
  accent: 'border-l-slate-400',
  iconBg: 'bg-slate-100 text-slate-600',
  badgeClass: 'badge',
};

function getTypeStyle(type: string) {
  return TYPE_STYLES[type] || DEFAULT_TYPE_STYLE;
}

function formatWhen(dateStr: string, lang: Lang) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return lang === 'si' ? 'මේ දැන්' : 'Just now';
  if (diffMins < 60) return lang === 'si' ? `${diffMins} මිනිත්තු කලින්` : `${diffMins}m ago`;
  if (diffHours < 24) return lang === 'si' ? `${diffHours} පැය කලින්` : `${diffHours}h ago`;
  if (diffDays < 7) return lang === 'si' ? `${diffDays} දින කලින්` : `${diffDays}d ago`;
  return date.toLocaleString(lang === 'si' ? 'si-LK' : undefined);
}

export default function NotificationsPage() {
  useSession(true, true);
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const {
    paginatedItems,
    page,
    setPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(items);

  useEffect(() => {
    fetch('/api/notifications')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setItems(data.notifications || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title label-si">{t('දැනුම්දීම්', 'Notifications')}</h1>
            <p className="page-subtitle label-si">
              {t(
                'පරිශීලකයින්, භාණ්ඩ, තොග සහ තත්වය වෙනස්වීම් පිළිබඳ සියලු දැනුම්දීම්.',
                'All alerts about users, products, stock, and status changes.'
              )}
            </p>
          </div>
          {items.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
              <HiOutlineBellAlert className="text-primary" />
              {items.length} {t('දැනුම්දීම්', 'notifications')}
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <Alert type="info">{t('දැනුම්දීම් නොමැත', 'No notifications')}</Alert>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((n) => {
            const style = getTypeStyle(n.type);
            const when = formatWhen(n.created_at, lang);
            const fullTime = new Date(n.created_at).toLocaleString(lang === 'si' ? 'si-LK' : undefined);

            return (
              <Card key={n.id} hover className={`flex gap-4 border-l-4 !p-4 ${style.accent}`}>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
                  {style.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className={style.badgeClass}>{t(style.labelSi, style.labelEn)}</span>
                    <time className="text-xs font-semibold text-slate-500" title={fullTime}>
                      {when}
                    </time>
                  </div>
                  <p className="label-si text-sm font-medium leading-relaxed text-slate-800">{n.message}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">{fullTime}</p>
                </div>
              </Card>
            );
          })}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setPage}
            className="rounded-xl border border-slate-200"
          />
        </div>
      )}
    </div>
  );
}
