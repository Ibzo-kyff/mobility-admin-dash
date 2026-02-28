'use client';

import AdminVehicleTabs from '@/components/admin/AdminVehicleTabs';

export default function AdminVehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Véhicules</h1>
          <p className="text-gray-600">Consultez, validez et gérez tous les véhicules inscrits sur la plateforme</p>
        </div>
      </div>

      <AdminVehicleTabs />
    </div>
  );
}
