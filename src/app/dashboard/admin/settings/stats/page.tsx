// app/dashboard/admin/settings/stats/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { settingsAPI, AnalyticsData } from '@/services/admin/settingsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faChartBar,
  faChartPie,
  faUserPlus,
  faCalendarWeek,
  faClock,
  faTurnUp,
  faDownload,
  faMapMarkerAlt,
  faUsers,
  faBuilding,
  faCar,
  faCalendarCheck,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'reservations'>('reservations');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await settingsAPI.getAnalyticsData();
      setAnalytics(data);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = () => {
    switch(selectedMetric) {
      case 'users': return '#F97316';
      case 'reservations': return '#3B82F6';
      default: return '#F97316';
    }
  };

  const getMetricData = () => {
    if (!analytics) return [];
    return analytics.monthlyTrends.map(trend => ({
      month: trend.month,
      [selectedMetric]: selectedMetric === 'users' ? trend.users : trend.reservations,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-black">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-black">Aucune donnée disponible</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Clients', value: analytics.userDistribution.clients, color: '#F97316' },
    { name: 'Parkings', value: analytics.userDistribution.parkings, color: '#3B82F6' },
    { name: 'Admins', value: analytics.userDistribution.admins, color: '#10B981' },
  ];

  // Statistiques clés avec fond blanc et couleurs spécifiques
  const statsCards = [
    { title: 'Utilisateurs', value: analytics.totalUsers, icon: faUsers, color: 'text-orange-500', bgIcon: 'bg-orange-100' },
    { title: 'Parkings', value: analytics.totalParkings, icon: faBuilding, color: 'text-blue-500', bgIcon: 'bg-blue-100' },
    { title: 'Véhicules', value: analytics.totalVehicles, icon: faCar, color: 'text-green-500', bgIcon: 'bg-green-100' },
    { title: 'Réservations', value: analytics.totalReservations, icon: faCalendarCheck, color: 'text-purple-500', bgIcon: 'bg-purple-100' },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Analyses Avancées</h1>
          <p className="text-black mt-1">Statistiques détaillées et tendances de la plateforme</p>
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <FontAwesomeIcon icon={faDownload} className="text-black" />
          Exporter
        </button>
      </div>

      {/* Cartes statistiques - version fond blanc */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgIcon} rounded-xl flex items-center justify-center`}>
                <FontAwesomeIcon icon={card.icon} className={`text-2xl ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-black">{card.value.toLocaleString()}</p>
            <p className="text-black text-sm mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique d'évolution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-orange-500" />
              Évolution (6 derniers mois)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('users')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedMetric === 'users'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Utilisateurs
              </button>
              <button
                onClick={() => setSelectedMetric('reservations')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedMetric === 'reservations'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Réservations
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getMetricData()}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={getMetricColor()} 
                fillOpacity={1} 
                fill="url(#colorMetric)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-black flex items-center gap-2 mb-6">
            <FontAwesomeIcon icon={faChartPie} className="text-orange-500" />
            Distribution des utilisateurs
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deuxième ligne de graphiques */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Parkings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-black flex items-center gap-2 mb-6">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
            Top 5 Parkings
          </h2>
          <div className="space-y-4">
            {analytics.topParkings.map((parking, index) => (
              <div key={parking.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                  {index + 1}
                </div>
                {parking.logo && (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                    <img src={parking.logo} alt={parking.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-black">{parking.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-black">
                      <FontAwesomeIcon icon={faCalendarCheck} className="mr-1 text-xs" />
                      {parking.reservations} réservations
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {analytics.topParkings.length === 0 && (
              <p className="text-center text-black py-8">Aucun parking avec réservations</p>
            )}
          </div>
        </div>

        {/* Activité horaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-black flex items-center gap-2 mb-6">
            <FontAwesomeIcon icon={faClock} className="text-orange-500" />
            Activité par tranche horaire
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="reservations" name="Réservations" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-black text-center mt-4">
            Répartition des réservations par tranche horaire
          </p>
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-black flex items-center gap-2 mb-6">
          <FontAwesomeIcon icon={faTurnUp} className="text-orange-500" />
          Vue d'ensemble
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-black">Utilisateurs par mois</p>
            <p className="text-lg font-semibold text-black">
              {analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.users || 0}
            </p>
            <p className="text-xs text-black mt-1">
              Dernier mois
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-black">Réservations par mois</p>
            <p className="text-lg font-semibold text-black">
              {analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.reservations || 0}
            </p>
            <p className="text-xs text-black mt-1">
              Dernier mois
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-black">Moyenne utilisateurs/mois</p>
            <p className="text-lg font-semibold text-black">
              {Math.round(analytics.monthlyTrends.reduce((sum, t) => sum + t.users, 0) / analytics.monthlyTrends.length) || 0}
            </p>
            <p className="text-xs text-black mt-1">
              Sur 6 mois
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-black">Moyenne réservations/mois</p>
            <p className="text-lg font-semibold text-black">
              {Math.round(analytics.monthlyTrends.reduce((sum, t) => sum + t.reservations, 0) / analytics.monthlyTrends.length) || 0}
            </p>
            <p className="text-xs text-black mt-1">
              Sur 6 mois
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}