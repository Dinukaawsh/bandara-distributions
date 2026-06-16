import type { Lang } from '@/lib/translations';

export type CashierStatus = 'available' | 'busy';

export function isAdminRole(role: string) {
  return role.toLowerCase() === 'admin';
}

export function counterOptionsForRole(
  lang: Lang,
  role: string,
  takenCounters: string[] = [],
  excludeCounter?: string
) {
  if (isAdminRole(role)) {
    return [
      { value: 'Admin Office', label: lang === 'si' ? 'පරිපාලක කාර්යාලය' : 'Admin Office' },
    ];
  }

  const taken = new Set(
    takenCounters.filter((c) => c && c !== 'Admin Office' && c !== excludeCounter)
  );

  return Array.from({ length: 15 }, (_, i) => {
    const value = `Counter ${i + 1}`;
    const takenByOther = taken.has(value);
    return {
      value,
      label:
        lang === 'si'
          ? `කවුන්ටරය ${i + 1}${takenByOther ? ' (ගත්තා)' : ''}`
          : `Counter ${i + 1}${takenByOther ? ' (taken)' : ''}`,
      disabled: takenByOther,
    };
  }).filter((opt) => !opt.disabled);
}

export function defaultCounterForRole(role: string, takenCounters: string[] = []) {
  if (isAdminRole(role)) return 'Admin Office';
  for (let i = 1; i <= 15; i++) {
    const counter = `Counter ${i}`;
    if (!takenCounters.includes(counter)) return counter;
  }
  return 'Counter 1';
}

export function getTakenCashierCounters(
  users: Array<{ username: string; role: string; counter_no: string }>,
  excludeUsername?: string
) {
  return users
    .filter(
      (u) =>
        !isAdminRole(u.role) &&
        u.username !== excludeUsername &&
        u.counter_no &&
        u.counter_no !== 'Admin Office'
    )
    .map((u) => u.counter_no);
}
