"use client";

import AnalyticsCharts from '@/components/parking/AnalyticsCharts';
import RevenueOverview from '@/components/parking/RevenueOverview';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Statistiques</h1>
      <p className="text-gray-600">Statistiques et rapports pour votre parking.</p>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCharts />
        <RevenueOverview />
      </div>
    </div>
  );
}
