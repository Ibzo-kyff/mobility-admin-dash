'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEuroSign,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faCalendarAlt,
  faDownload,
  faMoneyBillWave,
  faWallet,
  faCreditCard,
  faExchangeAlt,
  faReceipt,
  faCoins,
  faCheckCircle,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { parkingAPI } from '@/services/parking/parking-api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface RevenueStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  reservationsCount: number;
  averagePerReservation: number;
  monthlyHistory: { month: string; amount: number }[];
  typeDistribution: { name: string; value: number }[];
}

export default function ParkingRevenueStats() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const calculateTotal = (res: any) => {
    const vehicle = res.vehicle || res.vehicule;
    if (!vehicle) return 0;

    if (res.type === 'ACHAT') return vehicle.prix || 0;
    
    const pricePerDay = vehicle.prixJour || vehicle.prix || 0;
    if (!res.dateDebut || !res.dateFin) return pricePerDay;

    try {
      const start = new Date(res.dateDebut).getTime();
      const end = new Date(res.dateFin).getTime();
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
      return pricePerDay * days;
    } catch (e) {
      return pricePerDay;
    }
  };

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const response = await parkingAPI.getReservations();
      
      // Extraction robuste
      let reservations: any[] = [];
      if (Array.isArray(response)) {
        reservations = response;
      } else if (response && typeof response === 'object') {
        const anyRes = response as any;
        const level1 = anyRes.reservations || anyRes.data || anyRes.items || [];
        if (Array.isArray(level1)) {
          reservations = level1;
        } else if (level1 && typeof level1 === 'object') {
          const level2 = (level1 as any).reservations || (level1 as any).data || (level1 as any).items || [];
          if (Array.isArray(level2)) reservations = level2;
        }
      }

      // Filtrage
      const validReservations = reservations.filter((r: any) => {
        const s = (r.status || '').toUpperCase();
        return s !== 'CANCELED' && s !== 'ANNULÉE' && s !== 'REJECTED';
      });

      const paidReservations = validReservations.filter((r: any) => {
        const s = (r.status || '').toUpperCase();
        return s === 'COMPLETED' || s === 'ACCEPTED' || s === 'TERMINÉE' || s === 'CONFIRMED' || s === 'PAID';
      });

      const totalRevenue = paidReservations.reduce((acc: number, res: any) => acc + calculateTotal(res), 0);
      
      // Temps
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const thisMonthRevenue = paidReservations
        .filter((r: any) => {
          const d = new Date(r.createdAt || r.dateDebut || now);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc: number, res: any) => acc + calculateTotal(res), 0);

      const lastMonthRevenue = paidReservations
        .filter((r: any) => {
          const d = new Date(r.createdAt || r.dateDebut || now);
          const lastM = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastY = currentMonth === 0 ? currentYear - 1 : currentYear;
          return d.getMonth() === lastM && d.getFullYear() === lastY;
        })
        .reduce((acc: number, res: any) => acc + calculateTotal(res), 0);

      const growth = lastMonthRevenue === 0 ? (thisMonthRevenue > 0 ? 100 : 0) : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      // Historique
      const monthlyHistory = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        
        const amount = paidReservations
          .filter((r: any) => {
            const rd = new Date(r.createdAt || r.dateDebut || now);
            return rd.getMonth() === m && rd.getFullYear() === y;
          })
          .reduce((acc: number, res: any) => acc + calculateTotal(res), 0);
          
        monthlyHistory.push({
          month: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
          amount: amount
        });
      }

      setStats({
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: growth,
        reservationsCount: paidReservations.length,
        averagePerReservation: paidReservations.length > 0 ? totalRevenue / paidReservations.length : 0,
        monthlyHistory,
        typeDistribution: [
          { name: 'Ventes', value: validReservations.filter(r => (r?.type || '').toUpperCase() === 'ACHAT').length },
          { name: 'Locations', value: validReservations.filter(r => (r?.type || '').toUpperCase() === 'LOCATION').length }
        ]
      });

      const transactions = (reservations || []).slice(0, 10).map((r: any) => ({
        id: r?.id || Math.random(),
        client: r?.user ? `${r.user.prenom || ''} ${r.user.nom || ''}`.trim() : 'Client Inconnu',
        vehicle: (r?.vehicle || r?.vehicule) ? `${(r.vehicle || r.vehicule).marque || ''} ${(r.vehicle || r.vehicule).model || ''}` : 'Véhicule',
        amount: calculateTotal(r),
        date: new Date(r?.createdAt || r?.dateDebut || now).toLocaleDateString('fr-FR'),
        type: (r?.type || 'LOCATION').toUpperCase(),
        status: r?.status
      }));

      setRecentTransactions(transactions);

    } catch (error: any) {
      console.error('Error loading revenue:', error);
      // Optionnel: Gérer la déconnexion automatique ici si nécessaire
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Analyse financière en cours...</p>
      </div>
    );
  }

  if (!stats && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl shadow-inner">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <div className="text-center px-8">
          <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-xs">Session Expirée ou Erreur</p>
          <p className="text-slate-400 text-[10px] font-bold mt-2 max-w-xs mx-auto leading-relaxed">
            Votre session a probablement expiré ou nous n'avons pas pu charger les données. Veuillez vous reconnecter.
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/auth/login'}
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
        >
          Se reconnecter
        </button>
      </div>
    );
  }

  const COLORS = ['#f97316', '#3b82f6'];

  return (
    <div className="space-y-8 p-1">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueCard 
          title="Chiffre d'Affaires" 
          value={stats?.total || 0} 
          icon={faWallet} 
          color="bg-slate-900" 
          trend={`${Math.abs(Math.round(stats?.growth || 0))}%`} 
          isUp={(stats?.growth || 0) >= 0} 
        />
        <RevenueCard 
          title="Revenu Mensuel" 
          value={stats?.thisMonth || 0} 
          icon={faChartLine} 
          color="bg-orange-500" 
          trend="Ce mois" 
          isUp={true} 
        />
        <RevenueCard 
          title="Transactions" 
          value={stats?.reservationsCount || 0} 
          icon={faReceipt} 
          color="bg-blue-500" 
          trend="Volume" 
          isUp={true} 
          isCount={true}
        />
        <RevenueCard 
          title="Panier Moyen" 
          value={Math.round(stats?.averagePerReservation || 0)} 
          icon={faCoins} 
          color="bg-emerald-500" 
          trend="Efficacité" 
          isUp={true} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytique</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Évolution des revenus sur 6 mois</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Mensuel</button>
                <button className="px-6 py-2.5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Hebdo</button>
              </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyHistory || []}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    tickFormatter={(val) => `${val/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '20px',
                      fontSize: '12px',
                      fontWeight: 900
                    }}
                    formatter={(val: any) => [`${val?.toLocaleString() || 0} FCFA`, 'Revenu']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#f97316" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorAmt)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 self-start">Répartition</h3>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10 self-start">Source des gains</p>
          
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.typeDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  cornerRadius={12}
                >
                  {(stats?.typeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Résas</span>
              <span className="text-3xl font-black text-slate-900">{stats?.reservationsCount || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-10">
            {(stats?.typeDistribution || []).map((item, idx) => (
              <div key={item.name} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item?.name || '-'}</span>
                </div>
                <span className="text-lg font-black text-slate-900">{item?.value || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Flux de Trésorerie</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Dernières transactions enregistrées</p>
          </div>
          <button className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-3">
             <FontAwesomeIcon icon={faExchangeAlt} />
             Historique
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bénéficiaire</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails Véhicule</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant Brut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(recentTransactions || []).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-7 text-xs font-black text-slate-400 uppercase tracking-tighter">#TX-{tx.id}</td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black shadow-inner">
                        {tx.client.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{tx.client}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{tx.vehicle}</span>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      tx.type === 'ACHAT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <span className="text-base font-black text-slate-900">{tx?.amount?.toLocaleString() || 0} <span className="text-[10px] text-slate-400">F</span></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueCard({ title, value, icon, color, trend, isUp, isCount }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
      <div className={`absolute -right-6 -top-6 w-32 h-32 ${color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className={`w-14 h-14 ${color} text-white rounded-[1.25rem] flex items-center justify-center text-xl shadow-2xl shadow-slate-900/10 group-hover:scale-110 transition-transform`}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isUp && <FontAwesomeIcon icon={faArrowUp} />}
          {!isUp && <FontAwesomeIcon icon={faArrowDown} />}
          {trend}
        </div>
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 relative z-10">{title}</h4>
      <div className="text-2xl font-black text-slate-900 relative z-10 tracking-tight">
        {value.toLocaleString()} {!isCount && <span className="text-xs text-slate-400 ml-1">FCFA</span>}
      </div>
    </div>
  );
}
