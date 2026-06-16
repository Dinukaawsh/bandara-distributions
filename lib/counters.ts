import type { Lang } from '@/lib/translations';

export function counterOptionsForRole(lang: Lang, role: string) {
  const counters = Array.from({ length: 15 }, (_, i) => ({
    value: `Counter ${i + 1}`,
    label: lang === 'si' ? `කවුන්ටරය ${i + 1}` : `Counter ${i + 1}`,
  }));

  if (role.toLowerCase() === 'admin') {
    return [
      { value: 'Admin Office', label: lang === 'si' ? 'පරිපාලක කාර්යාලය' : 'Admin Office' },
      ...counters,
    ];
  }

  return counters;
}

export function defaultCounterForRole(role: string) {
  return role.toLowerCase() === 'admin' ? 'Admin Office' : 'Counter 1';
}
