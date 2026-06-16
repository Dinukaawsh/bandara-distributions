'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiOutlineChartBar, HiOutlineCog6Tooth, HiOutlineShoppingBag, HiOutlineUserCircle } from 'react-icons/hi2';
import { MdOutlinePointOfSale, MdOutlineStorefront, MdOutlinePeopleAlt, MdOutlineInventory2, MdOutlineEventAvailable, MdOutlinePassword } from 'react-icons/md';
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
  const [storeName, setStoreName] = useState('BANDARA STORE');
  const iconMap: Record<string, React.ReactNode> = {
    dashboard: <HiOutlineChartBar />,
    billing: <MdOutlinePointOfSale />,
    products: <MdOutlineInventory2 />,
    store: <MdOutlineStorefront />,
    users: <MdOutlinePeopleAlt />,
    report: <HiOutlineChartBar />,
    alerts: <HiOutlineShoppingBag />,
    settings: <HiOutlineCog6Tooth />,
    myday: <MdOutlineEventAvailable />,
    profile: <HiOutlineUserCircle />,
    password: <MdOutlinePassword />,
  };

  useEffect(() => {
    let active = true;
    async function loadStore() {
      const res = await fetch('/api/store');
      if (!res.ok || !active) return;
      const data = await res.json();
      const nextName = String(data?.store?.store_name || 'BANDARA STORE').trim();
      if (nextName) setStoreName(nextName);
    }
    loadStore();
    const onStoreUpdated = () => loadStore();
    window.addEventListener('store-updated', onStoreUpdated);
    return () => {
      active = false;
      window.removeEventListener('store-updated', onStoreUpdated);
    };
  }, []);

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`admin-sidebar ${open ? 'translate-x-0' : '-translate-x-full'} custom-scrollbar overflow-y-auto`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">BS</div>
          <div>
            <p className="text-base font-extrabold tracking-wide text-white">{storeName}</p>
            <p className="text-xs text-slate-400 label-si">
              {lang === 'si' ? 'බිල්පත් පද්ධතිය' : 'Billing System'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="sidebar-section-label label-si">
            {lang === 'si' ? 'ප්‍රධාන මෙනුව' : 'Main Menu'}
          </p>
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/settings' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={active ? 'admin-sidebar-link-active' : 'admin-sidebar-link'}
              >
                <span className="sidebar-icon text-lg">{iconMap[item.icon] || <HiOutlineChartBar />}</span>
                <span className="label-si">{navLabel(item, lang)}</span>
              </Link>
            );
          })}

          <div className="sidebar-divider" />

          <p className="sidebar-section-label label-si">
            {lang === 'si' ? 'ගිණුම' : 'Account'}
          </p>
          {userNav.filter((item) => !(isAdmin && item.href === '/my-day')).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={active ? 'admin-sidebar-link-active' : 'admin-sidebar-link'}
              >
                <span className="sidebar-icon text-lg">{iconMap[item.icon] || <HiOutlineChartBar />}</span>
                <span className="label-si">{navLabel(item, lang)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
