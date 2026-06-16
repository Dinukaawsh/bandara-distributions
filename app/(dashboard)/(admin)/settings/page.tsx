'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiOutlineArchiveBox, HiOutlineBuildingStorefront, HiOutlineChartBarSquare, HiOutlineCloudArrowDown, HiOutlineExclamationTriangle, HiOutlineUsers } from 'react-icons/hi2';
import { ProductsViewModal } from '@/components/modals/ProductsViewModal';
import { StockAlertsViewModal } from '@/components/modals/StockAlertsViewModal';
import { useLang } from '@/hooks/useLang';
import { useSession } from '@/hooks/useSession';

export default function SettingsPage() {
  useSession(true, true);
  const { t } = useLang();
  const [showProducts, setShowProducts] = useState(false);
  const [showStock, setShowStock] = useState(false);

  const items = [
    {
      key: 'products',
      icon: <HiOutlineArchiveBox />,
      color: 'settings-card-blue',
      title: t('Product Management', 'Manage Products'),
      desc: t('View, edit and delete products.', 'View, edit and delete products.'),
      viewBtn: t('View Items', 'View Items'),
      manageBtn: t('Manage', 'Manage'),
      viewVariant: 'btn-primary',
      manageVariant: 'btn-secondary',
      onView: () => setShowProducts(true),
      manageHref: '/settings/products',
    },
    {
      key: 'store',
      icon: <HiOutlineBuildingStorefront />,
      color: 'settings-card-emerald',
      title: t('Store Details', 'Store Details'),
      desc: t('Shop name, address and phone on invoice.', 'Shop name, address and phone on invoice.'),
      manageBtn: t('Manage', 'Manage'),
      manageVariant: 'btn-secondary',
      manageHref: '/manage-store',
    },
    {
      key: 'users',
      icon: <HiOutlineUsers />,
      color: 'settings-card-violet',
      title: t('User Accounts', 'User Accounts'),
      desc: t('Add and manage user accounts.', 'Add and manage user accounts.'),
      manageBtn: t('Manage', 'Manage'),
      manageVariant: 'btn-success',
      manageHref: '/manage-users',
    },
    {
      key: 'reports',
      icon: <HiOutlineChartBarSquare />,
      color: 'settings-card-sky',
      title: t('Sales Reports', 'Sales Reports'),
      desc: t('Monthly sales and profit reports.', 'Monthly sales and profit reports.'),
      manageBtn: t('View Reports', 'View Reports'),
      manageVariant: 'btn-secondary',
      manageHref: '/sales-report',
    },
    {
      key: 'stock',
      icon: <HiOutlineExclamationTriangle />,
      color: 'settings-card-amber',
      title: t('Stock Alerts', 'Stock Alerts'),
      desc: t('View low stock items.', 'View low stock items.'),
      viewBtn: t('View Items', 'View Items'),
      manageBtn: t('Open Page', 'Open Page'),
      viewVariant: 'btn-danger',
      manageVariant: 'btn-secondary',
      onView: () => setShowStock(true),
      manageHref: '/stock-alerts',
    },
    {
      key: 'backup',
      icon: <HiOutlineCloudArrowDown />,
      color: 'settings-card-slate',
      title: t('Backup', 'Backup'),
      desc: t('Download system data as JSON.', 'Download system data as JSON.'),
      manageBtn: t('Get Backup', 'Get Backup'),
      manageVariant: 'btn-warning',
      external: true,
      manageHref: '/api/backup',
    },
  ];

  return (
    <div>
      <div className="page-header mb-8">
        <h1 className="page-title label-si">{t('System Settings', 'System Settings')}</h1>
        <p className="page-subtitle label-si">{t('Manage products, users, reports and backups.', 'Manage products, users, reports and backups.')}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.key} className={`settings-card ${item.color}`}>
            <div className="settings-card-icon text-2xl">{item.icon}</div>
            <h2 className="settings-card-title label-si">{item.title}</h2>
            <p className="settings-card-desc label-si">{item.desc}</p>
            <div className={`grid gap-2 ${item.viewBtn ? 'grid-cols-2' : ''}`}>
              {item.viewBtn && (
                <button type="button" className={`btn ${item.viewVariant}`} onClick={item.onView}>
                  {item.viewBtn}
                </button>
              )}
              {item.external ? (
                <a href={item.manageHref} className={`btn ${item.manageVariant} ${item.viewBtn ? '' : 'w-full'}`}>
                  {item.manageBtn}
                </a>
              ) : (
                <Link href={item.manageHref!} className={`btn ${item.manageVariant} ${item.viewBtn ? '' : 'w-full'}`}>
                  {item.manageBtn}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <ProductsViewModal open={showProducts} onClose={() => setShowProducts(false)} />
      <StockAlertsViewModal open={showStock} onClose={() => setShowStock(false)} />
    </div>
  );
}
