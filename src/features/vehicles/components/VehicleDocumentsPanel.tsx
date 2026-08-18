import React from 'react';
import type { Vehicle } from '../types';

interface Props {
  vehicle?: Vehicle | null;
}

const VehicleDocumentsPanel: React.FC<Props> = ({ vehicle }) => {
  if (!vehicle) return null;

  const documents = [] as Array<{ label: string; url?: string }>;
  if ((vehicle as any).carteGrise) documents.push({ label: 'Carte Grise', url: (vehicle as any).carteGrise });
  if ((vehicle as any).vignette) documents.push({ label: 'Vignette', url: (vehicle as any).vignette });

  return (
    <div className="p-4 border rounded bg-white mt-4">
      <h4 className="text-lg font-semibold mb-2">Documents</h4>
      {documents.length === 0 ? (
        <div className="text-sm text-gray-500">Aucun document disponible.</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {documents.map((d, i) => (
            <li key={i} className="flex justify-between items-center">
              <div>{d.label}</div>
              {d.url ? (
                <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600">Voir</a>
              ) : (
                <div className="text-gray-500">—</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VehicleDocumentsPanel;
