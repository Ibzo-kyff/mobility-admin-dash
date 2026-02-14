'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN') {
        router.replace('/dashboard/admin');
      } else if (user.role === 'CLIENT') {
        router.replace('/dashboard/client');
      } else {
        router.replace('/dashboard/parking');
      }
    }
  }, [user, isLoading, router]);

  return <div className="p-10">Redirection...</div>;
}
