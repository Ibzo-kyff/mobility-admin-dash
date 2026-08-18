import React, { useState } from 'react';
import type { Vehicle } from '../../types';
import VehicleCard from './VehicleCard';
import VehicleFilters from './VehicleFilters';
import FleetDashboard from './FleetDashboard';

interface Props {
  vehicles: Vehicle[];
  fleetStats: any;
  loading?: boolean;
  onEdit?: (v: Vehicle) => void;
  onDelete?: (v: Vehicle) => void;
  onReserve?: (v: Vehicle) => void;
}

const VehicleList: React.FC<Props> = ({ vehicles, fleetStats, loading, onEdit, onDelete, onReserve }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const filtered = vehicles.filter((v) => {
    if (status && v.status !== status) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(`${v.marque ?? ''} ${v.model ?? ''}`.toLowerCase().includes(s))) return false;
    }
    return true;
  });

  return (
    <div>
      <FleetDashboard stats={fleetStats} />
      <div className="flex justify-between items-center mb-3">
        <VehicleFilters search={search} onSearch={setSearch} onStatusChange={(s) => setStatus(s)} />
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={`px-2 py-1 rounded ${view === 'grid' ? 'bg-gray-200' : ''}`}>Grid</button>
          <button onClick={() => setView('list')} className={`px-2 py-1 rounded ${view === 'list' ? 'bg-gray-200' : ''}`}>List</button>
        </div>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className={view === 'grid' ? 'flex flex-wrap -m-2' : ''}>
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} variant={view} onEdit={onEdit} onDelete={onDelete} onReserve={onReserve} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;
