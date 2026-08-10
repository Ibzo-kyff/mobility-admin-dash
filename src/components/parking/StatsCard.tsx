import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconDefinition;
  color: string;
  trend?: string;
}

export default function StatsCard({ title, value, icon, color, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="text-3xl font-bold text-black mt-2">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white`}>
          <FontAwesomeIcon icon={icon} className="text-2xl" />
        </div>
      </div>
      {trend && (
        <p className="text-emerald-600 text-sm font-medium mt-4 flex items-center gap-1">
          {trend} <span className="text-xs">ce mois</span>
        </p>
      )}
    </div>
  );
}