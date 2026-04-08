// components/layouts/navbars/ParkingNavbar.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faUser,
  faSignOutAlt,
  faChevronDown,
  faBars,
  faCar,
  faCalendarCheck,
  faChartLine,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { notificationAPI } from '@/services/notification-api';
import { useEffect } from 'react';

export default function ParkingNavbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        if (!user) return;
        const data = await notificationAPI.getNotifications({ parkingId: user.parkingId ?? undefined });
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>
          
          <Link href="/dashboard/parking" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-gray-800 hidden sm:block">Parking Pro</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link 
            href="/dashboard/parking/vehicles" 
            className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCar} />
            <span>Ma flotte</span>
          </Link>
          <Link 
            href="/dashboard/parking/reservations" 
            className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCalendarCheck} />
            <span>Réservations</span>
          </Link>
          <Link 
            href="/dashboard/parking/analytics" 
            className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faChartLine} />
            <span>Statistiques</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/parking/notifications" className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-block">
            <FontAwesomeIcon icon={faBell} className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm border-white border">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

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
                <p className="text-xs text-gray-500">Parking partenaire</p>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="text-xs text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-800">Mon parking</p>
                  <p className="text-xs text-gray-600">ID: {user?.parkingId}</p>
                </div>
                
                <Link
                  href="/dashboard/parking/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                  Mon profil
                </Link>
                
                <Link
                  href="/dashboard/parking/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                  Paramètres
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

      {showMobileMenu && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <Link
              href="/dashboard/parking/vehicles"
              className="block px-4 py-2 text-gray-600 hover:bg-orange-50 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <FontAwesomeIcon icon={faCar} className="mr-3" />
              Ma flotte
            </Link>
            <Link
              href="/dashboard/parking/reservations"
              className="block px-4 py-2 text-gray-600 hover:bg-orange-50 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
              Réservations
            </Link>
            <Link
              href="/dashboard/parking/analytics"
              className="block px-4 py-2 text-gray-600 hover:bg-orange-50 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <FontAwesomeIcon icon={faChartLine} className="mr-3" />
              Statistiques
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}