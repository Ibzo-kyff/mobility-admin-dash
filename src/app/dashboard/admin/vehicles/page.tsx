'use client';

import AdminVehicleTabs from '@/components/admin/AdminVehicleTabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

export default function AdminVehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Véhicules</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Consultez, validez et gérez tous les véhicules inscrits sur la plateforme</p>
        </div>
        <button
          onClick={() => {
            // Déclenche l'ouverture du modal dans AdminVehicleTabs
            const event = new CustomEvent('open-add-vehicle-modal');
            window.dispatchEvent(event);
          }}
          className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <FontAwesomeIcon icon={faCar} className="text-lg" />
          Ajouter un véhicule
        </button>
      </div>

      <AdminVehicleTabs />
    </div>
  );
}
