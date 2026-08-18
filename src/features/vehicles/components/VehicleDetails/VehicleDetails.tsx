import React from 'react';
import type { Vehicle } from '../../types';
import VehicleGallery from './VehicleGallery';
import VehicleSpecs from './VehicleSpecs';

interface Props {
  vehicle?: Vehicle | null;
  onEdit?: (v: Vehicle) => void;
  onReserve?: (v: Vehicle) => void;
  onPay?: (v: Vehicle) => void;
}

const VehicleDetails: React.FC<Props> = ({ vehicle, onEdit, onReserve, onPay }) => {
  if (!vehicle) return <div className="p-4">Sélectionnez un véhicule pour voir les détails.</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <VehicleGallery vehicle={vehicle} />
        <div className="mt-4 p-4 bg-white border rounded">
          <h3 className="text-xl font-semibold">{vehicle.marque} {vehicle.model}</h3>
          <p className="mt-2 text-gray-700">{vehicle.description}</p>
        </div>
      </div>
      <div>
        <VehicleSpecs vehicle={vehicle} />
        <div className="mt-4 flex flex-col gap-2">
          {onReserve && <button onClick={() => onReserve(vehicle)} className="w-full px-3 py-2 bg-blue-600 text-white rounded">Réserver</button>}
          {onPay && <button onClick={() => onPay(vehicle)} className="w-full px-3 py-2 bg-green-600 text-white rounded">Payer</button>}
          {onEdit && <button onClick={() => onEdit(vehicle)} className="w-full px-3 py-2 border rounded">Éditer</button>}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
