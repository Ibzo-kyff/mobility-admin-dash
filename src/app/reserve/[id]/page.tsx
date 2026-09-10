'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';

export default function ReserveRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard search/reserve flow which is more integrated
    router.replace(`/dashboard/client/search/${params.id}`);
  }, [params.id]);

  return (
    <PageLoader
      fullScreen
      text="Redirection vers la réservation"
      subtext="Préparation du véhicule..."
    />
  );
}
