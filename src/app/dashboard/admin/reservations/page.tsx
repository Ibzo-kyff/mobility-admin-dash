'use client';

import React from 'react';
import AdminReservationTabs from '@/components/admin/AdminReservationTabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold border-gray-900 text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-xl" />
            </div>
            Gestion des Réservations
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-13">
            Gérez toutes les demandes de location et d'achat sur la plateforme.
          </p>
        </div>
      </div>

      {/* Main Content Component */}
      <AdminReservationTabs />
    </div>
  );
}
