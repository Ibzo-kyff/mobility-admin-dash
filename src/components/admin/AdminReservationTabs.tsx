'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCheck,
  faTimes,
  faBan,
  faMoneyBillWave,
  faEdit,
  faSearch,
  faFilter,
  faSync,
  faTh,
  faList,
  faCar,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt,
  faTachometerAlt,
  faCheckCircle,
  faUserTie,
  faFileContract,
  faCertificate,
  faShield,
  faMapMarkerAlt,
  faGasPump,
  faCogs,
  faChartBar,
  faShieldAlt,
  faTrash,
  faTag,
  faShoppingCart,
  faPlane,
  faHeart,
  faBriefcase,
  faCamera,
  faUser,
  faInfoCircle,
  faInfo,
  faBars,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons';
import { mobilityAPI } from '@/services/mobility-api';
import Image from 'next/image';

export type ReservationStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELED";
export type ReservationType = "ACHAT" | "LOCATION";

const MOTIFS_LOCATION = [
  { id: 'voyage', label: 'Voyage', icon: faPlane },
  { id: 'mariage', label: 'Mariage', icon: faHeart },
  { id: 'mission', label: 'Mission professionnelle', icon: faBriefcase },
  { id: 'tourisme', label: 'Tourisme', icon: faCamera },
  { id: 'personnel', label: 'Usage personnel', icon: faUser },
  { id: 'autre', label: 'Autre', icon: faList },
];

const LOCALISATIONS = [
  { id: 'bamako', label: 'À Bamako' },
  { id: 'hors_bamako', label: 'Hors Bamako' },
];

export interface Reservation {
  id: number;
  status: ReservationStatus;
  type: ReservationType;
  dateDebut: string | null;
  dateFin: string | null;
  motifLocation?: string | null;
  localisation?: 'BAMAKO' | 'HORS_BAMAKO' | null;
  commission?: number;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    phone?: string;
  };
  vehicle: {
    id: number;
    marque: string;
    marqueRef?: {
      id: number;
      name: string;
      logoUrl?: string;
    };
    model: string;
    modele?: string;
    photos?: string[] | string;
    prix: number;
    prixJour?: number;
    annee?: number;
    year?: number;
    mileage?: number;
    kilometrage?: number;
    fuelType?: string;
    carburant?: string;
    transmission?: string;
    boite?: string;
    description?: string;
    garantie?: boolean;
    dureeGarantie?: number;
    assurance?: boolean;
    chauffeur?: boolean;
    carteGrise?: boolean;
    vignette?: boolean;
    forRent?: boolean;
    forSale?: boolean;
    parkingId?: number;
    parking?: {
      id: number;
      name?: string;
      nom?: string;
      address?: string;
      phone?: string;
      user?: {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        phone: string;
      };
    };
  };
  parking?: {
    id: number;
    name?: string;
    nom?: string;
    address?: string;
    phone?: string;
    user?: {
      id: number;
      nom: string;
      prenom: string;
      email: string;
      phone: string;
    };
  };
}

