'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import AdminNavbar from '@/components/layouts/navbars/AdminNavbar';
import AdminSidebar from '@/components/layouts/sidebars/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RoleGuard allowedRoles="ADMIN">
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        <AdminSidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminNavbar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}