import type { Document } from 'mongodb';
import { isAdminRole } from '@/lib/counters';

type DbUser = Document & {
  username?: string;
  role?: string;
  counter_no?: string;
};

export function validateUserAssignment(
  role: string,
  counter_no: string,
  users: DbUser[],
  excludeUsername?: string
): string | null {
  const normalizedRole = String(role || 'Cashier');
  const normalizedCounter = String(counter_no || '').trim();

  if (isAdminRole(normalizedRole)) {
    if (normalizedCounter !== 'Admin Office') {
      return 'Admin users must use Admin Office counter only.';
    }
    return null;
  }

  if (normalizedCounter === 'Admin Office') {
    return 'Cashiers cannot use Admin Office counter.';
  }

  const conflict = users.find(
    (u) =>
      u.username !== excludeUsername &&
      !isAdminRole(String(u.role || '')) &&
      String(u.counter_no) === normalizedCounter
  );

  if (conflict) {
    const name = String((conflict as { full_name?: string; username?: string }).full_name || conflict.username);
    return `Counter "${normalizedCounter}" is already assigned to ${name}. Edit that cashier first.`;
  }

  return null;
}
