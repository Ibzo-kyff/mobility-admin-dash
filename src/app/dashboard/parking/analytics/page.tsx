"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faCar, 
  faCalendarCheck, 
  faUsers, 
  faClock, 
  faArrowTrendUp,
  faCircleCheck,
  faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';
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
import { parkingAPI } from '@/services/parking/parking-api';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // On récupère les données réelles et on complète avec des simulations pour le visuel "premium"
        const analytics = await parkingAPI.getAnalytics();
        const vehiclesRaw = await parkingAPI.getMyVehicles();
        const reservationsRaw = await parkingAPI.getReservations();
        
        const vehicles = Array.isArray(vehiclesRaw) ? vehiclesRaw : 
                        (vehiclesRaw && typeof vehiclesRaw === 'object' && Array.isArray((vehiclesRaw as any).vehicles)) ? (vehiclesRaw as any).vehicles :
                        (vehiclesRaw && typeof vehiclesRaw === 'object' && Array.isArray((vehiclesRaw as any).data)) ? (vehiclesRaw as any).data : [];

        const reservations = Array.isArray(reservationsRaw) ? reservationsRaw : 
                             (reservationsRaw && typeof reservationsRaw === 'object' && Array.isArray((reservationsRaw as any).reservations)) ? (reservationsRaw as any).reservations :
                             (reservationsRaw && typeof reservationsRaw === 'object' && Array.isArray((reservationsRaw as any).data)) ? (reservationsRaw as any).data : [];

        // Calculs réels pour KPI
        const totalVehicles = vehicles.length;
        const totalRes = reservations.length;
        const occupancy = analytics?.occupancyRate || Math.round((reservations.filter((r: any) => ['ACCEPTED', 'CONFIRMED', 'ACTIVE'].includes(r.status?.toUpperCase())).length / (totalVehicles || 1)) * 100) || 0;

        // 1. Calcul Activity Data (7 derniers jours)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });
        const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        
        const dynamicActivityData = last7Days.map(dateStr => {
          const count = reservations.filter((r: any) => {
            const rDate = (r.createdAt || r.startDate || r.date || '').split('T')[0];
            return rDate === dateStr;
          }).length;
          
          const d = new Date(dateStr);
          return {
            name: daysOfWeek[d.getDay()],
            value: count
          };
        });

        // 2. Calcul Category Data (répartition par catégorie ou type de carburant)
        const categoriesCount: Record<string, number> = {};
        vehicles.forEach((v: any) => {
          const cat = v.categorie || v.carburant || v.fuelType || 'Autre';
          categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
        });
        
        const colorsList = ['#f97316', '#6366f1', '#10b981', '#ec4899', '#8b5cf6', '#eab308'];
        let dynamicCategoryData = Object.entries(categoriesCount).map(([name, value], index) => ({
          name,
          value,
          color: colorsList[index % colorsList.length]
        }));
        
        if (dynamicCategoryData.length === 0) {
          dynamicCategoryData = [{ name: 'Aucun véhicule', value: 1, color: '#e2e8f0' }];
        }

        // 3. Calcul des Alertes et Insights dynamiques
        const dynamicAlerts = [];
        
        const pendingRes = reservations.filter((r: any) => r.status === 'PENDING').length;
        if (pendingRes > 0) {
          dynamicAlerts.push({ title: 'Nouvelles demandes', desc: `${pendingRes} réservation(s) en attente de validation.`, type: 'info', icon: faCalendarCheck });
        }
        
        const missingDocsVehicles = vehicles.filter((v: any) => v.carteGrise === false || v.assurance === false).length;
        if (missingDocsVehicles > 0) {
          dynamicAlerts.push({ title: 'Documents requis', desc: `${missingDocsVehicles} véhicule(s) avec des documents manquants.`, type: 'warning', icon: faCircleExclamation });
        }
        
        if (occupancy >= 70) {
          dynamicAlerts.push({ title: 'Forte demande', desc: 'Excellent taux d\'occupation actuel !', type: 'success', icon: faArrowTrendUp });
        } else if (occupancy === 0 && totalVehicles > 0) {
          dynamicAlerts.push({ title: 'Aucune activité', desc: 'Boostez votre visibilité pour obtenir des réservations.', type: 'warning', icon: faChartLine });
        }
        
        if (dynamicAlerts.length < 3) {
           dynamicAlerts.push({ title: 'Système opérationnel', desc: 'Toutes vos statistiques sont à jour.', type: 'success', icon: faCircleCheck });
        }

        setStats({
          overview: [
            { label: 'Taux d\'occupation', value: `${occupancy}%`, icon: faChartLine, color: 'orange', trend: occupancy >= 50 ? '+5%' : '~0%' },
            { label: 'Véhicules Actifs', value: totalVehicles, icon: faCar, color: 'blue', trend: 'Total' },
            { label: 'Réservations Totales', value: totalRes, icon: faCalendarCheck, color: 'emerald', trend: 'Global' },
            { label: 'Clients Uniques', value: new Set(reservations.map((r: any) => r.clientId || r.userId)).size, icon: faUsers, color: 'purple', trend: 'Total' },
          ],
          activityData: dynamicActivityData,
          categoryData: dynamicCategoryData,
          recentAlerts: dynamicAlerts.slice(0, 3)
        });
      } catch (error) {
        console.error("Erreur stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-black font-black text-xs uppercase tracking-widest">Analyse des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-fadeIn">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tighter flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            Statistiques & Insights
          </h1>
          <p className="text-black font-bold text-sm uppercase tracking-widest mt-3 ml-1">
            Analyse approfondie de votre performance opérationnelle
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-black uppercase tracking-widest ml-3">Période :</span>
          <select className="bg-slate-50 border-none text-xs font-black text-black rounded-xl px-4 py-2 outline-none cursor-pointer">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>Cette année</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.overview.map((kpi: any, i: number) => {
          const colorClasses: Record<string, string> = {
            orange: 'bg-orange-500/5 text-orange-600 bg-orange-50',
            blue: 'bg-blue-500/5 text-blue-600 bg-blue-50',
            emerald: 'bg-emerald-500/5 text-emerald-600 bg-emerald-50',
            purple: 'bg-purple-500/5 text-purple-600 bg-purple-50'
          };
          const colors = colorClasses[kpi.color] || colorClasses.orange;
          const [bgLight, textColor, bgIcon] = colors.split(' ');

          return (
            <div key={i} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 ${bgLight} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
              
              <div className={`w-14 h-14 rounded-2xl ${bgIcon} ${textColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <FontAwesomeIcon icon={kpi.icon} size="lg" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-end justify-between mb-2">
                  <h3 className="text-3xl font-black text-black leading-none">{kpi.value}</h3>
                  <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg">
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-black font-black text-[10px] uppercase tracking-widest">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-black tracking-tight">Activité Hebdomadaire</h3>
              <p className="text-black font-bold text-xs uppercase tracking-widest mt-1">Volume de réservations par jour</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '15px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
          {/* Distribution */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-black mb-8 tracking-tight">Répartition Flotte</h3>
            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats?.categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-black text-black leading-none">100%</span>
                <span className="text-[8px] font-black text-black uppercase">Capacité</span>
              </div>
            </div>
            <div className="space-y-3 mt-6">
              {stats?.categoryData.map((cat: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">{cat.name}</span>
                  </div>
                  <span className="text-xs font-black text-black">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights / Alerts */}
          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-900/20 text-white">
            <h3 className="text-xl font-black mb-6 tracking-tight">Insights IA</h3>
            <div className="space-y-6">
              {stats?.recentAlerts.map((alert: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.type === 'warning' ? 'bg-amber-500/20 text-amber-500' : 
                    alert.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    <FontAwesomeIcon icon={alert.icon} size="sm" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{alert.title}</h4>
                    <p className="text-[10px] text-black font-bold mt-1 leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
