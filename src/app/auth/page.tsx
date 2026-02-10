import { Suspense } from 'react';
import AuthPageClient from './AuthPageClient';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthPageClient />
    </Suspense>
  );
}