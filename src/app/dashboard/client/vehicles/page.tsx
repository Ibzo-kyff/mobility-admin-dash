"use client";

import React, { useEffect, useState } from 'react';
import { clientAPI } from '@/services/client/client-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  faCar,
  faPlus,
  faTrash,
  faEdit,
  faSearch,
  faCheckCircle,
  faExclamationTriangle,
  faEllipsisVertical
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function ClientVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await clientAPI.getUserVehicles(user.id);
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
    try {
      await clientAPI.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.marque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.modele?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.immatriculation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Véhicules</h1>
          <p className="text-gray-500">Gérez vos véhicules pour des réservations plus rapides.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-sm active:scale-95">
          <FontAwesomeIcon icon={faPlus} />
          Ajouter un Véhicule
        </button>
      </div>

      <div className="relative group">
        <FontAwesomeIcon 
          icon={faSearch} 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" 
        />
        <input 
          type="text" 
          placeholder="Rechercher par marque, modèle ou plaque..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    <FontAwesomeIcon icon={faCar} className="text-xl" />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                    {vehicle.marque || 'Marque'}
                  </h3>
                  <p className="text-orange-600 font-bold">{vehicle.modele || 'Modèle'}</p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plaque / Immat</p>
                    <p className="text-lg font-black text-gray-900">{vehicle.plate || vehicle.immatriculation || '---'}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    {vehicle.stats ? (
                      <div className="flex gap-4 text-[10px] font-bold text-gray-500 uppercase">
                        <span>{vehicle.stats.reservations || 0} Rés.</span>
                        <span>{vehicle.stats.vues || 0} Vues</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Vérifié</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <FontAwesomeIcon icon={faCar} className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Aucun véhicule trouvé</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Ajoutez votre premier véhicule pour commencer à réserver vos places de parking.
          </p>
          <button className="mt-8 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
            Ajouter un véhicule
          </button>
        </div>
      )}
    </div>
  );
}
