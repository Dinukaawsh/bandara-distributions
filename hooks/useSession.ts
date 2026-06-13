'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lang } from '@/lib/translations';

export type SessionUser = {
  username: string;
  role: string;
  full_name: string;
  counter_no: string;
  lang: Lang;
};

export function useSession(requireAuth = true, requireAdmin = false) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          if (requireAuth) router.push('/login');
          return null;
        }
        const data = await res.json();
        return data.user as SessionUser;
      })
      .then((sessionUser) => {
        if (!sessionUser) {
          setLoading(false);
          return;
        }
        if (requireAdmin && sessionUser.role.toLowerCase() !== 'admin') {
          router.push('/billing');
          setLoading(false);
          return;
        }
        setUser(sessionUser);
        setLoading(false);
      })
      .catch(() => {
        if (requireAuth) router.push('/login');
        setLoading(false);
      });
  }, [router, requireAuth, requireAdmin]);

  return { user, loading, isAdmin: user?.role.toLowerCase() === 'admin' };
}
