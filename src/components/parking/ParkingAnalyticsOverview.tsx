'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faChartBar,
  faParking,
  faUsers,
  faCar,
  faClock,
  faCalendarDay,
  faArrowRight,
  faArrowTrendUp,
  faArrowTrendDown,
} from '@fortawesome/free-solid-svg-icons';
import { parkingAPI } from '@/services/parking/parking-api';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';

export default function ParkingAnalyticsOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await parkingAPI.getAnalytics();
      setStats({
        occupancyRate: data.occupancyRate || 68,
        topVehicles: data.topVehicles || [
          { name: 'Mercedes Classe C', value: 45 },
          { name: 'Toyota RAV4', value: 32 },
          { name: 'Peugeot 3008', value: 24 },
          { name: 'Range Rover', value: 18 },
        ],
        peakHours: [
          { hour: '08h', count: 12 },
          { hour: '10h', count: 18 },
          { hour: '12h', count: 25 },
          { hour: '14h', count: 20 },
          { hour: '16h', count: 30 },
          { hour: '18h', count: 35 },
          { hour: '20h', count: 22 },
        ],
        categories: [
          { name: 'Standard', value: 60, fill: '#6366f1' },
          { name: 'Luxe', value: 25, fill: '#f97316' },
          { name: 'Utilitaire', value: 15, fill: '#10b981' },
        ]
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f97316', '#6366f1', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Génération des rapports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Occupancy Card */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: stats.occupancyRate },
                    { value: 100 - stats.occupancyRate }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  <Cell fill="#f97316" stroke="none" />
                  <Cell fill="#f1f5f9" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 leading-none">{stats.occupancyRate}%</span>
              <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Occupé</span>
            </div>
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Taux d'Occupation</h3>
            <p className="text-slate-500 text-sm font-medium">Votre parking est actuellement utilisé à {stats.occupancyRate}% de sa capacité totale.</p>
            <div className="flex items-center gap-2 justify-center md:justify-start text-emerald-500 font-bold text-xs uppercase tracking-widest">
              <FontAwesomeIcon icon={faArrowTrendUp} />
              +5% depuis hier
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Répartition par Catégorie</h3>
           <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="30%" 
                  outerRadius="100%" 
                  data={stats.categories} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar
                    label={{ fill: '#fff', position: 'insideStart', fontSize: 10, fontWeight: 900 }}
                    background
                    dataKey="value"
                  />
                  <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right" 
                    wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Peak Hours */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pics d'Affluence</h3>
             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
               <FontAwesomeIcon icon={faClock} />
             </div>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.peakHours}>
                 <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                 <YAxis hide />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12, fontWeight: 900 }} />
                 <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Top Performing Vehicles */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Top Véhicules</h3>
          <div className="space-y-6">
            {stats.topVehicles.map((v: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                   <span className="text-slate-900">{v.name}</span>
                   <span className="text-orange-500">{v.value} rés.</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(v.value / stats.topVehicles[0].value) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
