import React from 'react';
import useVehicleForm from '../../hooks/useVehicleForm';
import type { Vehicule } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded?: (v: Vehicule) => void;
}

const AddVehicleModal: React.FC<Props> = ({ open, onClose, onAdded }) => {
  const { form, setField, addPhotoFile, removePhotoAt, createVehicle, submitting } = useVehicleForm();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded shadow p-6 w-full max-w-3xl">
        <h3 className="text-lg font-semibold">Ajouter un véhicule</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Marque</label>
            <input value={form.marque} onChange={(e) => setField('marque', e.target.value)} className="mt-1 w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Modèle</label>
            <input value={form.model} onChange={(e) => setField('model', e.target.value)} className="mt-1 w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Prix</label>
            <input type="number" value={form.price ?? ''} onChange={(e) => setField('price', e.target.value ? Number(e.target.value) : null)} className="mt-1 w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Année</label>
            <input type="number" value={form.year ?? ''} onChange={(e) => setField('year', e.target.value ? Number(e.target.value) : null)} className="mt-1 w-full border p-2 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm">Description</label>
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} className="mt-1 w-full border p-2 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm">Photos</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) addPhotoFile(e.target.files[0]); }} className="mt-1" />
            <div className="mt-2 flex gap-2 flex-wrap">
              {form.photos.map((p, idx) => (
                <div key={idx} className="w-20 h-20 border rounded overflow-hidden">
                  {typeof p === 'string' ? <img src={p} className="w-full h-full object-cover" alt={`photo-${idx}`} /> : <div className="p-2 text-xs">Fichier: {p.name}</div>}
                  <button onClick={() => removePhotoAt(idx)} className="w-full text-xs text-red-600">Suppr</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
          <button
            onClick={async () => {
              const res = await createVehicle();
              if (onAdded) onAdded(res as unknown as Vehicule);
              onClose();
            }}
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;
