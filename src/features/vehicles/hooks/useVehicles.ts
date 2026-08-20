import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Vehicle, FleetStats } from '../types';
import { vehiclesAPI } from '../../../services/vehicles-api';
import { parkingAPI } from '../../../services/parking/parking-api';

interface UseVehiclesOptions {
  initialFilters?: Record<string, string | number | boolean | null | undefined>;
}

export const useVehicles = ({ initialFilters = {} }: UseVehiclesOptions = {}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const loadVehicles = useCallback(async (extraFilters: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehiclesAPI.getVehicules({ ...filters, ...extraFilters });
      setVehicles(data as Vehicle[]);
    } catch (err: any) {
      setError(err?.message || 'Erreur chargement véhicules');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const filteredVehicles = useMemo(() => {
    // As the API already supports filtering, keep this minimal but allow additional client filters
    return vehicles.filter((v) => {
      // simple example: if filters.status provided, filter client-side
      if (filters && (filters as any).status) {
        if (v.status !== (filters as any).status) return false;
      }
      return true;
    });
  }, [vehicles, filters]);

  const fleetStats: FleetStats = useMemo(() => {
    const total = vehicles.length;
    const forSale = vehicles.filter((v) => Boolean(v.forSale)).length;
    const forRent = vehicles.filter((v) => Boolean(v.forRent)).length;
    // reservations may be fetched separately; keep placeholder calculations
    const withRes = 0;
    const activeReservations = 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyActivity = months.map((m) => ({ month: m, sales: Math.floor(Math.random() * 5), rentals: Math.floor(Math.random() * 10) }));
    const distribution = [
      { name: 'En location', value: forRent, color: '#FF6B35' },
      { name: 'En vente', value: forSale, color: '#FFD166' },
      { name: 'Avec réservations', value: withRes, color: '#E8E8E8' },
    ];
    return { total, forSale, forRent, withReservations: withRes, activeReservations, monthlyActivity, distribution } as FleetStats;
  }, [vehicles]);

  const setFilter = useCallback((next: Record<string, any>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const refresh = useCallback(() => loadVehicles(), [loadVehicles]);

  const handleStatusChange = useCallback(async (vehicleId: string, status: string) => {
    try {
      const updated = await vehiclesAPI.updateVehicule(vehicleId, { status } as any);
      setVehicles((prev) => prev.map((v) => (String(v.id) === String(vehicleId) ? { ...v, status: updated.status ?? status } : v)));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const handleDelete = useCallback(async (vehicleId: string) => {
    try {
      await vehiclesAPI.deleteVehicule(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    vehicles,
    filteredVehicles,
    fleetStats,
    loading,
    error,
    filters,
    setFilter,
    refresh,
    loadVehicles,
    handleStatusChange,
    handleDelete,
  } as const;
};

export default useVehicles;
