'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ReserveRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard search/reserve flow which is more integrated
    router.replace(`/dashboard/client/search/${params.id}`);
  }, [params.id]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}
