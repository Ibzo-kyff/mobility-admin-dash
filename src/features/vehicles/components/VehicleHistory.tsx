import React from 'react';
import type { Vehicle } from '../types';

interface Props {
  vehicle?: Vehicle | null;
}

const VehicleHistory: React.FC<Props> = ({ vehicle }) => {
  const reservations = (vehicle as any)?.reservations ?? [];

  if (!vehicle) return null;

  return (
    <div className="p-4 border rounded bg-white mt-4">
      <h4 className="text-lg font-semibold mb-2">Historique des réservations</h4>
      {reservations.length === 0 ? (
        <div className="text-sm text-gray-500">Aucune réservation enregistrée.</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {reservations.map((r: any) => (
            <li key={r.id} className="p-2 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{r.user?.nom ?? r.user?.email ?? 'Utilisateur'}</div>
                  <div className="text-xs text-gray-500">{r.type} — {new Date(r.date).toLocaleString()}</div>
                </div>
                <div className="text-sm">Status: {r.status}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VehicleHistory;
