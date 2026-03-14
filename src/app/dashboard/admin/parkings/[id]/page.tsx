"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as mobilityApiModule from "@/services/mobility-api";
import {
  MapPin,
  Mail,
  Phone,
  User as UserIcon,
  Car,
  Package,
  ShoppingCart,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Save,
  Edit,
  ChevronDown,
  ChevronUp,
  Fuel,
  Gauge,
  Users,
} from "lucide-react";

// ==================== TYPES ====================
interface Vehicle {
  id: number;
  prix: number;
  description: string;
  photos: string[];
  garantie: boolean;
  dureeGarantie: number;
  chauffeur: boolean;
  status: string;
  fuelType: string;
  mileage: number;
  model: string;
  year: number | null;
  transmission: string;
  forRent: boolean;
  forSale: boolean;
  reservations?: Reservation[];
}

interface Reservation {
  id: number;
  type: "LOCATION" | "ACHAT";
  date: string;
  status: string;
  user: User;
  vehicleId: number;
}

interface User {
  id: number;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  nom?: string;
  prenom?: string;
}

interface Parking {
  id: number;
  name: string;
  address: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
  city?: string;
  phone?: string;
  email?: string;
  description?: string;
  logo?: string;
  user?: User;
  vehicles?: Vehicle[];
  hoursOfOperation?: string;
}

// ==================== COMPOSANTS ====================

// Modale de détail du véhicule
function VehicleDetailModal({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            {vehicle.model} - Détails
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <img
                  src={vehicle.photos[0]}
                  alt={vehicle.model}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  <Car size={64} />
                </div>
              )}
              {vehicle.photos && vehicle.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {vehicle.photos.slice(1, 5).map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`${vehicle.model} ${idx + 2}`}
                      className="w-full h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Informations détaillées */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {vehicle.model} ({vehicle.year || "Année inconnue"})
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {vehicle.prix?.toLocaleString()} FCFA
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Fuel size={18} className="text-gray-400" />
                  <span>Carburant : {vehicle.fuelType || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Gauge size={18} className="text-gray-400" />
                  <span>Kilométrage : {vehicle.mileage?.toLocaleString()} km</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Car size={18} className="text-gray-400" />
                  <span>Transmission : {vehicle.transmission || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={18} className="text-gray-400" />
                  <span>Année : {vehicle.year || "N/A"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {vehicle.forRent && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    Disponible à la location
                  </span>
                )}
                {vehicle.forSale && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Disponible à la vente
                  </span>
                )}
                {vehicle.garantie && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle size={14} /> Garantie {vehicle.dureeGarantie} mois
                  </span>
                )}
                {vehicle.chauffeur && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Users size={14} /> Chauffeur inclus
                  </span>
                )}
              </div>

              {vehicle.description && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600">{vehicle.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Statistiques des transactions</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Package size={18} />
                    <span>
                      {vehicle.reservations?.filter((r) => r.type === "LOCATION").length || 0} locations
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <ShoppingCart size={18} />
                    <span>
                      {vehicle.reservations?.filter((r) => r.type === "ACHAT").length || 0} achats
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Carte véhicule
function VehicleCard({
  vehicle,
  onViewDetails,
}: {
  vehicle: Vehicle;
  onViewDetails: (vehicleId: number) => void;
}) {
  const locations = vehicle.reservations?.filter((r) => r.type === "LOCATION").length || 0;
  const achats = vehicle.reservations?.filter((r) => r.type === "ACHAT").length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="h-48 bg-gray-200 relative">
        {vehicle.photos && vehicle.photos.length > 0 ? (
          <img
            src={vehicle.photos[0]}
            alt={vehicle.model}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Car size={48} />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {vehicle.forRent && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Location</span>
          )}
          {vehicle.forSale && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Vente</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{vehicle.model || "Modèle inconnu"}</h3>
        <p className="text-gray-600 text-sm mb-2">{vehicle.year || "Année ?"}</p>
        <p className="text-orange-600 font-semibold">{vehicle.prix?.toLocaleString()} FCFA</p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {vehicle.garantie && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Garantie</span>
          )}
          {vehicle.chauffeur && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Chauffeur</span>
          )}
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {vehicle.fuelType}
          </span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {vehicle.transmission}
          </span>
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t text-sm">
          <div className="flex items-center gap-1 text-blue-600">
            <Package size={16} />
            <span>{locations} locations</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <ShoppingCart size={16} />
            <span>{achats} achats</span>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(vehicle.id)}
          className="mt-3 w-full py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Eye size={16} /> Voir détails
        </button>
      </div>
    </div>
  );
}

