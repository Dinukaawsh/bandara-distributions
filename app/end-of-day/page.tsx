'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EndOfDayPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/billing');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-center label-si">
      <p>{'යළි හරවා යවමින්...'}</p>
    </div>
  );
}
