'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNav, navLabel, userNav } from '@/lib/nav';
import type { Lang } from '@/lib/translations';

type AdminSidebarProps = {
  lang: Lang;
  isAdmin: boolean;
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ lang, isAdmin, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const navItems = mainNav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`admin-sidebar ${open ? 'translate-x-0' : '-translate-x-full'} custom-scrollbar overflow-y-auto`}
      >
        <div className="border-b border-slate-700 px-5 py-5">
          <p className="text-lg font-extrabold tracking-wide text-white">BANDARA STORE</p>
          <p className="text-xs text-slate-400 label-si">
            {lang === 'si' ? 'බිල්පත් පද්ධතිය' : 'Billing System'}
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 label-si">
            {lang === 'si' ? 'ප්‍රධාන මෙනුව' : 'Main Menu'}
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={active ? 'admin-sidebar-link-active' : 'admin-sidebar-link'}
              >
                <span>{item.icon}</span>
                <span className="label-si">{navLabel(item, lang)}</span>
              </Link>
            );
          })}

          <p className="mt-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 label-si">
            {lang === 'si' ? 'ගිණුම' : 'Account'}
          </p>
          {userNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={active ? 'admin-sidebar-link-active' : 'admin-sidebar-link'}
              >
                <span>{item.icon}</span>
                <span className="label-si">{navLabel(item, lang)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
