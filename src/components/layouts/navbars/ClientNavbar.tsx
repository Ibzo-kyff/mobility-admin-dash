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
  faCar,
  faCalendar,
  faHeart,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { notificationAPI } from '@/services/notification-api';
import { useEffect } from 'react';

export default function ClientNavbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        if (!user) return;
        const data = await notificationAPI.getNotifications({ userId: user.id });
        const unread = data.filter((n: any) => !n.read && n.type !== "MESSAGE").length;
        setUnreadCount(unread);
      } catch (err) {
        console.error(err);
      }
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo et menu mobile */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>
          
          <Link href="/dashboard/client" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-800 hidden sm:block">Mobility</span>
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" 
            />
            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
            />
          </div>
        </div>

        {/* Menu navigation desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <Link 
            href="/reserve" 
            className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCar} />
            <span>Réserver</span>
          </Link>
          <Link 
            href="/dashboard/client/reservations" 
            className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCalendar} />
            <span>Mes réservations</span>
          </Link>
        </div>

        {/* Actions utilisateur */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/client/notifications" className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-block">
            <FontAwesomeIcon icon={faBell} className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm border-white border">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

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
                <p className="text-sm font-medium text-gray-800">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500">Client</p>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="text-xs text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-800">Connecté en tant que</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                
                <Link
                  href="/dashboard/client/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                  Mon profil
                </Link>
                
                <Link
                  href="/dashboard/client/favorites"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
                  Mes favoris
                </Link>
                
                <Link
                  href="/dashboard/client/history"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                  Historique
                </Link>
                
                <hr className="my-2 border-gray-200" />
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <Link
              href="/reserve"
              className="block px-4 py-2 text-gray-600 hover:bg-orange-50 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <FontAwesomeIcon icon={faCar} className="mr-3" />
              Réserver un véhicule
            </Link>
            <Link
              href="/dashboard/client/reservations"
              className="block px-4 py-2 text-gray-600 hover:bg-orange-50 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <FontAwesomeIcon icon={faCalendar} className="mr-3" />
              Mes réservations
            </Link>
            <Link
              href="/dashboard/client/favorites"
              className="block px-4 py-2 text-gray-600 hover:bg-orange-50 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <FontAwesomeIcon icon={faHeart} className="mr-3" />
              Mes favoris
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}