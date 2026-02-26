'use client';

import { useEffect, useState } from 'react';
import { adminDashboardService, type AdminStats } from '@/services/admin/dashboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faCar, faParking, faCalendarCheck,
  faUserCheck, faUserClock, faChartLine
} from '@fortawesome/free-solid-svg-icons';

import StatsCard from '@/components/ui/StatsCard';
import RecentUsersTable from '@/components/admin/RecentUsersTable';
import MonthlyReservationsChart from '@/components/admin/MonthlyReservationsChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVehicules: 0,
    totalParkings: 0,
    pendingApprovals: 0,
    totalReservations: 0,
    reservationsThisMonth: 0,
    newUsersThisMonth: 0,
    activeReservations: 0,
  });

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, pending, recent] = await Promise.all([
        adminDashboardService.getStats(),
        adminDashboardService.getPendingUsers(10),
        adminDashboardService.getRecentReservations(8)
      ]);

      setStats(statsData);
      setPendingUsers(pending);
      setRecentReservations(recent);
    } catch (error) {
      console.error('Erreur dashboard:', error);
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
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          Exporter rapport
        </button>
      </div>

      {/* Première ligne de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Utilisateurs" value={stats.totalUsers} icon={faUsers} color="bg-blue-500" trend="+12%" />
        <StatsCard title="Véhicules" value={stats.totalVehicules} icon={faCar} color="bg-green-500" trend="+5%" />
        <StatsCard title="Parkings" value={stats.totalParkings} icon={faParking} color="bg-purple-500" trend="+8%" />
        <StatsCard title="Réservations ce mois" value={stats.reservationsThisMonth} icon={faCalendarCheck} color="bg-orange-500" trend="+18%" />
      </div>

      {/* Deuxième ligne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Approbations en attente" value={stats.pendingApprovals} icon={faUserClock} color="bg-amber-500" />
        <StatsCard title="Réservations totales" value={stats.totalReservations} icon={faCalendarCheck} color="bg-indigo-500" />
        <StatsCard title="Nouveaux utilisateurs" value={stats.newUsersThisMonth} icon={faUserCheck} color="bg-teal-500" trend="+22%" />
      </div>

      {/* Graphique + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyReservationsChart reservations={recentReservations} />
        </div>

        {/* ==================== ACTIVITÉ RÉCENTE ==================== */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartLine} className="text-orange-500" />
            Activité récente
          </h2>

          {recentReservations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Aucune réservation récente pour le moment
            </div>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {recentReservations.map((res: any) => (
                <div key={res.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  {/* Avatar utilisateur */}
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold text-lg">
                      {res.user?.prenom?.[0] || 'U'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {res.user?.prenom} {res.user?.nom}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {res.vehicule?.marque} {res.vehicule?.modele}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${
                      res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {res.status || 'N/A'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {new Date(res.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Utilisateurs en attente */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Utilisateurs en attente</h2>
        <RecentUsersTable users={pendingUsers} />
      </div>
    </div>
  );
}