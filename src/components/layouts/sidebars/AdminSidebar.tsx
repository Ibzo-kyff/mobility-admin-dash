'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faCar,
  faParking,
  faCalendarCheck,
  faChartLine,
  faFileAlt,
  faCog
} from '@fortawesome/free-solid-svg-icons';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Tableau de bord',
      icon: faTachometerAlt,
      path: '/dashboard/admin'
    },
    {
      name: 'Utilisateurs',
      icon: faUsers,
      path: '/dashboard/admin/users'
    },
    {
      name: 'Véhicules',
      icon: faCar,
      path: '/dashboard/admin/vehicules'
    },
    {
      name: 'Parkings',
      icon: faParking,
      path: '/dashboard/admin/parkings'
    },
    {
      name: 'Réservations',
      icon: faCalendarCheck,
      path: '/dashboard/admin/reservations'
    },
    {
      name: 'Statistiques',
      icon: faChartLine,
      path: '/dashboard/admin/statistiques'
    },
    {
      name: 'Rapports',
      icon: faFileAlt,
      path: '/dashboard/admin/rapports'
    },
    {
      name: 'Paramètres',
      icon: faCog,
      path: '/dashboard/admin/parametres'
    }
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-full">
      <div className="p-6 text-xl font-bold border-b">
        Mobility Admin
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}