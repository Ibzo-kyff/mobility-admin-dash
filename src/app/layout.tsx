// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'Mobility - Votre liberté sur 4 roues',
    template: '%s | Mobility'
  },
  description: 'Réservez, louez ou achetez votre véhicule en toute simplicité',
  keywords: ['location voiture', 'achat voiture', 'mobilité', 'parking', 'véhicules'],
  authors: [{ name: 'Mobility Team' }],
  creator: 'Mobility',
  publisher: 'Mobility',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/images/logo.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png' },
      { url: '/images/logo.jpg' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FD6A00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}