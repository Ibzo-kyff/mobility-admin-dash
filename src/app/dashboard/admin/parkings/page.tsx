"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchParkingData,
  deleteParkingApi,
} from "@/services/Parcking-api";
import { mobilityAPI } from "@/services/mobility-api";
import {
  Eye,
  CheckCircle,
  XCircle,
  Grid3x3,
  Table,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Loader2,
  Trash2,
  Filter,
} from "lucide-react";
import type { Parking } from "@/services/Parcking-api";

// Interface pour les utilisateurs
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://parkapp-pi.vercel.app/api";

export default function ParkingsPage() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // États pour la modale d'ajout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // État pour l'upload de fichier
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // État du formulaire avec tous les champs de la base
  const [newParking, setNewParking] = useState({
    name: "",
    address: "",
    city: "",
    capacity: 1,
    email: "",
    phone: "",
    description: "",
    hoursOfOperation: "05:00 - 00:00",
    logo: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    userId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!mobilityAPI.isAuthenticated()) {
          console.log("Non authentifié, redirection...");
          return;
        }

        const parkingsData = await fetchParkingData();
        setParkings(parkingsData);
        
        await fetchUsers();
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await mobilityAPI.getAllUsers();
      const parkingUsers = allUsers.filter((user: User) => user.role === "PARKING");
      setUsers(parkingUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setAddError("Impossible de charger la liste des gestionnaires. Vérifiez votre connexion.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filtered parkings list
  const filteredParkings = parkings.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParkings = filteredParkings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredParkings.length / itemsPerPage));

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewParking((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParking((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewParking((prev) => ({ ...prev, [name]: value as "ACTIVE" | "INACTIVE" }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewParking((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddParking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError(null);

    try {
      if (!newParking.userId) {
        throw new Error("Veuillez sélectionner un gestionnaire");
      }

      const token = mobilityAPI.getToken();
      
      const formData = new FormData();
      formData.append("name", newParking.name);
      formData.append("address", newParking.address);
      formData.append("city", newParking.city);
      formData.append("capacity", String(newParking.capacity));
      formData.append("email", newParking.email || "");
      formData.append("phone", newParking.phone || "");
      formData.append("description", newParking.description || "");
      formData.append("hoursOfOperation", newParking.hoursOfOperation);
      formData.append("status", newParking.status);
      formData.append("userId", newParking.userId);
      
      if (selectedFile) {
        formData.append("logo", selectedFile);
      }
      
      const response = await fetch(`${BASE_URL}/parkings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorData}`);
      }

      const createdParking = await response.json();
      
      setParkings((prev) => [...prev, createdParking]);
      
      setIsModalOpen(false);
      setNewParking({
        name: "",
        address: "",
        city: "",
        capacity: 1,
        email: "",
        phone: "",
        description: "",
        hoursOfOperation: "05:00 - 00:00",
        logo: "",
        status: "ACTIVE",
        userId: "",
      });
      setSelectedFile(null);
      setPreviewUrl("");
      
    } catch (err: unknown) {
      console.error("Erreur création parking:", err);
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setAddError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteParking = async (id: number, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le parking "${name}" ? Cette action est définitive.`)) return;
    try {
      const token = mobilityAPI.getToken() || undefined;
      const ok = await deleteParkingApi(id, token);
      if (ok) {
        setParkings((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Échec de la suppression du parking");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const getBadgeStyle = () => {
      switch (status) {
        case "ACTIVE":
          return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "INACTIVE":
          return "bg-amber-100 text-amber-700 border-amber-200";
        case "BLOCKED":
          return "bg-red-100 text-red-700 border-red-200";
        case "PENDING":
          return "bg-blue-100 text-blue-700 border-blue-200";
        case "REJECTED":
          return "bg-slate-100 text-slate-700 border-slate-200";
        default:
          return "bg-gray-100 text-gray-700 border-gray-200";
      }
    };

    const getLabel = () => {
      switch (status) {
        case "ACTIVE": return "Actif";
        case "INACTIVE": return "Inactif";
        case "BLOCKED": return "Bloqué";
        case "PENDING": return "En attente";
        case "REJECTED": return "Rejeté";
        default: return status || "Inconnu";
      }
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${getBadgeStyle()}`}>
        {status === "ACTIVE" ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {getLabel()}
      </span>
    );
  };

  const Logo = ({ src, name }: { src?: string | null; name: string }) => {
    const [imageError, setImageError] = useState(false);
    
    if (src && !imageError) {
      return (
        <div className="w-10 h-10 relative">
          <img
            src={src}
            alt={`Logo de ${name}`}
            className="w-10 h-10 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400" title={name}>
        <ImageIcon size={20} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête avec bouton d'ajout */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Parkings & Gestionnaires
          </h1>
          <p className="text-gray-500 mt-2">
            Gestion complète des parkings enregistrés
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus size={20} /> Ajouter un parking
        </button>
      </div>

      {/* Barre d'outils */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filtre par Statut */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="INACTIVE">Inactifs</option>
              <option value="BLOCKED">Bloqués</option>
              <option value="PENDING">En attente</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition ${
                view === "list"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Vue liste"
            >
              <Table size={18} />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition ${
                view === "grid"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Vue grille"
            >
              <Grid3x3 size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Afficher</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">par page</span>
        </div>
      </div>

      {/* Contenu principal */}
      {view === "list" ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left">Logo</th>
                <th className="p-4 text-left">Nom</th>
                <th className="p-4 text-left">Adresse</th>
                <th className="p-4 text-left">Places</th>
                <th className="p-4 text-left">Gestionnaire</th>
                <th className="p-4 text-left">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentParkings.map((parking) => (
                <tr key={parking.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">
                    <Logo src={parking.logo} name={parking.name} />
                  </td>
                  <td className="p-4 font-bold text-gray-800">{parking.name}</td>
                  <td className="p-4 text-gray-600 text-sm">{parking.address}</td>
                  <td className="p-4 text-gray-600 text-sm font-semibold">{parking.capacity}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    {parking.user ? `${parking.user.prenom} ${parking.user.nom}` : "—"}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={parking.status} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/parkings/${parking.id}`}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        <Eye size={14} /> Détail
                      </Link>
                      <button
                        onClick={() => handleDeleteParking(parking.id, parking.name)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                        title="Supprimer le parking"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentParkings.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-medium">
              Aucun parking correspondant aux critères
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentParkings.map((parking) => (
            <div key={parking.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="p-4 border-b flex items-center justify-between">
                  <Logo src={parking.logo} name={parking.name} />
                  <StatusBadge status={parking.status} />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg text-gray-800">{parking.name}</h3>
                  <p className="text-gray-600 text-sm">{parking.address}</p>
                  <div className="pt-2 text-xs space-y-1 text-gray-600 border-t border-gray-100">
                    <p>
                      <span className="font-bold text-gray-700">Capacité :</span> {parking.capacity} places
                    </p>
                    <p>
                      <span className="font-bold text-gray-700">Gestionnaire :</span>{" "}
                      {parking.user ? `${parking.user.prenom} ${parking.user.nom}` : "—"}
                    </p>
                    {parking.city && (
                      <p>
                        <span className="font-bold text-gray-700">Ville :</span> {parking.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                <Link
                  href={`/dashboard/admin/parkings/${parking.id}`}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 transition"
                >
                  <Eye size={14} /> Voir détail
                </Link>
                <button
                  onClick={() => handleDeleteParking(parking.id, parking.name)}
                  className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition"
                  title="Supprimer le parking"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {parkings.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Affichage de {indexOfFirstItem + 1} à{" "}
            {Math.min(indexOfLastItem, parkings.length)} sur {parkings.length} parkings
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Modale d'ajout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Ajouter un parking</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddParking} className="p-6 space-y-4">
              {addError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {addError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom du parking */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du parking *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newParking.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Adresse */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newParking.address}
                    onChange={handleInputChange}
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
                    value={newParking.city}
                    onChange={handleInputChange}
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
                    value={newParking.capacity}
                    onChange={handleNumberChange}
                    required
                    min="1"
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
                    value={newParking.phone}
                    onChange={handleInputChange}
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
                    value={newParking.email}
                    onChange={handleInputChange}
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
                    value={newParking.hoursOfOperation}
                    onChange={handleInputChange}
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
                    value={newParking.status}
                    onChange={handleStatusChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Inactif</option>
                  </select>
                </div>

                {/* Gestionnaire */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gestionnaire *
                  </label>
                  <select
                    name="userId"
                    value={newParking.userId}
                    onChange={handleSelectChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un gestionnaire</option>
                    {loadingUsers ? (
                      <option value="" disabled>Chargement des gestionnaires...</option>
                    ) : users.length === 0 ? (
                      <option value="" disabled>Aucun gestionnaire disponible</option>
                    ) : (
                      users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.prenom} {user.nom} - {user.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Logo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo du parking
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                        <Upload size={18} />
                        Choisir une image
                      </div>
                    </label>
                  </div>
                  
                  {(previewUrl || newParking.logo) && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Aperçu :</p>
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={previewUrl || newParking.logo}
                          alt="Aperçu du logo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/128?text=Erreur';
                          }}
                        />
                      </div>
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
                    value={newParking.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newParking.userId}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Ajouter"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}