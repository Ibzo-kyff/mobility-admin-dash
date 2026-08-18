import React from 'react';
import type { FleetStats } from '../../types';

interface Props {
  stats: FleetStats;
}

const FleetDashboard: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="p-4 border rounded bg-white">
        <div className="text-sm text-gray-500">Total</div>
        <div className="text-2xl font-bold">{stats.total}</div>
      </div>
      <div className="p-4 border rounded bg-white">
        <div className="text-sm text-gray-500">En vente</div>
        <div className="text-2xl font-bold">{stats.forSale}</div>
      </div>
      <div className="p-4 border rounded bg-white">
        <div className="text-sm text-gray-500">En location</div>
        <div className="text-2xl font-bold">{stats.forRent}</div>
      </div>
      <div className="p-4 border rounded bg-white">
        <div className="text-sm text-gray-500">Réservations</div>
        <div className="text-2xl font-bold">{stats.activeReservations}</div>
      </div>
    </div>
  );
};

export default FleetDashboard;
