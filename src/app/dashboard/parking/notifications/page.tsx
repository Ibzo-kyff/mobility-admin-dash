'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { notificationAPI } from '@/services/notification-api';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCircle,
  faTrash,
  faCheckDouble,
  faInbox,
  faCar,
  faMoneyBillWave,
  faSync,
  faEye,
  faClock,
  faCalendarAlt,
  faUser,
  faChevronLeft,
  faArrowRight,
  faEnvelope,
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

export default function ParkingNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const users = await mobilityAPI.getAllUsers().catch(() => []);
        const uMap: Record<number, string> = {};
        users.forEach((u: any) => { uMap[u.id] = `${u.prenom || ''} ${u.nom || ''}`.trim() || `Client #${u.id}`; });
        setUsersMap(uMap);
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

      const params: any = { parkingId: user.parkingId };
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

  const getIcon = (type?: string, isRead?: boolean) => {
    if (!isRead) return faEnvelope;
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

  if (selectedNotification) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setSelectedNotification(null)}
            className="group flex items-center gap-3 text-black hover:text-orange-500 font-black text-xs uppercase tracking-[0.2em] transition-all mb-8"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 transition-all shadow-sm">
              <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </div>
            Retour
          </button>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className={`p-8 text-center ${!selectedNotification.read ? 'bg-orange-600 text-white' : 'bg-gray-800 text-white'}`}>
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <FontAwesomeIcon icon={getIcon(selectedNotification.type, selectedNotification.read)} className="text-3xl" />
              </div>
              <h2 className="text-2xl font-black mb-2">{selectedNotification.title}</h2>
              <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-black uppercase tracking-widest">
                {getTypeLabel(selectedNotification.type)}
              </span>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-center gap-4 mb-8 text-black text-sm">
                <span className="flex items-center gap-2"><FontAwesomeIcon icon={faCalendarAlt} /> {new Date(selectedNotification.createdAt).toLocaleDateString('fr-FR')}</span>
                <span className="flex items-center gap-2"><FontAwesomeIcon icon={faClock} /> {new Date(selectedNotification.createdAt).toLocaleTimeString('fr-FR')}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-center text-black font-medium">
                {selectedNotification.message}
              </div>

              {selectedNotification.userId && (
                <div className="mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Client concerné</p>
                    <p className="text-sm font-bold text-orange-900">{usersMap[selectedNotification.userId] || `Client #${selectedNotification.userId}`}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="flex-1 py-4 rounded-xl bg-gray-100 text-black font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleDelete(selectedNotification.id)}
                  className="flex-1 py-4 rounded-xl border-2 border-red-100 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Notifications</h1>
          <p className="text-black">Alertes et mises à jour de votre parking.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-black hover:bg-gray-50 transition-all"
          >
            Tout marquer lu
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
          >
            Tout supprimer
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-black hover:text-black'}`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'unread' ? 'bg-white text-orange-600 shadow-sm' : 'text-black hover:text-black'}`}
        >
          Non lues ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <FontAwesomeIcon icon={faSync} className="text-4xl text-orange-500 animate-spin mb-4" />
          <p className="text-black font-medium">Chargement...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faInbox} className="text-3xl text-black" />
          </div>
          <h3 className="text-xl font-black text-black">Aucune notification</h3>
          <p className="text-black mt-2">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                setSelectedNotification(n);
                if (!n.read) handleMarkAsRead(n.id);
              }}
              className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 flex gap-4 ${!n.read ? 'border-l-4 border-l-orange-500 border-gray-200' : 'border-gray-100 opacity-80'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-black'}`}>
                <FontAwesomeIcon icon={getIcon(n.type, n.read)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-black ${!n.read ? 'font-bold' : 'text-sm'}`}>{n.title}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getTypeColor(n.type)}`}>
                    {getTypeLabel(n.type)}
                  </span>
                </div>
                <p className="text-sm text-black line-clamp-1 mb-2">{n.message}</p>
                <div className="flex items-center justify-between text-[10px] text-black font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faCalendarAlt} /> {new Date(n.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> {new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-black group-hover:text-orange-500 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
