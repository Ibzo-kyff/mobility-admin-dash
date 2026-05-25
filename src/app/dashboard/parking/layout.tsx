// app/(dashboard)/client/layout.tsx - Version corrigée
'use client';

import { useState } from 'react';

import { RoleGuard } from '@/components/auth/RoleGuard';
import ParkingNavbar from '@/components/layouts/navbars/ParkingNavbar';
import ParkingSidebar from '@/components/layouts/sidebars/ParkingSidebar';

export default function ParkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RoleGuard allowedRoles="PARKING">
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        <ParkingSidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ParkingNavbar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}