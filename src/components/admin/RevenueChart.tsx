'use client';

import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

interface RevenueData {
  month: string;
  revenue: number;
}

interface Props {
  reservations: any[];   // ← PROP OBLIGATOIRE maintenant
}

export default function RevenueChart({ reservations }: Props) {
  // Calcul des revenus mensuels à partir des réservations
  const data: RevenueData[] = useMemo(() => {
    const monthlyMap = new Map<string, number>();

    reservations.forEach((res) => {
      if (!res.createdAt) return;
      
      const date = new Date(res.createdAt);
      const monthKey = date.toLocaleString('fr-FR', { month: 'short' });
      
      const amount = res.total || res.amount || res.price || 0;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
    });

    // Génère les 12 derniers mois (même ceux à 0€)
    const now = new Date();
    const result: RevenueData[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('fr-FR', { month: 'short' });
      const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      result.push({
        month: formattedMonth,
        revenue: monthlyMap.get(monthName) || 0,
      });
    }

    return result;
  }, [reservations]);

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1); // évite division par 0
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const averageRevenue = data.length ? Math.round(totalRevenue / data.length) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-black">Revenus mensuels</h2>
        <div className="flex items-center gap-2 text-sm text-black">
          <FontAwesomeIcon icon={faChartLine} className="text-orange-500" />
          <span>+23% vs mois dernier</span>
        </div>
      </div>

      {/* Graphique à barres */}
      <div className="flex-1 flex items-end justify-between gap-3 pb-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 group relative">
            <div className="relative w-full flex justify-center">
              <div
                className="w-full max-w-[42px] bg-gradient-to-t from-orange-500 via-orange-400 to-orange-300 rounded-t-xl transition-all duration-700 hover:from-orange-600 hover:to-orange-500 shadow-sm"
                style={{
                  height: `${(item.revenue / maxRevenue) * 210}px`,
                }}
              >
                {/* Tooltip au survol */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                  {item.revenue.toLocaleString('fr-FR')} €
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>

            <span className="mt-3 text-xs font-medium text-black">
              {item.month}
            </span>
          </div>
        ))}
      </div>

      {/* Résumé en bas */}
      <div className="mt-auto pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-black">Revenu total (12 mois)</p>
          <p className="text-3xl font-bold text-black mt-1">
            {totalRevenue.toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black">Moyenne mensuelle</p>
          <p className="text-3xl font-bold text-black mt-1">
            {averageRevenue.toLocaleString('fr-FR')} €
          </p>
        </div>
      </div>

      {reservations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <p className="text-black text-lg">Aucune réservation pour le moment</p>
        </div>
      )}
    </div>
  );
}