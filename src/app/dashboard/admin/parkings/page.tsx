"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchParkingData,
  createParking,
} from "@/libs/Parcking-api";
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
} from "lucide-react";
import type { Parking } from "@/libs/Parcking-api";

// Interface pour les utilisateurs
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

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
  const [uploadingImage, setUploadingImage] = useState(false);
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
    status: "ACTIVE",
    userId: "", // ID du gestionnaire sélectionné
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Vérifier que l'utilisateur est authentifié
        if (!mobilityAPI.isAuthenticated()) {
          console.log("Non authentifié, redirection...");
          return;
        }

        // Charger les parkings
        const parkingsData = await fetchParkingData();
        setParkings(parkingsData);
        
        // Charger les utilisateurs (gestionnaires)
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
      console.log("Récupération des utilisateurs...");
      // Vérifier que le token est présent
      const token = mobilityAPI.getToken();
      console.log("Token présent:", !!token);
      
      // Récupérer tous les utilisateurs via l'API
      const allUsers = await mobilityAPI.getAllUsers();
      console.log("Utilisateurs reçus:", allUsers);
      
      // Filtrer pour ne garder que ceux avec le rôle "PARKING"
      const parkingUsers = allUsers.filter((user: User) => user.role === "PARKING");
      console.log("Gestionnaires trouvés:", parkingUsers.length);
      setUsers(parkingUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setAddError("Impossible de charger la liste des gestionnaires. Vérifiez votre connexion.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParkings = parkings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(parkings.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Gestion du formulaire d'ajout
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewParking(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParking(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewParking(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewParking(prev => ({ ...prev, [name]: value }));
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Créer une URL de prévisualisation
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Mettre à jour l'URL du logo (temporairement)
      setNewParking(prev => ({ ...prev, logo: url }));
    }
  };

  // Fonction d'upload d'image vers un service de stockage
  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);

      // Appel à votre API d'upload (à adapter selon votre backend)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const data = await response.json();
      return data.url; // L'URL de l'image uploadée
    } catch (error) {
      console.error("Erreur upload:", error);
      throw error;
    } finally {
      setUploadingImage(false);
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
      console.log("Token pour création:", !!token);
      
      // Si un fichier est sélectionné, on l'upload d'abord
      let logoUrl = newParking.logo;
      if (selectedFile) {
        try {
          logoUrl = await uploadImage(selectedFile);
        } catch (uploadError) {
          throw new Error("Erreur lors de l'upload du logo");
        }
      }
      
      // Préparer les données
      const parkingData = {
        name: newParking.name,
        address: newParking.address,
        city: newParking.city,
        capacity: newParking.capacity,
        email: newParking.email || null,
        phone: newParking.phone || null,
        description: newParking.description || null,
        hoursOfOperation: newParking.hoursOfOperation,
        logo: logoUrl || null,
        status: newParking.status,
        userId: parseInt(newParking.userId),
      };
      
      console.log("Données envoyées avec logo:", parkingData.logo);
      
      const createdParking = await createParking(parkingData, token || undefined);
      
      console.log("Parking créé avec logo:", createdParking.logo);
      
      setParkings(prev => [...prev, createdParking]);
      
      // Réinitialiser le formulaire
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
      
    } catch (err: any) {
      console.error("Erreur création parking:", err);
      setAddError(err.message || "Une erreur est survenue");
    } finally {
      setIsAdding(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
        status === "ACTIVE"
          ? "bg-green-100 text-green-600"
          : status === "INACTIVE"
          ? "bg-yellow-100 text-yellow-600"
          : "bg-red-100 text-red-600"
      }`}
    >
      {status === "ACTIVE" ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {status}
    </span>
  );

  // Composant Logo amélioré avec meilleure gestion des erreurs d'image
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg ${
              view === "list"
                ? "bg-orange-100 text-orange-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title="Vue liste"
          >
            <Table size={20} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg ${
              view === "grid"
                ? "bg-orange-100 text-orange-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title="Vue grille"
          >
            <Grid3x3 size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Afficher</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-4 text-left">Logo</th>
                <th className="p-4 text-left">Nom</th>
                <th className="p-4 text-left">Adresse</th>
                <th className="p-4 text-left">Places</th>
                <th className="p-4 text-left">Gestionnaire</th>
                <th className="p-4 text-left">Statut</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentParkings.map((parking) => (
                <tr key={parking.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">
                    <Logo src={parking.logo} name={parking.name} />
                  </td>
                  <td className="p-4 font-semibold text-gray-700">{parking.name}</td>
                  <td className="p-4 text-gray-600">{parking.address}</td>
                  <td className="p-4 text-gray-600">{parking.capacity}</td>
                  <td className="p-4 text-gray-600">
                    {parking.user ? `${parking.user.prenom} ${parking.user.nom}` : "—"}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={parking.status} />
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/admin/parkings/${parking.id}`}
                      className="text-orange-600 hover:text-orange-800 font-medium inline-flex items-center gap-1"
                    >
                      <Eye size={16} /> Voir détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentParkings.length === 0 && (
            <div className="p-6 text-center text-gray-500">Aucun parking trouvé</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentParkings.map((parking) => (
            <div key={parking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-4 border-b flex items-center justify-between">
                <Logo src={parking.logo} name={parking.name} />
                <StatusBadge status={parking.status} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{parking.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{parking.address}</p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Capacité :</span> {parking.capacity} places
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Gestionnaire :</span>{" "}
                  {parking.user ? `${parking.user.prenom} ${parking.user.nom}` : "—"}
                </p>
                {parking.city && (
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Ville :</span> {parking.city}
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t">
                <Link
                  href={`/dashboard/admin/parkings/${parking.id}`}
                  className="text-orange-600 hover:text-orange-800 font-medium inline-flex items-center gap-1"
                >
                  <Eye size={16} /> Voir détail
                </Link>
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

                {/* Gestionnaire (liste des utilisateurs PARKING) */}
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

                {/* Upload du logo */}
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
                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 size={18} className="animate-spin" />
                        Upload en cours...
                      </div>
                    )}
                  </div>
                  
                  {/* Aperçu de l'image */}
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
                  disabled={isAdding || !newParking.userId || uploadingImage}
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