export default function AdminReservationTabs() {
  const [activeTab, setActiveTab] = useState<'pending' | 'ongoing' | 'history'>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModeTab, setViewModeTab] = useState<'list' | 'details'>('list');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalConfig, setStatusModalConfig] = useState<any>({
    id: 0,
    newStatus: 'PENDING',
    title: '',
    message: '',
    showReasonField: false,
    icon: faCheck,
    color: 'emerald'
  });
  const [statusReason, setStatusReason] = useState('');
  const [editReservationData, setEditReservationData] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [commissionAmount, setCommissionAmount] = useState('');
  const [updating, setUpdating] = useState(false);
  const [allParkings, setAllParkings] = useState<any[]>([]);

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    type: 'ALL',
    dateMin: '',
    dateMax: '',
    minPrice: '',
    maxPrice: '',
  });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await mobilityAPI.getAdminReservations();
      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const data = await mobilityAPI.getParkings();
        setAllParkings(data);
      } catch (e) {
        console.error("Erreur récupération parkings:", e);
      }
    };
    fetchParkings();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (viewMode === 'grid') setViewModeTab('list');
  }, [activeTab, search, viewMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedReservation && !isGalleryHovered && viewModeTab === 'details') {
      const photos = getAllPhotoUrls(selectedReservation.vehicle.photos);
      if (photos.length > 1) {
        interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % photos.length);
        }, 3000);
      }
    }
    return () => clearInterval(interval);
  }, [selectedReservation, isGalleryHovered, viewModeTab]);

  const handleStatusChange = async (id: number, newStatus: ReservationStatus, reason?: string) => {
    let finalReason = reason || statusReason;

    setUpdating(true);
    try {
      await mobilityAPI.updateReservation(id, {
        status: newStatus,
        ...(finalReason ? { reason: finalReason } : {})
      });

      setReservations(prev => prev.map(res => res.id === id ? { ...res, status: newStatus } : res));
      if (selectedReservation?.id === id) {
        setSelectedReservation(prev => prev ? ({ ...prev, status: newStatus }) : null);
      }
      setIsStatusModalOpen(false);
      setStatusReason('');
    } catch (firstError: any) {
      console.warn('Endpoint admin échoué, essai de l\'endpoint status:', firstError?.message);
      try {
        await mobilityAPI.updateReservationStatus(id.toString(), newStatus, finalReason);
        setReservations(prev => prev.map(res => res.id === id ? { ...res, status: newStatus } : res));
        if (selectedReservation?.id === id) {
          setSelectedReservation(prev => prev ? ({ ...prev, status: newStatus }) : null);
        }
        setIsStatusModalOpen(false);
        setStatusReason('');
      } catch (secondError: any) {
        console.error('Erreur lors du changement de statut', secondError);
        const msg = secondError?.details || secondError?.message || 'Impossible de modifier le statut.';
        alert(msg);
      }
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (id: number, newStatus: ReservationStatus) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;

    setSelectedReservation(reservation);
    setStatusReason('');

    let config = {
      id,
      newStatus,
      title: '',
      message: '',
      showReasonField: false,
      icon: faCheck,
      color: 'emerald'
    };

    switch (newStatus) {
      case 'ACCEPTED':
        config = {
          ...config,
          title: 'Accepter la réservation',
          message: `Êtes-vous sûr de vouloir accepter la réservation #${id} pour ${reservation.vehicle.marque} ${reservation.vehicle.model} ?`,
          icon: faCheckCircle,
          color: 'emerald'
        };
        break;
      case 'COMPLETED':
        config = {
          ...config,
          title: 'Terminer la réservation',
          message: `Voulez-vous marquer la réservation #${id} comme terminée ? Cela confirmera que le service a été rendu.`,
          icon: faCheckCircle,
          color: 'blue'
        };
        break;
      case 'CANCELED':
        config = {
          ...config,
          title: 'Annuler la réservation',
          message: `Vous êtes sur le point d'annuler la réservation #${id}. Veuillez indiquer le motif de l'annulation.`,
          showReasonField: true,
          icon: faBan,
          color: 'rose'
        };
        break;
    }

    setStatusModalConfig(config);
    setIsStatusModalOpen(true);
  };

  const handleUpdateCommission = () => {
    if (!selectedReservation || !commissionAmount) return;

    console.log(`Mise à jour de la commission pour la résa #${selectedReservation.id} avec montant: ${commissionAmount}`);

    setReservations(prev => prev.map(res =>
      res.id === selectedReservation.id ? { ...res, commission: parseFloat(commissionAmount) } : res
    ));

    setIsCommissionModalOpen(false);
    setSelectedReservation(null);
    setCommissionAmount('');
  };

  const openCommissionModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCommissionAmount(reservation.commission ? reservation.commission.toString() : '');
    setIsCommissionModalOpen(true);
  };

  const openEditModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    const formatForDateTimeLocal = (dateString: string | null) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    setEditReservationData({
      dateDebut: formatForDateTimeLocal(reservation.dateDebut),
      dateFin: formatForDateTimeLocal(reservation.dateFin),
      type: reservation.type,
      commission: reservation.commission || 0,
      motifLocation: MOTIFS_LOCATION.find(m => m.label === reservation.motifLocation)?.id || (reservation.motifLocation ? 'autre' : ''),
      autreMotif: MOTIFS_LOCATION.find(m => m.label === reservation.motifLocation) ? '' : (reservation.motifLocation || ''),
      localisation: reservation.localisation?.toLowerCase() || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateReservation = async () => {
    if (!selectedReservation || !editReservationData) return;
    setUpdating(true);
    try {
      const dateD = editReservationData.dateDebut ? new Date(editReservationData.dateDebut) : null;
      const dateF = editReservationData.dateFin ? new Date(editReservationData.dateFin) : null;

      const selectedMotifObj = MOTIFS_LOCATION.find(m => m.id === editReservationData.motifLocation);
      const motifFinal = selectedMotifObj && selectedMotifObj.id !== 'autre' ? selectedMotifObj.label : editReservationData.autreMotif;

      const payload: any = {
        type: editReservationData.type,
        motifLocation: motifFinal || null,
        localisation: editReservationData.localisation === 'bamako' ? 'BAMAKO' : 
                     editReservationData.localisation === 'hors_bamako' ? 'HORS_BAMAKO' : null,
      };
      
      if (dateD && !isNaN(dateD.getTime())) payload.dateDebut = dateD.toISOString();
      if (dateF && !isNaN(dateF.getTime())) payload.dateFin = dateF.toISOString();
      if (editReservationData.commission !== undefined) {
        payload.commission = parseFloat(editReservationData.commission.toString());
      }

      console.log('Envoi au backend:', payload);

      const updated = await mobilityAPI.updateReservation(selectedReservation.id, payload);

      setReservations(prev => prev.map(res => res.id === selectedReservation.id ? { ...res, ...updated } : res));
      setIsEditModalOpen(false);
      alert('Réservation mise à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour', error);
      alert('Erreur lors de la mise à jour: ' + (error.message || 'Erreur serveur'));
    } finally {
      setUpdating(false);
    }
  };

  const filteredReservations = useMemo(() => {
    let result = reservations;

    if (activeTab === 'pending') {
      result = result.filter(r => r.status === 'PENDING');
    } else if (activeTab === 'ongoing') {
      result = result.filter(r => r.status === 'ACCEPTED');
    } else if (activeTab === 'history') {
      result = reservations;
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(r =>
        r.user?.nom?.toLowerCase().includes(lowerSearch) ||
        r.user?.prenom?.toLowerCase().includes(lowerSearch) ||
        r.vehicle?.marque?.toLowerCase().includes(lowerSearch) ||
        r.vehicle?.marqueRef?.name?.toLowerCase().includes(lowerSearch) ||
        r.vehicle?.model?.toLowerCase().includes(lowerSearch) ||
        r.vehicle?.parking?.name?.toLowerCase().includes(lowerSearch) ||
        r.vehicle?.parking?.nom?.toLowerCase().includes(lowerSearch) ||
        r.vehicle?.parkingId?.toString().includes(lowerSearch) ||
        r.type.toLowerCase().includes(lowerSearch) ||
        r.id.toString().includes(lowerSearch)
      );
    }

    if (advancedFilters.type !== 'ALL') {
      result = result.filter(r => r.type === advancedFilters.type);
    }

    if (advancedFilters.dateMin) {
      const minDate = new Date(advancedFilters.dateMin).getTime();
      result = result.filter(r => r.dateDebut && new Date(r.dateDebut).getTime() >= minDate);
    }

    if (advancedFilters.dateMax) {
      const maxDate = new Date(advancedFilters.dateMax).getTime();
      result = result.filter(r => r.dateFin ? new Date(r.dateFin).getTime() <= maxDate : r.dateDebut ? new Date(r.dateDebut).getTime() <= maxDate : true);
    }

    if (advancedFilters.minPrice) {
      const minPriceNum = parseFloat(advancedFilters.minPrice);
      result = result.filter(r => calculateTotal(r) >= minPriceNum);
    }

    if (advancedFilters.maxPrice) {
      const maxPriceNum = parseFloat(advancedFilters.maxPrice);
      result = result.filter(r => calculateTotal(r) <= maxPriceNum);
    }

    return result;
  }, [reservations, activeTab, search, advancedFilters]);

  const itemsPerPage = useMemo(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return viewMode === 'list' ? 5 : 4;
      if (window.innerWidth < 768) return viewMode === 'list' ? 8 : 6;
      if (window.innerWidth < 1024) return viewMode === 'list' ? 10 : 8;
    }
    return viewMode === 'list' ? 10 : 9;
  }, [viewMode]);

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
      day: 'numeric'
    });
  };

  const getPhotoUrl = (photos: string[] | string | undefined) => {
    if (!photos) return null;
    const photo = Array.isArray(photos) ? photos[0] : photos;
    if (typeof photo === 'string' && photo.trim() !== '') return photo;
    return null;
  };

  const getAllPhotoUrls = (photos: string[] | string | undefined): string[] => {
    if (!photos) return [];
    if (Array.isArray(photos)) return photos.filter(p => typeof p === 'string' && p.trim() !== '');
    if (typeof photos === 'string') return photos.split(',').filter(p => p.trim() !== '');
    return [];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatMileage = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)}K km`;
    return `${m} km`;
  };

  const formatTransmissionForDisplay = (t?: string) => {
    if (!t) return 'N/A';
    const trans = t.toUpperCase();
    if (trans.includes('MANUAL') || trans.includes('MANUELLE')) return 'Manuelle';
    if (trans.includes('AUTOMATIC') || trans.includes('AUTOMATIQUE')) return 'Automatique';
    return t;
  };

  const calculateTotal = (res: Reservation) => {
    if (res.type === 'ACHAT') return res.vehicle.prix;
    if (!res.dateDebut || !res.dateFin) return res.vehicle.prix;

    const start = new Date(res.dateDebut).getTime();
    const end = new Date(res.dateFin).getTime();
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    return res.vehicle.prix * days;
  };

  const getParkingDisplay = (res: Reservation) => {
    const p = res.parking || res.vehicle?.parking || (res as any).Parking || (res.vehicle as any)?.Parking;
    
    if (p && typeof p === 'object') {
      const name = p.name || p.nom || (p as any).name_parking || (p as any).nom_parking;
      if (name) return name;
      
      const u = p.user || (p as any).owner || (p as any).User;
      if (u) {
        const userName = `${u.prenom || ''} ${u.nom || ''}`.trim();
        if (userName) return userName;
      }
    }

    const pId = res.vehicle?.parkingId || res.parking?.id || (p && typeof p === 'object' ? p.id : (typeof p === 'number' ? p : null));
    if (pId && allParkings.length > 0) {
      const foundParking = allParkings.find(parking => parking.id === pId);
      if (foundParking) {
        return foundParking.name || foundParking.nom || foundParking.nom_parking || `Parking #${pId}`;
      }
    }

    const directName = (res as any).parkingName || (res.vehicle as any)?.parkingName || (res.vehicle as any)?.nom_parking;
    if (directName) return directName;

    return 'Parking Privé';
  };

  // Composant pour les onglets responsifs
  const ResponsiveTabs = () => (
    <div className="relative">
      {/* Version desktop - visible sur md et plus */}
      <div className="hidden md:flex border-b border-gray-200">
        <button
          className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'pending'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Réservations en attente
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {reservations.filter(r => r.status === 'PENDING').length}
          </span>
        </button>
        <button
          className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'ongoing'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('ongoing')}
        >
          Locations en cours
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {reservations.filter(r => r.status === 'ACCEPTED').length}
          </span>
        </button>
        <button
          className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Historique
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {reservations.length}
          </span>
        </button>
      </div>

      {/* Version mobile - menu déroulant */}
      <div className="md:hidden relative">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between"
        >
          <span className="text-sm font-medium text-gray-700">
            {activeTab === 'pending' && 'Réservations en attente'}
            {activeTab === 'ongoing' && 'Locations en cours'}
            {activeTab === 'history' && 'Historique'}
          </span>
          <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} className="text-gray-500" />
        </button>
        
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-30">
            <button
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('pending');
                setMobileMenuOpen(false);
              }}
            >
              Réservations en attente
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {reservations.filter(r => r.status === 'PENDING').length}
              </span>
            </button>
            <button
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                activeTab === 'ongoing'
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('ongoing');
                setMobileMenuOpen(false);
              }}
            >
              Locations en cours
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {reservations.filter(r => r.status === 'ACCEPTED').length}
              </span>
            </button>
            <button
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                activeTab === 'history'
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('history');
                setMobileMenuOpen(false);
              }}
            >
              Historique
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {reservations.length}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderModals = () => (
    <>
      {/* Modals - Version responsive (même structure avec classes responsives) */}
      {/* Commission Modal */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center animate-fadeIn bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col animate-slideUp">
            <div className="p-4 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shadow-inner">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </span>
                  Commission
                </h2>
              </div>
              <button
                onClick={() => setIsCommissionModalOpen(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center border border-slate-100"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-4 sm:p-8">
              {selectedReservation && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-5 bg-slate-50 rounded-xl sm:rounded-[1.5rem] border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Réservation</p>
                    <p className="text-xs sm:text-sm font-black text-slate-900">#{selectedReservation.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xs sm:text-sm font-black text-orange-600">{calculateTotal(selectedReservation).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
              )}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">
                  Montant (FCFA)
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 font-black text-orange-300 text-xs sm:text-sm">FCFA</span>
                  <input
                    type="number"
                    value={commissionAmount}
                    onChange={(e) => setCommissionAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-16 sm:pl-20 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-orange-600 transition-all text-base sm:text-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setIsCommissionModalOpen(false)}
                  className="flex-1 py-3 sm:py-4 bg-white border border-slate-200 text-slate-400 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all active:scale-95"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateCommission}
                  className="flex-1 py-3 sm:py-4 bg-orange-500 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal - Version responsive */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center animate-fadeIn bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col animate-slideUp">
            <div className="p-4 sm:p-8 text-center bg-white">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 shadow-xl ${
                statusModalConfig.color === 'emerald' ? 'bg-emerald-100 text-emerald-500 shadow-emerald-500/20' :
                statusModalConfig.color === 'blue' ? 'bg-blue-100 text-blue-500 shadow-blue-500/20' :
                'bg-rose-100 text-rose-500 shadow-rose-500/20'
              }`}>
                <FontAwesomeIcon icon={statusModalConfig.icon} size="xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 sm:mb-3">{statusModalConfig.title}</h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 sm:mb-8 px-2 sm:px-4">
                {statusModalConfig.message}
              </p>
              {statusModalConfig.showReasonField && (
                <div className="mb-6 sm:mb-8 text-left">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">
                    Motif (Optionnel)
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Pourquoi annulez-vous cette réservation ?"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-medium text-slate-700 transition-all text-sm min-h-[80px] sm:min-h-[100px] resize-none"
                  />
                </div>
              )}
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="flex-1 py-3 sm:py-5 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all active:scale-95"
                >
                  Retour
                </button>
                <button
                  onClick={() => handleStatusChange(statusModalConfig.id, statusModalConfig.newStatus)}
                  disabled={updating}
                  className={`flex-1 py-3 sm:py-5 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
                    statusModalConfig.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600' :
                    statusModalConfig.color === 'blue' ? 'bg-blue-500 shadow-blue-500/30 hover:bg-blue-600' :
                    'bg-rose-500 shadow-rose-500/30 hover:bg-rose-600'
                  }`}
                >
                  {updating ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faCheck} />
                  )}
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Version responsive (simplifiée pour la lisibilité) */}
      {isEditModalOpen && selectedReservation && editReservationData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fadeIn bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
            <div className="sticky top-0 bg-white p-4 sm:p-8 border-b border-slate-100 flex justify-between items-center z-20">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 sm:gap-4">
                  <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shadow-inner">
                    <FontAwesomeIcon icon={faEdit} />
                  </span>
                  Modifier
                </h2>
                <div className="flex items-center gap-2 sm:gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900">
                      #{selectedReservation.id}
                    </span>
                  </div>
                  <div className="w-6 sm:w-8 h-px bg-slate-100" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-200 transition-all" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[100px] sm:max-w-none">
                      {selectedReservation.vehicle.marqueRef?.name || selectedReservation.vehicle.marque}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-white border border-slate-100 transition-all flex items-center justify-center shadow-sm"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-4 sm:p-8">
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-[2rem] border border-slate-200 shadow-inner">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-4 sm:mb-6 block flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500" />
                  Période
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Début</p>
                    <input
                      type="datetime-local"
                      value={editReservationData.dateDebut}
                      onChange={(e) => setEditReservationData({ ...editReservationData, dateDebut: e.target.value })}
                      className="w-full px-3 sm:px-5 py-2 sm:py-3.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fin</p>
                    <input
                      type="datetime-local"
                      value={editReservationData.dateFin}
                      onChange={(e) => setEditReservationData({ ...editReservationData, dateFin: e.target.value })}
                      className="w-full px-3 sm:px-5 py-2 sm:py-3.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6 sm:mb-8">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-3 sm:mb-4 block flex items-center gap-2">
                  <FontAwesomeIcon icon={faTag} className="text-orange-500" />
                  Type
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { id: 'LOCATION', label: 'Location', icon: faClockRegular, activeClass: 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20' },
                    { id: 'ACHAT', label: 'Achat', icon: faShoppingCart, activeClass: 'bg-purple-500 text-white border-purple-500 shadow-xl shadow-purple-500/20' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setEditReservationData({ ...editReservationData, type: type.id })}
                      className={`py-3 sm:py-5 rounded-xl sm:rounded-2xl border-2 font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        editReservationData.type === type.id
                          ? type.activeClass
                          : 'bg-white text-slate-400 border-slate-200 hover:border-orange-200 hover:text-slate-600'
                      }`}
                    >
                      <FontAwesomeIcon icon={type.icon} className="text-xs sm:text-sm" />
                      <span className="hidden sm:inline">{type.label}</span>
                      <span className="sm:hidden">{type.label.charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-orange-50/30 rounded-xl sm:rounded-[2rem] border border-orange-100">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-3 sm:mb-4 block flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-orange-500" />
                  Commission (FCFA)
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 font-black text-orange-300 text-xs sm:text-sm">FCFA</span>
                  <input
                    type="number"
                    value={editReservationData.commission}
                    onChange={(e) => setEditReservationData({ ...editReservationData, commission: e.target.value })}
                    placeholder="0"
                    className="w-full pl-16 sm:pl-20 pr-3 sm:pr-5 py-2 sm:py-4 bg-white border border-orange-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-black text-orange-600 transition-all text-base sm:text-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 sm:py-5 bg-white border border-slate-200 text-slate-400 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-widest hover:text-slate-900 hover:border-slate-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>
                <button
                  onClick={handleUpdateReservation}
                  disabled={updating}
                  className="flex-1 py-3 sm:py-5 bg-orange-500 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-widest shadow-xl shadow-orange-500/40 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">Mise à jour...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      <span className="hidden sm:inline">Enregistrer</span>
                      <span className="sm:hidden">OK</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (viewModeTab === 'details' && selectedReservation) {
    const v = selectedReservation.vehicle;
    const photos = getAllPhotoUrls(v.photos);
    const dailyPrice = v.prixJour || v.prix || 0;

    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8 animate-fadeIn bg-white rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setViewModeTab('list')}
            className="group flex items-center gap-2 sm:gap-3 text-slate-400 hover:text-orange-500 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all self-start"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 transition-all">
              <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </div>
            Retour
          </button>

          <button
            onClick={() => openEditModal(selectedReservation)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faEdit} className="text-sm" />
            <span className="hidden sm:inline">Modifier la réservation</span>
            <span className="sm:hidden">Modifier</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl border border-slate-100">
          <div
            className="relative group"
            onMouseEnter={() => setIsGalleryHovered(true)}
            onMouseLeave={() => setIsGalleryHovered(false)}
          >
            <div className="aspect-[4/3] sm:aspect-[21/9] md:aspect-[21/7] relative overflow-hidden bg-slate-100">
              {photos.length > 0 ? (
                <>
                  <div
                    className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                  >
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative min-w-full h-full">
                        <Image
                          src={photo}
                          alt={`${v.marque} ${v.model}`}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10" />

                  {photos.length > 1 && (
                    <>
                      <button
                        title="Précédent"
                        onClick={() => setCurrentImageIndex(prev => (prev - 1 + photos.length) % photos.length)}
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-white/40 transition-all z-20 shadow-2xl active:scale-90"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} size="sm" />
                      </button>
                      <button
                        title="Suivant"
                        onClick={() => setCurrentImageIndex(prev => (prev + 1) % photos.length)}
                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-white/40 transition-all z-20 shadow-2xl active:scale-90"
                      >
                        <FontAwesomeIcon icon={faChevronRight} size="sm" />
                      </button>
                    </>
                  )}

                  <div className="absolute top-2 sm:top-6 right-2 sm:right-6 px-2 sm:px-4 py-1 sm:py-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.2em] z-20">
                    {currentImageIndex + 1} / {photos.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <FontAwesomeIcon icon={faCar} size="3x" className="text-slate-300" />
                </div>
              )}

              <div className="absolute top-2 sm:top-6 left-2 sm:left-6 flex flex-row gap-2 z-20 flex-wrap">
                {v.forSale && (
                  <span className="px-2 sm:px-5 py-1 sm:py-2.5 bg-rose-500/90 backdrop-blur-sm text-white rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1 sm:gap-2 border border-rose-400/30">
                    <FontAwesomeIcon icon={faTag} size="xs" />
                    <span className="hidden sm:inline">En Vente</span>
                    <span className="sm:hidden">Vente</span>
                  </span>
                )}
                {v.forRent && (
                  <span className="px-2 sm:px-5 py-1 sm:py-2.5 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1 sm:gap-2 border border-emerald-400/30">
                    <FontAwesomeIcon icon={faClockRegular} size="xs" />
                    <span className="hidden sm:inline">Location</span>
                    <span className="sm:hidden">Loc</span>
                  </span>
                )}
              </div>
            </div>

            {photos.length > 1 && (
              <div className="bg-slate-50 border-b border-slate-100 p-2 sm:p-4 overflow-x-auto">
                <div className="flex justify-center gap-2 sm:gap-3 min-w-max">
                  {photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-12 h-10 sm:w-20 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        idx === currentImageIndex ? 'border-orange-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={photo} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">
                  {v.marqueRef?.name || v.marque} {v.model || v.modele}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500/50" />
                    {v.annee || v.year || 'N/A'}
                  </span>
                  <span className="text-slate-300 mx-1 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faTachometerAlt} className="text-orange-500/50" />
                    {formatMileage(v.mileage || v.kilometrage || 0)}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl sm:text-3xl font-black text-orange-600">{formatPrice(dailyPrice)}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500/50 text-[8px] sm:text-[10px]" />
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{getParkingDisplay(selectedReservation)}</p>
                </div>
              </div>
            </div>

            {(v.garantie || v.assurance || v.chauffeur) && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-6 sm:w-8 h-[1px] bg-slate-200"></span>
                  Services & Inclusions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {v.garantie && (
                    <div className="bg-emerald-50/50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faShieldAlt} size="sm" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Garantie</p>
                        <p className="text-xs sm:text-sm font-black text-emerald-900">{v.dureeGarantie || 0} mois</p>
                      </div>
                    </div>
                  )}
                  {v.assurance && (
                    <div className="bg-blue-50/50 border border-blue-100 p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faCheckCircle} size="sm" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest">Assurance</p>
                        <p className="text-xs sm:text-sm font-black text-blue-900">Incluse</p>
                      </div>
                    </div>
                  )}
                  {v.chauffeur && (
                    <div className="bg-purple-50/50 border border-purple-100 p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 text-white rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faUserTie} size="sm" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-bold text-purple-600 uppercase tracking-widest">Chauffeur</p>
                        <p className="text-xs sm:text-sm font-black text-purple-900">Inclus</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {v.description && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-slate-600">{v.description}</p>
              </div>
            )}

            <div className="mb-6 sm:mb-8">
              <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-6 sm:w-8 h-[1px] bg-slate-200"></span>
                Documents & Conformité
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className={`p-2 sm:p-4 rounded-xl sm:rounded-[1.5rem] border ${v.carteGrise ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} flex flex-col items-center text-center`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 rounded-lg sm:rounded-xl flex items-center justify-center ${v.carteGrise ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <FontAwesomeIcon icon={faFileContract} size="sm" />
                  </div>
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Carte Grise</p>
                </div>
                <div className={`p-2 sm:p-4 rounded-xl sm:rounded-[1.5rem] border ${v.vignette ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} flex flex-col items-center text-center`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 rounded-lg sm:rounded-xl flex items-center justify-center ${v.vignette ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <FontAwesomeIcon icon={faCertificate} size="sm" />
                  </div>
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Vignette</p>
                </div>
                <div className="p-2 sm:p-4 rounded-xl sm:rounded-[1.5rem] border bg-emerald-50/50 border-emerald-100 flex flex-col items-center text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <FontAwesomeIcon icon={faShield} size="sm" />
                  </div>
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700">Contrôle T.</p>
                </div>
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-6 sm:w-8 h-[1px] bg-slate-200"></span>
                Caractéristiques
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {[
                  { label: 'Année', value: v.annee || v.year || 'N/A', icon: faCalendarAlt, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Boîte', value: formatTransmissionForDisplay(v.transmission || v.boite), icon: faCogs, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Carburant', value: v.fuelType || v.carburant || 'N/A', icon: faGasPump, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Kilométrage', value: formatMileage(v.mileage || v.kilometrage || 0), icon: faTachometerAlt, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((spec, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-2 sm:p-4 rounded-xl sm:rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${spec.bg} ${spec.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                      <FontAwesomeIcon icon={spec.icon} size="sm" />
                    </div>
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                    <p className="text-xs sm:text-sm font-black text-slate-900">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-100">
              <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 sm:mb-6 flex items-center gap-2">
                <span className="w-6 sm:w-8 h-[1px] bg-slate-200"></span>
                Actions Administrateur
              </h3>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {selectedReservation.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => openStatusModal(selectedReservation.id, 'ACCEPTED')}
                      className="flex-1 min-w-[120px] sm:min-w-[150px] py-3 sm:py-4 bg-emerald-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      <span className="hidden sm:inline">Accepter la demande</span>
                      <span className="sm:hidden">Accepter</span>
                    </button>
                    <button
                      onClick={() => openStatusModal(selectedReservation.id, 'CANCELED')}
                      className="flex-1 min-w-[120px] sm:min-w-[150px] py-3 sm:py-4 bg-rose-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      <span className="hidden sm:inline">Refuser la demande</span>
                      <span className="sm:hidden">Refuser</span>
                    </button>
                  </>
                )}

                {selectedReservation.status === 'ACCEPTED' && (
                  <button
                    onClick={() => openStatusModal(selectedReservation.id, 'COMPLETED')}
                    className="flex-1 py-3 sm:py-4 bg-blue-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span className="hidden sm:inline">Marquer comme terminée</span>
                    <span className="sm:hidden">Terminer</span>
                  </button>
                )}

                {(selectedReservation.status === 'ACCEPTED' || selectedReservation.status === 'PENDING') && (
                  <button
                    onClick={() => openStatusModal(selectedReservation.id, 'CANCELED')}
                    className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-100 text-slate-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faBan} />
                    <span className="hidden sm:inline">Annuler</span>
                  </button>
                )}

                <button
                  onClick={() => openCommissionModal(selectedReservation)}
                  className="px-4 sm:px-8 py-3 sm:py-4 bg-orange-100 text-orange-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  <span className="hidden sm:inline">Commission</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {renderModals()}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <ResponsiveTabs />

      {/* Toolbox - Version responsive */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 bg-gray-50 border-b border-gray-100">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-sans text-sm"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400 text-sm" />
        </div>
        <div className="flex gap-2 justify-end">
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vue liste"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vue grille"
            >
              <FontAwesomeIcon icon={faTh} />
            </button>
          </div>
          <button
            onClick={fetchReservations}
            title="Rafraîchir"
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200 bg-white"
          >
            <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-colors text-xs sm:text-sm font-medium ${showAdvancedFilters ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>
      </div>

      {/* Modal Filtres Avancés - Version responsive */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-fadeIn bg-slate-900/40 backdrop-blur-sm p-0 m-0 border-none transition-all">
          <div className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slideLeft">
            <div className="p-4 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Filtres</h3>
              <button
                title="Fermer"
                onClick={() => setShowAdvancedFilters(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
              {/* Type Filter */}
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500" />
                  Type
                </label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {['ALL', 'ACHAT', 'LOCATION'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setAdvancedFilters({ ...advancedFilters, type: t })}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        advancedFilters.type === t
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {t === 'ALL' ? 'Toutes' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-500" />
                  Budget (FCFA)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedFilters.minPrice}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minPrice: e.target.value })}
                    className="w-full px-3 sm:px-5 py-2 sm:py-3.5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedFilters.maxPrice}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxPrice: e.target.value })}
                    className="w-full px-3 sm:px-5 py-2 sm:py-3.5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Dates Filter */}
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-500" />
                  Période
                </label>
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Du</span>
                    <input
                      type="date"
                      value={advancedFilters.dateMin}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateMin: e.target.value })}
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-5 py-2 sm:py-3.5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all text-sm"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Au</span>
                    <input
                      type="date"
                      value={advancedFilters.dateMax}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateMax: e.target.value })}
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-5 py-2 sm:py-3.5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3 sm:gap-4">
              <button
                onClick={() => setAdvancedFilters({
                  type: 'ALL',
                  dateMin: '',
                  dateMax: '',
                  minPrice: '',
                  maxPrice: '',
                })}
                className="flex-1 py-3 sm:py-4 bg-white border border-slate-200 text-slate-400 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all active:scale-95"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="flex-1 py-3 sm:py-4 bg-orange-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data View - Version responsive */}
      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID & Date</th>
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Montant</th>
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                    Chargement...
                   </td>
                 </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                    Aucune réservation trouvée.
                   </td>
                 </tr>
              ) : (
                paginatedReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 sm:py-3 px-3 sm:px-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">#{res.id}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(res.dateDebut)}
                      </div>
                     </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                        {res.user ? `${res.user.nom} ${res.user.prenom}` : 'Inconnu'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[120px] sm:max-w-none">{res.user?.email || '-'}</div>
                     </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                        {res.vehicle?.marqueRef?.name || res.vehicle?.marque} {res.vehicle?.model || res.vehicle?.modele}
                      </div>
                      <div className="text-xs text-orange-600 font-bold mt-1 uppercase tracking-tight truncate max-w-[150px]">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                        {getParkingDisplay(res)}
                      </div>
                     </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${res.type === 'ACHAT' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {res.type === 'ACHAT' ? 'Achat' : 'Location'}
                      </span>
                      {res.type === 'LOCATION' && (
                        <div className="text-xs text-gray-600 mt-1">
                          {formatDate(res.dateDebut)} → {formatDate(res.dateFin)}
                        </div>
                      )}
                     </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm font-bold text-gray-900">
                        {calculateTotal(res).toLocaleString('fr-FR')} FCFA
                      </div>
                      {res.commission && (
                        <div className="text-xs font-medium text-orange-600 mt-1">
                          Com: {res.commission.toLocaleString('fr-FR')} FCFA
                        </div>
                      )}
                     </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        res.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        res.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' :
                        res.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {res.status === 'PENDING' && 'En attente'}
                        {res.status === 'ACCEPTED' && 'En cours'}
                        {res.status === 'COMPLETED' && 'Terminée'}
                        {res.status === 'CANCELED' && 'Annulée'}
                      </span>
                     </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          title="Voir détails"
                          onClick={() => {
                            setSelectedReservation(res);
                            setViewModeTab('details');
                            setCurrentImageIndex(0);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {res.status !== 'ACCEPTED' && res.status !== 'COMPLETED' && (
                          <button
                            title="Accepter"
                            onClick={() => openStatusModal(res.id, 'ACCEPTED')}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded transition-colors"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}
                        {res.status === 'ACCEPTED' && (
                          <button
                            title="Terminer"
                            onClick={() => openStatusModal(res.id, 'COMPLETED')}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}
                        {res.status !== 'COMPLETED' && res.status !== 'CANCELED' && (
                          <button
                            title={res.status === 'PENDING' ? 'Refuser' : 'Annuler'}
                            onClick={() => openStatusModal(res.id, 'CANCELED')}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <FontAwesomeIcon icon={res.status === 'PENDING' ? faTimes : faBan} />
                          </button>
                        )}
                        <button
                          title="Commission"
                          onClick={() => openCommissionModal(res)}
                          className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition-colors"
                        >
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                        </button>
                        <button
                          title="Modifier"
                          onClick={(e) => { e.stopPropagation(); openEditModal(res); }}
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                     </td>
                   </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
      ) : (
        <div className="p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500 font-medium">Chargement...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-medium">Aucune réservation trouvée.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedReservations.map((res) => (
                <div
                  key={res.id}
                  onClick={() => {
                    setSelectedReservation(res);
                    setViewModeTab('details');
                    setCurrentImageIndex(0);
                  }}
                  className="group bg-white rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer"
                >
                  <div className="aspect-[16/9] relative rounded-xl sm:rounded-[2rem] overflow-hidden bg-slate-50 shadow-inner border border-white m-[3px]">
                    {getPhotoUrl(res.vehicle?.photos) ? (
                      <Image
                        src={getPhotoUrl(res.vehicle?.photos)!}
                        alt={res.vehicle?.marque || 'Véhicule'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <FontAwesomeIcon icon={faCar} size="2x" />
                      </div>
                    )}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-row gap-1 flex-wrap">
                      <span className={`px-2 sm:px-4 py-1 text-white rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm ${res.type === 'ACHAT' ? 'bg-[#05b17B]' : 'bg-[#05b17B]'}`}>
                        {res.type === 'ACHAT' ? 'ACHAT' : 'LOC'}
                      </span>
                    </div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase shadow-sm bg-white/95 text-[#8fa3b0] backdrop-blur-sm ${
                        res.status === 'PENDING' ? 'text-yellow-600' :
                        res.status === 'ACCEPTED' ? 'text-green-600' :
                        res.status === 'COMPLETED' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {res.status === 'PENDING' && 'ATTENTE'}
                        {res.status === 'ACCEPTED' && 'ACTIF'}
                        {res.status === 'COMPLETED' && 'TERMINÉ'}
                        {res.status === 'CANCELED' && 'ANNULÉ'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6 pt-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-gray-900 border border-gray-200 px-2 py-0.5 rounded-lg bg-gray-50 text-xs shadow-sm">#{res.id}</span>
                        <div className="mt-1 text-[10px] sm:text-xs text-gray-500">
                          {res.type === 'ACHAT' ? 'Soumis' : 'Du'} {formatDate(res.dateDebut)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 mb-3 flex-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-500">Client</span>
                        <span className="font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">{res.user?.nom} {res.user?.prenom}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-500">Véhicule</span>
                        <span className="font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">{res.vehicle?.marqueRef?.name || res.vehicle?.marque}</span>
                      </div>
                      <div className="flex justify-between items-center bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                        <span className="text-orange-900 text-[8px] sm:text-[10px] uppercase font-black tracking-wider">Parking</span>
                        <span className="font-black text-orange-600 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[120px]">
                          {getParkingDisplay(res)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                        <span className="text-gray-500 text-xs sm:text-sm">Montant</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">{calculateTotal(res).toLocaleString('fr-FR')} FCFA</span>
                          {res.commission && (
                            <div className="text-[9px] sm:text-[11px] font-semibold text-orange-600">Com: {res.commission.toLocaleString('fr-FR')} FCFA</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination - Version responsive */}
      {filteredReservations.length > 0 && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Affichage de <span className="font-medium text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredReservations.length)}</span> sur <span className="font-medium text-gray-900">{filteredReservations.length}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${currentPage === 1
                  ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
            >
              Précédent
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (currentPage <= 3) {
                  pageNum = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }
                
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-colors ${currentPage === pageNum
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages
                  ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {renderModals()}
    </div>
  );
}