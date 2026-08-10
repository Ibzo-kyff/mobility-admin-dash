'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { parkingAPI } from '@/services/parking/parking-api';

export default function VehicleForm({ initial = {} as any }: { initial?: any }) {
  const [form, setForm] = useState<any>({
    plate: initial.plate || initial.immatriculation || '',
    marque: initial.marque || initial.brand || '',
    model: initial.model || initial.modele || '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await parkingAPI.createVehicle(form);
      router.push('/dashboard/parking/vehicles');
    } catch (err: any) {
      alert(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-black">Immatriculation</label>
          <input name="plate" value={form.plate} onChange={onChange} className="w-full mt-1 px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="text-sm text-black">Marque</label>
          <input name="marque" value={form.marque} onChange={onChange} className="w-full mt-1 px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="text-sm text-black">Modèle</label>
          <input name="model" value={form.model} onChange={onChange} className="w-full mt-1 px-3 py-2 border rounded" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="submit" isLoading={loading} variant="primary">Enregistrer</Button>
      </div>
    </form>
  );
}
