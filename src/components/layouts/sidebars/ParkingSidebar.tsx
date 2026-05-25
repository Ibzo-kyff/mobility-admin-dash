// components/layouts/sidebars/ParkingSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faCar,
  faCalendarCheck,
  faChartLine,
  faUsers,
  faCog,
  faPlusCircle,
  faChevronLeft,
  faChevronRight,
  faEuroSign
} from '@fortawesome/free-solid-svg-icons';

export default function ParkingSidebar({ 
  mobileOpen, 
  setMobileOpen 
}: { 
  mobileOpen?: boolean; 
  setMobileOpen?: (open: boolean) => void; 
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: faTachometerAlt,
      href: '/dashboard/parking',
      exact: true
    },
    {
      title: 'Ma Flotte',
      icon: faCar,
      href: '/dashboard/parking/fleet',
    },
    {
      title: 'Véhicules',
      icon: faCar,
      href: '/dashboard/parking/vehicles',
    },
    {
      title: 'Réservations',
      icon: faCalendarCheck,
      href: '/dashboard/parking/reservations',
    },
    {
      title: 'Revenus',
      icon: faEuroSign,
      href: '/dashboard/parking/revenue',
    },
    {
      title: 'Statistiques',
      icon: faChartLine,
      href: '/dashboard/parking/analytics',
    },
    {
      title: 'Clients',
      icon: faUsers,
      href: '/dashboard/parking/clients',
    },
    {
      title: 'Paramètres',
      icon: faCog,
      href: '/dashboard/parking/settings',
    },
  ];

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed lg:static inset-y-0 left-0 z-50 transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard/parking" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-gray-800">Parking Pro</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard/parking" className="w-full flex justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
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
                onClick={() => setMobileOpen?.(false)}
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
    </>
  );
}