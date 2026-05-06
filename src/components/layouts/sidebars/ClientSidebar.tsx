// components/layouts/sidebars/ClientSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faCar,
  faCalendarCheck,
  faHeart,
  faHistory,
  faUser,
  faCog,
  faQuestionCircle,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

export default function ClientSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: faTachometerAlt,
      href: '/dashboard/client',
      exact: true
    },
    {
      title: 'Réserver',
      icon: faCar,
      href: '/dashboard/client/search',
    },
    {
      title: 'Mes réservations',
      icon: faCalendarCheck,
      href: '/dashboard/client/reservations',
    },
    {
      title: 'Mes favoris',
      icon: faHeart,
      href: '/dashboard/client/favorites',
    },
    {
      title: 'Historique',
      icon: faHistory,
      href: '/dashboard/client/history',
    },
    {
      title: 'Mon profil',
      icon: faUser,
      href: '/dashboard/client/profile',
    },
    {
      title: 'Paramètres',
      icon: faCog,
      href: '/dashboard/client/settings',
    },
    {
      title: 'Aide',
      icon: faQuestionCircle,
      href: '/dashboard/client/help',
    },
  ];

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard/client" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-800">Mobility</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard/client" className="w-full flex justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item)
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}