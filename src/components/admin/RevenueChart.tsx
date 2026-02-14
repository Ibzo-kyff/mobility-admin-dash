// components/admin/RevenueChart.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

interface RevenueData {
  month: string;
  revenue: number;
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([
    { month: 'Jan', revenue: 4500 },
    { month: 'Fév', revenue: 5200 },
    { month: 'Mar', revenue: 6100 },
    { month: 'Avr', revenue: 5800 },
    { month: 'Mai', revenue: 7200 },
    { month: 'Juin', revenue: 8900 },
    { month: 'Juil', revenue: 10100 },
    { month: 'Août', revenue: 11200 },
    { month: 'Sep', revenue: 9800 },
    { month: 'Oct', revenue: 10500 },
    { month: 'Nov', revenue: 11700 },
    { month: 'Déc', revenue: 13400 },
  ]);

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Revenus mensuels</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FontAwesomeIcon icon={faChartLine} className="text-orange-500" />
          <span>+23% vs mois dernier</span>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="relative w-full flex justify-center">
              <div
                className="w-full max-w-[40px] bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all duration-500 hover:from-orange-600 hover:to-orange-500"
                style={{
                  height: `${(item.revenue / maxRevenue) * 180}px`,
                }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2">
                  {item.revenue.toLocaleString()}€
                </div>
              </div>
            </div>
            <span className="mt-2 text-xs text-gray-600">{item.month}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Revenu total</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}€
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Moyenne mensuelle</p>
            <p className="text-lg font-semibold text-gray-800">
              {Math.round(data.reduce((sum, item) => sum + item.revenue, 0) / data.length).toLocaleString()}€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}