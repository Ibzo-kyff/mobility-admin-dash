// app/(dashboard)/client/layout.tsx - Version corrigée
'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';
import ParkingNavbar from '@/components/layouts/navbars/ParkingNavbar';
import ParkingSidebar from '@/components/layouts/sidebars/ParkingSidebar';

export default function ParkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles="PARKING">
      <div className="flex h-screen bg-gray-50">
        <ParkingSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ParkingNavbar />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}