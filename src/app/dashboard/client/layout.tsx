// app/(dashboard)/client/layout.tsx - Version corrigée
'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles="CLIENT">
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </RoleGuard>
  );
}