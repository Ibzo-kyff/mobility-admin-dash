// app/(dashboard)/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCar,
  faParking,
  faChartLine,
  faUserCheck,
  faUserClock,
  faEuroSign,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import StatsCard from '@/components/ui/StatsCard';
import RecentUsersTable from '@/components/admin/RecentUsersTable';
import RevenueChart from '@/components/admin/RevenueChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicules: 0,
    totalParkings: 0,
    pendingApprovals: 0,
    totalReservations: 0,
    revenue: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Charger toutes les statistiques admin
      const [users, vehicules, parkings, reservations] = await Promise.all([
        mobilityAPI.getAllUsers(),
        mobilityAPI.getVehicules(),
        mobilityAPI.getParkings(),
        mobilityAPI.getAllReservations()
      ]);

      setStats({
        totalUsers: users.length,
        totalVehicules: vehicules.length,
        totalParkings: parkings.length,
        pendingApprovals: users.filter(u => u.status === 'PENDING').length,
        totalReservations: reservations.length,
        revenue: reservations.reduce((sum, r) => sum + (r.total || 0), 0),
        activeUsers: users.filter(u => u.status === 'APPROVED').length
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord Admin</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Exporter rapport
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={faUsers}
          color="bg-blue-500"
          trend="+12%"
        />
        <StatsCard
          title="Véhicules"
          value={stats.totalVehicules}
          icon={faCar}
          color="bg-green-500"
          trend="+5%"
        />
        <StatsCard
          title="Parkings"
          value={stats.totalParkings}
          icon={faParking}
          color="bg-purple-500"
          trend="+8%"
        />
        <StatsCard
          title="Revenus"
          value={`${stats.revenue}€`}
          icon={faEuroSign}
          color="bg-yellow-500"
          trend="+15%"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Approbations en attente"
          value={stats.pendingApprovals}
          icon={faUserClock}
          color="bg-orange-500"
        />
        <StatsCard
          title="Réservations"
          value={stats.totalReservations}
          icon={faCalendarCheck}
          color="bg-indigo-500"
        />
        <StatsCard
          title="Utilisateurs actifs"
          value={stats.activeUsers}
          icon={faUserCheck}
          color="bg-teal-500"
        />
      </div>

      {/* Charts et Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
          <div className="space-y-4">
            {/* Activité list */}
          </div>
        </div>
      </div>

      {/* Utilisateurs récents */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Utilisateurs en attente</h2>
        <RecentUsersTable />
      </div>
    </div>
  );
}