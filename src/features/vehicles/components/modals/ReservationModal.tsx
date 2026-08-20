import React from 'react';
import useReservation from '../../hooks/useReservation';
import type { Vehicle } from '../../types';

interface Props {
  open: boolean;
  vehicle?: Vehicle | null;
  onClose: () => void;
  onConfirm?: (data: any) => void;
}

const ReservationModal: React.FC<Props> = ({ open, vehicle, onClose, onConfirm }) => {
  const {
    reservationType,
    setReservationType,
    startDateTime,
    setStartDateTime,
    endDateTime,
    setEndDateTime,
    selectedMotif,
    setSelectedMotif,
    prepareReservation,
  } = useReservation();

  if (!open) return null;

  const formatDateForInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');

  const handleConfirm = () => {
    if (!vehicle) return;
    const price = (vehicle.prix as any) || (vehicle.price as any) || 0;
    const res = prepareReservation(vehicle.id, price);
    if (onConfirm) onConfirm(res);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded shadow p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold">Réserver: {vehicle ? `${vehicle.marque ?? ''} ${vehicle.model ?? ''}` : ''}</h3>
        <div className="mt-4">
          <label className="block text-sm">Type</label>
          <select
            value={reservationType ?? ''}
            onChange={(e) => setReservationType(e.target.value as 'LOCATION' | 'ACHAT')}
            className="mt-1 w-full border p-2 rounded"
          >
            <option value="">Sélectionner</option>
            <option value="LOCATION">Location</option>
            <option value="ACHAT">Achat</option>
          </select>
        </div>

        <div className="mt-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm">Date début</label>
            <input
              type="date"
              value={formatDateForInput(startDateTime)}
              onChange={(e) => setStartDateTime(e.target.value ? new Date(e.target.value) : null)}
              className="mt-1 w-full border p-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm">Date fin</label>
            <input
              type="date"
              value={formatDateForInput(endDateTime)}
              onChange={(e) => setEndDateTime(e.target.value ? new Date(e.target.value) : null)}
              className="mt-1 w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded">Confirmer</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
