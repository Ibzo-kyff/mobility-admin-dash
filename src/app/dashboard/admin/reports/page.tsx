
import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}


// 'use client';

// import { useState, useEffect } from 'react';
// import { settingsAPI, ReportSummary } from '@/services/admin/settingsApi';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faChartBar, 
//   faCalendarDay, 
//   faCalendarWeek, 
//   faCalendarAlt,
//   faSpinner,
//   faRefresh 
// } from '@fortawesome/free-solid-svg-icons';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend
// } from 'recharts';

// export default function ReportsPage() {
//   const [summary, setSummary] = useState<ReportSummary | null>(null);
//   const [activityByDay, setActivityByDay] = useState<Array<{ date: string; count: number }>>([]);
//   const [loading, setLoading] = useState(true);

//   const loadReports = async () => {
//     setLoading(true);
//     try {
//       const [summaryData, activityData] = await Promise.all([
//         settingsAPI.getReportSummary(),
//         settingsAPI.getActivityByDay(30)
//       ]);

//       setSummary(summaryData);
//       setActivityByDay(activityData);
//     } catch (error) {
//       console.error('Erreur chargement rapports:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadReports();
//   }, []);

//   const handleRefresh = () => loadReports();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[70vh]">
//         <FontAwesomeIcon icon={faSpinner} className="text-5xl text-orange-500 animate-spin" />
//       </div>
//     );
//   }

//   if (!summary) {
//     return <div className="p-10 text-center text-gray-500">Impossible de charger les rapports</div>;
//   }

//   const pieData = summary.topActions.map((item, index) => ({
//     name: item.action,
//     value: item.count,
//     color: ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'][index % 5]
//   }));

//   return (
//     <div className="p-8 max-w-[1400px] mx-auto">
//       <div className="flex justify-between items-center mb-10">
//         <div>
//           <h1 className="text-4xl font-bold text-gray-900">Rapports & Statistiques Serveur</h1>
//           <p className="text-gray-600 mt-2">Vue d'ensemble de l'activité sur la plateforme</p>
//         </div>
//         <button
//           onClick={handleRefresh}
//           className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50"
//         >
//           <FontAwesomeIcon icon={faRefresh} />
//           Rafraîchir
//         </button>
//       </div>

//       {/* KPIs */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
//           <p className="text-gray-500 text-sm">Total des logs</p>
//           <p className="text-5xl font-bold text-gray-900 mt-4">{summary.totalLogs.toLocaleString()}</p>
//         </div>

//         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <FontAwesomeIcon icon={faCalendarDay} className="text-3xl text-orange-500" />
//             <div>
//               <p className="text-gray-500 text-sm">Aujourd'hui</p>
//               <p className="text-4xl font-bold text-orange-600">{summary.logsToday}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <FontAwesomeIcon icon={faCalendarWeek} className="text-3xl text-blue-500" />
//             <div>
//               <p className="text-gray-500 text-sm">Cette semaine</p>
//               <p className="text-4xl font-bold text-blue-600">{summary.logsThisWeek}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl text-emerald-500" />
//             <div>
//               <p className="text-gray-500 text-sm">Ce mois-ci</p>
//               <p className="text-4xl font-bold text-emerald-600">{summary.logsThisMonth}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-8">
//         {/* Activité par jour */}
//         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
//           <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
//             <FontAwesomeIcon icon={faChartBar} className="text-orange-500" />
//             Activité des 30 derniers jours
//           </h2>
//           <ResponsiveContainer width="100%" height={320}>
//             <BarChart data={activityByDay}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
//               <XAxis dataKey="date" stroke="#9ca3af" />
//               <YAxis stroke="#9ca3af" />
//               <Tooltip />
//               <Bar dataKey="count" fill="#F97316" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Top Actions */}
//         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
//           <h2 className="text-xl font-semibold mb-6">Répartition des actions</h2>
//           <ResponsiveContainer width="100%" height={320}>
//             <PieChart>
//               <Pie
//                 data={pieData}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={70}
//                 outerRadius={110}
//                 dataKey="value"
//               >
//                 {pieData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Top Entités & Utilisateurs */}
//       <div className="grid lg:grid-cols-2 gap-8 mt-8">
//         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
//           <h2 className="text-xl font-semibold mb-6">Entités les plus actives</h2>
//           <div className="space-y-5">
//             {summary.topEntities.map((item, i) => (
//               <div key={i} className="flex justify-between items-center">
//                 <span className="font-medium">{item.entity}</span>
//                 <span className="text-orange-600 font-semibold">{item.count} actions</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
//           <h2 className="text-xl font-semibold mb-6">Utilisateurs les plus actifs</h2>
//           <div className="space-y-5">
//             {summary.mostActiveUsers.map((item, i) => (
//               <div key={i} className="flex justify-between items-center">
//                 <span className="font-medium">{item.userName}</span>
//                 <span className="text-orange-600 font-semibold">{item.count} actions</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }