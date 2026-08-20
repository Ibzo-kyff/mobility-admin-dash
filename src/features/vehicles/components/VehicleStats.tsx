import React from 'react';
import type { FleetStats } from '../types';

interface Props {
  stats: FleetStats;
}

const VehicleStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="p-4 border rounded bg-white mt-4">
      <h4 className="text-lg font-semibold mb-2">Statistiques</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="p-3 border rounded">
          <div className="text-gray-500">Total</div>
          <div className="text-xl font-bold">{stats.total}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-gray-500">En vente</div>
          <div className="text-xl font-bold">{stats.forSale}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-gray-500">En location</div>
          <div className="text-xl font-bold">{stats.forRent}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-gray-500">Réservations</div>
          <div className="text-xl font-bold">{stats.activeReservations}</div>
        </div>
      </div>
    </div>
  );
};

export default VehicleStats;
