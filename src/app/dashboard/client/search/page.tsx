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
  const [activeTab, setActiveTab] = useState<'parkings' | 'vehicles'>('vehicles');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filters State
  const [filters, setFilters] = useState({
    type: 'all',
    marque: 'all',
    transmission: 'all',
    minPrice: '',
    maxPrice: '',
    transactionType: 'all', // 'all', 'rent', 'buy'
  });

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

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
      
      const matchesTransaction = filters.transactionType === 'all' || 
                                 (filters.transactionType === 'rent' && v.forRent) || 
                                 (filters.transactionType === 'buy' && v.forSale);

      return matchesSearch && matchesType && matchesMarque && matchesTrans && matchesMinPrice && matchesMaxPrice && matchesTransaction;
    });
  }, [vehicles, searchTerm, filters]);

  const resetFilters = () => {
    setFilters({
      type: 'all',
      marque: 'all',
      transmission: 'all',
      minPrice: '',
      maxPrice: '',
      transactionType: 'all',
    });
  };

  const isFilterActive = useMemo(() => {
    return filters.marque !== 'all' || filters.transmission !== 'all' || filters.minPrice !== '' || filters.maxPrice !== '' || filters.transactionType !== 'all';
  }, [filters]);

  const maxSliderValue = filters.transactionType === 'rent' ? 200000 : 20000000;
  const sliderStep = filters.transactionType === 'rent' ? 5000 : 500000;

  const paginatedParkings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredParkings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParkings, currentPage, itemsPerPage]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const totalPages = activeTab === 'parkings' 
    ? Math.ceil(filteredParkings.length / itemsPerPage) 
    : Math.ceil(filteredVehicles.length / itemsPerPage);

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
            onClick={() => setActiveTab('vehicles')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'vehicles' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FontAwesomeIcon icon={faCar} className="mr-2" />
            Véhicules
          </button>
          <button 
            onClick={() => setActiveTab('parkings')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'parkings' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FontAwesomeIcon icon={faParking} className="mr-2" />
            Parkings
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
          <button 
            onClick={fetchData}
            className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:text-orange-500 transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content Area: Flex Row for left items and right filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Area: Results */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement en cours...</p>
            </div>
          ) : (
            <>
              <div className={
                activeTab === 'vehicles' && viewMode === 'list' 
                  ? "flex flex-col gap-4" 
                : activeTab === 'vehicles'
                ? "grid grid-cols-1 md:grid-cols-2 gap-6" // 2 cards for vehicles as requested
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            }>
              {activeTab === 'parkings' ? (
                <>
                  {paginatedParkings.map((parking) => (
                    <ParkingCard key={parking.id} parking={parking} />
                  ))}
                  {filteredParkings.length === 0 && <EmptyState message="Aucun parking ne correspond à vos critères." />}
                </>
              ) : (
                <>
                  {paginatedVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
                  ))}
                  {filteredVehicles.length === 0 && <EmptyState message="Aucun véhicule ne correspond à vos critères." />}
                </>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Précédent
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-700">
                    Page {currentPage} <span className="text-slate-400 font-medium">sur {totalPages}</span>
                  </span>
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
          )}
        </div>

        {/* Right Area: Permanent Filter Panel (Only for vehicles) */}
        {activeTab === 'vehicles' && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Filtres</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnalisez votre recherche</p>
              </div>

              <div className="space-y-8">
                {/* Type de transaction */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
                    Type d'annonce
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                    {(['all', 'rent', 'buy'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setFilters({ ...filters, transactionType: t, maxPrice: '' });
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          filters.transactionType === t 
                          ? 'bg-white text-orange-500 shadow-sm border border-slate-100' 
                          : 'text-slate-400 hover:text-slate-600 border border-transparent'
                        }`}
                      >
                        {t === 'all' ? 'Tout' : t === 'rent' ? 'Location' : 'Achat'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Échelle de prix (Slider) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FontAwesomeIcon icon={faEuroSign} className="text-orange-500" />
                      Échelle de prix {filters.transactionType === 'rent' && '(Par jour)'}
                    </label>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                      Max: {filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString()} F` : 'Illimité'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="range" 
                      min="0" 
                      max={maxSliderValue} 
                      step={sliderStep}
                      value={filters.maxPrice || maxSliderValue} 
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) === maxSliderValue ? '' : e.target.value })}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-all"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>0 F</span>
                      <span>{maxSliderValue.toLocaleString()}+ F</span>
                    </div>
                  </div>
                </div>

                {/* Marque */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FontAwesomeIcon icon={faCar} className="text-blue-500" />
                    Marque du véhicule
                  </label>
                  <select 
                    value={filters.marque}
                    onChange={(e) => setFilters({ ...filters, marque: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Toutes les marques</option>
                    {marques.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Boîte */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FontAwesomeIcon icon={faCogs} className="text-purple-500" />
                    Type de boîte
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                    {(['all', 'auto', 'manual'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilters({ ...filters, transmission: t })}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          filters.transmission === t 
                          ? 'bg-white text-orange-500 shadow-sm border border-slate-100' 
                          : 'text-slate-400 hover:text-slate-600 border border-transparent'
                        }`}
                      >
                        {t === 'all' ? 'Tout' : t === 'auto' ? 'Auto' : 'Manu'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={resetFilters}
                    className="w-full py-3.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faSync} className="text-[10px]" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const checkFav = async () => {
      // dynamic import or use existing service if imported above
      const { favorisService } = await import('@/services/client/favoris-service');
      const isFavorite = await favorisService.isInFavoris(vehicle.id);
      setIsFav(isFavorite);
    };
    checkFav();
    
    const handleUpdate = () => checkFav();
    window.addEventListener('favorisUpdated', handleUpdate);
    return () => window.removeEventListener('favorisUpdated', handleUpdate);
  }, [vehicle.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { favorisService } = await import('@/services/client/favoris-service');
    if (isFav) {
      await favorisService.removeFromFavoris(vehicle.id);
    } else {
      await favorisService.addToFavoris(vehicle);
    }
  };

  const photoUrl = Array.isArray(vehicle.photos) ? vehicle.photos[0] : vehicle.photos;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';
  let cleanUrl = photoUrl;
  if (typeof photoUrl === 'string' && photoUrl.trim().startsWith('[')) {
    try { const parsed = JSON.parse(photoUrl); if (parsed.length) cleanUrl = parsed[0]; } catch(e) {}
  }
  const fullPhotoUrl = cleanUrl?.startsWith('http') ? cleanUrl : `${baseUrl}${cleanUrl?.startsWith('/') ? '' : '/'}${cleanUrl}`;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex items-center p-3 gap-6 group relative">
        <div className="w-24 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner relative">
          <img 
            src={cleanUrl ? fullPhotoUrl : 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt={`${vehicle.marque} ${vehicle.model}`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        
        <button 
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 shadow-sm ${isFav ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400 hover:text-rose-400 hover:bg-rose-50'}`}
          title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <FontAwesomeIcon icon={faStar} className={isFav ? 'text-rose-500' : ''} />
        </button>
        
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-8">
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative">
      <div className="h-44 bg-gray-100 relative overflow-hidden">
        <img 
          src={cleanUrl ? fullPhotoUrl : 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt={`${vehicle.marque} ${vehicle.model}`}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 leading-tight truncate group-hover:text-orange-500 transition-colors">
                {vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}
              </h3>
              {vehicle.stats?.reservations > 0 && (
                <span className="text-[8px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest mt-1 inline-block">
                  Populaire
                </span>
              )}
            </div>
            <button 
              onClick={toggleFavorite}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isFav ? 'bg-rose-50 text-rose-500 shadow-sm' : 'bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50'}`}
              title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <FontAwesomeIcon icon={faStar} />
            </button>
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
