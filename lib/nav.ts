export type NavItem = {
  href: string;
  icon: string;
  labelSi: string;
  labelEn: string;
  adminOnly?: boolean;
};

export const mainNav: NavItem[] = [
  { href: '/dashboard', icon: 'dashboard', labelSi: 'පරිපාලක ඩෑෂ්බෝඩ්', labelEn: 'Admin Dashboard', adminOnly: true },
  { href: '/billing', icon: 'billing', labelSi: 'බිල්පත් පද්ධතිය', labelEn: 'Billing' },
  { href: '/settings/products', icon: 'products', labelSi: 'භාණ්ඩ කළමනාකරණය', labelEn: 'Products', adminOnly: true },
  { href: '/manage-store', icon: 'store', labelSi: 'ආයතන විස්තර', labelEn: 'Store', adminOnly: true },
  { href: '/manage-users', icon: 'users', labelSi: 'පරිශීලකයින්', labelEn: 'Users', adminOnly: true },
  { href: '/sales-report', icon: 'report', labelSi: 'විකුණුම් වාර්තා', labelEn: 'Sales Report', adminOnly: true },
  { href: '/notifications', icon: 'notifications', labelSi: 'දැනුම්දීම්', labelEn: 'Notifications', adminOnly: true },
  { href: '/stock-alerts', icon: 'alerts', labelSi: 'තොග දැනුම්දීම්', labelEn: 'Stock Alerts', adminOnly: true },
  { href: '/settings', icon: 'settings', labelSi: 'සැකසුම්', labelEn: 'Settings', adminOnly: true },
];

export const userNav: NavItem[] = [
  { href: '/my-day', icon: 'myday', labelSi: 'මගේ අද විකුණුම්', labelEn: 'My Day Sales' },
  { href: '/profile', icon: 'profile', labelSi: 'මගේ ගිණුම', labelEn: 'My Profile' },
  { href: '/change-password', icon: 'password', labelSi: 'මුරපදය වෙනස් කරන්න', labelEn: 'Change Password' },
];

export function navLabel(item: NavItem, lang: 'si' | 'en') {
  return lang === 'si' ? item.labelSi : item.labelEn;
}
