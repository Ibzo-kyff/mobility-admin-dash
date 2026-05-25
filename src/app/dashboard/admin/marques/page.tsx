'use client';

import React, { useState, useEffect } from 'react';
import { vehiclesAPI } from '@/services/vehicles-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faCar, faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminMarquesPage() {
  const [marques, setMarques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadMarques();
  }, []);

  const loadMarques = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getMarques();
      // Suppression des doublons basée sur le nom (casse ignorée)
      const unique = Array.from(new Map(data.map((item: any) => [item.name.trim().toLowerCase(), item])).values());
      setMarques(unique);
    } catch (e) {
      console.error('Erreur de chargement des marques:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarques = marques.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getFullLogoUrl = (logoUrl?: string) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';
    return `${baseUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Marques</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Consultez les marques et leurs véhicules associés</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="flex-1 relative group">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une marque..." 
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMarques.map((marque: any) => {
            const fullLogoUrl = getFullLogoUrl(marque.logo || marque.logoUrl);
            
            return (
              <div 
                key={marque.id} 
                onClick={() => router.push(`/dashboard/admin/vehicles?marque=${encodeURIComponent(marque.name)}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-500/30 transition-all p-6 flex flex-col items-center justify-center gap-4 cursor-pointer group"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center p-3 relative overflow-hidden">
                  {fullLogoUrl ? (
                    <img 
                      src={fullLogoUrl} 
                      alt={marque.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback');
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faCar} className="text-3xl text-gray-300 group-hover:text-orange-400 transition-colors" />
                  )}
                </div>
                <div className="text-center w-full">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-500 transition-colors">{marque.name}</h3>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center justify-center gap-1 group-hover:text-orange-400 transition-colors">
                    <span>Voir véhicules</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-[8px] transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMarques.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Aucune marque ne correspond à votre recherche.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
