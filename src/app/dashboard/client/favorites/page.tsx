'use client';

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCar, faMapMarkerAlt, faGasPump, faCalendarAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { favorisService, FavorisVehicule } from '@/services/client/favoris-service';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavorisVehicule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    const favs = await favorisService.getFavoris();
    setFavorites(favs);
    setLoading(false);
  };

  useEffect(() => {
    loadFavorites();

    const handleUpdate = () => loadFavorites();
    window.addEventListener('favorisUpdated', handleUpdate);
    return () => window.removeEventListener('favorisUpdated', handleUpdate);
  }, []);

  const removeFavorite = async (id: number) => {
    await favorisService.removeFromFavoris(id);
  };

  const clearAll = async () => {
    if (window.confirm('Voulez-vous vraiment retirer tous les véhicules de vos favoris ?')) {
      await favorisService.clearFavoris();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <FontAwesomeIcon icon={faHeart} className="text-rose-500" />
            Mes Véhicules Favoris
          </h1>
          <p className="text-gray-500 mt-1">Retrouvez les véhicules que vous avez sauvegardés.</p>
        </div>
        {favorites.length > 0 && (
          <button 
            onClick={clearAll}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-bold px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
            <span className="hidden sm:inline">Vider la liste</span>
          </button>
        )}
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            // Extraction image
            const vehPhotos = fav.photos;
            let vehImage = null;
            if (Array.isArray(vehPhotos) && vehPhotos.length > 0) vehImage = vehPhotos[0];
            else if (typeof vehPhotos === 'string' && vehPhotos.trim().startsWith('[')) {
              try { const parsed = JSON.parse(vehPhotos); if (parsed.length) vehImage = parsed[0]; } catch(e) {}
            } else if (typeof vehPhotos === 'string' && vehPhotos.trim().length > 0) vehImage = vehPhotos;
            
            const imageUrl = vehImage
              ? (vehImage.startsWith('http') ? vehImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app'}${vehImage.startsWith('/') ? '' : '/'}${vehImage}`)
              : null;

            return (
              <div key={fav.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col">
                <div className="relative h-48 bg-gray-100 w-full overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={fav.model} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FontAwesomeIcon icon={faCar} className="text-5xl" />
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={() => removeFavorite(fav.id)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white shadow-lg transition-colors"
                      title="Retirer des favoris"
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                  </div>
                  
                  {fav.prix && (
                    <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-xl text-sm font-black tracking-wide">
                      {fav.prix.toLocaleString()} F <span className="text-[10px] font-medium opacity-80">/ jour</span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    {fav.marqueRef?.logoUrl && (
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden p-1">
                        <img src={fav.marqueRef.logoUrl.startsWith('http') ? fav.marqueRef.logoUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app'}${fav.marqueRef.logoUrl.startsWith('/') ? '' : '/'}${fav.marqueRef.logoUrl}`} alt="logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-orange-500 transition-colors">
                        {fav.marqueRef?.name || 'Véhicule'} {fav.model}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{fav.parking?.city || 'Localisation inconnue'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                      <span className="font-medium">{fav.year || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                      <FontAwesomeIcon icon={faGasPump} className="text-gray-400" />
                      <span className="font-medium truncate">{fav.fuelType || 'Essence'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 flex gap-3">
                    <Link href={`/dashboard/client/search?vehicle=${fav.id}`} className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-orange-600 transition-all text-center shadow-lg shadow-orange-500/20">
                      Réserver
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
            <FontAwesomeIcon icon={faHeart} className="text-5xl" />
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">Aucun favori pour le moment</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Explorez les véhicules et parkings disponibles et ajoutez-les à vos favoris pour les retrouver facilement ici.
          </p>
          <Link href="/dashboard/client/search" className="px-8 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20">
            Explorer les offres
          </Link>
        </div>
      )}
    </div>
  );
}
