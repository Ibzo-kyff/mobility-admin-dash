'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faTimes,
  faBan,
  faSearch,
  faFilter,
  faTh,
  faList,
  faCar,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt,
  faCheckCircle,
  faMapMarkerAlt,
  faGasPump,
  faCogs,
  faInfoCircle,
  faHistory,
  faClock,
  faMoneyBillWave,
  faThLarge,
  faXmark,
  faBars,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { clientAPI } from '@/services/client/client-api';
import { useAuth } from '@/components/auth/AuthProvider';
import Image from 'next/image';

export type ReservationStatus = "PENDING" | "ACCEPTED" | "APPROVED" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "CANCELED" | "COMPLETED";
export type ReservationType = "ACHAT" | "LOCATION";

export interface Reservation {
  id: number;
  status: ReservationStatus;
  type: ReservationType;
  dateDebut: string | null;
  dateFin: string | null;
  motifLocation?: string | null;
  localisation?: 'BAMAKO' | 'HORS_BAMAKO' | null;
  montant?: number;
  prix?: number;
  vehicle: {
    id: number;
    marque: string;
    model: string;
    modele?: string;
    photos?: string[] | string;
    prix: number;
    prixJour?: number;
    fuelType?: string;
    carburant?: string;
    transmission?: string;
    boite?: string;
    parking?: {
      nom?: string;
      name?: string;
      adresse?: string;
      address?: string;
      logo?: string;
    };
  };
  parking?: {
    nom?: string;
    name?: string;
    adresse?: string;
    address?: string;
    logo?: string;
  };
}

const getVehicle = (res: any) => res?.vehicle || res?.vehicule;

const getParkingName = (res: any, parkings: any[] = []) => {
  if (!res) return 'Parking Privé';
  const p1 = res.parking?.nom || res.parking?.name;
  const veh = getVehicle(res);
  const p2 = veh?.parking?.nom || veh?.parking?.name;
  if (p1 || p2) return p1 || p2;
  
  const parkingId = res.parkingId || veh?.parkingId;
  if (parkingId && parkings.length > 0) {
    const found = parkings.find((p: any) => p.id === parkingId || p.id === Number(parkingId));
    if (found) return found.nom || found.name || 'Parking Privé';
  }
  
  return 'Parking Privé';
};

