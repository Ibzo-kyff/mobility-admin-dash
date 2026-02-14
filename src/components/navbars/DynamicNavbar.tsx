// components/navbars/DynamicNavbar.tsx
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import ClientNavbar from '../layouts/navbars/ClientNavbar';
import ParkingNavbar from '../layouts/navbars/ParkingNavbar';
import AdminNavbar from '../layouts/navbars/AdminNavbar';

export default function DynamicNavbar() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  switch (user.role) {
    case 'ADMIN':
      return <AdminNavbar />;
    case 'PARKING':
      return <ParkingNavbar />;
    case 'CLIENT':
    default:
      return <ClientNavbar />;
  }
}