'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';
import ClientNavbar from '@/components/layouts/navbars/ClientNavbar';
import ClientSidebar from '@/components/layouts/sidebars/ClientSidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles="CLIENT">
      <div className="flex h-screen bg-gray-50">
        <ClientSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ClientNavbar />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}