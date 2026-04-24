"use client";

import ReservationList from '@/components/parking/ReservationList';

export default function ReservationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Réservations</h1>
      <p className="text-gray-600">Gérez les réservations de votre parking ici.</p>
      <div className="mt-6">
        <ReservationList />
      </div>
    </div>
  );
}
