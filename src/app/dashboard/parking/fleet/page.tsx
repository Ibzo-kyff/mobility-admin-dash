"use client";

import ParkingVehicleTabs from '@/components/parking/ParkingVehicleTabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

export default function FleetPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/20">
              <FontAwesomeIcon icon={faCar} />
            </div>
            Ma Flotte
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-16">
            Gérez votre inventaire et suivez vos performances
          </p>
        </div>
      </div>

      <ParkingVehicleTabs showDashboard={true} />
    </div>
  );
}
