'use client';

import { useState, useEffect, useRef } from 'react';
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
  faSearch,
  faFilter,
  faEuroSign,
  faGasPump,
  faCogs,
  faCalendarAlt,
  faUser,
  faMapMarkerAlt,
  faClock,
  faExclamationTriangle,
  faShieldAlt,
  faImage,
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
  faThLarge,
} from '@fortawesome/free-solid-svg-icons';
import { faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons';
import { vehiclesAPI } from '@/services/vehicles-api';
import { mobilityAPI } from '@/services/mobility-api';
import type { Vehicule, Parking } from '@/types';
import Image from 'next/image';
import { getCookie } from 'cookies-next';

type TabType = 'list' | 'details' | 'history' | 'stats' | 'documents';

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
  const [currentReservation, setCurrentReservation] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState<'start' | 'end' | null>(null);

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
  const [isAdding, setIsAdding] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [addMarque, setAddMarque] = useState("");
  const [addModel, setAddModel] = useState("");
  const [addPrice, setAddPrice] = useState(0);
  const [addYear, setAddYear] = useState(new Date().getFullYear());
  const [addMileage, setAddMileage] = useState(0);
  const [addFuelType, setAddFuelType] = useState("ESSENCE");
  const [addTransmission, setAddTransmission] = useState("MANUAL");
  const [addDescription, setAddDescription] = useState("");
  const [addPhotos, setAddPhotos] = useState<File[]>([]);
  const [addForSale, setAddForSale] = useState(true);
  const [addForRent, setAddForRent] = useState(true);
  const [addGarantie, setAddGarantie] = useState(false);
  const [addDureeGarantie, setAddDureeGarantie] = useState(0);
  const [addChauffeur, setAddChauffeur] = useState(false);
  const [addAssurance, setAddAssurance] = useState(false);
  const [addDureeAssurance, setAddDureeAssurance] = useState(0);
  const [addCarteGrise, setAddCarteGrise] = useState(false);
  const [addVignette, setAddVignette] = useState(false);
  const [addCategory, setAddCategory] = useState("Standard");
  const [addParkingId, setAddParkingId] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: string;
  }>({
    show: false,
    type: 'info',
    message: '',
  });
  const notificationTimer = useRef<NodeJS.Timeout | null>(null);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, details?: string) => {
    console.log(`[Notification] ${type}: ${message}`, details);
    // Nettoyer le timer précédent s'il existe
    if (notificationTimer.current) clearTimeout(notificationTimer.current);

    setNotification({ show: true, type, message, details });

    // Masquer automatiquement après 6 secondes quel que soit le type
    notificationTimer.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 6000);
  };

  // Lists
  const [marquesList, setMarquesList] = useState<{ name: string }[]>([]);
  const [parkingsList, setParkingsList] = useState<Parking[]>([]);

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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

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

  const loadMarques = async () => {
    try {
      const data = await vehiclesAPI.getMarques();
      setMarquesList(data);
    } catch (e) {
      console.error("Erreur marques:", e);
    }
  };

  const loadParkings = async () => {
    try {
      const data = await mobilityAPI.getParkings();
      setParkingsList(data);
    } catch (e) {
      console.error("Erreur parkings:", e);
    }
  };

  const loadMyParking = async () => {
    try {
      const data = await vehiclesAPI.getMyParking();
      if (data && data.id) {
        setAddParkingId(data.id.toString());
      }
    } catch (e) {
      console.error("Erreur récup mon parking:", e);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadMarques();
    loadParkings();
    loadMyParking();

    const handleOpenAdd = () => {
      setIsAdding(true);
      resetAddForm();
    };

    window.addEventListener('open-add-vehicle-modal', handleOpenAdd);
    return () => window.removeEventListener('open-add-vehicle-modal', handleOpenAdd);
  }, []);

  const resetAddForm = () => {
    setAddStep(1);
    setAddMarque("");
    setAddModel("");
    setAddPrice(0);
    setAddYear(new Date().getFullYear());
    setAddMileage(0);
    setAddFuelType("ESSENCE");
    setAddTransmission("MANUAL");
    setAddDescription("");
    setAddPhotos([]);
    setAddForSale(true);
    setAddForRent(true);
    setAddGarantie(false);
    setAddDureeGarantie(0);
    setAddChauffeur(false);
    setAddAssurance(false);
    setAddDureeAssurance(0);
    setAddCarteGrise(false);
    setAddVignette(false);
    setAddCategory("Standard");

    const userStr = getCookie('user');
    if (userStr) {
      const user = JSON.parse(userStr as string);
      setAddParkingId(user.parkingId?.toString() || "");
    }
  };

  const handleAddSubmit = async () => {
    try {
      // Validations de base
      if (!addMarque || !addModel || !addPrice || addPrice <= 0) {
        showNotification('warning', "Informations manquantes", "Veuillez remplir la marque, le modèle et un prix valide.");
        return;
      }

      if (addPhotos.length === 0) {
        showNotification('warning', "Photo requise", "Veuillez ajouter au moins une photo du véhicule.");
        return;
      }

      // Log pour débogage
      console.log('Tentative d\'ajout avec:', { addMarque, addModel, addPrice, addYear });

      setSavingAdd(true);
      const formData = new FormData();

      // Récupération du parkingId
      const userStr = getCookie('user');
      const user = userStr ? JSON.parse(userStr as string) : null;
      const finalParkingId = addParkingId || user?.parkingId?.toString();

      if (finalParkingId) {
        formData.append('parkingId', finalParkingId);
      } else {
        showNotification('warning', "Parking non défini", "Attention: Aucun parking sélectionné. L'ajout risque d'échouer.");
      }

      // Données du véhicule (conformes au type Vehicule)
      formData.append('marque', addMarque);
      formData.append('model', addModel);
      formData.append('prix', addPrice.toString());
      formData.append('annee', addYear.toString());
      formData.append('mileage', addMileage.toString());
      formData.append('fuelType', addFuelType);
      formData.append('transmission', addTransmission);
      formData.append('description', addDescription);
      formData.append('categorie', addCategory);

      // Booleans
      formData.append('forSale', String(addForSale));
      formData.append('forRent', String(addForRent));
      formData.append('garantie', String(addGarantie));
      formData.append('assurance', String(addAssurance));
      formData.append('chauffeur', String(addChauffeur));
      formData.append('carteGrise', String(addCarteGrise));
      formData.append('vignette', String(addVignette));

      if (addGarantie) formData.append('dureeGarantie', addDureeGarantie.toString());
      if (addAssurance) formData.append('dureeAssurance', addDureeAssurance.toString());

      // Photos
      addPhotos.forEach(file => {
        formData.append('photos', file);
      });

      console.log('FormData prêt, envoi...');
      await vehiclesAPI.createVehicule(formData);

      console.log('Véhicule ajouté avec succès !');
      showNotification('success', "Véhicule ajouté !", "Le véhicule a été créé avec succès dans votre inventaire.");
      setIsAdding(false);
      resetAddForm();
      loadVehicles();
    } catch (error: unknown) {
      console.error('Erreur API détaillée:', error);
      const apiError = error as { message: string, details?: any };
      showNotification('error', "Erreur lors de l'ajout", apiError.message + (apiError.details ? ` : ${JSON.stringify(apiError.details)}` : ''));
    } finally {
      setSavingAdd(false);
    }
  };

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
  }, [selectedVehicle, isGalleryHovered, activeTab, getAllPhotoUrls]);

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
        status: editStatus as Vehicule['status'],
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
      showNotification('success', "Mise à jour réussie", "Les informations du véhicule ont été actualisées.");
    } catch (error: unknown) {
      console.error('Error updating vehicle:', error);
      showNotification('error', "Erreur de mise à jour", "Impossible d'enregistrer les modifications du véhicule.");
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
      showNotification('success', "Action effectuée", `Le véhicule a été ${action === 'APPROVE' ? 'approuvé' : 'mis à jour'}.`);

    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      showNotification('error', "Erreur d'action", "L'opération a échoué. Veuillez réessayer.");
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

  const confirmReservation = () => {
    if (!reservationType || !selectedVehicle) {
      showNotification('warning', "Type requis", "Veuillez sélectionner un type de réservation (Location ou Achat).");
      return;
    }

    if (reservationType === 'LOCATION') {
      if (!startDateTime || !endDateTime) {
        showNotification('warning', "Dates manquantes", "Les dates de début et de fin sont obligatoires pour la location.");
        return;
      }
      if (endDateTime.getTime() <= startDateTime.getTime()) {
        showNotification('warning', "Dates invalides", "La date de fin doit être postérieure à la date de début.");
        return;
      }
      const diffHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      if (diffHours < 1) {
        showNotification('warning', "Durée insuffisante", "La durée de location doit être d'au moins 1 heure.");
        return;
      }
      if (!selectedMotif) {
        showNotification('warning', "Motif requis", "Veuillez sélectionner un motif de location.");
        return;
      }
      if (!selectedLocalisation) {
        showNotification('warning', "Localisation requise", "Veuillez préciser la zone d'utilisation du véhicule.");
        return;
      }
      if (!conditionsAccepted) {
        showNotification('warning', "Conditions requises", "Vous devez accepter les conditions générales pour continuer.");
        return;
      }
      if (!selectedVehicle.forRent) {
        showNotification('error', "Indisponible", "Ce véhicule n'est malheureusement pas ouvert à la location pour le moment.");
        return;
      }
    }

    if (reservationType === 'ACHAT' && !selectedVehicle.forSale) {
      showNotification('error', "Indisponible", "Ce véhicule n'est pas disponible à la vente.");
      return;
    }

    let motifFinal = null;
    if (reservationType === 'LOCATION') {
      if (selectedMotif === 'autre') {
        motifFinal = autreMotif.trim();
        if (!motifFinal) {
          showNotification('warning', "Précision requise", "Veuillez préciser votre motif de location personnalisé.");
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
      showNotification('error', "Données manquantes", "Les informations de réservation sont incomplètes.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const message = paymentMethod === 'ESPECES'
        ? 'Votre réservation est confirmée !\n\nLe parking vous contactera bientôt pour organiser le paiement en espèces et la remise du véhicule.'
        : 'Votre réservation et paiement sont confirmés !';

      showNotification('success', "Confirmation", message);

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
      showNotification('error', "Échec de l'opération", error.message || 'Une erreur est survenue lors de la confirmation.');
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
              title="Filtrer par statut"
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

          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid'
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Vue grille"
            >
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'list'
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Vue liste"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
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

      {/* Mode d'affichage Grille ou Liste */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((vehicle) => (
              <div
                key={vehicle.id}
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setActiveTab('details');
                }}
              >
                {/* Image Section */}
                <div className="p-2">
                  <div className="aspect-[16/9] relative rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner border border-slate-50">
                    {getPhotoUrl(vehicle.photos) ? (
                      <Image
                        src={getPhotoUrl(vehicle.photos)!}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <FontAwesomeIcon icon={faCar} size="3x" />
                      </div>
                    )}

                    {/* Badges sur l'image plus compacts */}
                    <div className="absolute top-3 left-3 flex flex-row gap-1.5 flex-wrap">
                      {vehicle.forSale && (
                        <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-sm text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                          Vente
                        </span>
                      )}
                      {vehicle.forRent && (
                        <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                          Location
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase border backdrop-blur-md shadow-sm ${getStatusColor(vehicle.status)} bg-white/90`}>
                        {vehicle.status === 'PENDING' ? 'Attente' : vehicle.status === 'APPROVED' ? 'Validé' : vehicle.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                        {vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}
                      </h3>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">
                        {vehicle.annee || vehicle.year} • {vehicle.categorie || 'Standard'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-orange-600 leading-none">
                        {formatPrice(vehicle.prixJour || vehicle.prix || 0)}
                      </p>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">/jour</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
                      <FontAwesomeIcon icon={faGasPump} className="text-orange-500/50" />
                      <span className="truncate">{vehicle.fuelType || vehicle.carburant || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
                      <FontAwesomeIcon icon={faCogs} className="text-indigo-500/50" />
                      <span className="truncate">{formatTransmissionForDisplay(vehicle.transmission || vehicle.boite)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-rose-500/50" />
                      <span className="truncate">{vehicle.annee || vehicle.year || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
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
                      <FontAwesomeIcon icon={faMapMarkerAlt} size="sm" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 truncate">
                      {vehicle.parking?.name || 'Localisation non spécifiée'}
                    </p>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button
                      title="Voir les détails du véhicule"
                      className="flex-1 py-3 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
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
      ) : (
        <div className="space-y-4">
          {filteredVehicles
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((vehicle) => (
              <div
                key={vehicle.id}
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 overflow-hidden flex flex-col md:flex-row cursor-pointer"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setActiveTab('details');
                }}
              >
                {/* Image Section - Fixed width and flex-shrink-0 */}
                <div className="w-full md:w-80 p-3 shrink-0">
                  <div className="aspect-[16/10] md:h-full relative rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
                    {getPhotoUrl(vehicle.photos) ? (
                      <Image
                        src={getPhotoUrl(vehicle.photos)!}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <FontAwesomeIcon icon={faCar} size="2x" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-row gap-1 flex-wrap">
                      {vehicle.forSale && (
                        <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                          Vente
                        </span>
                      )}
                      {vehicle.forRent && (
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                          Location
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenu - Espacement garanti par le padding et flex-1 */}
                <div className="flex-1 p-6 flex flex-col justify-center min-w-0">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                    <div className="min-w-0">
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors truncate">
                        {vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                          {vehicle.annee || vehicle.year} • {vehicle.categorie || 'Standard'}
                        </p>
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase border ${getStatusColor(vehicle.status)} bg-white`}>
                          {vehicle.status === 'PENDING' ? 'En attente' : vehicle.status === 'APPROVED' ? 'Validé' : vehicle.status}
                        </span>
                      </div>
                    </div>

                    <div className="lg:text-right shrink-0">
                      <p className="text-3xl font-black text-orange-600 leading-none">
                        {formatPrice(vehicle.prixJour || vehicle.prix || 0)}
                      </p>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">/jour</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <FontAwesomeIcon icon={faGasPump} size="xs" />
                      </div>
                      <span className="truncate">{vehicle.fuelType || vehicle.carburant || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <FontAwesomeIcon icon={faCogs} size="xs" />
                      </div>
                      <span className="truncate">{formatTransmissionForDisplay(vehicle.transmission || vehicle.boite)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                        <FontAwesomeIcon icon={faTachometerAlt} size="xs" />
                      </div>
                      <span className="truncate">{formatMileage(vehicle.mileage || vehicle.kilometrage || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="xs" />
                      </div>
                      <span className="truncate">{vehicle.parking?.name || 'Localisation'}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                    <div className="flex gap-2">
                      {vehicle.garantie && (
                        <div className="w-8 h-8 rounded-lg border border-emerald-100 bg-emerald-50 flex items-center justify-center text-emerald-600" title="Garantie">
                          <FontAwesomeIcon icon={faShieldAlt} size="xs" />
                        </div>
                      )}
                      {vehicle.assurance && (
                        <div className="w-8 h-8 rounded-lg border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-600" title="Assurance">
                          <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        title="Voir les détails du véhicule"
                        className="px-6 py-2 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicle(vehicle);
                          setActiveTab('details');
                        }}
                      >
                        Détails
                      </button>
                      <button
                        className="w-10 h-10 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center transition-all"
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
              </div>
            ))}
        </div>
      )}

      {/* Pagination Style Utilisateur - Harmonisation avec la page Users */}
      {filteredVehicles.length > 0 && (
        <div className="mt-8 px-6 py-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">
              Affichage de <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredVehicles.length)}</span> sur <span className="font-bold text-orange-600">{filteredVehicles.length}</span> véhicules
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
              <option value={12}>12 par page</option>
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
                Page <span className="text-orange-600">{currentPage}</span> sur {Math.ceil(filteredVehicles.length / itemsPerPage) || 1}
              </span>
            </div>

            <button
              title="Page suivante"
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredVehicles.length / itemsPerPage)));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === Math.ceil(filteredVehicles.length / itemsPerPage) || filteredVehicles.length === 0}
              className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      {filteredVehicles.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
            <FontAwesomeIcon icon={faCar} size="2x" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Aucun véhicule</h3>
          <p className="text-slate-400 font-bold mt-1">Nous n&apos;avons trouvé aucun véhicule correspondant à votre recherche.</p>
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
                title="Fermer les filtres"
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
            Retour à l&apos;inventaire
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
                        title="Image précédente"
                        onClick={prevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-white/40 transition-all z-20 shadow-2xl active:scale-90"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <button
                        title="Image suivante"
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
              <div className="absolute top-6 left-6 flex flex-row gap-2 z-20 flex-wrap">
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
                    title={`Voir la photo ${idx + 1}`}
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
              title="Fermer"
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
                      title="Précisez votre motif"
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
                      title="Accepter les conditions"
                      type="checkbox"
                      checked={conditionsAccepted}
                      onChange={(e) => setConditionsAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-orange-500"
                    />
                    <span className="text-sm font-bold text-slate-700">
                      J&apos;accepte les conditions générales de location
                    </span>
                  </label>

                  <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-2">
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="xs" />
                      Le client prend en charge les frais d&apos;essence
                    </p>
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="xs" />
                      Maximum 5 personnes dans le véhicule
                    </p>
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" size="xs" />
                      Véhicule doit être retourné dans l&apos;état initial
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
                <p className="text-sm text-emerald-700">Ce véhicule est disponible à l&apos;achat. Tous les documents sont inclus.</p>
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
              title="Fermer"
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
              title="Fermer"
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
                      title="Supprimer la photo"
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
                      title="Supprimer la photo"
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
                  title="Prix du véhicule"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Kilométrage (km)</label>
                <input
                  title="Kilométrage du véhicule"
                  type="number"
                  value={editMileage}
                  onChange={(e) => setEditMileage(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Statut</label>
                <select
                  title="Statut du véhicule"
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
                  title="Type de carburant"
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
                  title="Type de transmission"
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
                        title="Durée de la garantie"
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
                        title="Durée de l'assurance"
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

  const renderAddModal = () => {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fadeIn bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white p-8 border-b border-slate-100 flex justify-between items-center z-20">
            <div>
              <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shadow-inner">
                  <FontAwesomeIcon icon={faCar} />
                </span>
                Nouveau véhicule
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${addStep >= 1 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-200'} transition-all`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${addStep === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Infos Base</span>
                </div>
                <div className="w-8 h-px bg-slate-100" />
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${addStep >= 2 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-200'} transition-all`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${addStep === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Options</span>
                </div>
              </div>
            </div>
            <button
              title="Fermer"
              onClick={() => setIsAdding(false)}
              className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-white border border-slate-100 transition-all flex items-center justify-center shadow-sm"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="p-8">
            {addStep === 1 ? (
              <div className="space-y-8 animate-fadeIn">
                {/* Photo Upload Section */}
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-6 block">
                    Photos du véhicule ({addPhotos.length}/10)
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {addPhotos.map((file, index) => (
                      <div key={index} className="relative w-28 h-28 rounded-2xl overflow-hidden group/photo border-2 border-white shadow-lg">
                        <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                        <button
                          title="Supprimer la photo"
                          onClick={() => setAddPhotos(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover/photo:opacity-100 transition-all z-10 shadow-xl"
                        >
                          <FontAwesomeIcon icon={faTimesCircle} />
                        </button>
                      </div>
                    ))}
                    {addPhotos.length < 10 && (
                      <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all text-slate-400 hover:text-orange-500 group shadow-sm">
                        <FontAwesomeIcon icon={faImage} size="xl" className="group-hover:scale-110 transition-transform text-slate-300 group-hover:text-orange-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest mt-3 transition-colors">Ajouter</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const files = Array.from(e.target.files);
                              setAddPhotos(prev => [...prev, ...files].slice(0, 10));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Marque</label>
                    <div className="relative">
                      <input
                        type="text"
                        list="marques-list"
                        value={addMarque}
                        onChange={(e) => setAddMarque(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                        placeholder="Ex: Toyota"
                      />
                      <datalist id="marques-list">
                        {marquesList.map((m, i) => (
                          <option key={i} value={m.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Modèle</label>
                    <input
                      type="text"
                      value={addModel}
                      onChange={(e) => setAddModel(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                      placeholder="Corolla"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Année</label>
                    <input
                      title="Année du véhicule"
                      type="number"
                      value={addYear}
                      onChange={(e) => setAddYear(Number(e.target.value))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div className="space-y-2 text-orange-600">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Prix (FCFA)</label>
                    <div className="relative">
                      <input
                        title="Prix du véhicule"
                        type="number"
                        value={addPrice}
                        onChange={(e) => setAddPrice(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-orange-50/50 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-black text-orange-600 transition-all text-xl"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-orange-300">FCFA</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Kilométrage (km)</label>
                    <input
                      title="Kilométrage du véhicule"
                      type="number"
                      value={addMileage}
                      onChange={(e) => setAddMileage(Number(e.target.value))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Catégorie</label>
                    <select
                      title="Catégorie du véhicule"
                      value={addCategory}
                      onChange={(e) => setAddCategory(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Économique">Économique</option>
                      <option value="Luxe">Luxe</option>
                      <option value="4x4">4x4 / SUV</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Carburant</label>
                    <select
                      title="Type de carburant"
                      value={addFuelType}
                      onChange={(e) => setAddFuelType(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
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
                      title="Type de transmission"
                      value={addTransmission}
                      onChange={(e) => setAddTransmission(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="MANUAL">Manuelle</option>
                      <option value="AUTOMATIC">Automatique</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Parking de rattachement *</label>
                    <select
                      title="Sélectionner un parking"
                      value={addParkingId}
                      onChange={(e) => setAddParkingId(e.target.value)}
                      className="w-full px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-indigo-700 appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner un parking</option>
                      {parkingsList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name || `Parking #${p.id}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                    <textarea
                      value={addDescription}
                      onChange={(e) => setAddDescription(e.target.value)}
                      rows={3}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-bold text-slate-700 resize-none transition-all focus:ring-4 focus:ring-orange-500/10"
                      placeholder="Décrivez l'état général du véhicule..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Disponibilités obligatoires</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Choisissez les modes d&apos;exploitation du véhicule</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAddForSale(!addForSale)}
                      className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center gap-2 ${addForSale ? 'bg-orange-500 text-white border-orange-600 shadow-xl shadow-orange-500/20' : 'bg-white text-slate-400 border-slate-100'}`}
                    >
                      <FontAwesomeIcon icon={faTag} />
                      Vente
                    </button>
                    <button
                      onClick={() => setAddForRent(!addForRent)}
                      className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center gap-2 ${addForRent ? 'bg-indigo-500 text-white border-indigo-600 shadow-xl shadow-indigo-500/20' : 'bg-white text-slate-400 border-slate-100'}`}
                    >
                      <FontAwesomeIcon icon={faClockRegular} />
                      Location
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (!addMarque || !addModel || !addPrice || !addParkingId || addPhotos.length === 0 || (!addForSale && !addForRent)) {
                        const missingFields = [];
                        if (!addMarque) missingFields.push("la marque");
                        if (!addModel) missingFields.push("le modèle");
                        if (!addPrice) missingFields.push("le prix");
                        if (!addParkingId) missingFields.push("le parking");
                        if (addPhotos.length === 0) missingFields.push("au moins une photo");
                        if (!addForSale && !addForRent) missingFields.push("un type (Vente ou Location)");

                        showNotification('warning', "Champs requis", `Veuillez renseigner ${missingFields.join(', ')}.`);
                        return;
                      }
                      setAddStep(2);
                    }}
                    className="group px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:bg-black transition-all flex items-center gap-4 active:scale-95"
                  >
                    Suivant
                    <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform text-orange-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[
                    { id: 'garantie', label: 'Garantie', state: addGarantie, setter: setAddGarantie, icon: faShieldAlt, color: 'emerald' },
                    { id: 'assurance', label: 'Assurance', state: addAssurance, setter: setAddAssurance, icon: faCheckCircle, color: 'blue' },
                    { id: 'chauffeur', label: 'Chauffeur', state: addChauffeur, setter: setAddChauffeur, icon: faUserTie, color: 'purple' },
                    { id: 'carteGrise', label: 'Carte Grise', state: addCarteGrise, setter: setAddCarteGrise, icon: faFileContract, color: 'rose' },
                    { id: 'vignette', label: 'Vignette', state: addVignette, setter: setAddVignette, icon: faCertificate, color: 'amber' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => opt.setter(!opt.state)}
                      className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all duration-500 group ${opt.state
                        ? `bg-white border-${opt.color}-200 shadow-xl shadow-slate-200/50`
                        : 'bg-slate-50 border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${opt.state ? `bg-${opt.color}-100 text-${opt.color}-500 shadow-inner` : 'bg-slate-200 text-slate-400 group-hover:scale-110'}`}>
                        <FontAwesomeIcon icon={opt.icon} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest text-center ${opt.state ? 'text-slate-900' : 'text-slate-400'}`}>
                        {opt.label}
                      </span>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${opt.state ? `bg-${opt.color}-500/20` : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-2 h-2 rounded-full transition-all duration-300 ${opt.state ? 'right-1 bg-white shadow-sm scale-125' : 'left-1 bg-slate-400'}`} />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {addGarantie && (
                    <div className="space-y-3 p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 animate-slideDown">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <FontAwesomeIcon icon={faShieldAlt} size="xs" />
                        </div>
                        <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Durée de Garantie</label>
                      </div>
                      <select
                        title="Durée de la garantie"
                        value={addDureeGarantie}
                        onChange={(e) => setAddDureeGarantie(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-white border border-emerald-100 rounded-2xl outline-none font-bold text-emerald-700 cursor-pointer hover:border-emerald-300 transition-all appearance-none"
                      >
                        <option value={0}>Non spécifiée</option>
                        {[3, 6, 12, 24, 36].map(m => <option key={m} value={m}>{m} mois</option>)}
                      </select>
                    </div>
                  )}

                  {addAssurance && (
                    <div className="space-y-3 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 animate-slideDown">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                        </div>
                        <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Durée d&apos;Assurance</label>
                      </div>
                      <select
                        title="Durée de l'assurance"
                        value={addDureeAssurance}
                        onChange={(e) => setAddDureeAssurance(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-white border border-blue-100 rounded-2xl outline-none font-bold text-blue-700 cursor-pointer hover:border-blue-300 transition-all appearance-none"
                      >
                        <option value={0}>Non spécifiée</option>
                        {[3, 6, 12, 24].map(m => <option key={m} value={m}>{m} mois</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-12">
                  <button
                    onClick={() => setAddStep(1)}
                    className="px-10 py-5 bg-white border border-slate-200 text-slate-400 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:text-slate-900 hover:border-slate-400 transition-all active:scale-95 flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Précédent
                  </button>
                  <button
                    onClick={handleAddSubmit}
                    disabled={savingAdd}
                    className="flex-1 px-12 py-5 bg-orange-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-orange-500/40 hover:bg-orange-600 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {savingAdd ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        Confirmer l&apos;ajout
                        <FontAwesomeIcon icon={faCheck} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
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
            title="Retour à l'inventaire"
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

      {/* Notification Toast Component */}
      {notification.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] animate-in notification-fade-in slide-in-from-top-10 duration-500 w-full max-w-md px-4">
          <div className="relative group">
            <div className={`absolute -inset-0.5 blur-xl opacity-50 group-hover:opacity-100 transition duration-500 rounded-[2.5rem] ${notification.type === 'success' ? 'bg-emerald-500' :
              notification.type === 'error' ? 'bg-rose-500' :
                notification.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
              }`}></div>

            <div className={`relative px-8 py-6 rounded-[2rem] border backdrop-blur-3xl shadow-2xl min-w-[320px] max-w-md ${notification.type === 'success' ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900' :
              notification.type === 'error' ? 'bg-rose-50/80 border-rose-100 text-rose-900' :
                notification.type === 'warning' ? 'bg-amber-50/80 border-amber-100 text-amber-900' : 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
              }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${notification.type === 'success' ? 'bg-emerald-500 text-white' :
                  notification.type === 'error' ? 'bg-rose-500 text-white' :
                    notification.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                  }`}>
                  <FontAwesomeIcon icon={
                    notification.type === 'success' ? faCheck :
                      notification.type === 'error' ? faTimes :
                        notification.type === 'warning' ? faExclamationTriangle : faInfoCircle
                  } className="text-xl" />
                </div>

                <div className="flex-1 pt-1">
                  <h3 className="font-black text-sm uppercase tracking-widest">{notification.message}</h3>
                  {notification.details && (
                    <p className="mt-2 text-xs font-bold opacity-70 leading-relaxed italic border-l-2 border-current pl-3">
                      {notification.details}
                    </p>
                  )}
                </div>

                <button
                  title="Fermer la notification"
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs opacity-40" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {modalVisible && renderReservationModal()}
      {modalPayVisible && renderPaymentModal()}
      {isEditing && renderEditModal()}
      {isAdding && renderAddModal()}
    </div>
  );
}