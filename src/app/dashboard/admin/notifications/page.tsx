'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { notificationAPI } from '@/services/notification-api';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCircle,
  faTrash,
  faCheck,
  faCheckDouble,
  faInbox,
  faExclamationTriangle,
  faCar,
  faMoneyBillWave,
  faSync,
  faEye,
  faEyeSlash,
  faEnvelope,
  faEnvelopeOpen,
  faClock,
  faCalendarAlt,
  faUser,
  faParking,
  faTag,
  faArrowRight,
  faChevronLeft,
  faTimes,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type?: string;
  userId?: number;
  parkingId?: number;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [parkingsMap, setParkingsMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const users = await mobilityAPI.getAllUsers().catch(() => []);
        const uMap: Record<number, string> = {};
        users.forEach((u: any) => { uMap[u.id] = `${u.prenom || ''} ${u.nom || ''}`.trim() || `Client #${u.id}`; });
        setUsersMap(uMap);

        const parkings = await mobilityAPI.getParkings().catch(() => []);
        const pMap: Record<number, string> = {};
        parkings.forEach((p: any) => { pMap[p.id] = p.nom || p.name || `Parking #${p.id}`; });
        setParkingsMap(pMap);
      } catch (err) {
        console.error("Erreur récupération des noms:", err);
      }
    };
    fetchNames();
  }, []);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (!user) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params: any = {};
      if (user.role === 'PARKING') {
        params.parkingId = user.parkingId;
      } else if (user.role === 'CLIENT') {
        params.userId = user.id;
      }
      
      const data = await notificationAPI.getNotifications(params);
      
      const formatted = (Array.isArray(data) ? data : [])
        .filter((n: any) => n.type !== "MESSAGE")
        .map((n: any) => ({
          ...n,
          createdAt: n.createdAt || new Date().toISOString()
        }));

      setNotifications(formatted);
    } catch (err) {
      console.error("Erreur récupération notifications :", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (notifications.length > 0 && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const notifId = searchParams.get('id');
      if (notifId) {
        const found = notifications.find(n => n.id === Number(notifId));
        if (found) {
          setSelectedNotification(found);
          if (!found.read) {
            handleMarkAsRead(found.id);
          }
        }
      }
    }
  }, [notifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Erreur mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    for (const id of unreadIds) {
      await handleMarkAsRead(id);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette notification ?")) return;
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotification?.id === id) setSelectedNotification(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer toutes les notifications ?")) return;
    for (const n of notifications) {
      await notificationAPI.deleteNotification(n.id);
    }
    setNotifications([]);
    setSelectedNotification(null);
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'RESERVATION': return faCar;
      case 'PAIEMENT': return faMoneyBillWave;
      case 'MISE_A_JOUR': return faSync;
      default: return faBell;
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'RESERVATION': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PAIEMENT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'MISE_A_JOUR': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-black border-gray-100';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'RESERVATION': return 'Réservation';
      case 'PAIEMENT': return 'Paiement';
      case 'MISE_A_JOUR': return 'Mise à jour';
      default: return 'Système';
    }
  };

  // Vue détail quand une notification est sélectionnée
  if (selectedNotification) {
    return (
      <div className="space-y-6 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setSelectedNotification(null)}
              className="group flex items-center gap-3 text-black hover:text-orange-500 font-black text-xs uppercase tracking-[0.2em] transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 transition-all shadow-sm">
                <FontAwesomeIcon icon={faChevronLeft} size="xs" />
              </div>
              Retour aux notifications
            </button>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className={`p-8 text-center ${!selectedNotification.read ? 'bg-orange-600 text-white' : 'bg-gray-800 text-white'}`}>
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <FontAwesomeIcon icon={getIcon(selectedNotification.type)} className="text-3xl" />
                </div>
                
                <h2 className="text-2xl font-black mb-2">{selectedNotification.title}</h2>
                
                <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-black uppercase tracking-widest">
                  {getTypeLabel(selectedNotification.type)}
                </span>
              </div>

              <div className="p-8">
                {/* Date et heure */}
                <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-black text-sm">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{new Date(selectedNotification.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-2 text-black text-sm">
                    <FontAwesomeIcon icon={faClock} />
                    <span>{new Date(selectedNotification.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                  <p className="text-black leading-relaxed text-center text-lg font-medium">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Destinataire */}
                {(selectedNotification.userId || selectedNotification.parkingId) && (
                  <div className="mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <FontAwesomeIcon icon={selectedNotification.parkingId ? faParking : faUser} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Destinataire</p>
                        <p className="text-sm font-bold text-orange-900">
                          {selectedNotification.parkingId 
                            ? parkingsMap[selectedNotification.parkingId] || `Parking #${selectedNotification.parkingId}`
                            : usersMap[selectedNotification.userId!] || `Client #${selectedNotification.userId}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="flex-1 py-4 rounded-xl bg-gray-100 text-black font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => handleDelete(selectedNotification.id)}
                    className="flex-1 py-4 rounded-xl bg-white border-2 border-red-200 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Notifications</h1>
            <p className="text-black mt-1">Gérez vos alertes et communications système.</p>
          </div>
          
          <div className="flex gap-2">
            {notifications.filter(n => !n.read).length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-gray-100 text-black hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faCheckDouble} />
                Tout marquer lu
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTrash} />
                Tout supprimer
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'all' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                : 'bg-white text-black hover:bg-gray-50 border border-gray-100'
            }`}
          >
            Toutes
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {notifications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'unread' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                : 'bg-white text-black hover:bg-gray-50 border border-gray-100'
            }`}
          >
            Non lues
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {notifications.filter(n => !n.read).length}
            </span>
          </button>
        </div>

        {/* Grille de notifications */}
        {loading && notifications.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100">
            <div className="animate-spin mb-4 inline-block">
              <FontAwesomeIcon icon={faSync} className="text-4xl text-orange-500" />
            </div>
            <p className="text-black font-medium">Chargement des notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faInbox} className="text-3xl text-black" />
            </div>
            <h3 className="text-xl font-black text-black">Aucune notification</h3>
            <p className="text-black max-w-xs mx-auto mt-2">
              {activeTab === 'unread' 
                ? "Vous avez lu toutes vos notifications. Bravo !" 
                : "Vous n'avez pas de notifications à afficher pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  setSelectedNotification(n);
                  if (!n.read) handleMarkAsRead(n.id);
                }}
                className={`group relative bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                  !n.read 
                    ? 'border-l-4 border-l-orange-500 border-gray-100' 
                    : 'border-gray-100 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Icône */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      !n.read 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-black'
                    }`}>
                      <FontAwesomeIcon icon={getIcon(n.type)} className="text-xl" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* En-tête */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className={`font-black text-black ${!n.read ? 'text-base' : 'text-sm'}`}>
                          {n.title}
                        </h3>
                        <span className={`text-[10px] uppercase tracking-tighter font-black px-2 py-1 rounded-full ${getTypeColor(n.type)}`}>
                          {getTypeLabel(n.type)}
                        </span>
                        {!n.read && (
                          <span className="text-[10px] uppercase tracking-tighter font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <FontAwesomeIcon icon={faCircle} className="text-[6px]" />
                            Nouveau
                          </span>
                        )}
                      </div>
                      
                      {/* Message */}
                      <p className={`text-black ${!n.read ? 'font-medium' : ''} line-clamp-2 mb-3`}>
                        {n.message}
                      </p>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-black">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} size="xs" />
                            {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} size="xs" />
                            {new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {(n.userId || n.parkingId) && (
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={n.parkingId ? faParking : faUser} size="xs" />
                              {n.parkingId 
                                ? parkingsMap[n.parkingId]?.split(' ')[0] || `Parking #${n.parkingId}`
                                : usersMap[n.userId!]?.split(' ')[0] || `Client #${n.userId}`}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faEnvelope} size="xs" />
                              Non lue
                            </span>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(n.id);
                            }}
                            className="p-2 text-black hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Flèche d'indication */}
                    <div className="hidden sm:flex items-center text-black group-hover:text-orange-500 transition-colors">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}