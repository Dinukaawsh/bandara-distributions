'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductsViewModal } from '@/components/modals/ProductsViewModal';
import { StockAlertsViewModal } from '@/components/modals/StockAlertsViewModal';
import { Card } from '@/components/ui';
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
      icon: '📦',
      title: t('භාණ්ඩ කළමනාකරණය', 'Manage Products'),
      desc: t('භාණ්ඩ බැලීම, සංස්කරණය සහ මකාදැමීම.', 'View, edit and delete products.'),
      viewBtn: t('භාණ්ඩ බලන්න', 'View Items'),
      manageBtn: t('කළමනාකරණය', 'Manage'),
      viewVariant: 'btn-primary',
      manageVariant: 'btn-secondary',
      onView: () => setShowProducts(true),
      manageHref: '/settings/products',
    },
    {
      key: 'store',
      icon: '🏪',
      title: t('ආයතන විස්තර', 'Store Details'),
      desc: t('බිල්පතේ මුද්‍රණය වන නම, ලිපිනය සහ දුරකථන අංකය.', 'Shop name, address and phone on invoice.'),
      manageBtn: t('කළමනාකරණය', 'Manage'),
      manageVariant: 'btn-secondary',
      manageHref: '/manage-store',
    },
    {
      key: 'users',
      icon: '👥',
      title: t('පරිශීලක ගිණුම්', 'User Accounts'),
      desc: t('Cashier ලා එකතු කිරීම සහ කළමනාකරණය.', 'Add and manage cashier accounts.'),
      manageBtn: t('කළමනාකරණය', 'Manage'),
      manageVariant: 'btn-success',
      manageHref: '/manage-users',
    },
    {
      key: 'reports',
      icon: '📊',
      title: t('විකුණුම් වාර්තා', 'Sales Reports'),
      desc: t('මාසික විකුණුම් සහ ලාභ වාර්තා.', 'Monthly sales and profit reports.'),
      manageBtn: t('වාර්තා බලන්න', 'View Reports'),
      manageVariant: 'btn-secondary',
      manageHref: '/sales-report',
    },
    {
      key: 'stock',
      icon: '⚠️',
      title: t('තොග දැනුම්දීම්', 'Stock Alerts'),
      desc: t('අඩු තොග ඇති භාණ්ඩ බලන්න.', 'View low stock items.'),
      viewBtn: t('භාණ්ඩ බලන්න', 'View Items'),
      manageBtn: t('පිටුවට යන්න', 'Open Page'),
      viewVariant: 'btn-danger',
      manageVariant: 'btn-secondary',
      onView: () => setShowStock(true),
      manageHref: '/stock-alerts',
    },
    {
      key: 'backup',
      icon: '💾',
      title: t('දත්ත බැකප්', 'Backup'),
      desc: t('පද්ධති දත්ත JSON ලෙස බාගත කරන්න.', 'Download system data as JSON.'),
      manageBtn: t('Backup ලබාගන්න', 'Get Backup'),
      manageVariant: 'btn-warning',
      external: true,
      manageHref: '/api/backup',
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold label-si">{t('පද්ධති සැකසුම්', 'System Settings')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.key} hover title={`${item.icon} ${item.title}`} description={item.desc}>
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
          </Card>
        ))}
      </div>

      <ProductsViewModal open={showProducts} onClose={() => setShowProducts(false)} />
      <StockAlertsViewModal open={showStock} onClose={() => setShowStock(false)} />
    </div>
  );
}
