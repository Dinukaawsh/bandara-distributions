export type NavItem = {
  href: string;
  icon: string;
  labelSi: string;
  labelEn: string;
  adminOnly?: boolean;
};

export const mainNav: NavItem[] = [
  { href: '/billing', icon: '🧾', labelSi: 'බිල්පත් පද්ධතිය', labelEn: 'Billing' },
  { href: '/settings/products', icon: '📦', labelSi: 'භාණ්ඩ කළමනාකරණය', labelEn: 'Products', adminOnly: true },
  { href: '/manage-store', icon: '🏪', labelSi: 'ආයතන විස්තර', labelEn: 'Store', adminOnly: true },
  { href: '/manage-users', icon: '👥', labelSi: 'පරිශීලකයින්', labelEn: 'Users', adminOnly: true },
  { href: '/sales-report', icon: '📊', labelSi: 'විකුණුම් වාර්තා', labelEn: 'Sales Report', adminOnly: true },
  { href: '/stock-alerts', icon: '⚠️', labelSi: 'තොග දැනුම්දීම්', labelEn: 'Stock Alerts', adminOnly: true },
  { href: '/settings', icon: '⚙️', labelSi: 'සැකසුම්', labelEn: 'Settings', adminOnly: true },
];

export const userNav: NavItem[] = [
  { href: '/profile', icon: '👤', labelSi: 'මගේ ගිණුම', labelEn: 'My Profile' },
  { href: '/change-password', icon: '🔑', labelSi: 'මුරපදය වෙනස් කරන්න', labelEn: 'Change Password' },
];

export function navLabel(item: NavItem, lang: 'si' | 'en') {
  return lang === 'si' ? item.labelSi : item.labelEn;
}
