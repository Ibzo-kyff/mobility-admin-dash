'use client';

import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

interface Props {
  reservations: any[];
}

export default function MonthlyReservationsChart({ reservations }: Props) {
  const data = useMemo(() => {
    const monthly = new Map<string, number>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleString('fr-FR', { month: 'short' });
      monthly.set(monthKey, 0);
    }

    reservations.forEach((res) => {
      if (!res.createdAt) return;
      const d = new Date(res.createdAt);
      const monthKey = d.toLocaleString('fr-FR', { month: 'short' });
      if (monthly.has(monthKey)) {
        monthly.set(monthKey, (monthly.get(monthKey) || 0) + 1);
      }
    });

    return Array.from(monthly.entries()).map(([month, count]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      count,
    }));
  }, [reservations]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Évolution des réservations</h2>
        <div className="flex items-center gap-2 text-sm text-black">
          <FontAwesomeIcon icon={faChartLine} className="text-orange-500" />
          <span>12 derniers mois</span>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-3">
        {data.map((item) => (
          <div key={item.month} className="flex-1 flex flex-col items-center group">
            <div className="relative w-full flex justify-center">
              <div
                className="w-full max-w-[42px] bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-xl transition-all hover:brightness-110"
                style={{ height: `${(item.count / maxCount) * 220}px` }}
              />
            </div>
            <span className="mt-3 text-xs font-medium text-black">{item.month}</span>
            <span className="text-sm font-semibold text-black mt-1">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}