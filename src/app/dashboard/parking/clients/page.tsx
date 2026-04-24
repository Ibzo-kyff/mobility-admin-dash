"use client";

import ClientsTable from '@/components/parking/ClientsTable';

export default function ClientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>
      <p className="text-gray-600">Liste des clients qui utilisent vos services.</p>
      <div className="mt-6">
        <ClientsTable />
      </div>
    </div>
  );
}
