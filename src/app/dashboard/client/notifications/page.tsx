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
  faSync
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

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mes Notifications</h1>
            <p className="text-gray-500 mt-1">Gérez vos alertes et réservations.</p>
          </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'all' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-500' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'unread' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-500' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            Non lues ({notifications.filter(n => !n.read).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-4">
          {loading && notifications.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
              <div className="animate-spin mb-4 inline-block">
                <FontAwesomeIcon icon={faSync} className="text-3xl text-orange-500" />
              </div>
              <p className="text-gray-500 font-medium">Chargement...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faInbox} className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Aucune notification</h3>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  setSelectedNotification(n);
                  if (!n.read) handleMarkAsRead(n.id);
                }}
                className={`group relative bg-white p-5 rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
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
                    !n.read ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <FontAwesomeIcon icon={getIcon(n.type)} className="text-lg" />
                  </div>
                  <div className="flex-1 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 leading-tight">{n.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{n.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium tracking-wide italic">
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
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
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

        {/* Détails */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {selectedNotification ? (
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl relative overflow-hidden group">
                <div className="relative">
                  <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-200 mb-6 mx-auto">
                    <FontAwesomeIcon icon={getIcon(selectedNotification.type)} className="text-2xl" />
                  </div>
                  
                  <h2 className="text-2xl font-black text-gray-900 text-center mb-2">{selectedNotification.title}</h2>
                  <div className="flex justify-center mb-6">
                    <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                      {selectedNotification.type || 'Information'}
                    </span>
                  </div>

                  <div className="bg-gray-50/50 rounded-3xl p-6 mb-6">
                    <p className="text-gray-700 leading-relaxed text-center font-medium">
                      {selectedNotification.message}
                    </p>
                  </div>

                  <p className="text-xs text-gray-400 text-center font-medium uppercase tracking-widest mb-8">
                    Reçu le {new Date(selectedNotification.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setSelectedNotification(null)}
                      className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-black tracking-widest uppercase text-xs hover:bg-gray-200 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-12 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 border border-gray-100">
                  <FontAwesomeIcon icon={faBell} className="text-3xl text-gray-200" />
                </div>
                <h4 className="font-bold text-gray-400">Sélectionnez une notification</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
