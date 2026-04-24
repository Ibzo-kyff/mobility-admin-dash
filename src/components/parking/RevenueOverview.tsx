'use client';

import { useEffect, useState } from 'react';
import { parkingAPI } from '@/services/parking/parking-api';

export default function RevenueOverview() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    parkingAPI.getRevenueSummary()
      .then((d) => mounted && setData(d))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!data) return <div className="bg-white border p-4 rounded">Aucune donnée de revenus.</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Revenus</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 border rounded">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-semibold">{data.total || data.totalRevenue || 0} €</p>
        </div>
        <div className="p-3 border rounded">
          <p className="text-xs text-gray-500">Moyenne par réservation</p>
          <p className="text-xl font-semibold">{data.avg || data.avgPerReservation || '-'} €</p>
        </div>
        <div className="p-3 border rounded">
          <p className="text-xs text-gray-500">Réservations</p>
          <p className="text-xl font-semibold">{data.count || data.reservationCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
