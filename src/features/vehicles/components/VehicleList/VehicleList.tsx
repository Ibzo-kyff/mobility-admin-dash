import React, { useState } from 'react';
import type { Vehicle } from '../../types';
import VehicleCard from './VehicleCard';
import VehicleFilters from './VehicleFilters';
import FleetDashboard from './FleetDashboard';

interface Props {
  vehicles: Vehicle[];
  fleetStats: any;
  loading?: boolean;

  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onReserve?: (vehicle: Vehicle) => void;

  // Actions déjà utilisées par VehicleCard
  onView?: (vehicle: Vehicle) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const VehicleList: React.FC<Props> = ({
  vehicles,
  fleetStats,
  loading,
  onEdit,
  onDelete,
  onReserve,
  onView,
  onStatusChange,
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const filtered = vehicles.filter((v) => {
    // Filtre statut
    if (status && v.status !== status) {
      return false;
    }

    // Recherche marque + modèle
    if (search) {
      const s = search.toLowerCase();

      const vehicleName = `${v.marque ?? ''} ${v.model ?? ''}`.toLowerCase();

      if (!vehicleName.includes(s)) {
        return false;
      }
    }

    return true;
  });

  /**
   * Gestion des actions du VehicleCard
   */
  const handleAction = (id: string, action: string) => {
    const vehicle = vehicles.find(
      (v) => String(v.id) === String(id)
    );

    if (!vehicle) {
      console.warn(`Véhicule introuvable pour l'id : ${id}`);
      return;
    }

    switch (action) {
      case 'EDIT':
        onEdit?.(vehicle);
        break;

      case 'DELETE':
        onDelete?.(vehicle);
        break;

      case 'RESERVE':
        onReserve?.(vehicle);
        break;

      default:
        console.warn(`Action inconnue : ${action}`);
    }
  };

  /**
   * Changement de statut
   */
  const handleStatusChange = (id: string, newStatus: string) => {
    onStatusChange?.(id, newStatus);
  };

  /**
   * Voir les détails
   */
  const handleView = (vehicle: Vehicle) => {
    onView?.(vehicle);
  };

  return (
    <div>
      {/* Dashboard */}
      <FleetDashboard stats={fleetStats} />

      {/* Barre de recherche + filtres + affichage */}
      <div className="flex justify-between items-center mb-3">
        <VehicleFilters
          search={search}
          onSearch={setSearch}
          onStatusChange={(s) => setStatus(s)}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`px-2 py-1 rounded ${
              view === 'grid' ? 'bg-gray-200' : ''
            }`}
          >
            Grid
          </button>

          <button
            type="button"
            onClick={() => setView('list')}
            className={`px-2 py-1 rounded ${
              view === 'list' ? 'bg-gray-200' : ''
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Liste des véhicules */}
      {loading ? (
        <div>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          Aucun véhicule trouvé.
        </div>
      ) : (
        <div
          className={
            view === 'grid'
              ? 'flex flex-wrap -m-2'
              : 'flex flex-col gap-4'
          }
        >
          {filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              variant={view}
              onView={handleView}
              onStatusChange={handleStatusChange}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;