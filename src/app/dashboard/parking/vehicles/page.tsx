'use client';

import ParkingVehicleTabs from '@/components/parking/ParkingVehicleTabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function ParkingVehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Véhicules</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Gérez votre inventaire, suivez leurs performances et documents</p>
        </div>
        <button
          onClick={() => {
            const event = new CustomEvent('open-add-vehicle-modal');
            window.dispatchEvent(event);
          }}
          className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <FontAwesomeIcon icon={faCar} className="text-lg" />
          Nouveau véhicule
        </button>
      </div>

      <ParkingVehicleTabs />
    </div>
  );
}
