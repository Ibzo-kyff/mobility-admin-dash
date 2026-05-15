"use client";

import { Users, UserCheck, UserPlus } from 'lucide-react';
import ClientsTable from '@/components/parking/ClientsTable';

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestion des Clients</h1>
          <p className="text-gray-500 mt-1">Gérez et suivez l'activité de vos clients fidèles.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Clients</p>
              <h3 className="text-2xl font-bold text-gray-900">1,284</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
            <span className="text-gray-400 font-normal text-[11px]">depuis le mois dernier</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Clients Actifs</p>
              <h3 className="text-2xl font-bold text-gray-900">856</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full">67%</span>
            <span className="text-gray-400 font-normal text-[11px]">taux d'engagement</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Nouveaux</p>
              <h3 className="text-2xl font-bold text-gray-900">42</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full">+5%</span>
            <span className="text-gray-400 font-normal text-[11px]">cette semaine</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Liste des Clients</h2>
          <div className="flex items-center gap-2">
            <select className="bg-gray-50 border-none text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Tous les statuts</option>
              <option>Actif</option>
              <option>Inactif</option>
              <option>Bloqué</option>
            </select>
          </div>
        </div>
        <ClientsTable />
      </div>
    </div>
  );
}
