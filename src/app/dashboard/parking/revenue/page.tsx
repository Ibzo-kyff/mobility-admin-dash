"use client";

import RevenueOverview from '@/components/parking/RevenueOverview';

export default function RevenuePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Revenus</h1>
      <p className="text-gray-600">Vue d'ensemble des revenus générés par le parking.</p>
      <div className="mt-6">
        <RevenueOverview />
      </div>
    </div>
  );
}