export default function ClientReservationTabs() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'canceled'>('pending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [viewModeTab, setViewModeTab] = useState<'list' | 'details'>('list');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parkings, setParkings] = useState<any[]>([]);

  const fetchReservations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [data, parkingsData] = await Promise.all([
        clientAPI.getUserReservations(user.id),
        clientAPI.getParkings()
      ]);
      setReservations(data as Reservation[]);
      setParkings(parkingsData || []);
    } catch (error: any) {
      if (error?.message?.includes('Token invalide') || error?.status === 401) {
        console.warn('Session expirée ou token invalide. Veuillez vous reconnecter.');
      } else {
        console.warn('Erreur lors de la récupération des réservations:', error?.message || error);
      }
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredReservations = useMemo(() => {
    let result = reservations;

    if (activeTab === 'pending') {
      result = result.filter(r => r.status === 'PENDING');
    } else if (activeTab === 'confirmed') {
      result = result.filter(r => ['APPROVED', 'CONFIRMED', 'ACCEPTED'].includes(r.status));
    } else if (activeTab === 'canceled') {
      result = result.filter(r => ['REJECTED', 'CANCELLED', 'CANCELED'].includes(r.status));
    } else if (activeTab === 'history') {
      result = result.filter(r => ['COMPLETED'].includes(r.status));
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((r: any) => {
        const veh = getVehicle(r);
        const parkingName = getParkingName(r, parkings);
        return (
          veh?.marque?.toLowerCase().includes(lowerSearch) ||
          veh?.model?.toLowerCase().includes(lowerSearch) ||
          veh?.modele?.toLowerCase().includes(lowerSearch) ||
          parkingName.toLowerCase().includes(lowerSearch) ||
          r.id.toString().includes(lowerSearch)
        );
      });
    }

    return result;
  }, [reservations, activeTab, search]);

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage) || 1;
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReservations, currentPage, itemsPerPage]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhotoUrl = (photos: string[] | string | undefined) => {
    if (!photos) return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b';
    const photo = Array.isArray(photos) ? photos[0] : photos;
    if (typeof photo !== 'string' || !photo) return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b';
    if (photo.startsWith('http')) return photo;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';
    return `${baseUrl}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const configs: Record<string, { bg: string, text: string, label: string, icon: any }> = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'En attente', icon: faClock },
      ACCEPTED: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Confirmée', icon: faCheckCircle },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Approuvée', icon: faCheckCircle },
      CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Confirmée', icon: faCheckCircle },
      REJECTED: { bg: 'bg-rose-50', text: 'text-rose-600', label: 'Rejetée', icon: faBan },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Annulée', icon: faTimes },
      CANCELED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Annulée', icon: faTimes },
      COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Terminée', icon: faHistory },
    };

    const config = configs[status] || configs.PENDING;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Tabs Header */}
      <div className="bg-white rounded-[2.5rem] p-4 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Tabs Container */}
          <div className="relative w-full lg:w-auto">
             {/* Desktop Tabs */}
            <div className="hidden md:flex p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
              {(['pending', 'confirmed', 'canceled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${
                    activeTab === tab
                      ? 'bg-white text-orange-500 shadow-lg shadow-orange-500/10'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'pending' ? 'En attente' : 
                   tab === 'confirmed' ? 'Confirmées' : 
                   'Annulées'}
                </button>
              ))}
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden w-full">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100"
              >
                <span className="font-black text-[10px] uppercase tracking-widest text-slate-900">
                  {activeTab === 'pending' ? 'En attente' : 
                   activeTab === 'confirmed' ? 'Confirmées' : 
                   'Annulées'}
                </span>
                <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} className="text-slate-400" />
              </button>
              {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-30 overflow-hidden animate-slideDown">
                  {(['pending', 'confirmed', 'canceled'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-5 py-4 text-left font-black text-[10px] uppercase tracking-widest border-b border-slate-50 last:border-none ${
                        activeTab === tab ? 'bg-orange-50 text-orange-500' : 'text-slate-500'
                      }`}
                    >
                      {tab === 'pending' ? 'En attente' : 
                       tab === 'confirmed' ? 'Confirmées' : 
                       'Annulées'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-bold text-sm transition-all"
              />
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'grid' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <FontAwesomeIcon icon={faThLarge} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'list' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReservations.map((res) => (
            <div key={res.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                <img 
                  src={getPhotoUrl(getVehicle(res)?.photos)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt="Vehicule"
                />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(res.status)}
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-900 shadow-sm">
                  #{res.id}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 group-hover:text-orange-500 transition-colors truncate">
                    {getVehicle(res)?.marque} {getVehicle(res)?.model || getVehicle(res)?.modele}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
                    {getParkingName(res, parkings)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Type</p>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <FontAwesomeIcon icon={res.type === 'LOCATION' ? faClock : faCar} className="text-orange-300" />
                      {res.type}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Date</p>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                      {formatDate(res.dateDebut)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-black text-orange-600">
                    {(res.montant || res.prix || getVehicle(res)?.prix || 0).toLocaleString()} F
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedReservation(res);
                      setViewModeTab('details');
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-inner"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Véhicule</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Parking</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 font-black text-xs text-slate-400">#{res.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                          <img src={getPhotoUrl(getVehicle(res)?.photos)} className="w-full h-full object-cover" alt="Photo du véhicule" />
                        </div>
                        <div className="font-black text-sm text-slate-900 group-hover:text-orange-500 transition-colors">
                          {getVehicle(res)?.marque} {getVehicle(res)?.model || getVehicle(res)?.modele}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-xs text-slate-600">{getParkingName(res, parkings)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-xs text-slate-600">{formatDate(res.dateDebut)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-600">{res.type}</span>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedReservation(res);
                          setViewModeTab('details');
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-inner ml-auto"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredReservations.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
            <FontAwesomeIcon icon={faHistory} className="text-4xl" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Aucune réservation</h3>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Votre historique est actuellement vide.</p>
        </div>
      )}

      {/* Pagination Style Administrateur */}
      {filteredReservations.length > 0 && (
        <div className="mt-8 px-6 py-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">
              Affichage de <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredReservations.length)}</span> sur <span className="font-bold text-orange-600">{filteredReservations.length}</span> réservations
            </span>
            <select
              title="Nombre d'éléments par page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer transition-all hover:bg-gray-100"
            >
              <option value={6}>6 par page</option>
              <option value={10}>10 par page</option>
              <option value={24}>24 par page</option>
              <option value={48}>48 par page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Page précédente"
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-bold text-gray-700">
                Page <span className="text-orange-600">{currentPage}</span> sur {Math.ceil(filteredReservations.length / itemsPerPage) || 1}
              </span>
            </div>

            <button
              title="Page suivante"
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredReservations.length / itemsPerPage)));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === Math.ceil(filteredReservations.length / itemsPerPage) || filteredReservations.length === 0}
              className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Overlay/Modal */}
      {viewModeTab === 'details' && selectedReservation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center z-20">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shadow-inner">
                  <FontAwesomeIcon icon={faCar} />
                </span>
                Réservation #{selectedReservation.id}
              </h2>
              <button
                onClick={() => setViewModeTab('list')}
                className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center border border-slate-100 shadow-inner"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Visual Section */}
                <div className="space-y-6">
                  <div className="aspect-video rounded-[2rem] bg-slate-100 overflow-hidden shadow-2xl relative group">
                    <img 
                      src={getPhotoUrl(getVehicle(selectedReservation)?.photos)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt="Photo du véhicule"
                    />
                    <div className="absolute top-6 right-6">
                      {getStatusBadge(selectedReservation.status)}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Véhicule</p>
                        <h4 className="text-xl font-black text-slate-900">{getVehicle(selectedReservation)?.marque} {getVehicle(selectedReservation)?.model || getVehicle(selectedReservation)?.modele}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-xl font-black text-orange-600">{(selectedReservation.montant || selectedReservation.prix || 0).toLocaleString()} F</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-4">
                      <DetailBlock icon={faCalendarAlt} label="Date Début" value={formatDate(selectedReservation.dateDebut)} />
                      <DetailBlock icon={faCalendarAlt} label="Date Fin" value={formatDate(selectedReservation.dateFin)} />
                      <DetailBlock icon={faMapMarkerAlt} label="Parking" value={getParkingName(selectedReservation, parkings)} />
                      <DetailBlock icon={faInfoCircle} label="Type" value={selectedReservation.type} />
                      {selectedReservation.motifLocation && (
                        <DetailBlock icon={faTag} label="Motif" value={selectedReservation.motifLocation} />
                      )}
                      {selectedReservation.localisation && (
                        <DetailBlock icon={faMapMarkerAlt} label="Zone" value={selectedReservation.localisation} />
                      )}
                   </div>

                   <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100">
                     <h5 className="text-[10px] font-black text-orange-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <FontAwesomeIcon icon={faInfoCircle} />
                       Note client / État
                     </h5>
                     <p className="text-sm font-bold text-orange-700 leading-relaxed">
                        Votre réservation est actuellement en statut <span className="underline">{selectedReservation.status}</span>. 
                        {selectedReservation.status === 'PENDING' ? ' Le parking doit confirmer votre demande prochainement.' : ' Profitez bien de votre service !'}
                     </p>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
               <button 
                 onClick={() => setViewModeTab('list')}
                 className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-orange-500 transition-all active:scale-95"
               >
                 Fermer
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-50 shadow-sm space-y-1">
      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
        <FontAwesomeIcon icon={icon} className="text-orange-300" />
        {label}
      </p>
      <p className="text-xs font-black text-slate-800">{value}</p>
    </div>
  );
}

