/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getParkingById,
  updateParkingStatus,
  blockParking,
  deleteParkingApi,
  type Parking,
  type Vehicle,
} from "@/services/Parcking-api";
import { mobilityAPI } from "@/services/mobility-api";
import EditParkingInline from "@/components/admin/EditParkingInline";
import PageLoader from "@/components/common/PageLoader";
import { getAllPhotoUrls } from "@/features/vehicles/utils/photos";
import {
  formatPrice,
  formatMileage,
  formatTransmissionForDisplay,
  getStatusColor,
  getStatusLabel,
} from "@/features/vehicles/utils/format";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  User as UserIcon,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Building,
  ShieldAlert,
  Power,
  RotateCw,
  Fuel,
  Gauge,
  Calendar,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Modal pour afficher les détails complets d'un véhicule
function VehicleDetailModal({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle;
  onClose: () => void;
}) {
  const photos = getAllPhotoUrls(vehicle?.photos);
  const [activePhoto, setActivePhoto] = useState(0);

  // Fermeture par la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!vehicle) return null;

  const vehicleName = [
    vehicle.marque || vehicle.marqueRef?.name || vehicle.brand,
    vehicle.model || vehicle.modele,
  ]
    .filter(Boolean)
    .join(" ") || "Véhicule";

  const price = vehicle.prixJour || vehicle.prix;

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[300] p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col"
      >
        {/* Header modal */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{vehicleName}</h3>
              {vehicle.status && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase border ${getStatusColor(
                    vehicle.status
                  )}`}
                >
                  {getStatusLabel(vehicle.status)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {vehicle.annee || vehicle.year ? `Année ${vehicle.annee || vehicle.year}` : "Année non renseignée"}
              {vehicle.immatriculation || vehicle.plate ? ` • Immatriculation : ${vehicle.immatriculation || vehicle.plate}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
            title="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Galerie photos */}
          {photos.length > 0 ? (
            <div className="space-y-3">
              <div className="h-72 sm:h-80 bg-slate-900 rounded-2xl overflow-hidden relative group">
                <img
                  src={photos[activePhoto] || photos[0]}
                  alt={vehicleName}
                  className="w-full h-full object-cover transition duration-300"
                />

                {/* Badges Vente / Location */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  {vehicle.forSale && (
                    <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-sm text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Vente
                    </span>
                  )}
                  {vehicle.forRent && (
                    <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Location
                    </span>
                  )}
                </div>

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevPhoto}
                      aria-label="Photo précédente"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={nextPhoto}
                      aria-label="Photo suivante"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                      {activePhoto + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Miniatures */}
              {photos.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {photos.map((photo, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActivePhoto(idx)}
                      aria-label={`Afficher la photo ${idx + 1}`}
                      className={`w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                        activePhoto === idx
                          ? "border-orange-500 ring-2 ring-orange-500/20 scale-95"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
              <Car size={56} />
            </div>
          )}

          {/* Tarifs et informations clés */}
          <div className="p-5 bg-orange-50/70 border border-orange-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Tarification</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                {price ? formatPrice(price) : "Prix sur demande"}
              </p>
            </div>
            <div className="flex gap-2">
              {vehicle.forSale && (
                <span className="px-3.5 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                  Vente
                </span>
              )}
              {vehicle.forRent && (
                <span className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                  Location
                </span>
              )}
            </div>
          </div>

          {/* Caractéristiques techniques */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-3">
              Caractéristiques techniques
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Fuel size={14} className="text-orange-500" /> Carburant
                </p>
                <p className="font-bold text-gray-800 text-sm">{vehicle.fuelType || vehicle.carburant || "Non spécifié"}</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Gauge size={14} className="text-blue-500" /> Boîte
                </p>
                <p className="font-bold text-gray-800 text-sm">
                  {formatTransmissionForDisplay(vehicle.transmission || vehicle.boite)}
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Gauge size={14} className="text-emerald-500" /> Kilométrage
                </p>
                <p className="font-bold text-gray-800 text-sm">
                  {formatMileage(vehicle.mileage || vehicle.kilometrage)}
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" /> Année
                </p>
                <p className="font-bold text-gray-800 text-sm">{vehicle.annee || vehicle.year || "—"}</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Users size={14} className="text-purple-500" /> Chauffeur
                </p>
                <p className="font-bold text-gray-800 text-sm">{vehicle.chauffeur ? "Option incluse" : "Non inclus"}</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-500" /> Garantie
                </p>
                <p className="font-bold text-gray-800 text-sm">
                  {vehicle.garantie ? `${vehicle.dureeGarantie || 6} mois` : "Sans garantie"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div>
              <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-2">
                Description du véhicule
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Carte de véhicule dans la grille du parking
function VehicleCard({
  vehicle,
  onViewDetails,
}: {
  vehicle: Vehicle;
  onViewDetails: (vehicle: Vehicle) => void;
}) {
  const photos = getAllPhotoUrls(vehicle.photos);
  const mainPhoto = photos[0] || null;

  const vehicleName = [
    vehicle.marque || vehicle.marqueRef?.name || vehicle.brand,
    vehicle.model || vehicle.modele,
  ]
    .filter(Boolean)
    .join(" ") || "Véhicule";

  const price = vehicle.prixJour || vehicle.prix;

  return (
    <div
      onClick={() => onViewDetails(vehicle)}
      className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      <div className="h-44 bg-gray-100 relative overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={vehicleName}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
            <Car size={40} />
          </div>
        )}

        {/* Badges Vente / Location - EXACTEMENT les mêmes styles que sur la page véhicule */}
        <div className="absolute top-3 left-3 flex flex-row gap-1.5 flex-wrap z-10">
          {vehicle.forSale && (
            <span className="px-2.5 py-1 bg-rose-500/90 backdrop-blur-sm text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
              Vente
            </span>
          )}

          {vehicle.forRent && (
            <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
              Location
            </span>
          )}
        </div>

        {/* Statut du véhicule */}
        {vehicle.status && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border backdrop-blur-md shadow-sm ${getStatusColor(
                vehicle.status
              )} bg-white/90`}
            >
              {getStatusLabel(vehicle.status)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-gray-800 text-base group-hover:text-orange-600 transition-colors">
              {vehicleName}
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-md">
              {vehicle.annee || vehicle.year || "—"}
            </span>
          </div>

          <p className="text-orange-600 font-black text-lg mb-3">
            {price ? formatPrice(price) : "Prix sur demande"}
          </p>

          <div className="flex flex-wrap gap-1.5 text-xs text-gray-600 mb-4">
            {(vehicle.fuelType || vehicle.carburant) && (
              <span className="bg-gray-100 px-2 py-1 rounded-md font-medium text-[11px]">
                {vehicle.fuelType || vehicle.carburant}
              </span>
            )}
            {(vehicle.transmission || vehicle.boite) && (
              <span className="bg-gray-100 px-2 py-1 rounded-md font-medium text-[11px]">
                {formatTransmissionForDisplay(vehicle.transmission || vehicle.boite)}
              </span>
            )}
            {vehicle.chauffeur && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-bold text-[11px]">
                Chauffeur
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(vehicle);
          }}
          className="w-full py-2 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <Eye size={15} /> Voir détails
        </button>
      </div>
    </div>
  );
}

export default function AdminParkingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const parkingId = params.id as string;

  const [parking, setParking] = useState<Parking | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadParkingDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = mobilityAPI.getToken() || undefined;

      // 1. Charger les infos du parking
      const data = await getParkingById(parkingId, token);
      if (!data) {
        throw new Error("Impossible de charger les informations de ce parking");
      }
      setParking(data);

      // 2. Charger les véhicules associés au parking
      try {
        const vehiclesList: Vehicle[] = await mobilityAPI.getVehicules({ parkingId: String(parkingId) });
        const filteredVehicles = Array.isArray(vehiclesList)
          ? vehiclesList.filter(
              (v: Vehicle) =>
                Number(v.parkingId || v.parking?.id) === Number(parkingId)
            )
          : [];

        if (filteredVehicles.length > 0) {
          setVehicles(filteredVehicles);
        } else if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
          setVehicles(data.vehicles as Vehicle[]);
        } else if (Array.isArray(vehiclesList) && vehiclesList.length > 0) {
          setVehicles(vehiclesList);
        } else {
          setVehicles([]);
        }
      } catch (vErr) {
        console.warn("Erreur lors de la récupération des véhicules spécifiques:", vErr);
        setVehicles((data.vehicles as Vehicle[]) || []);
      }
    } catch (err: unknown) {
      console.error("Erreur chargement parking:", err);
      const msg = err instanceof Error ? err.message : "Erreur lors du chargement des données";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [parkingId]);

  useEffect(() => {
    if (parkingId) {
      loadParkingDetails();
    }
  }, [parkingId, loadParkingDetails]);

  const handleToggleStatus = async () => {
    if (!parking) return;
    const newStatus = parking.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirmMessage = `Voulez-vous vraiment passer le statut de ce parking à ${
      newStatus === "ACTIVE" ? "ACTIF" : "INACTIF"
    } ?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(true);
      const token = mobilityAPI.getToken() || undefined;
      const success = await updateParkingStatus(parking.id, newStatus, token);
      if (success) {
        setParking((prev) => (prev ? { ...prev, status: newStatus } : null));
      } else {
        alert("Échec de la mise à jour du statut");
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockParking = async () => {
    if (!parking) return;
    if (!window.confirm("Êtes-vous sûr de vouloir bloquer ce parking ?")) return;

    try {
      setActionLoading(true);
      const token = mobilityAPI.getToken() || undefined;
      const success = await blockParking(parking.id, token);
      if (success) {
        setParking((prev) => (prev ? { ...prev, status: "BLOCKED" } : null));
      } else {
        alert("Échec du blocage du parking");
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParking = async () => {
    if (!parking) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le parking "${parking.name}" ? cette action est irréversible.`)) return;

    try {
      setActionLoading(true);
      const token = mobilityAPI.getToken() || undefined;
      const success = await deleteParkingApi(parking.id, token);
      if (success) {
        alert("Parking supprimé avec succès");
        router.push("/dashboard/admin/parkings");
      } else {
        alert("Échec de la suppression du parking");
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLoader
        fullScreen={false}
        text="Détails du parking"
        subtext="Chargement des véhicules et données du site..."
      />
    );
  }

  if (error || !parking) {
    return (
      <div className="p-10 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Parking introuvable</h2>
          <p className="text-gray-600 text-sm mb-6">
            {error || "Le parking demandé n'existe pas ou vous n'avez pas l'autorisation d'y accéder."}
          </p>
          <Link
            href="/dashboard/admin/parkings"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition"
          >
            <ArrowLeft size={18} /> Retour aux parkings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Modale détails véhicule */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* Bouton retour */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <Link
          href="/dashboard/admin/parkings"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white text-gray-700 hover:text-orange-600 rounded-xl border border-gray-200 shadow-sm font-semibold transition text-xs sm:text-sm"
        >
          <ArrowLeft size={16} /> Retour à la liste
        </Link>
        <button
          onClick={loadParkingDetails}
          className="p-2 text-gray-500 hover:text-orange-600 bg-white border border-gray-200 rounded-xl shadow-sm transition"
          title="Actualiser"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* En-tête principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex items-start gap-3.5 sm:gap-4">
            {parking.logo ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gray-100 border flex-shrink-0 shadow-sm">
                <img src={parking.logo} alt={parking.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Building size={28} />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800">{parking.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    parking.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : parking.status === "INACTIVE"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : parking.status === "BLOCKED"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : parking.status === "PENDING"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {parking.status === "ACTIVE" ? (
                    <CheckCircle size={14} />
                  ) : parking.status === "BLOCKED" ? (
                    <ShieldAlert size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {parking.status === "ACTIVE"
                    ? "Actif"
                    : parking.status === "INACTIVE"
                    ? "Inactif"
                    : parking.status === "BLOCKED"
                    ? "Bloqué"
                    : parking.status === "PENDING"
                    ? "En attente"
                    : parking.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-orange-500" />
                  {parking.address}
                  {parking.city ? `, ${parking.city}` : ""}
                </span>
                {parking.hoursOfOperation && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    {parking.hoursOfOperation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions rapides Admin */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm ${
                parking.status === "ACTIVE"
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <Power size={16} />
              {parking.status === "ACTIVE" ? "Désactiver" : "Activer"}
            </button>

            {parking.status !== "BLOCKED" && (
              <button
                onClick={handleBlockParking}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
              >
                <ShieldAlert size={16} /> Bloquer
              </button>
            )}

            <button
              onClick={handleDeleteParking}
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
            >
              <X size={16} /> Supprimer
            </button>
          </div>
        </div>

        {/* Formulaire de modification inline */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <EditParkingInline parking={parking} onUpdate={loadParkingDetails} />
        </div>
      </div>

      {/* Grille des infos clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Gestionnaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider text-orange-600">
            <UserIcon size={18} /> Gestionnaire du parking
          </h2>
          {parking.user ? (
            <div className="space-y-1.5">
              <p className="font-bold text-gray-900 text-base sm:text-lg">
                {parking.user.prenom} {parking.user.nom}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 truncate">
                <Mail size={15} className="text-gray-400 shrink-0" /> {parking.user.email}
              </p>
              {parking.user.phone && (
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={15} className="text-gray-400 shrink-0" /> {parking.user.phone}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Aucun gestionnaire associé</p>
          )}
        </div>

        {/* Contact du parking */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider text-orange-600">
            <Mail size={18} /> Coordonnées du site
          </h2>
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2 truncate">
              <Mail size={16} className="text-gray-400 shrink-0" />
              {parking.email || "Email non renseigné"}
            </p>
            <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
              <Phone size={16} className="text-gray-400 shrink-0" />
              {parking.phone || "Téléphone non renseigné"}
            </p>
          </div>
        </div>

        {/* Capacité et flotte */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider text-orange-600">
            <Car size={18} /> Capacité &amp; Flotte
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">{parking.capacity}</p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Places totales</p>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-black text-orange-600">{vehicles.length}</p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Véhicules enregistrés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description si disponible */}
      {parking.description && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">Description du parking</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{parking.description}</p>
        </div>
      )}

      {/* Section Véhicules */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Car size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Véhicules du parking</h2>
              <p className="text-xs text-gray-500 font-medium">{vehicles.length} véhicule(s) dans l&apos;inventaire</p>
            </div>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Car size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-semibold">Aucun véhicule enregistré</p>
            <p className="text-gray-400 text-sm mt-1">Ce parking n&apos;a pas encore ajouté de véhicules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onViewDetails={(v) => {
                  setSelectedVehicle(v);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
