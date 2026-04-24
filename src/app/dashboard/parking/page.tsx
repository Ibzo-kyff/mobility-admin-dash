'use client';

import React, { useEffect, useState } from 'react';
import { parkingAPI } from '@/services/parking/parking-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEuroSign,
  faParking,
  faCar,
  faCalendarCheck,
  faClock,
  faUsers,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';

import StatsCard from '@/components/ui/StatsCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ParkingDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueThisMonth: 0,
    occupancyRate: 0,
    totalReservations: 0,
    reservationsToday: 0,
    activeReservations: 0,
    totalVehicles: 0,
    upcomingReservations: 0,
  });

  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueSummary, analyticsData, reservations, vehicles] = await Promise.all([
        parkingAPI.getRevenueSummary(),
        parkingAPI.getAnalytics(),
        parkingAPI.getReservations(),
        parkingAPI.getMyVehicles(),
      ]);

      const todayStr = new Date().toISOString().split('T')[0];

      const reservationsToday = reservations.filter((r: any) => {
        const dateStr = r.startDate || r.date || r.createdAt || '';
        return dateStr.startsWith(todayStr);
      }).length;

      const activeReservations = reservations.filter((r: any) =>
        ['CONFIRMED', 'ACTIVE', 'ONGOING'].includes((r.status || '').toUpperCase())
      ).length;

      const upcomingReservations = reservations.filter((r: any) => {
        const start = new Date(r.startDate || r.date || r.createdAt || 0);
        return start > new Date() && ['PENDING', 'CONFIRMED'].includes((r.status || '').toUpperCase());
      }).length;

      setStats({
        totalRevenue: revenueSummary.total || revenueSummary.totalRevenue || 0,
        revenueThisMonth: revenueSummary.thisMonth || revenueSummary.monthly || 0,
        occupancyRate: analyticsData.occupancyRate || analyticsData.occupancy || 0,
        totalReservations: reservations.length,
        reservationsToday,
        activeReservations,
        totalVehicles: vehicles.length,
        upcomingReservations,
      });

      // Graphique revenu (si l'API renvoie daily)
      const chartRaw = revenueSummary.daily || revenueSummary.revenueByDay || [];
      setRevenueChartData(chartRaw.map((item: any) => ({
        date: item.date || item.day || 'Date inconnue',
        amount: Number(item.amount || item.revenue || item.value || 0),
      })));

      // Dernières réservations
      const sorted = [...reservations]
        .sort((a, b) => new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime())
        .slice(0, 8);

      setRecentReservations(sorted);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors du chargement des données");
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

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {error} <br />
        <button onClick={loadDashboardData} className="underline mt-2">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord Parking</h1>
        <button
          onClick={loadDashboardData}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faChartLine} />
          Actualiser
        </button>
      </div>

      {/* Ligne 1 - Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Revenu Total" value={`${stats.totalRevenue.toLocaleString('fr-FR')} €`} icon={faEuroSign} color="bg-emerald-500" />
        <StatsCard title="Revenu ce mois" value={`${stats.revenueThisMonth.toLocaleString('fr-FR')} €`} icon={faEuroSign} color="bg-orange-500" trend="+18%" />
        <StatsCard title="Taux d'Occupation" value={`${stats.occupancyRate}%`} icon={faParking} color="bg-blue-500" />
        <StatsCard title="Véhicules" value={stats.totalVehicles} icon={faCar} color="bg-purple-500" />
      </div>

      {/* Ligne 2 - Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Réservations Aujourd'hui" value={stats.reservationsToday} icon={faCalendarCheck} color="bg-amber-500" />
        <StatsCard title="Réservations Actives" value={stats.activeReservations} icon={faClock} color="bg-indigo-500" />
        <StatsCard title="À Venir" value={stats.upcomingReservations} icon={faUsers} color="bg-teal-500" />
      </div>

      {/* Graphique + Dernières Réservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Évolution du Revenu</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v: number) => [`${v} €`, 'Revenu']} />
                <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={4} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Dernières Réservations</h2>
          {recentReservations.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Aucune réservation récente</div>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto">
              {recentReservations.map((res: any) => (
                <div key={res.id} className="flex gap-4 py-3 border-b last:border-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">
                      {(res.client?.prenom || res.user?.prenom || 'R')[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {res.client?.prenom || res.user?.prenom} {res.client?.nom || res.user?.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {res.vehicle?.marque} {res.vehicle?.modele}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                      res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                      res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                    }`}>
                      {res.status}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(res.createdAt || res.startDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}