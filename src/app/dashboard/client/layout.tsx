'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import ClientNavbar from '@/components/layouts/navbars/ClientNavbar';
import ClientSidebar from '@/components/layouts/sidebars/ClientSidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RoleGuard allowedRoles="CLIENT">
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        <ClientSidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ClientNavbar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}