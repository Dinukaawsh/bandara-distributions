'use client';

import { useSession } from '@/hooks/useSession';
import { PageLoader } from '@/components/ui';

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession(true, true);
  if (loading) return <PageLoader />;
  if (!user) return null;
  return <>{children}</>;
}
