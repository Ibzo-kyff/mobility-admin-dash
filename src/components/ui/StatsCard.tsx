// components/ui/StatsCard.tsx
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconDefinition;
  color: string;
  trend?: string;
}

export default function StatsCard({ title, value, icon, color, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black text-sm">{title}</p>
          <p className="text-2xl font-bold text-black mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2">+{trend} ce mois</p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
      </div>
    </div>
  );
}