// Transaction individuelle
function TransactionItem({ reservation }: { reservation: Reservation }) {
  const user = reservation.user;
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
          {user?.prenom?.charAt(0) || user?.nom?.charAt(0) || "U"}
        </div>
        <div>
          <p className="font-medium">
            {user?.prenom} {user?.nom}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            reservation.type === "LOCATION"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {reservation.type === "LOCATION" ? "Location" : "Achat"}
        </span>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(reservation.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

// Liste des transactions avec "Voir plus"
function TransactionListWithMore({ reservations }: { reservations: Reservation[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? reservations : reservations.slice(0, 3);
  const hasMore = reservations.length > 3;

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-orange-600" /> Transactions récentes
        </h2>
        <p className="text-gray-500 text-center py-8">Aucune transaction</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Calendar size={20} className="text-orange-600" /> Transactions récentes
      </h2>
      <div className="space-y-3">
        {displayed.map((res) => (
          <TransactionItem key={res.id} reservation={res} />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center justify-center gap-1 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {showAll ? (
            <>
              <ChevronUp size={16} /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Voir les {reservations.length - 3} autres transactions
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Bouton Activer/Désactiver avec confirmation
function ToggleStatusButton({
  currentStatus,
  onToggle,
}: {
  currentStatus: "ACTIVE" | "INACTIVE";
  onToggle: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const action = currentStatus === "ACTIVE" ? "désactiver" : "activer";
    if (confirm(`Êtes-vous sûr de vouloir ${action} ce parking ?`)) {
      startTransition(async () => {
        await onToggle();
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-5 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
        currentStatus === "ACTIVE"
          ? "bg-yellow-600 hover:bg-yellow-700"
          : "bg-green-600 hover:bg-green-700"
      } disabled:opacity-50`}
    >
      {currentStatus === "ACTIVE" ? (
        <>
          <XCircle size={18} /> {isPending ? "Désactivation..." : "Désactiver"}
        </>
      ) : (
        <>
          <CheckCircle size={18} /> {isPending ? "Activation..." : "Activer"}
        </>
      )}
    </button>
  );
}

// Formulaire d'édition inline
function EditParkingInline({ parking, onUpdate }: { parking: Parking; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: parking.name || "",
    address: parking.address || "",
    phone: parking.phone || "",
    email: parking.email || "",
    city: parking.city || "",
    description: parking.description || "",
    capacity: parking.capacity || 0,
    hoursOfOperation: parking.hoursOfOperation || "05:00 - 00:00",
    logo: parking.logo || "",
    status: parking.status || "ACTIVE",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        description: formData.description,
        capacity: formData.capacity,
        hoursOfOperation: formData.hoursOfOperation,
        logo: formData.logo,
        status: formData.status,
      };

      await mobilityApiModule.mobilityAPI.updateParkingInfo(parking.id, updatedData);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
      >
        <Edit size={18} /> Modifier
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 mt-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Modifier le parking</h2>
        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-lg">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom du parking */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du parking *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Adresse complète */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Capacité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacité (places) *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleNumberChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Heures d'ouverture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heures d'ouverture
            </label>
            <input
              type="text"
              name="hoursOfOperation"
              value={formData.hoursOfOperation}
              onChange={handleChange}
              placeholder="ex: 05:00 - 00:00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </select>
          </div>

          {/* URL du logo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL du logo
            </label>
            <input
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {formData.logo && (
              <div className="mt-2">
                <img src={formData.logo} alt="Logo" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? "Modification..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==================== PAGE PRINCIPALE ====================
export default function ParkingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [parking, setParking] = useState<Parking | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 [Page] Contenu du module mobility-api:", mobilityApiModule);
    console.log("🔍 [Page] mobilityAPI exporté:", mobilityApiModule.mobilityAPI);
    
    const api = mobilityApiModule.mobilityAPI;
    
    if (!api) {
      console.error("❌ [Page] mobilityAPI est undefined");
      setError("Erreur de chargement de l'API");
      setLoading(false);
      return;
    }

    console.log("✅ [Page] mobilityAPI est défini", api);
    console.log("✅ [Page] isAuthenticated existe?", typeof api.isAuthenticated === 'function');

    const fetchParking = async () => {
      try {
        if (typeof api.isAuthenticated === 'function' && !api.isAuthenticated()) {
          console.log("🔍 [Page] Non authentifié, redirection vers login");
          router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
          return;
        }

        const { id } = await params;
        console.log("🔍 [Page] Fetching parking ID:", id);
        
        if (typeof api.getParkingById !== 'function') {
          console.error("❌ [Page] getParkingById n'est pas une fonction");
          setError("Erreur API - méthode getParkingById manquante");
          setLoading(false);
          return;
        }

        const data = await api.getParkingById(parseInt(id));
        console.log("🔍 [Page] Parking data reçue:", data);
        
        if (!data) {
          setError("Parking introuvable");
        } else {
          setParking(data);
          
          try {
            if (typeof api.getAdminReservations === 'function') {
              console.log("🔍 [Page] Chargement des réservations...");
              const allReservations = await api.getAdminReservations();
              const parkingReservations = allReservations.filter(
                (r: any) => r.vehicle?.parkingId === parseInt(id)
              );
              console.log("🔍 [Page] Réservations trouvées:", parkingReservations.length);
              setReservations(parkingReservations);
            }
          } catch (resError) {
            console.error("❌ [Page] Erreur chargement réservations:", resError);
          }
        }
      } catch (err: any) {
        console.error("❌ [Page] Erreur détaillée:", err);
        
        if (err.message?.includes('401') || err.message?.includes('Non authentifié')) {
          router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        } else {
          setError(err.message || "Erreur lors du chargement");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchParking();
  }, [params, router]);

  const handleViewVehicle = async (vehicleId: number) => {
    const api = mobilityApiModule.mobilityAPI;
    setLoadingVehicle(true);
    setVehicleError(null);
    try {
      if (typeof api.getVehiculeById !== 'function') {
        throw new Error("Méthode getVehiculeById non disponible");
      }
      const vehicle = await api.getVehiculeById(vehicleId.toString());
      if (vehicle) {
        setSelectedVehicle(vehicle);
      } else {
        setVehicleError("Impossible de charger les détails du véhicule.");
      }
    } catch (error) {
      setVehicleError("Erreur lors du chargement.");
    } finally {
      setLoadingVehicle(false);
    }
  };

  const handleToggle = async () => {
    if (!parking) return;
    const api = mobilityApiModule.mobilityAPI;
    const newStatus = parking.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      // Utiliser la même méthode updateParkingInfo que pour la modification
      // mais seulement avec le champ status
      await api.updateParkingInfo(parking.id, { status: newStatus });
      const { id } = await params;
      const updated = await api.getParkingById(parseInt(id));
      setParking(updated);
    } catch (error: any) {
      alert(error.message || "Échec de la mise à jour.");
    }
  };

  const refreshParking = async () => {
    const api = mobilityApiModule.mobilityAPI;
    const { id } = await params;
    const updated = await api.getParkingById(parseInt(id));
    setParking(updated);
  };

  if (loading) {
    return (
      <div className="p-10 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error || !parking) {
    return (
      <div className="p-10 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Parking introuvable</h2>
        <p className="text-gray-500 mt-2">
          {error || "Le parking demandé n'existe pas ou a été supprimé."}
        </p>
        <Link 
          href="/dashboard/admin/parkings" 
          className="mt-6 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  const vehicles = parking.vehicles || [];
  const totalLocations = reservations.filter((r) => r.type === "LOCATION").length;
  const totalAchats = reservations.filter((r) => r.type === "ACHAT").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modales */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
      
      {loadingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="text-gray-600">Chargement...</div>
          </div>
        </div>
      )}
      
      {vehicleError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-red-600">
            {vehicleError}
          </div>
        </div>
      )}

      {/* En-tête avec actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{parking.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin size={18} className="text-gray-400" />
              <span className="text-gray-600">
                {parking.address}{parking.city ? `, ${parking.city}` : ''}
              </span>
              <span
                className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  parking.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {parking.status === "ACTIVE" ? "Actif" : "Inactif"}
              </span>
            </div>
            {parking.hoursOfOperation && (
              <p className="text-sm text-gray-500 mt-1">Horaires: {parking.hoursOfOperation}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <ToggleStatusButton currentStatus={parking.status} onToggle={handleToggle} />
            <EditParkingInline parking={parking} onUpdate={refreshParking} />
          </div>
        </div>
      </div>

      {/* Grille d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Mail size={18} className="text-orange-600" /> Contact
          </h2>
          <p className="flex items-center gap-2 text-gray-600">
            <Mail size={16} className="text-gray-400" /> {parking.email || "Non renseigné"}
          </p>
          <p className="flex items-center gap-2 text-gray-600 mt-2">
            <Phone size={16} className="text-gray-400" /> {parking.phone || "Non renseigné"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <UserIcon size={18} className="text-orange-600" /> Gestionnaire
          </h2>
          {parking.user ? (
            <>
              <p className="font-medium">
                {parking.user.prenom} {parking.user.nom}
              </p>
              <p className="text-sm text-gray-500">{parking.user.email}</p>
            </>
          ) : (
            <p className="text-gray-500">Aucun gestionnaire assigné</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Car size={18} className="text-orange-600" /> Capacité
          </h2>
          <p className="text-2xl font-bold text-gray-800">{parking.capacity}</p>
          <p className="text-sm text-gray-500">places de stationnement</p>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Statistiques des transactions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Véhicules</p>
            <p className="text-3xl font-bold text-blue-700">{vehicles.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Locations</p>
            <p className="text-3xl font-bold text-green-700">{totalLocations}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Achats</p>
            <p className="text-3xl font-bold text-orange-700">{totalAchats}</p>
          </div>
        </div>
      </div>

      {/* Véhicules et transactions récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Car size={20} className="text-orange-600" /> Véhicules du parking
            </h2>
            {vehicles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun véhicule enregistré</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onViewDetails={handleViewVehicle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <TransactionListWithMore reservations={reservations} />
        </div>
      </div>
    </div>
  );
}