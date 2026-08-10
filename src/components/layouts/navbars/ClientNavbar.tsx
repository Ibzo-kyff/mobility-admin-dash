// components/layouts/navbars/ClientNavbar.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faUser,
  faSignOutAlt,
  faChevronDown,
  faSearch,
  faBars,
  faCog,
  faHeart,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { notificationAPI } from '@/services/notification-api';
import { useEffect } from 'react';

export default function ClientNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        if (!user) return;
        const data = await notificationAPI.getNotifications({ userId: user.id });
        const formatted = (Array.isArray(data) ? data : []).filter((n: any) => n.type !== "MESSAGE");
        setNotifications(formatted);
        const unread = formatted.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.warn('Failed to check notifications:', err);
      }
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Menu hamburger pour mobile */}
        <button onClick={onMenuClick} className="lg:hidden text-black hover:text-black p-2 -ml-2">
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </button>

        {/* Barre de recherche - Centralisée */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-sm" 
            />
            <input
              type="text"
              placeholder="Rechercher un véhicule, un parking..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
            />
          </div>
        </div>

        {/* Actions utilisateur */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-black hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm border-white border">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed inset-x-4 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:w-96 sm:mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-w-md">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-black">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-black text-sm">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <Link 
                        key={n.id} 
                        href={`/dashboard/client/notifications?id=${n.id}`}
                        onClick={async () => {
                          if (!n.read) {
                            try {
                              await notificationAPI.markNotificationAsRead(n.id);
                            } catch (e) {}
                          }
                          setShowNotifications(false);
                        }}
                        className={`block px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${!n.read ? 'bg-orange-50/30' : ''}`}
                      >
                        <p className={`text-sm ${!n.read ? 'font-bold text-black' : 'text-black'}`}>
                          {n.title || n.message}
                        </p>
                        {!n.title && n.message && n.title !== n.message && (
                          <p className="text-xs text-black line-clamp-2 mt-0.5">{n.message}</p>
                        )}
                        <p className="text-[10px] text-black mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString('fr-FR') : 'Récemment'}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <Link 
                    href="/dashboard/client/notifications" 
                    onClick={() => setShowNotifications(false)}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    Voir toutes les notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-sm">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-black">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-black">Client</p>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="text-xs text-black" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-black">Compte Client</p>
                  <p className="text-xs text-black truncate">{user?.email}</p>
                </div>
                
                <Link
                  href="/dashboard/client/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-black hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-black" />
                  Mon profil
                </Link>
                
                <Link
                  href="/dashboard/client/favorites"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-black hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-black" />
                  Mes favoris
                </Link>
                
                <Link
                  href="/dashboard/client/history"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-black hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faHistory} className="w-4 h-4 text-black" />
                  Historique
                </Link>

                <Link
                  href="/dashboard/client/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-black hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faCog} className="w-4 h-4 text-black" />
                  Paramètres
                </Link>
                
                <hr className="my-2 border-gray-200" />
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left font-medium"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}