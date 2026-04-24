'use client';

import { useEffect, useState } from 'react';
import { parkingAPI } from '@/services/parking/parking-api';

export default function AnalyticsCharts() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    parkingAPI.getAnalytics()
      .then((d) => mounted && setData(d))
      .catch(() => {})
    return () => { mounted = false; };
  }, []);

  if (!data) return <div className="bg-white border p-4 rounded">Aucune donnée d'analytics.</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Statistiques</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">Graphique 1 (placeholder)</div>
        <div className="p-4 border rounded">Graphique 2 (placeholder)</div>
      </div>
    </div>
  );
}
