'use client';

import { useEffect, useState } from 'react';
import { parkingAPI } from '@/services/parking/parking-api';

export default function ClientsTable() {
  const [clients, setClients] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    parkingAPI.getClients()
      .then((d) => mounted && setClients(d || []))
      .catch(() => {})
    return () => { mounted = false; };
  }, []);

  if (!clients) return <div>Chargement clients...</div>;
  if (clients.length === 0) return <div className="bg-white border p-4 rounded">Aucun client trouvé.</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Clients</h3>
      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.id} className="p-2 border rounded">{c.name || c.fullName || 'Client'}</li>
        ))}
      </ul>
    </div>
  );
}
