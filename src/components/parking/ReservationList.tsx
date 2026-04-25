'use client';

import { useEffect, useState } from 'react';
import { parkingAPI } from '@/services/parking/parking-api';

export default function ReservationList() {
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    parkingAPI.getReservations()
      .then((data) => mounted && setItems(data || []))
      .catch((err) => mounted && setError(err.message || 'Erreur'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Chargement des réservations...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!items || items.length === 0) return <div className="bg-white border p-4 rounded">Aucune réservation trouvée.</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">Réservations récentes</h2>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="p-3 border rounded hover:bg-gray-50">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{r.clientName || r.client?.name || 'Client'}</p>
                <p className="text-xs text-gray-500">{r.vehicle?.plate || r.vehiclePlate || ''}</p>
              </div>
              <div className="text-sm text-gray-600">{r.status || r.etat}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
