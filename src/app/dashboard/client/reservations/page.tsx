'use client';

import React from 'react';
import ClientReservationTabs from '@/components/client/ClientReservationTabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

export default function ClientReservationsPage() {
  return (
    <div className="space-y-8 animate-fadeIn p-2 sm:p-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-xl sm:text-2xl" />
            </div>
            Mes Réservations
          </h1>
          <p className="text-[10px] sm:text-xs font-black text-black mt-2 ml-1 uppercase tracking-widest">
            Historique et suivi de vos locations et stationnements
          </p>
        </div>
      </div>

      {/* Main Content Component */}
      <ClientReservationTabs />
    </div>
  );
}
