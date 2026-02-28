'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faTrash,
  faEye,
  faHistory,
  faChartBar,
  faFileAlt,
  faSearch,
  faFilter,
  faEuroSign,
  faGasPump,
  faCogs,
  faCalendarAlt,
  faUser,
  faMapMarkerAlt,
  faClock,
  faExternalLinkAlt,
  faExclamationTriangle,
  faShieldAlt,
  faImage,
  faHeart as faHeartSolid,
  faChevronLeft,
  faChevronRight,
  faCalendarCheck,
  faShoppingCart,
  faMoneyBillWave,
  faLock,
  faTag,
  faFileContract,
  faList,
  faInfoCircle,
  faCheck,
  faTimes,
  faArrowRight,
  faBriefcase,
  faCamera,
  faPlane,
  faHeart,
  faWrench,
  faTachometerAlt,
  faCertificate,
  faShield,
  faUserTie,
  faLocationDot,
  faFire,
  faOilCan,
  faBolt,
  faLeaf,
  faMobile,
  faWaveSquare,
  faStar,
  faDollarSign,
  faBell,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular, faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons';
import { vehiclesAPI } from '@/services/vehicles-api';
import type { Vehicule } from '@/types';
import Image from 'next/image';

type TabType = 'list' | 'details' | 'history' | 'stats' | 'documents';

// Constantes du mobile
const PRIMARY_COLOR = '#ff7d00';
const SECONDARY_COLOR = '#2c3e50';
const BACKGROUND_COLOR = '#f8f9fa';

// Motifs de location disponibles
const MOTIFS_LOCATION = [
  { id: 'voyage', label: 'Voyage', icon: faPlane },
  { id: 'mariage', label: 'Mariage', icon: faHeart },
  { id: 'mission', label: 'Mission professionnelle', icon: faBriefcase },
  { id: 'tourisme', label: 'Tourisme', icon: faCamera },
  { id: 'personnel', label: 'Usage personnel', icon: faUser },
  { id: 'autre', label: 'Autre', icon: faList },
];

// Localisations disponibles
const LOCALISATIONS = [
  { id: 'bamako', label: 'À Bamako' },
  { id: 'hors_bamako', label: 'Hors Bamako' },
];

