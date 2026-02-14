// app/(dashboard)/admin/layout.tsx
'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';
import AdminNavbar from '@/components/layouts/navbars/AdminNavbar';
import AdminSidebar from '@/components/layouts/sidebars/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles="ADMIN">
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminNavbar />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}