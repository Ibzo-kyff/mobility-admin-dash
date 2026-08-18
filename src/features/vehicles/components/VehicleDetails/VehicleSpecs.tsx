import React from 'react';
import type { Vehicle } from '../../types';
import { formatPrice, formatMileage, formatTransmissionForDisplay } from '../../utils/format';

interface Props {
  vehicle?: Vehicle | null;
}

const VehicleSpecs: React.FC<Props> = ({ vehicle }) => {
  if (!vehicle) return null;

  return (
    <div className="p-4 border rounded bg-white">
      <h4 className="text-lg font-semibold mb-2">Caractéristiques</h4>
      <ul className="text-sm text-gray-700 space-y-1">
        <li><strong>Prix:</strong> {formatPrice(vehicle.price)}</li>
        <li><strong>Kilométrage:</strong> {formatMileage(vehicle.mileage)}</li>
        <li><strong>Année:</strong> {vehicle.year ?? '—'}</li>
        <li><strong>Carburant:</strong> {vehicle.fuelType ?? '—'}</li>
        <li><strong>Transmission:</strong> {formatTransmissionForDisplay(vehicle.transmission)}</li>
        <li><strong>Statut:</strong> {vehicle.status ?? '—'}</li>
      </ul>
    </div>
  );
};

export default VehicleSpecs;
