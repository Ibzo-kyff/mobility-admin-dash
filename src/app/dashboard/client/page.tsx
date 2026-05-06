"use client";

import React, { useEffect, useState } from 'react';
import { clientAPI } from '@/services/client/client-api';
import { mobilityAPI } from '@/services/mobility-api';
import { parkingAPI } from '@/services/parking/parking-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faCar,
  faCreditCard,
  faStar,
  faSearch,
  faHistory,
  faChartLine,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import StatsCard from '@/components/ui/StatsCard';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

interface ClientStats {
  activeReservations: number;
  totalVehicles: number;
  loyaltyPoints: number;
  totalSpent: number;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    activeReservations: 0,
    totalVehicles: 0,
    loyaltyPoints: 1250,
    totalSpent: 85000
  });
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await clientAPI.getDashboardStats(user.id);
      
      setUpcomingReservations(dashboardData.reservations);
      setStats({
        activeReservations: dashboardData.activeReservations,
        totalVehicles: dashboardData.totalVehicles,
        loyaltyPoints: dashboardData.loyaltyPoints,
        totalSpent: dashboardData.totalSpent
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError("Erreur lors du chargement des données");
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, <span className="text-orange-500">{user?.prenom || 'Client'}</span>
          </h1>
          <p className="text-gray-500">Gérez vos réservations et vos véhicules en toute simplicité.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/client/search" 
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <FontAwesomeIcon icon={faSearch} />
            Réserver
          </Link>
          <button
            onClick={loadDashboardData}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon icon={faChartLine} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Réservations Actives" value={stats.activeReservations} icon={faCalendarCheck} color="bg-blue-500" />
        <StatsCard title="Mes Véhicules" value={stats.totalVehicles} icon={faCar} color="bg-purple-500" />
        <StatsCard title="Dépenses (Mensuel)" value={`${stats.totalSpent.toLocaleString()} F`} icon={faCreditCard} color="bg-emerald-500" trend="+12%" />
        <StatsCard title="Points Fidélité" value={stats.loyaltyPoints} icon={faStar} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prochaines réservations */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-orange-500" />
              Prochaines Réservations
            </h2>
            <Link href="/dashboard/client/reservations" className="text-sm text-orange-600 hover:underline font-medium">
              Voir tout
            </Link>
          </div>

          {upcomingReservations.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Aucune réservation à venir</p>
              <Link href="/dashboard/client/search" className="mt-2 text-orange-500 font-bold hover:underline inline-block">
                Trouver un parking
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((res: any) => (
                <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50/30 transition-colors border border-transparent hover:border-orange-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm border border-gray-100">
                      <FontAwesomeIcon icon={faCalendarCheck} className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{res.parking?.nom || 'Parking Place'}</h3>
                      <p className="text-sm text-gray-500">{res.date || new Date(res.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{res.prix || '2.500'} F</p>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                        res.status === 'APPROVED' || res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    <FontAwesomeIcon icon={faHistory} className="text-gray-300 group-hover:text-orange-400 transition-colors cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Rapides */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Actions Rapides</h2>
            <div className="space-y-3">
              <QuickActionLink 
                icon={faCar} 
                title="Gérer mes véhicules" 
                href="/dashboard/client/vehicles" 
                color="text-purple-600 bg-purple-50"
              />
              <QuickActionLink 
                icon={faHistory} 
                title="Mon Historique" 
                href="/dashboard/client/reservations" 
                color="text-blue-600 bg-blue-50"
              />
              <QuickActionLink 
                icon={faCreditCard} 
                title="Mes Paiements" 
                href="/dashboard/client/billing" 
                color="text-emerald-600 bg-emerald-50"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
            <FontAwesomeIcon icon={faStar} className="absolute -right-4 -bottom-4 text-white/10 text-8xl" />
            <h3 className="font-bold text-lg mb-2">Programme Fidélité</h3>
            <p className="text-orange-50/80 text-sm mb-4">Vous avez 1250 points. Plus que 250 pour une place gratuite !</p>
            <button className="w-full py-2 bg-white text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors">
              Voir mes avantages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionLink({ icon, title, href, color }: { icon: any, title: string, href: string, color: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <span className="font-medium text-gray-700 group-hover:text-gray-900 flex-1">{title}</span>
      <FontAwesomeIcon icon={faHistory} className="text-gray-300 group-hover:text-gray-400 text-xs" />
    </Link>
  );
}
