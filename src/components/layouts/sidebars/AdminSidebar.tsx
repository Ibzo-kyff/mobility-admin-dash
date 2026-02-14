// components/layouts/sidebars/AdminSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faCar,
  faParking,
  faCalendarCheck,
  faCog,
  faChartBar,
  faFileAlt,
  faChevronLeft,
  faChevronRight,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: faTachometerAlt,
      href: '/dashboard/admin',
      exact: true
    },
    {
      title: 'Utilisateurs',
      icon: faUsers,
      href: '/dashboard/admin/users',
    },
    {
      title: 'Véhicules',
      icon: faCar,
      href: '/dashboard/admin/vehicles',
    },
    {
      title: 'Parkings',
      icon: faParking,
      href: '/dashboard/admin/parkings',
    },
    {
      title: 'Réservations',
      icon: faCalendarCheck,
      href: '/dashboard/admin/reservations',
    },
    {
      title: 'Statistiques',
      icon: faChartBar,
      href: '/dashboard/admin/statistics',
    },
    {
      title: 'Rapports',
      icon: faFileAlt,
      href: '/dashboard/admin/reports',
    },
    {
      title: 'Paramètres',
      icon: faCog,
      href: '/dashboard/admin/settings',
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
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-gray-800">Admin Panel</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard/admin" className="w-full flex justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
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

      {/* Menu */}
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-gray-600 text-sm" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-xs text-gray-500">Version</p>
              <p className="text-sm font-medium text-gray-800">1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}