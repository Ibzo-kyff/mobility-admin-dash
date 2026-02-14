// app/(dashboard)/layout.tsx
'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>        {/* ← AuthProvider est déjà dans le root layout */}
      {children}
    </AuthGuard>
  );
}