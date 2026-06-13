'use client';

import { useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui';
import { DialogProvider } from '@/hooks/useDialog';
import { LangProvider } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';
import type { Lang } from '@/lib/translations';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

type DashboardLayoutProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  title?: string;
};

export function DashboardLayout({ children, requireAdmin = false, title }: DashboardLayoutProps) {
  const { user, loading } = useSession(true, requireAdmin);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Lang>(user?.lang || 'si');

  useEffect(() => {
    if (user?.lang) setLang(user.lang);
  }, [user]);

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <LangProvider lang={lang} setLang={setLang}>
      <DialogProvider lang={lang}>
        <div className="admin-shell">
          <AdminSidebar
            lang={lang}
            isAdmin={user.role.toLowerCase() === 'admin'}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="admin-main">
            <AdminTopbar
              user={user}
              lang={lang}
              onLangChange={setLang}
              onMenuClick={() => setSidebarOpen(true)}
              title={title}
            />
            <main className="admin-content custom-scrollbar">{children}</main>
          </div>
        </div>
      </DialogProvider>
    </LangProvider>
  );
}
