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

  faShieldAlt,
  faUserCircle,       // profil
  faQuestionCircle,    // help
  faChartLine,         // statistiques (différent de faChartBar)
  faHistory,           // logs
  faChevronDown,
  faChevronUp,
  faTag,
} from '@fortawesome/free-solid-svg-icons';

export default function AdminSidebar({ 
  mobileOpen, 
  setMobileOpen 
}: { 
  mobileOpen?: boolean; 
  setMobileOpen?: (open: boolean) => void; 
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false); // état du sous-menu Paramètres

  const pathname = usePathname();

  const menuItems = [
    { title: 'Tableau de bord', icon: faTachometerAlt, href: '/dashboard/admin', exact: true },
    { title: 'Utilisateurs', icon: faUsers, href: '/dashboard/admin/users' },
    { title: 'Véhicules', icon: faCar, href: '/dashboard/admin/vehicles' },
    { title: 'Marques', icon: faTag, href: '/dashboard/admin/marques' },
    { title: 'Parkings', icon: faParking, href: '/dashboard/admin/parkings' },
    { title: 'Réservations', icon: faCalendarCheck, href: '/dashboard/admin/reservations' },
    { title: 'Rapports', icon: faFileAlt, href: '/dashboard/admin/reports' },
  ];

  const settingsSubmenu = [
    { title: 'Profil admin', icon: faUserCircle, href: '/dashboard/admin/settings/profile' },
    { title: 'Help Center',  icon: faQuestionCircle, href: '/dashboard/admin/settings/help' },
    { title: 'Statistiques', icon: faChartLine, href: '/dashboard/admin/settings/stats' },
    { title: 'Logs',         icon: faHistory, href: '/dashboard/admin/settings/logs' },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const isSettingsActive = settingsSubmenu.some(item => isActive(item.href));

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen fixed lg:static inset-y-0 left-0 z-50 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
      {/* Header / Logo + Collapse button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-black">Admin Panel</span>
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
          className="p-1.5 rounded-lg hover:bg-gray-100 text-black"
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>
      {/* Menu principal */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
              </Link>
            </li>
          ))}

          {/* Sous-menu Paramètres */}
          <li>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isSettingsActive || settingsOpen
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">Paramètres</span>}
              </div>
              {!collapsed && (
                <FontAwesomeIcon
                  icon={settingsOpen ? faChevronUp : faChevronDown}
                  className="w-4 h-4"
                />
              )}
            </button>

            {/* Sous-items (visible seulement si ouvert) */}
            {!collapsed && settingsOpen && (
              <ul className="ml-8 mt-1 space-y-1">
                {settingsSubmenu.map((sub) => (
                  <li key={sub.href}>
                    <Link
                      href={sub.href}
                      onClick={() => setMobileOpen?.(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(sub.href)
                          ? 'bg-orange-50/70 text-orange-700'
                          : 'text-black hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={sub.icon} className="w-4 h-4" />
                      <span>{sub.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-black text-sm" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-xs text-black">Version</p>
              <p className="text-sm font-medium text-black">1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}