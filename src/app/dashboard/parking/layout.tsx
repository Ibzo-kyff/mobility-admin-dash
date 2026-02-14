// app/(dashboard)/client/layout.tsx - Version corrigée
'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ParkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles="PARKING">
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </RoleGuard>
  );
}