export default function AdminVehicleTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicule | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // États pour le détail (inspirés du mobile)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // États réservation
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPayVisible, setModalPayVisible] = useState(false);
  const [reservationType, setReservationType] = useState<'LOCATION' | 'ACHAT' | null>(null);
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<string | null>(null);
  const [selectedLocalisation, setSelectedLocalisation] = useState<string | null>(null);
  const [autreMotif, setAutreMotif] = useState('');
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState<'start' | 'end' | null>(null);
  const [dateTimeMode, setDateTimeMode] = useState<'date' | 'time'>('date');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(0);
  const [editStatus, setEditStatus] = useState('');
  const [editDescription, setEditDescription] = useState("");
  const [editFuelType, setEditFuelType] = useState("ESSENCE");
  const [editTransmission, setEditTransmission] = useState("MANUAL");
  const [editMileage, setEditMileage] = useState(0);
  const [editForSale, setEditForSale] = useState(true);
  const [editForRent, setEditForRent] = useState(true);
  const [editGarantie, setEditGarantie] = useState(false);
  const [editDureeGarantie, setEditDureeGarantie] = useState(0);
  const [editChauffeur, setEditChauffeur] = useState(false);
  const [editAssurance, setEditAssurance] = useState(false);
  const [editDureeAssurance, setEditDureeAssurance] = useState(0);
  const [editCarteGrise, setEditCarteGrise] = useState(false);
  const [editVignette, setEditVignette] = useState(false);
  const [editMarque, setEditMarque] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState(0);
  const [editExistingPhotos, setEditExistingPhotos] = useState<string[]>([]);
  const [editNewPhotos, setEditNewPhotos] = useState<File[]>([]);

  // Mobile-inspired Filtering State
  const [saleRentTab, setSaleRentTab] = useState<'all' | 'sale' | 'rent'>('all');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minPrice: '',
    maxPrice: '',
    withWarranty: false,
    withInsurance: false,
    minMileage: '',
    maxMileage: '',
    minYear: '',
    maxYear: '',
    transmission: '',
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';

  // Formatting Helpers from Mobile
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatMileage = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)}K km`;
    return `${m} km`;
  };

  const normalizeTransmission = (t?: string) => {
    if (!t) return null;
    const trans = t.toUpperCase();
    if (trans.includes('MANUAL') || trans.includes('MANUELLE')) return 'MANUELLE';
    if (trans.includes('AUTOMATIC') || trans.includes('AUTOMATIQUE')) return 'AUTOMATIQUE';
    if (trans.includes('SEMI')) return 'SEMI-AUTOMATIQUE';
    return trans;
  };

  const formatTransmissionForDisplay = (t?: string) => {
    const normalized = normalizeTransmission(t);
    if (!normalized) return 'N/A';
    if (normalized === 'MANUELLE') return 'Manuelle';
    if (normalized === 'AUTOMATIQUE') return 'Automatique';
    if (normalized === 'SEMI-AUTOMATIQUE') return 'Semi-Auto';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  };

  const getFuelIcon = (fuelType: string | undefined) => {
    switch (fuelType?.toLowerCase()) {
      case 'essence':
        return faFire;
      case 'diesel':
        return faOilCan;
      case 'electrique':
      case 'électrique':
        return faBolt;
      case 'hybride':
        return faLeaf;
      default:
        return faCar;
    }
  };

  const getPhotoUrl = (photos: string[] | string | undefined) => {
    if (!photos) return null;
    const photo = Array.isArray(photos) ? photos[0] : photos;
    if (typeof photo !== 'string' || !photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  const getAllPhotoUrls = (photos: string[] | string | undefined): string[] => {
    if (!photos) return [];

    try {
      if (Array.isArray(photos)) {
        return photos
          .filter(photo => photo && photo !== "" && photo !== null)
          .map(photo => {
            if (photo.startsWith('http')) return photo;
            return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
          });
      }

      if (typeof photos === 'string') {
        const photoArray = photos.split(',').filter(p => p && p !== "");
        return photoArray.map(photo => {
          if (photo.startsWith('http')) return photo;
          return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
        });
      }

      return [];
    } catch (error) {
      console.error('Erreur formatage photos:', error);
      return [];
    }
  };

  const availableFuelTypes = [...new Set(vehicles.map(v => v.fuelType || v.carburant).filter(Boolean))];

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedVehicle && !isGalleryHovered && activeTab === 'details') {
      const photos = getAllPhotoUrls(selectedVehicle.photos);
      if (photos.length > 1) {
        interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % photos.length);
        }, 3000);
      }
    }
    return () => clearInterval(interval);
  }, [selectedVehicle, isGalleryHovered, activeTab]);

  useEffect(() => {
    if (selectedVehicle) {
      setEditPrice(selectedVehicle.prixJour || selectedVehicle.prix || 0);
      setEditStatus(selectedVehicle.status || 'PENDING');
      setEditDescription(selectedVehicle.description || "");
      setEditFuelType(selectedVehicle.fuelType || selectedVehicle.carburant || "ESSENCE");
      setEditTransmission(selectedVehicle.transmission || selectedVehicle.boite || "MANUAL");
      setEditMileage(selectedVehicle.mileage || selectedVehicle.kilometrage || 0);
      setEditForSale(selectedVehicle.forSale ?? true);
      setEditForRent(selectedVehicle.forRent ?? true);
      setEditGarantie(selectedVehicle.garantie ?? false);
      setEditDureeGarantie(selectedVehicle.dureeGarantie || 0);
      setEditChauffeur(selectedVehicle.chauffeur ?? false);
      setEditAssurance(selectedVehicle.assurance ?? false);
      setEditDureeAssurance(selectedVehicle.dureeAssurance || 0);
      setEditCarteGrise(selectedVehicle.carteGrise ?? false);
      setEditVignette(selectedVehicle.vignette ?? false);
      setEditMarque(selectedVehicle.marque || selectedVehicle.marqueRef?.name || "");
      setEditModel(selectedVehicle.model || selectedVehicle.modele || "");
      setEditYear(selectedVehicle.annee || selectedVehicle.year || 0);

      const currentPhotos = selectedVehicle.photos
        ? (Array.isArray(selectedVehicle.photos) ? selectedVehicle.photos : [selectedVehicle.photos])
        : [];
      setEditExistingPhotos(currentPhotos);
      setEditNewPhotos([]);
      setCurrentImageIndex(0);

      // Initialiser les dates pour la location
      const now = new Date();
      const defaultStart = new Date(now);
      defaultStart.setHours(8, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setDate(defaultEnd.getDate() + 1);
      setStartDateTime(defaultStart);
      setEndDateTime(defaultEnd);
      setCalculatedPrice(selectedVehicle.prixJour || selectedVehicle.prix || 0);
    }
  }, [selectedVehicle]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getAllVehiculesAdmin();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedVehicle) return;
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('marque', editMarque);
      formData.append('model', editModel);
      formData.append('prix', editPrice.toString());
      formData.append('status', editStatus);
      formData.append('description', editDescription);
      formData.append('fuelType', editFuelType);
      formData.append('transmission', editTransmission);
      formData.append('mileage', editMileage.toString());
      formData.append('year', editYear.toString());
      formData.append('forSale', String(editForSale));
      formData.append('forRent', String(editForRent));
      formData.append('garantie', String(editGarantie));
      formData.append('dureeGarantie', editDureeGarantie.toString());
      formData.append('chauffeur', String(editChauffeur));
      formData.append('assurance', String(editAssurance));
      formData.append('dureeAssurance', editDureeAssurance.toString());
      formData.append('carteGrise', String(editCarteGrise));
      formData.append('vignette', String(editVignette));

      editExistingPhotos.forEach(photo => {
        formData.append('existingPhotos', photo);
      });

      editNewPhotos.forEach(file => {
        formData.append('photos', file);
      });

      const updated = await vehiclesAPI.updateVehicule(selectedVehicle.id, formData);

      const updateData: Partial<Vehicule> = {
        marque: editMarque,
        model: editModel,
        prixJour: editPrice,
        status: editStatus as any,
        description: editDescription,
        fuelType: editFuelType,
        transmission: editTransmission,
        mileage: editMileage,
        annee: editYear,
        forSale: editForSale,
        forRent: editForRent,
        garantie: editGarantie,
        dureeGarantie: editDureeGarantie,
        chauffeur: editChauffeur,
        assurance: editAssurance,
        dureeAssurance: editDureeAssurance,
        carteGrise: editCarteGrise,
        vignette: editVignette,
        photos: updated.photos || editExistingPhotos
      };

      setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, ...updateData } : v));
      setSelectedVehicle({ ...selectedVehicle, ...updateData });
      setIsEditing(false);
      alert('Véhicule mis à jour avec succès');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'DELETE') => {
    try {
      if (action === 'DELETE') {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
        await vehiclesAPI.deleteVehicule(id);
        setVehicles(vehicles.filter(v => v.id !== id));
        if (selectedVehicle?.id === id) {
          setSelectedVehicle(null);
          setActiveTab('list');
        }
        return;
      }

      const status = 'APPROVED';
      await vehiclesAPI.updateVehicule(id, { status });

      setVehicles(vehicles.map(v => v.id === id ? { ...v, status } : v));
      if (selectedVehicle?.id === id) setSelectedVehicle({ ...selectedVehicle, status });

    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      alert('Une erreur est survenue.');
    }
  };

  // Fonctions de réservation
  const calculateDurationAndPrice = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);
    setSelectedDays(diffDays);
    if (selectedVehicle?.prixJour || selectedVehicle?.prix) {
      const dailyPrice = selectedVehicle.prixJour || selectedVehicle.prix || 0;
      setCalculatedPrice(diffDays * dailyPrice);
    }
    return { diffDays, diffHours };
  };

  const selectReservationType = (type: 'LOCATION' | 'ACHAT') => {
    setReservationType(type);
    setSelectedMotif(null);
    setSelectedLocalisation(null);
    setAutreMotif('');
    setConditionsAccepted(false);

    if (type === 'LOCATION') {
      const now = new Date();
      const defaultStart = new Date(now);
      defaultStart.setHours(8, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setDate(defaultEnd.getDate() + 1);
      setStartDateTime(defaultStart);
      setEndDateTime(defaultEnd);
      if (selectedVehicle?.prixJour || selectedVehicle?.prix) {
        setCalculatedPrice(selectedVehicle.prixJour || selectedVehicle?.prix || 0);
      }
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (!selectedDate || !showDateTimePicker) return;

    const newDate = new Date(selectedDate);

    if (showDateTimePicker === 'start') {
      const currentEnd = endDateTime || new Date();
      const newEnd = new Date(currentEnd);

      if (dateTimeMode === 'date') {
        newEnd.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        if (newEnd.getTime() <= newDate.getTime()) {
          newEnd.setDate(newDate.getDate() + 1);
        }
      } else {
        const hoursDiff = newEnd.getHours() - (startDateTime?.getHours() || 8);
        newEnd.setHours(newDate.getHours() + hoursDiff, newDate.getMinutes(), 0, 0);
      }

      setStartDateTime(newDate);
      setEndDateTime(newEnd);
      calculateDurationAndPrice(newDate, newEnd);
    } else if (showDateTimePicker === 'end') {
      if (startDateTime && newDate.getTime() > startDateTime.getTime()) {
        setEndDateTime(newDate);
        calculateDurationAndPrice(startDateTime, newDate);
      }
    }

    setShowDateTimePicker(null);
  };

  const getIconForMotif = (motifId: string) => {
    const motif = MOTIFS_LOCATION.find(m => m.id === motifId);
    switch (motif?.icon) {
      case faPlane: return faPlane;
      case faHeart: return faHeart;
      case faBriefcase: return faBriefcase;
      case faCamera: return faCamera;
      case faUser: return faUser;
      default: return faList;
    }
  };

  const confirmReservation = () => {
    if (!reservationType || !selectedVehicle) {
      alert('Sélectionnez un type de réservation');
      return;
    }

    if (reservationType === 'LOCATION') {
      if (!startDateTime || !endDateTime) {
        alert('Les dates sont requises pour la location');
        return;
      }
      if (endDateTime.getTime() <= startDateTime.getTime()) {
        alert('La date de fin doit être après la date de début');
        return;
      }
      const diffHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      if (diffHours < 1) {
        alert('La location doit être d\'au moins 1 heure');
        return;
      }
      if (!selectedMotif) {
        alert('Veuillez sélectionner un motif de location');
        return;
      }
      if (!selectedLocalisation) {
        alert('Veuillez sélectionner une localisation');
        return;
      }
      if (!conditionsAccepted) {
        alert('Veuillez accepter les conditions générales');
        return;
      }
      if (!selectedVehicle.forRent) {
        alert('Ce véhicule n\'est pas disponible à la location');
        return;
      }
    }

    if (reservationType === 'ACHAT' && !selectedVehicle.forSale) {
      alert('Ce véhicule n\'est pas disponible à l\'achat');
      return;
    }

    let motifFinal = null;
    if (reservationType === 'LOCATION') {
      if (selectedMotif === 'autre') {
        motifFinal = autreMotif.trim();
        if (!motifFinal) {
          alert('Veuillez préciser votre motif');
          return;
        }
      } else {
        const motifObj = MOTIFS_LOCATION.find(m => m.id === selectedMotif);
        motifFinal = motifObj ? motifObj.label : selectedMotif;
      }
    }

    const localisationFinal = reservationType === 'LOCATION'
      ? (selectedLocalisation === 'bamako' ? 'BAMAKO' : 'HORS_BAMAKO')
      : null;

    const tempReservation = {
      vehicleId: selectedVehicle.id,
      dateDebut: reservationType === 'LOCATION' ? startDateTime?.toISOString() : null,
      dateFin: reservationType === 'LOCATION' ? endDateTime?.toISOString() : null,
      type: reservationType,
      motifLocation: motifFinal,
      localisation: localisationFinal,
      conditionsAcceptees: reservationType === 'LOCATION' ? conditionsAccepted : null,
      vehicule: selectedVehicle,
      montant: reservationType === 'LOCATION' ? calculatedPrice : (selectedVehicle.prixJour || selectedVehicle.prix || 0)
    };

    setCurrentReservation(tempReservation);
    setModalPayVisible(true);
    setModalVisible(false);
  };

  const processPayment = async (paymentMethod: string) => {
    if (!currentReservation || !selectedVehicle) {
      alert('Informations de réservation manquantes');
      return;
    }

    setIsProcessingPayment(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const message = paymentMethod === 'ESPECES'
        ? 'Votre réservation est confirmée !\n\nLe parking vous contactera bientôt pour organiser le paiement en espèces et la remise du véhicule.'
        : 'Votre réservation et paiement sont confirmés !';

      alert(message);

      setModalPayVisible(false);
      setModalVisible(false);
      setCurrentReservation(null);
      setSelectedMotif(null);
      setSelectedLocalisation(null);
      setAutreMotif('');
      setConditionsAccepted(false);
      setReservationType(null);

    } catch (error: any) {
      console.error('Erreur lors du traitement:', error);
      alert(error.message || 'Une erreur est survenue lors de la confirmation');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const nextImage = () => {
    if (!selectedVehicle) return;
    const photos = getAllPhotoUrls(selectedVehicle.photos);
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevImage = () => {
    if (!selectedVehicle) return;
    const photos = getAllPhotoUrls(selectedVehicle.photos);
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const brand = (v.marque || v.marqueRef?.name || '').toLowerCase();
    const model = (v.model || v.modele || '').toLowerCase();
    const parkingName = (v.parking?.name || '').toLowerCase();
    const matchesSearch =
      brand.includes(searchTerm.toLowerCase()) ||
      model.includes(searchTerm.toLowerCase()) ||
      parkingName.includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    if (!matchesSearch || !matchesStatus) return false;

    if (saleRentTab === 'sale' && !v.forSale) return false;
    if (saleRentTab === 'rent' && !v.forRent) return false;

    if (activeQuickFilter !== 'all') {
      const priceValue = v.prixJour || v.prix || 0;
      if (activeQuickFilter === 'economique' && priceValue >= 10000000) return false;
      if (activeQuickFilter === 'luxe' && priceValue < 30000000) return false;
      if (!['economique', 'luxe'].includes(activeQuickFilter)) {
        if ((v.fuelType || v.carburant) !== activeQuickFilter) return false;
      }
    }

    const price = v.prixJour || v.prix || 0;
    if (advancedFilters.minPrice && price < parseFloat(advancedFilters.minPrice)) return false;
    if (advancedFilters.maxPrice && price > parseFloat(advancedFilters.maxPrice)) return false;
    if (advancedFilters.withWarranty && !v.garantie) return false;
    if (advancedFilters.withInsurance && !v.assurance) return false;

    const mileage = v.mileage || v.kilometrage || 0;
    if (advancedFilters.minMileage && mileage < parseInt(advancedFilters.minMileage)) return false;
    if (advancedFilters.maxMileage && mileage > parseInt(advancedFilters.maxMileage)) return false;

    const year = v.annee || v.year || 0;
    if (advancedFilters.minYear && year < parseInt(advancedFilters.minYear)) return false;
    if (advancedFilters.maxYear && year > parseInt(advancedFilters.maxYear)) return false;

    if (advancedFilters.transmission) {
      const vTrans = normalizeTransmission(v.transmission || v.boite);
      if (vTrans !== advancedFilters.transmission) return false;
    }

    return true;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';

      case 'BLOCKED': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-50';
    }
  };

  const renderList = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            placeholder="Rechercher un véhicule..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
            {(['all', 'sale', 'rent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSaleRentTab(tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${saleRentTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab === 'all' ? 'Tous' : tab === 'sale' ? 'Vente' : 'Location'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(true)}
            className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-slate-600 font-bold"
          >
            <FontAwesomeIcon icon={faFilter} className="text-orange-500" />
            <span className="hidden md:inline">Filtres</span>
          </button>

          <div className="relative flex-1 md:flex-initial">
            <select
              className="w-full md:w-48 pl-4 pr-10 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none cursor-pointer font-bold text-slate-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Statut: Tous</option>
              <option value="PENDING">Statut: Attente</option>
              <option value="APPROVED">Statut: Validé</option>

              <option value="BLOCKED">Statut: Bloqué</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <FontAwesomeIcon icon={faFilter} size="xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar scroll-smooth">
        {[
          { id: 'all', label: 'Tous les types' },
          { id: 'economique', label: 'Économique' },
          { id: 'luxe', label: 'Luxe' },
          ...(availableFuelTypes as string[]).map(fuel => ({ id: fuel, label: fuel }))
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveQuickFilter(filter.id)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${activeQuickFilter === filter.id
              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-500 font-bold text-sm">
          {filteredVehicles.length} résultat{filteredVehicles.length > 1 ? 's' : ''} trouvé{filteredVehicles.length > 1 ? 's' : ''}
        </p>
        {(searchTerm || filterStatus !== 'ALL' || saleRentTab !== 'all' || activeQuickFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('ALL');
              setSaleRentTab('all');
              setActiveQuickFilter('all');
            }}
            className="text-orange-500 font-black text-[10px] uppercase tracking-widest hover:underline"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer"
            onClick={() => {
              setSelectedVehicle(vehicle);
              setActiveTab('details');
            }}
          >
            {/* Image Section */}
            <div className="p-3">
              <div className="aspect-[16/10] relative rounded-[2rem] overflow-hidden bg-slate-50 shadow-inner">
                {getPhotoUrl(vehicle.photos) ? (
                  <Image src={getPhotoUrl(vehicle.photos)!} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <FontAwesomeIcon icon={faCar} size="3x" />
                  </div>
                )}

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {vehicle.forSale && (
                    <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <FontAwesomeIcon icon={faTag} size="xs" />
                      Vente
                    </span>
                  )}
                  {vehicle.forRent && (
                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <FontAwesomeIcon icon={faClockRegular} size="xs" />
                      Location
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase border backdrop-blur-md shadow-sm ${getStatusColor(vehicle.status)} bg-white/80`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                    {vehicle.status === 'PENDING' ? 'En attente' : vehicle.status === 'APPROVED' ? 'Validé' : vehicle.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                    {vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}
                  </h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                    {vehicle.annee || vehicle.year} • {vehicle.categorie || 'Standard'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-orange-600 leading-none">
                    {formatPrice(vehicle.prixJour || vehicle.prix || 0)}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">/jour</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500">
                  <FontAwesomeIcon icon={faGasPump} className="text-orange-500/50" />
                  <span className="truncate">{vehicle.fuelType || vehicle.carburant || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500">
                  <FontAwesomeIcon icon={faCogs} className="text-indigo-500/50" />
                  <span className="truncate">{formatTransmissionForDisplay(vehicle.transmission || vehicle.boite)}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-rose-500/50" />
                  <span className="truncate">{vehicle.annee || vehicle.year || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500">
                  <FontAwesomeIcon icon={faTachometerAlt} className="text-emerald-500/50" />
                  <span className="truncate">{formatMileage(vehicle.mileage || vehicle.kilometrage || 0)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {vehicle.garantie && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    <FontAwesomeIcon icon={faShieldAlt} size="xs" />
                    Garantie
                  </span>
                )}
                {vehicle.assurance && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                    <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                    Assurance
                  </span>
                )}
                {vehicle.chauffeur && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
                    <FontAwesomeIcon icon={faUserTie} size="xs" />
                    Chauffeur
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6 px-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <FontAwesomeIcon icon={faMapMarkerAlt} size="xs" />
                </div>
                <p className="text-xs font-bold text-slate-500 truncate">
                  {vehicle.parking?.name || 'Localisation non spécifiée'}
                </p>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  className="flex-1 py-3 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVehicle(vehicle);
                    setActiveTab('details');
                  }}
                >
                  Détails
                </button>
                <button
                  className="w-12 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(vehicle.id, 'DELETE');
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
            <FontAwesomeIcon icon={faCar} size="2x" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Aucun véhicule</h3>
          <p className="text-slate-400 font-bold mt-1">Nous n'avons trouvé aucun véhicule correspondant à votre recherche.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('ALL');
              setSaleRentTab('all');
              setActiveQuickFilter('all');
              setAdvancedFilters({
                minPrice: '',
                maxPrice: '',
                withWarranty: false,
                withInsurance: false,
                minMileage: '',
                maxMileage: '',
                minYear: '',
                maxYear: '',
                transmission: '',
              });
            }}
            className="mt-8 px-8 py-3 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end animate-fadeIn bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm h-full bg-white shadow-2xl animate-slideLeft flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Filtres Avancés</h3>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm"
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faEuroSign} className="text-orange-500" />
                  Budget (FCFA)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                    value={advancedFilters.minPrice}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minPrice: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                    value={advancedFilters.maxPrice}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faTachometerAlt} className="text-emerald-500" />
                  Kilométrage (km)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                    value={advancedFilters.minMileage}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minMileage: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                    value={advancedFilters.maxMileage}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxMileage: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-500" />
                  Année
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="1990"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                    value={advancedFilters.minYear}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minYear: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="2025"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-slate-700 transition-all"
                    value={advancedFilters.maxYear}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garanties & Inclusions</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white hover:border-orange-100 transition-all group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-orange-500 rounded-lg cursor-pointer"
                      checked={advancedFilters.withWarranty}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, withWarranty: e.target.checked })}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">Avec garantie</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Véhicules sous garantie</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white hover:border-orange-100 transition-all group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-indigo-500 rounded-lg cursor-pointer"
                      checked={advancedFilters.withInsurance}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, withInsurance: e.target.checked })}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">Avec assurance</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Assurance incluse</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FontAwesomeIcon icon={faCogs} className="text-slate-400" />
                  Transmission
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['MANUELLE', 'AUTOMATIQUE'].map((trans) => (
                    <button
                      key={trans}
                      onClick={() => setAdvancedFilters({ ...advancedFilters, transmission: advancedFilters.transmission === trans ? '' : trans })}
                      className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${advancedFilters.transmission === trans
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      {trans === 'MANUELLE' ? 'Manuelle' : 'Auto'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button
                onClick={() => setAdvancedFilters({
                  minPrice: '',
                  maxPrice: '',
                  withWarranty: false,
                  withInsurance: false,
                  minMileage: '',
                  maxMileage: '',
                  minYear: '',
                  maxYear: '',
                  transmission: '',
                })}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all active:scale-95"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    if (!selectedVehicle) return null;

    const photos = getAllPhotoUrls(selectedVehicle.photos);
    const dailyPrice = selectedVehicle.prixJour || selectedVehicle.prix || 0;

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button
            onClick={() => {
              setSelectedVehicle(null);
              setActiveTab('list');
            }}
            className="group flex items-center gap-3 text-slate-400 hover:text-orange-500 font-black text-xs uppercase tracking-[0.2em] transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 transition-all">
              <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </div>
            Retour à l'inventaire
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModalVisible(true)}
              className="px-6 py-3 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faCalendarCheck} />
              Aperçu réservation
            </button>

            {selectedVehicle.status === 'PENDING' && (
              <button
                onClick={() => handleAction(selectedVehicle.id, 'APPROVE')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                Approuver
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-2xl hover:opacity-90 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faEdit} />
              Modifier
            </button>
          </div>
        </div>

        {/* Détail du véhicule style mobile */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
          {/* Galerie photos interactive */}
          <div
            className="relative group"
            onMouseEnter={() => setIsGalleryHovered(true)}
            onMouseLeave={() => setIsGalleryHovered(false)}
          >
            <div className="aspect-[21/9] md:aspect-[21/7] relative overflow-hidden bg-slate-100">
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
                          alt={`${selectedVehicle.marque} ${selectedVehicle.model}`}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                          priority={idx === currentImageIndex}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10" />

                  {/* Navigation Arrows */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-white/40 transition-all z-20 shadow-2xl active:scale-90"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-white/40 transition-all z-20 shadow-2xl active:scale-90"
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute top-6 right-6 px-4 py-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] z-20">
                    Photo {currentImageIndex + 1} / {photos.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <FontAwesomeIcon icon={faCar} size="4x" className="text-slate-300" />
                </div>
              )}

              {/* Status Badges Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                {selectedVehicle.forSale && (
                  <span className="px-5 py-2.5 bg-rose-500/90 backdrop-blur-sm text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-rose-400/30">
                    <FontAwesomeIcon icon={faTag} size="xs" />
                    En Vente
                  </span>
                )}
                {selectedVehicle.forRent && (
                  <span className="px-5 py-2.5 bg-emerald-500/90 backdrop-blur-sm text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-emerald-400/30">
                    <FontAwesomeIcon icon={faClockRegular} size="xs" />
                    Location
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails Navigation Strip */}
            {photos.length > 1 && (
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-center gap-3">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex
                      ? 'border-orange-500 scale-105 shadow-lg'
                      : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <Image src={photo} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900">
                  {selectedVehicle.marque || selectedVehicle.marqueRef?.name} {selectedVehicle.model || selectedVehicle.modele}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500/50" />
                    {selectedVehicle.annee || selectedVehicle.year || 'N/A'}
                  </span>
                  <span className="text-slate-300 mx-1">•</span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faTachometerAlt} className="text-orange-500/50" />
                    {formatMileage(selectedVehicle.mileage || selectedVehicle.kilometrage || 0)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-orange-600">{formatPrice(dailyPrice)}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">par jour</p>
              </div>
            </div>

            {/* Services & Inclusions cards */}
            {(selectedVehicle.garantie || selectedVehicle.assurance || selectedVehicle.chauffeur) && (
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-200"></span>
                  Services & Inclusions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedVehicle.garantie && (
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-[1.5rem] flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faShieldAlt} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Garantie</p>
                        <p className="text-xs font-black text-emerald-900">{selectedVehicle.dureeGarantie} mois</p>
                      </div>
                    </div>
                  )}
                  {selectedVehicle.assurance && (
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-[1.5rem] flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Assurance</p>
                        <p className="text-xs font-black text-blue-900">Incluse</p>
                      </div>
                    </div>
                  )}
                  {selectedVehicle.chauffeur && (
                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-[1.5rem] flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faUserTie} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Chauffeur</p>
                        <p className="text-xs font-black text-purple-900">Inclus</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedVehicle.description && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-600">{selectedVehicle.description}</p>
              </div>
            )}

            {/* Documents Checklist cards */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-slate-200"></span>
                Documents & Conformité
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-[1.5rem] border ${selectedVehicle.carteGrise ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} flex flex-col items-center text-center transition-all`}>
                  <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center ${selectedVehicle.carteGrise ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <FontAwesomeIcon icon={faFileContract} />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedVehicle.carteGrise ? 'text-emerald-700' : 'text-slate-400'}`}>Carte Grise</p>
                  <p className="text-[9px] font-bold mt-1 text-slate-500">{selectedVehicle.carteGrise ? 'Disponible' : 'Non spécifie'}</p>
                </div>
                <div className={`p-4 rounded-[1.5rem] border ${selectedVehicle.vignette ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} flex flex-col items-center text-center transition-all`}>
                  <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center ${selectedVehicle.vignette ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <FontAwesomeIcon icon={faCertificate} />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedVehicle.vignette ? 'text-emerald-700' : 'text-slate-400'}`}>Vignette</p>
                  <p className="text-[9px] font-bold mt-1 text-slate-500">{selectedVehicle.vignette ? 'Validé' : 'Non spécifié'}</p>
                </div>
                <div className="p-4 rounded-[1.5rem] border bg-emerald-50/50 border-emerald-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 mb-3 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <FontAwesomeIcon icon={faShield} />
                  </div>
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Contrôle T.</p>
                  <p className="text-[9px] font-bold mt-1 text-slate-500">Conforme</p>
                </div>
              </div>
            </div>

            {/* Informations parking */}
            {selectedVehicle.parking && (
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div>
                    <p className="font-black text-orange-900">{selectedVehicle.parking.name || 'Parking'}</p>
                    <p className="text-xs text-orange-700">{selectedVehicle.parking.address || 'Adresse non spécifiée'}</p>
                  </div>
                </div>
                {selectedVehicle.parking.phone && (
                  <p className="text-xs font-bold text-orange-800 mt-2">
                    📞 {selectedVehicle.parking.phone}
                  </p>
                )}
              </div>
            )}

            {/* Fiche Technique en Cards */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-slate-200"></span>
                Caractéristiques
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Année', value: selectedVehicle.annee || selectedVehicle.year || 'N/A', icon: faCalendarAlt, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Boîte', value: formatTransmissionForDisplay(selectedVehicle.transmission || selectedVehicle.boite), icon: faCogs, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Carburant', value: selectedVehicle.fuelType || selectedVehicle.carburant || 'N/A', icon: faGasPump, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Kilométrage', value: formatMileage(selectedVehicle.mileage || selectedVehicle.kilometrage || 0), icon: faTachometerAlt, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((spec, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-4 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                    <div className={`w-12 h-12 ${spec.bg} ${spec.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <FontAwesomeIcon icon={spec.icon} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                    <p className="text-sm font-black text-slate-900">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Action Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldAlt} className="text-orange-500" />
            Actions Administrateur
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedVehicle.status !== 'APPROVED' && (
              <button
                onClick={() => handleAction(selectedVehicle.id, 'APPROVE')}
                className="flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                Approuver
              </button>
            )}

            <button
              onClick={() => handleAction(selectedVehicle.id, 'DELETE')}
              className="flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-95"
            >
              <FontAwesomeIcon icon={faTrash} />
              Supprimer
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {selectedVehicle.stats && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartBar} className="text-orange-500" />
              Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-orange-600">{selectedVehicle.stats.vues || 0}</p>
                <p className="text-xs font-bold text-slate-500">Vues</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-600">{selectedVehicle.stats.reservations || 0}</p>
                <p className="text-xs font-bold text-slate-500">Réservations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Modale de réservation
  const renderReservationModal = () => {
    if (!selectedVehicle) return null;

    const dailyPrice = selectedVehicle.prixJour || selectedVehicle.prix || 0;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fadeIn bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
            <h2 className="text-2xl font-black text-slate-900">Aperçu réservation</h2>
            <button
              onClick={() => {
                setModalVisible(false);
                setReservationType(null);
              }}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="p-6">
            {/* Type de réservation */}
            <div className="mb-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Type de réservation</label>
              <div className="flex gap-3">
                <button
                  onClick={() => selectReservationType('ACHAT')}
                  className={`flex-1 py-4 rounded-xl border-2 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${reservationType === 'ACHAT'
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-slate-200 text-slate-500 hover:border-orange-200'
                    }`}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Achat
                </button>
                <button
                  onClick={() => selectReservationType('LOCATION')}
                  className={`flex-1 py-4 rounded-xl border-2 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${reservationType === 'LOCATION'
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-slate-200 text-slate-500 hover:border-orange-200'
                    }`}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  Location
                </button>
              </div>
            </div>

            {reservationType === 'LOCATION' && (
              <>
                {/* Dates de location */}
                <div className="mb-6">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Dates de location</label>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 mb-2">Début</p>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-bold">{startDateTime?.toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-slate-500">{startDateTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 mb-2">Fin</p>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-bold">{endDateTime?.toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-slate-500">{endDateTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-orange-800">Durée: {selectedDays} jour(s)</span>
                      <span className="text-xl font-black text-orange-600">{formatPrice(calculatedPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Motif de location */}
                <div className="mb-6">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Motif de location</label>
                  <div className="grid grid-cols-2 gap-3">
                    {MOTIFS_LOCATION.map((motif) => (
                      <button
                        key={motif.id}
                        onClick={() => {
                          setSelectedMotif(motif.id);
                          if (motif.id !== 'autre') setAutreMotif('');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMotif === motif.id
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-slate-200 text-slate-500 hover:border-orange-200'
                          }`}
                      >
                        <FontAwesomeIcon icon={motif.icon} />
                        <span className="text-xs font-bold">{motif.label}</span>
                      </button>
                    ))}
                  </div>
                  {selectedMotif === 'autre' && (
                    <input
                      type="text"
                      placeholder="Précisez votre motif..."
                      value={autreMotif}
                      onChange={(e) => setAutreMotif(e.target.value)}
                      className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  )}
                </div>

                {/* Localisation */}
                <div className="mb-6">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Localisation</label>
                  <div className="flex gap-3">
                    {LOCALISATIONS.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedLocalisation(loc.id)}
                        className={`flex-1 py-4 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${selectedLocalisation === loc.id
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-slate-200 text-slate-500 hover:border-orange-200'
                          }`}
                      >
                        <FontAwesomeIcon icon={faLocationDot} />
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditionsAccepted}
                      onChange={(e) => setConditionsAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-orange-500"
                    />
                    <span className="text-sm font-bold text-slate-700">
                      J'accepte les conditions générales de location
                    </span>
                  </label>

                  <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-2">
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="xs" />
                      Le client prend en charge les frais d'essence
                    </p>
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="xs" />
                      Maximum 5 personnes dans le véhicule
                    </p>
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="xs" />
                      Véhicule doit être retourné dans l'état initial
                    </p>
                    {selectedVehicle.chauffeur && (
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="xs" />
                        Chauffeur professionnel inclus
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {reservationType === 'ACHAT' && (
              <div className="mb-6 p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-emerald-600 mb-4" />
                <p className="text-lg font-black text-emerald-800 mb-2">Achat immédiat</p>
                <p className="text-3xl font-black text-emerald-600 mb-4">{formatPrice(dailyPrice)}</p>
                <p className="text-sm text-emerald-700">Ce véhicule est disponible à l'achat. Tous les documents sont inclus.</p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setModalVisible(false);
                  setReservationType(null);
                }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmReservation}
                disabled={!reservationType || (reservationType === 'LOCATION' && (!selectedMotif || !selectedLocalisation || !conditionsAccepted))}
                className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${!reservationType || (reservationType === 'LOCATION' && (!selectedMotif || !selectedLocalisation || !conditionsAccepted))
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
              >
                {reservationType === 'ACHAT' ? 'Acheter' : 'Réserver'}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modale de paiement
  const renderPaymentModal = () => {
    if (!currentReservation) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fadeIn bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Paiement</h2>
            <button
              onClick={() => {
                setModalPayVisible(false);
                setCurrentReservation(null);
              }}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="p-6">
            {/* Récapitulatif */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Récapitulatif</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Véhicule</span>
                  <span className="text-sm font-black text-slate-900">
                    {selectedVehicle?.marque} {selectedVehicle?.model}
                  </span>
                </div>
                {currentReservation.type === 'LOCATION' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Dates</span>
                      <span className="text-sm font-black text-slate-900">
                        {new Date(currentReservation.dateDebut).toLocaleDateString('fr-FR')} - {new Date(currentReservation.dateFin).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Durée</span>
                      <span className="text-sm font-black text-slate-900">{selectedDays} jour(s)</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-base font-black text-slate-900">Total</span>
                  <span className="text-xl font-black text-orange-600">{formatPrice(currentReservation.montant)}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs font-bold text-slate-500 mb-4">
              Sélectionnez votre mode de paiement
            </p>

            {/* Options de paiement */}
            <div className="space-y-3">
              <button
                onClick={() => processPayment('ESPECES')}
                disabled={isProcessingPayment}
                className="w-full p-4 bg-white border-2 border-emerald-500 rounded-xl flex items-center gap-4 hover:bg-emerald-50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <FontAwesomeIcon icon={faMoneyBillWave} size="lg" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-slate-900">Espèces</p>
                  <p className="text-xs text-slate-500">Paiement à la remise</p>
                </div>
                {isProcessingPayment ? (
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="lg" />
                )}
              </button>

              <div className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl flex items-center gap-4 opacity-60 cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <FontAwesomeIcon icon={faMobile} size="lg" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-slate-900">Orange Money</p>
                  <p className="text-xs text-slate-500">Bientôt disponible</p>
                </div>
                <FontAwesomeIcon icon={faLock} className="text-slate-400" />
              </div>

              <div className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl flex items-center gap-4 opacity-60 cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <FontAwesomeIcon icon={faWaveSquare} size="lg" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-slate-900">Wave</p>
                  <p className="text-xs text-slate-500">Bientôt disponible</p>
                </div>
                <FontAwesomeIcon icon={faLock} className="text-slate-400" />
              </div>
            </div>

            {isProcessingPayment && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-600">Traitement en cours...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-6">
            <span className="w-16 h-16 rounded-[2rem] bg-orange-100 text-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/10">
              <FontAwesomeIcon icon={faHistory} size="sm" />
            </span>
            Journal de Bord
          </h3>
          <p className="text-slate-400 font-bold text-lg mt-3 ml-22">Historique des opérations</p>
        </div>
      </div>

      <div className="relative space-y-16 pl-4 md:pl-20 before:absolute before:inset-0 before:ml-12 md:before:ml-28 before:-translate-x-px before:h-full before:w-1.5 before:bg-slate-50 before:rounded-full">
        {[
          { date: '12 fév. 2024', time: '14:22', event: 'Création du véhicule', desc: 'Le partenaire a ajouté ce véhicule à la plateforme.', color: 'bg-indigo-500', author: 'Jean-Luc Koffi' },
          { date: '13 fév. 2024', time: '09:45', event: 'Validation administrative', desc: 'Vérification des documents effectuée.', color: 'bg-amber-500', author: 'Admin Système' },
          { date: '14 fév. 2024', time: '11:10', event: 'Publication en ligne', desc: 'Le véhicule est désormais visible sur la plateforme.', color: 'bg-emerald-500', author: 'Auto-pilot' }
        ].map((item, idx) => (
          <div key={idx} className="relative flex flex-col md:flex-row gap-8 group">
            <div className={`z-10 absolute -left-14 md:-left-20 w-16 h-16 rounded-[2rem] border-[10px] border-white shadow-2xl flex items-center justify-center text-white transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 ${item.color}`}>
              <FontAwesomeIcon icon={faClock} className="text-xs" />
            </div>

            <div className="flex-1 bg-slate-50/50 rounded-[3rem] p-10 border border-transparent group-hover:border-slate-100 group-hover:bg-white group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{item.time}</span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{item.event}</h4>
                </div>
              </div>
              <p className="text-lg font-medium text-slate-500 leading-relaxed mb-8 border-l-2 border-slate-200 pl-6">{item.desc}</p>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[10px]">👤</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Responsable</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{item.author}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => {
    if (!selectedVehicle?.stats) return null;

    return (
      <div className="space-y-10 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="relative group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden hover:-translate-y-2 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg mb-6 group-hover:rotate-6 transition-transform">
              <FontAwesomeIcon icon={faEye} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Vues</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{selectedVehicle.stats?.vues || 0}</h4>
            <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">
              Total
            </span>
          </div>

          <div className="relative group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden hover:-translate-y-2 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg mb-6 group-hover:rotate-6 transition-transform">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Réservations</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{selectedVehicle.stats?.reservations || 0}</h4>
            <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">
              Total
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    if (!selectedVehicle) return null;

    return (
      <div className="space-y-10 animate-fadeIn">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldAlt} />
            </span>
            Documents du véhicule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${selectedVehicle.carteGrise ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-12 h-12 rounded-xl ${selectedVehicle.carteGrise ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'} flex items-center justify-center`}>
                <FontAwesomeIcon icon={faFileContract} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-900">Carte Grise</h4>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${selectedVehicle.carteGrise ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedVehicle.carteGrise ? 'Validé' : 'Non fourni'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl border ${selectedVehicle.assurance ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-12 h-12 rounded-xl ${selectedVehicle.assurance ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'} flex items-center justify-center`}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-900">Assurance</h4>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${selectedVehicle.assurance ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedVehicle.assurance ? `${selectedVehicle.dureeAssurance || '?'} mois` : 'Non inclus'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl border ${selectedVehicle.vignette ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-12 h-12 rounded-xl ${selectedVehicle.vignette ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'} flex items-center justify-center`}>
                <FontAwesomeIcon icon={faCertificate} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-900">Vignette</h4>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${selectedVehicle.vignette ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedVehicle.vignette ? 'Validé' : 'Non fourni'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center">
                <FontAwesomeIcon icon={faWrench} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-900">Contrôle Technique</h4>
                  <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-100 text-amber-700">
                    À vérifier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!selectedVehicle) return null;
    const photos = getAllPhotoUrls(selectedVehicle.photos);

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fadeIn bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto relative">
          <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faEdit} className="text-orange-500" />
              Édition du véhicule
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="p-8">
            {/* Photo Management */}
            <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-4 block">
                Photos du véhicule ({photos.length + editNewPhotos.length})
              </label>
              <div className="flex flex-wrap gap-4">
                {photos.map((photo, index) => (
                  <div key={`existing-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden group/photo shadow-sm">
                    <Image src={photo} alt="" fill className="object-cover" />
                    <button
                      onClick={() => {
                        const newPhotos = [...editExistingPhotos];
                        newPhotos.splice(index, 1);
                        setEditExistingPhotos(newPhotos);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover/photo:opacity-100 transition-opacity z-10 shadow-md"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                    <div className="absolute bottom-0 w-full bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold text-center py-1">
                      Existante
                    </div>
                  </div>
                ))}

                {editNewPhotos.map((file, index) => (
                  <div key={`new-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden group/photo border-2 border-orange-500 shadow-sm">
                    <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                    <button
                      onClick={() => setEditNewPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover/photo:opacity-100 transition-opacity z-10 shadow-md"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                    <div className="absolute bottom-0 w-full bg-orange-500 text-white text-[8px] font-bold text-center py-1">
                      Nouvelle
                    </div>
                  </div>
                ))}

                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all text-slate-400 hover:text-orange-500 group">
                  <FontAwesomeIcon icon={faImage} size="lg" className="group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-widest mt-2">+ Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setEditNewPhotos(prev => [...prev, ...files]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Marque</label>
                <input
                  type="text"
                  value={editMarque}
                  onChange={(e) => setEditMarque(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                  placeholder="Ex: Toyota"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Modèle</label>
                <input
                  type="text"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                  placeholder="Ex: Corolla"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Année</label>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                  placeholder="2024"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Prix (FCFA)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Kilométrage (km)</label>
                <input
                  type="number"
                  value={editMileage}
                  onChange={(e) => setEditMileage(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Statut</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                >
                  <option value="PENDING">En attente</option>
                  <option value="APPROVED">Approuvé</option>
                  <option value="BLOCKED">Bloqué</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Carburant</label>
                <select
                  value={editFuelType}
                  onChange={(e) => setEditFuelType(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                >
                  <option value="ESSENCE">Essence</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIQUE">Électrique</option>
                  <option value="HYBRIDE">Hybride</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Transmission</label>
                <select
                  value={editTransmission}
                  onChange={(e) => setEditTransmission(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                >
                  <option value="MANUAL">Manuelle</option>
                  <option value="AUTOMATIC">Automatique</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all resize-none"
                  placeholder="Description du véhicule..."
                />
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: 'Vente', state: editForSale, setter: setEditForSale, icon: faTag },
                    { label: 'Location', state: editForRent, setter: setEditForRent, icon: faClockRegular },
                    { label: 'Garantie', state: editGarantie, setter: setEditGarantie, icon: faShieldAlt },
                    { label: 'Assurance', state: editAssurance, setter: setEditAssurance, icon: faCheckCircle },
                    { label: 'Chauffeur', state: editChauffeur, setter: setEditChauffeur, icon: faUserTie },
                    { label: 'Carte Grise', state: editCarteGrise, setter: setEditCarteGrise, icon: faFileContract },
                    { label: 'Vignette', state: editVignette, setter: setEditVignette, icon: faCertificate },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => opt.setter(!opt.state)}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${opt.state
                        ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20'
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                        }`}
                    >
                      <FontAwesomeIcon icon={opt.icon} size="xs" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {(editGarantie || editAssurance) && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editGarantie && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Durée Garantie (mois)</label>
                      <select
                        value={editDureeGarantie}
                        onChange={(e) => setEditDureeGarantie(Number(e.target.value))}
                        className="w-full px-5 py-3 bg-orange-50 border border-orange-100 rounded-2xl outline-none font-bold text-orange-700 transition-all"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 36].map(d => (
                          <option key={d} value={d}>{d} mois</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {editAssurance && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Durée Assurance (mois)</label>
                      <select
                        value={editDureeAssurance}
                        onChange={(e) => setEditDureeAssurance(Number(e.target.value))}
                        className="w-full px-5 py-3 bg-orange-50 border border-orange-100 rounded-2xl outline-none font-bold text-orange-700 transition-all"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(d => (
                          <option key={d} value={d}>{d} mois</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUpdate}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-32">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Chargement des véhicules...
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Navigation Tabs */}
      {activeTab !== 'list' && (
        <div className="sticky top-6 z-40 mb-12 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setSelectedVehicle(null);
              setActiveTab('list');
            }}
            className="w-14 h-14 rounded-[1.5rem] bg-white text-slate-400 hover:text-orange-500 shadow-xl border border-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="inline-flex bg-white/70 backdrop-blur-3xl p-2 rounded-[3rem] border border-white/50 shadow-2xl shadow-slate-200/50">
            {[
              { id: 'details', label: 'Détails', icon: faEye },
              { id: 'history', label: 'Journal', icon: faHistory },
              { id: 'stats', label: 'Stats', icon: faChartBar },
              { id: 'documents', label: 'Documents', icon: faShieldAlt },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-y-[-2px]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                  }`}
              >
                <FontAwesomeIcon icon={tab.icon} className={activeTab === tab.id ? 'text-orange-500' : ''} />
                <span className="hidden md:block">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        {activeTab === 'list' && renderList()}
        {activeTab === 'details' && renderDetails()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'documents' && renderDocuments()}
      </div>

      {/* Modales */}
      {modalVisible && renderReservationModal()}
      {modalPayVisible && renderPaymentModal()}
      {isEditing && renderEditModal()}
    </div>
  );
}