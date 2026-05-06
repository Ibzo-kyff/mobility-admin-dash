'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { mobilityAPI } from '@/services/mobility-api';
import { clientAPI } from '@/services/client/client-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faMapMarkerAlt, faStar, faCar, faFilter, 
  faChevronRight, faParking, faClock, faMoneyBillWave,
  faGasPump, faCogs, faInfoCircle, faThLarge, faList,
  faXmark, faChevronDown, faChevronUp, faSync, faTimesCircle, faArrowRight, faEuroSign
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function SearchPage() {
  const [parkings, setParkings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [marques, setMarques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'parkings' | 'vehicles'>('parkings');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    type: 'all',
    marque: 'all',
    transmission: 'all',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'parkings') {
        const data = await clientAPI.getParkings();
        setParkings(data || []);
      } else {
        const [vData, mData] = await Promise.all([
          mobilityAPI.getVehicules(),
          clientAPI.getMarques()
        ]);
        setVehicles(vData || []);
        setMarques(mData || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredParkings = useMemo(() => {
    return parkings.filter(p => {
      const matchesSearch = 
        (p.nom || p.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.adresse || p.address)?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [parkings, searchTerm]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        (v.marque || v.marqueRef?.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.model || v.modele)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.parking?.nom || v.parking?.name)?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || v.type?.toLowerCase() === filters.type.toLowerCase();
      const matchesMarque = filters.marque === 'all' || 
                            v.marque?.toLowerCase() === filters.marque.toLowerCase() || 
                            v.marqueRef?.name?.toLowerCase() === filters.marque.toLowerCase();
      
      const transmission = (v.transmission || v.boite || '').toLowerCase();
      const matchesTrans = filters.transmission === 'all' || 
                           (filters.transmission === 'auto' && (transmission.includes('auto'))) ||
                           (filters.transmission === 'manual' && (transmission.includes('manuelle') || transmission.includes('manual')));

      const price = Number(v.prix || v.prixJour || 0);
      const matchesMinPrice = filters.minPrice === '' || price >= Number(filters.minPrice);
      const matchesMaxPrice = filters.maxPrice === '' || price <= Number(filters.maxPrice);

      return matchesSearch && matchesType && matchesMarque && matchesTrans && matchesMinPrice && matchesMaxPrice;
    });
  }, [vehicles, searchTerm, filters]);

  const resetFilters = () => {
    setFilters({
      type: 'all',
      marque: 'all',
      transmission: 'all',
      minPrice: '',
      maxPrice: '',
    });
  };

  const isFilterActive = useMemo(() => {
    return filters.marque !== 'all' || filters.transmission !== 'all' || filters.minPrice !== '' || filters.maxPrice !== '';
  }, [filters]);

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Réservation</h1>
          <p className="text-gray-500 text-sm">Trouvez et réservez votre parking ou votre véhicule idéal.</p>
        </div>
      </div>

      {/* Tab Switcher & View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('parkings')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'parkings' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FontAwesomeIcon icon={faParking} className="mr-2" />
            Parkings
          </button>
          <button 
            onClick={() => setActiveTab('vehicles')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'vehicles' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FontAwesomeIcon icon={faCar} className="mr-2" />
            Véhicules
          </button>
        </div>

        {activeTab === 'vehicles' && (
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        )}
      </div>

      {/* Search Bar Container */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" 
          />
          <input 
            type="text" 
            placeholder={activeTab === 'parkings' ? "Rechercher un parking..." : "Rechercher une marque, un modèle..."} 
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {activeTab === 'vehicles' && (
            <button 
              onClick={() => setShowFilters(true)}
              className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isFilterActive ? 'bg-slate-900 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faFilter} />
              Filtres
            </button>
          )}
          <button 
            onClick={fetchData}
            className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:text-orange-500 transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer - Fixed Right Anchor */}
      {showFilters && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" 
            onClick={() => setShowFilters(false)} 
          />
          
          {/* Side Panel */}
          <div className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slideLeft">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Filtres</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnalisez votre recherche</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center shadow-sm hover:shadow-lg active:scale-95"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faEuroSign} className="text-orange-500" />
                  Budget (FCFA)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <span className="text-[9px] font-bold text-slate-300 uppercase ml-1">Minimum</span>
                     <input
                      type="number"
                      placeholder="0"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-300 uppercase ml-1">Maximum</span>
                    <input
                      type="number"
                      placeholder="Illimité"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faCar} className="text-blue-500" />
                  Marque du véhicule
                </label>
                <select 
                  value={filters.marque}
                  onChange={(e) => setFilters({ ...filters, marque: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Toutes les marques</option>
                  {marques.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faCogs} className="text-purple-500" />
                  Type de boîte
                </label>
                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                  {(['all', 'auto', 'manual'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilters({ ...filters, transmission: t })}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        filters.transmission === t 
                        ? 'bg-white text-orange-500 shadow-md shadow-orange-500/5' 
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t === 'all' ? 'Tout' : t === 'auto' ? 'Auto' : 'Manu'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
              <button
                onClick={resetFilters}
                className="w-full py-4 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faSync} className="text-[8px]" />
                Réinitialiser les filtres
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                Voir les résultats
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement en cours...</p>
        </div>
      ) : (
        <div className={
          activeTab === 'vehicles' && viewMode === 'list' 
            ? "flex flex-col gap-4" 
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }>
          {activeTab === 'parkings' ? (
            <>
              {filteredParkings.map((parking) => (
                <ParkingCard key={parking.id} parking={parking} />
              ))}
              {filteredParkings.length === 0 && <EmptyState message="Aucun parking ne correspond à vos critères." />}
            </>
          ) : (
            <>
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
              ))}
              {filteredVehicles.length === 0 && <EmptyState message="Aucun véhicule ne correspond à vos critères." />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200 shadow-sm">
        <FontAwesomeIcon icon={faInfoCircle} className="text-2xl" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}

function ParkingCard({ parking }: { parking: any }) {
  const getLogoUrl = (logo?: string) => {
    if (!logo) return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80';
    if (logo.startsWith('http')) return logo;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';
    return `${baseUrl}${logo.startsWith('/') ? '' : '/'}${logo}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      <div className="h-40 bg-gray-200 relative overflow-hidden">
        <img 
          src={getLogoUrl(parking.logo || parking.photo)} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={parking.nom || parking.name}
        />
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-orange-600 shadow-sm">
          {parking.prixHeure || '500'} F / h
        </div>
      </div>
      
      <div className="p-5 flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-orange-500 transition-colors">{parking.nom || parking.name}</h3>
          <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2 py-0.5 rounded-lg">
            <FontAwesomeIcon icon={faStar} className="mr-1" />
            {parking.rating || '4.5'}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
          {parking.adresse || parking.address || 'Dakar, Sénégal'}
        </p>

        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 mt-2">
          <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
            <FontAwesomeIcon icon={faCar} className="text-gray-300" />
            {parking.placesDisponibles || '12'} places
          </div>
          <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
            <FontAwesomeIcon icon={faClock} className="text-gray-300" />
            24h/7j
          </div>
        </div>
      </div>

      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <Link 
          href={`/dashboard/client/search/${parking.id}`}
          className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-sm"
        >
          Voir les détails
          <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        </Link>
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, viewMode = 'grid' }: { vehicle: any, viewMode?: 'grid' | 'list' }) {
  const photoUrl = Array.isArray(vehicle.photos) ? vehicle.photos[0] : vehicle.photos;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';
  const fullPhotoUrl = photoUrl?.startsWith('http') ? photoUrl : `${baseUrl}${photoUrl?.startsWith('/') ? '' : '/'}${photoUrl}`;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex items-center p-3 gap-6 group">
        <div className="w-24 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
          <img 
            src={photoUrl ? fullPhotoUrl : 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt={`${vehicle.marque} ${vehicle.model}`}
          />
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
              {vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
               <FontAwesomeIcon icon={faParking} className="text-orange-500 text-[8px]" />
               {vehicle.parking?.nom || vehicle.parking?.name || 'Vendeur particulier'}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Carburant</span>
               <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FontAwesomeIcon icon={faGasPump} className="text-gray-300" />
                  {vehicle.fuelType || vehicle.carburant || '---'}
               </div>
            </div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Boîte</span>
               <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FontAwesomeIcon icon={faCogs} className="text-gray-300" />
                  {vehicle.transmission || vehicle.boite || '---'}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-black text-gray-900">{(vehicle.prix || vehicle.prixJour || 0).toLocaleString()} F</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{vehicle.forRent ? 'Par jour' : 'Prix total'}</p>
            </div>
            <Link 
              href={`/dashboard/client/search/${vehicle.id}`}
              className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-orange-500 transition-colors shadow-sm"
            >
              Réserver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      <div className="h-44 bg-gray-100 relative overflow-hidden">
        <img 
          src={photoUrl ? fullPhotoUrl : 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt={`${vehicle.marque} ${vehicle.model}`}
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-gray-900 shadow-sm uppercase tracking-widest">
          {vehicle.forRent ? 'À Louer' : 'À Vendre'}
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500 rounded-full text-xs font-bold text-white shadow-sm">
          {(vehicle.prix || vehicle.prixJour || 0).toLocaleString()} F
        </div>
      </div>
      
      <div className="p-5 flex-1 space-y-4">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg text-gray-900 leading-tight truncate group-hover:text-orange-500 transition-colors">
              {vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}
            </h3>
            {vehicle.stats?.reservations > 0 && (
              <span className="text-[8px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                Populaire
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faParking} className="text-orange-500 text-[8px]" />
            {vehicle.parking?.nom || vehicle.parking?.name || 'Vendeur particulier'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <FontAwesomeIcon icon={faGasPump} className="text-gray-400 w-3" />
            {vehicle.fuelType || vehicle.carburant || '---'}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <FontAwesomeIcon icon={faCogs} className="text-gray-400 w-3" />
            {vehicle.transmission || vehicle.boite || '---'}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-lg">
            <FontAwesomeIcon icon={faStar} className="mr-1" />
            4.8
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg">
            {vehicle.annee || vehicle.year || '2023'}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <Link 
          href={`/dashboard/client/search/${vehicle.id}`}
          className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors shadow-sm active:scale-95"
        >
          Réserver
          <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        </Link>
      </div>
    </div>
  );
}
