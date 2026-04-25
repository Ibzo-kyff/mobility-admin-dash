"use client";

import VehicleForm from '@/components/parking/VehicleForm';

export default function AddVehiclePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Ajouter un véhicule</h1>
      <p className="text-gray-600">Formulaire pour ajouter un nouveau véhicule à la flotte.</p>
      <div className="mt-6">
        <VehicleForm />
      </div>
    </div>
  );
}
