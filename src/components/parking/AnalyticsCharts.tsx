'use client';

import { useEffect, useState } from 'react';
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
  Legend 
} from 'recharts';

export default function AnalyticsCharts() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    parkingAPI.getAnalytics()
      .then((d) => {
        if (mounted) {
          setData(d || {
            occupancyRate: 0,
            vehicleCategories: [
              { name: 'Standard', value: 0 },
              { name: 'Luxe', value: 0 },
            ]
          });
        }
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="bg-white border p-4 rounded animate-pulse">Chargement des graphiques...</div>;
  if (!data) return <div className="bg-white border p-4 rounded">Aucune donnée d'analytics.</div>;

  const categoryData = data.vehicleCategories || [
    { name: 'Standard', value: 60 },
    { name: 'Luxe', value: 40 },
  ];

  const COLORS = ['#f97316', '#6366f1', '#10b981', '#f59e0b'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Statistiques d'utilisation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taux d'occupation */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-2">Répartition par catégorie</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupation Rate */}
        <div className="flex flex-col items-center justify-center border-l pl-6">
          <p className="text-sm text-gray-500 mb-4">Taux d'occupation actuel</p>
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-gray-100">
             <div className="text-2xl font-bold text-orange-500">{data.occupancyRate || 0}%</div>
             <div 
               className="absolute inset-0 rounded-full border-8 border-orange-500 border-t-transparent border-l-transparent rotate-45"
               style={{ clipPath: `inset(0 0 0 0)` }}
             ></div>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center italic">Basé sur votre capacité totale</p>
        </div>
      </div>
    </div>
  );
}
