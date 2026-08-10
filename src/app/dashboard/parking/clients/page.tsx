"use client";

import { useEffect, useState } from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import ClientsTable from '@/components/parking/ClientsTable';
import { parkingAPI } from '@/services/parking/parking-api';

export default function ClientsPage() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisWeek: 0,
  });

  useEffect(() => {
    parkingAPI.getClients().then((clientsData) => {
      if (!clientsData || clientsData.length === 0) return;
      
      const total = clientsData.length;
      const active = clientsData.filter((c: any) => c.status === 'APPROVED').length;
      
      // Calculate new this week (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newThisWeek = clientsData.filter((c: any) => new Date(c.createdAt || Date.now()) > oneWeekAgo).length;

      setStats({ total, active, newThisWeek });
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">Gestion des Clients</h1>
          <p className="text-black mt-1">Gérez et suivez l'activité de vos clients fidèles.</p>
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
              <p className="text-sm text-black font-medium">Total Clients</p>
              <h3 className="text-2xl font-bold text-black">{stats.total}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full">Total</span>
            <span className="text-black font-normal text-[11px]">base de données complète</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-black font-medium">Clients Actifs</p>
              <h3 className="text-2xl font-bold text-black">{stats.active}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
            <span className="text-black font-normal text-[11px]">taux d'approbation</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-black font-medium">Nouveaux</p>
              <h3 className="text-2xl font-bold text-black">{stats.newThisWeek}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full">Récent</span>
            <span className="text-black font-normal text-[11px]">inscrits cette semaine</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Liste des Clients</h2>
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
