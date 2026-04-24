'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { parkingAPI } from '@/services/parking/parking-api';

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    parkingAPI.getMyVehicles()
      .then((data) => {
        if (!mounted) return;
        setVehicles(data || []);
      })
      .catch((err) => setError(err.message || 'Erreur'))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce véhicule ?')) return;
    try {
      await parkingAPI.deleteVehicle(id);
      setVehicles((prev) => prev?.filter((v) => v.id !== id) ?? null);
    } catch (e: any) {
      alert(e?.message || 'Erreur suppression');
    }
  };

  if (loading) return <div>Chargement des véhicules...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!vehicles || vehicles.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <p className="text-gray-600">Aucun véhicule enregistré.</p>
      <div className="mt-4">
        <Link href="/dashboard/parking/vehicles/add">
          <Button variant="primary">Ajouter un véhicule</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Véhicules</h2>
        <Link href="/dashboard/parking/vehicles/add">
          <Button variant="primary">Ajouter</Button>
        </Link>
      </div>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-2">Immatriculation</th>
            <th className="py-2">Marque</th>
            <th className="py-2">Modèle</th>
            <th className="py-2">Statut</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id} className="border-t">
              <td className="py-3">{v.plate || v.immatriculation || '-'}</td>
              <td className="py-3">{v.marque || v.brand || '-'}</td>
              <td className="py-3">{v.model || v.modele || '-'}</td>
              <td className="py-3">{v.status || v.statut || '—'}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/parking/vehicles/${v.id}`}>
                    <Button variant="outline">Voir</Button>
                  </Link>
                  <button onClick={() => handleDelete(v.id)} className="text-red-600 px-3 py-1 rounded hover:bg-red-50">Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
