// app/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faUserPlus,
  faUserCheck,
  faUserClock,
  faUserXmark,
  faUsers,
  faEllipsisVertical,
  faEye,
  faEdit,
  faTrash,
  faTimes,
  faSave,
  faChevronLeft,
  faChevronRight,
  faImage,
  faUser,
  faCheck,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { adminUsersService } from '@/services/admin/users';
import type { User } from '@/types';
import Image from 'next/image';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [formData, setFormData] = useState<Partial<User & { password?: string }>>({});
  const [saving, setSaving] = useState(false);

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
    if (notificationTimer.current) clearTimeout(notificationTimer.current);

    setNotification({ show: true, type, message, details });

    notificationTimer.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 6000);
  };

  // Menu dropdown state
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUsersService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setModalMode('add');
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      phone: '',
      role: 'CLIENT',
      status: 'PENDING',
      emailVerified: false,
      password: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleEditUser = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({ ...user });
    setImageFile(null);
    setImagePreview(user.image || null);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleViewUser = (user: User) => {
    setModalMode('view');
    setSelectedUser(user);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
      try {
        await adminUsersService.deleteUser(user.id);
        await loadUsers();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        showNotification('error', "Échec de suppression", "Erreur lors de la suppression de l'utilisateur : " + (error.message || "Erreur serveur"));
      }
    }
    setActiveMenu(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      if (modalMode === 'add') {
        if (!formData.password) {
          showNotification('warning', "Mot de passe requis", "Veuillez saisir un mot de passe pour le nouvel utilisateur.");
          setSaving(false);
          return;
        }

        await adminUsersService.createUser(formData as any);

      } else if (modalMode === 'edit' && selectedUser) {
        const { password, ...updateData } = formData;

        if (imageFile) {
          // Mise à jour avec image
          await adminUsersService.updateUserWithImage(selectedUser.id, updateData, imageFile);
        } else {
          // Mise à jour sans image
          await adminUsersService.updateUser(selectedUser.id, updateData);
        }
      }

      await loadUsers();
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      showNotification('success', "Action réussie", `L'utilisateur a été ${modalMode === 'add' ? 'créé' : 'mis à jour'} avec succès.`);
    } catch (error: any) {
      console.error('Error saving user:', error);
      showNotification('error', "Erreur d'enregistrement", error.message || "Une erreur est survenue lors de l'enregistrement de l'utilisateur.");
    } finally {
      setSaving(false);
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nom?.toLowerCase().includes(search.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (filterStatus !== 'all') {
      if (filterStatus === 'clients') matchesStatus = user.role === 'CLIENT';
      else if (filterStatus === 'parkings') matchesStatus = user.role === 'PARKING';
      else matchesStatus = user.status === filterStatus.toUpperCase();
    }

    let matchesDate = true;
    if (filterDate) {
      const userDate = new Date(user.createdAt).toISOString().split('T')[0];
      matchesDate = userDate === filterDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: users.length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    parkings: users.filter(u => u.role === 'PARKING').length,
    pending: users.filter(u => u.status === 'PENDING').length,
    approved: users.filter(u => u.status === 'APPROVED').length,
    rejected: users.filter(u => u.status === 'REJECTED').length,
  };

  return (
    <div className="p-2 sm:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Gestion des utilisateurs</h1>
          <p className="text-black">Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total" value={stats.total} icon={faUsers} color="bg-blue-500" />
        <StatCard title="Clients" value={stats.clients} icon={faUserCheck} color="bg-green-500" />
        <StatCard title="Parkings" value={stats.parkings} icon={faUserCheck} color="bg-purple-500" />
        <StatCard title="En attente" value={stats.pending} icon={faUserClock} color="bg-yellow-500" />
        <StatCard title="Approuvés" value={stats.approved} icon={faUserCheck} color="bg-green-500" />
        <StatCard title="Rejetés" value={stats.rejected} icon={faUserXmark} color="bg-red-500" />
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
            />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
              <option value="clients">Clients</option>
              <option value="parkings">Parkings</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {(filterStatus !== 'all' || filterDate) && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterDate('');
                }}
                className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Mobile Grid Layout for Users */}
        <div className="block md:hidden p-2 sm:p-4 space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-black shadow-sm font-bold">
              Aucun utilisateur trouvé
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div key={user.id} className="bg-slate-50/50 rounded-2xl p-3 sm:p-5 border border-slate-100/80 shadow-md shadow-slate-200/20 relative overflow-hidden flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center border border-slate-50">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={`${user.prenom} ${user.nom}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-sm font-black text-black">${user.prenom?.[0] || ''}${user.nom?.[0] || ''}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-sm font-black text-black">
                          {user.prenom?.[0]}{user.nom?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-black leading-snug">
                        {user.prenom} {user.nom}
                      </h3>
                      <p className="text-xs text-black font-bold truncate max-w-[180px] mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                      className="w-8 h-8 rounded-xl bg-slate-100 text-black hover:text-black flex items-center justify-center hover:bg-slate-200/70 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>

                    {/* Actions dropdown for mobile card */}
                    {activeMenu === user.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl z-20 border border-slate-100 py-1"
                      >
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex w-full items-center px-4 py-2.5 text-xs font-bold text-black hover:bg-slate-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-2.5 text-black" />
                          Voir détails
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="flex w-full items-center px-4 py-2.5 text-xs font-bold text-black hover:bg-slate-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-2.5 text-black" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="flex w-full items-center px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-2.5 text-rose-400" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100/50">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-black uppercase tracking-wider">Rôle & Statut</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'PARKING' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                        user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-black text-black uppercase tracking-wider">Email vérifié</p>
                    <p className={`text-[11px] font-bold mt-1 ${user.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user.emailVerified ? 'Vérifié' : 'En attente'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-black">
                  <span>Inscrit le :</span>
                  <span className="text-black font-extrabold">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Email vérifié
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-black">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={`${user.prenom} ${user.nom}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // En cas d'erreur de chargement, afficher les initiales
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<span class="text-sm font-medium text-black">${user.prenom?.[0] || ''}${user.nom?.[0] || ''}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-sm font-medium text-black">
                              {user.prenom?.[0]}{user.nom?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-black">
                            {user.prenom} {user.nom}
                          </p>
                          <p className="text-sm text-black">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'PARKING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.emailVerified ? (
                        <span className="text-green-600">Vérifié</span>
                      ) : (
                        <span className="text-yellow-600">En attente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className="text-black hover:text-black p-2 rounded-full hover:bg-gray-100"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {/* Menu déroulant */}
                      {activeMenu === user.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                        >
                          <div className="py-1">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              Voir détails
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-2" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-2" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={5}>5 par page</option>
              <option value={10}>10 par page</option>
              <option value={20}>20 par page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="px-3 py-1">
              Page {currentPage} sur {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">
                {modalMode === 'add' && 'Ajouter un utilisateur'}
                {modalMode === 'edit' && 'Modifier l\'utilisateur'}
                {modalMode === 'view' && 'Détails de l\'utilisateur'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-black hover:text-black"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'view' && selectedUser && (
                <div className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {selectedUser.image ? (
                        <img
                          src={selectedUser.image}
                          alt={`${selectedUser.prenom} ${selectedUser.nom}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-4xl text-black" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black">Nom</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.nom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Prénom</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.prenom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Email</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Téléphone</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.phone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Rôle</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.role}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Statut</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.status}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Email vérifié</label>
                      <p className="mt-1 text-sm text-black">
                        {selectedUser.emailVerified ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Date d'inscription</label>
                      <p className="mt-1 text-sm text-black">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(modalMode === 'add' || modalMode === 'edit') && (
                <div className="space-y-4">
                  {/* Champ d'upload d'image */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      <FontAwesomeIcon icon={faImage} className="mr-2" />
                      Photo de profil
                    </label>
                    <div className="flex items-center space-x-4">
                      {(imagePreview || (modalMode === 'edit' && selectedUser?.image)) && (
                        <div className="w-16 h-16 rounded-full overflow-hidden">
                          <img
                            src={imagePreview || selectedUser?.image || ''}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                    </div>
                    <p className="mt-2 text-xs text-black">
                      Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black">Nom *</label>
                      <input
                        type="text"
                        value={formData.nom || ''}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Prénom *</label>
                      <input
                        type="text"
                        value={formData.prenom || ''}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Email *</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Téléphone</label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Rôle *</label>
                      <select
                        value={formData.role || 'CLIENT'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CLIENT' | 'PARKING' | 'ADMIN' })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="CLIENT">Client</option>
                        <option value="PARKING">Parking</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">Statut *</label>
                      <select
                        value={formData.status || 'PENDING'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="PENDING">En attente</option>
                        <option value="APPROVED">Approuvé</option>
                        <option value="REJECTED">Rejeté</option>
                      </select>
                    </div>
                    {modalMode === 'add' && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-black">Mot de passe *</label>
                        <input
                          type="password"
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.emailVerified || false}
                          onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-black">Email vérifié</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50"
              >
                Fermer
              </button>
              {(modalMode === 'add' || modalMode === 'edit') && (
                <button
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Enregistrer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black">{title}</p>
          <p className="text-2xl font-bold text-black">{value}</p>
        </div>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );
}