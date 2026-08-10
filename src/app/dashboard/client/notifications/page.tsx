'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { notificationAPI } from '@/services/notification-api';
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
  faChevronLeft,
  faCalendarAlt,
  faClock,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type?: string;
  louee?: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (!user) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params: any = { userId: user.id };
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
    const interval = setInterval(() => fetchNotifications(true), 30000); // 30s check
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

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const getIcon = (type?: string) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('RESERV') || t.includes('RÉSERV')) return faCar;
    if (t.includes('PAIEMENT')) return faMoneyBillWave;
    if (t.includes('MISE À JOUR') || t.includes('UPDATE')) return faSync;
    return faBell;
  };

  const getTypeColor = (type?: string) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('RESERV') || t.includes('RÉSERV')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (t.includes('PAIEMENT')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (t.includes('MISE À JOUR') || t.includes('UPDATE')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-gray-50 text-black border-gray-100';
  };

  const getTypeLabel = (type?: string) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('RESERV') || t.includes('RÉSERV')) return 'Réservation';
    if (t.includes('PAIEMENT')) return 'Paiement';
    return 'Système';
  };

  if (selectedNotification) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 w-full flex justify-center p-4">
        <div className="w-full max-w-4xl">
          <button
            onClick={() => setSelectedNotification(null)}
            className="group flex items-center gap-3 text-black hover:text-orange-500 font-black text-xs uppercase tracking-[0.2em] transition-all mb-8"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 transition-all shadow-sm">
              <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </div>
            Retour
          </button>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-fadeIn">
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
              <div className="flex items-center justify-center gap-4 mb-8 text-black text-sm">
                <span className="flex items-center gap-2"><FontAwesomeIcon icon={faCalendarAlt} /> {new Date(selectedNotification.createdAt).toLocaleDateString('fr-FR')}</span>
                <span className="flex items-center gap-2"><FontAwesomeIcon icon={faClock} /> {new Date(selectedNotification.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-center text-black font-medium">
                {selectedNotification.message}
              </div>

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
    <div className="min-h-screen w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Mes Notifications</h1>
            <p className="text-black mt-1">Gérez vos alertes et réservations.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'all' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-500' 
                  : 'bg-white text-black hover:bg-gray-50 border border-gray-100'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'unread' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-500' 
                  : 'bg-white text-black hover:bg-gray-50 border border-gray-100'
              }`}
            >
              Non lues ({notifications.filter(n => !n.read).length})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading && notifications.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm animate-fadeIn">
              <div className="animate-spin mb-4 inline-block">
                <FontAwesomeIcon icon={faSync} className="text-3xl text-orange-500" />
              </div>
              <p className="text-black font-medium">Chargement...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm animate-fadeIn">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faInbox} className="text-2xl text-black" />
              </div>
              <h3 className="text-lg font-bold text-black">Aucune notification</h3>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  setSelectedNotification(n);
                  if (!n.read) handleMarkAsRead(n.id);
                }}
                className={`group relative bg-white p-5 rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 animate-fadeIn ${
                  !n.read 
                    ? 'border-orange-100 ring-1 ring-orange-50 ring-offset-4' 
                    : 'border-gray-50 opacity-80 hover:opacity-100'
                }`}
              >
                {!n.read && (
                  <div className="absolute top-6 right-6">
                    <FontAwesomeIcon icon={faCircle} className="text-[8px] text-orange-500 animate-pulse" />
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    !n.read ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-black'
                  }`}>
                    <FontAwesomeIcon icon={getIcon(n.type)} className="text-lg" />
                  </div>
                  <div className="flex-1 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-black leading-tight">{n.title}</h3>
                    </div>
                    <p className="text-black text-sm line-clamp-2 mb-3">{n.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-black font-medium tracking-wide italic">
                        {new Date(n.createdAt).toLocaleString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n.id);
                        }}
                        className="p-2 text-black hover:text-red-500 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
