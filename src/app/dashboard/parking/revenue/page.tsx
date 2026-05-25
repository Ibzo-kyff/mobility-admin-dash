"use client";

import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faChartBar, faFileInvoiceDollar, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/components/auth/AuthProvider';

// Import dynamique pour éviter les erreurs de rendu côté serveur avec Recharts
const ParkingRevenueStats = dynamic(() => import('@/components/parking/ParkingRevenueStats'), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm space-y-4">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Chargement des données...</p>
    </div>
  )
});

export default function RevenuePage() {
  const { logout } = useAuth();

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/20">
              <FontAwesomeIcon icon={faWallet} size="sm" />
            </div>
            Tableau de Bord Financier
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-3 ml-1">
            Suivez vos revenus, analysez vos performances et gérez vos transactions
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 md:flex-none px-8 py-4 bg-white border border-slate-100 text-slate-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500" />
            Actualiser la session
          </button>
          <button 
            onClick={() => logout()}
            className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Revenue Content */}
      <div className="bg-slate-50/50 p-1 rounded-[3.5rem]">
        <ParkingRevenueStats />
      </div>
    </div>
  );
}
