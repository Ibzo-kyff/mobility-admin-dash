import React, { useState } from 'react';
import { getAllPhotoUrls } from '../../utils/photos';
import type { Vehicle } from '../../types';

interface Props {
  vehicle?: Vehicle | null;
  className?: string;
}

const VehicleGallery: React.FC<Props> = ({ vehicle, className }) => {
  const photos = getAllPhotoUrls(vehicle?.photos ?? []);
  const [index, setIndex] = useState(0);

  if (!vehicle) return null;

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div className={className}>
      <div className="w-full h-64 bg-gray-100 relative">
        <img src={photos[index]} alt={`photo-${index}`} className="w-full h-64 object-cover" />
        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded">‹</button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded">›</button>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {photos.map((p, idx) => (
          <button key={idx} onClick={() => setIndex(idx)} className={`w-20 h-14 overflow-hidden rounded ${idx === index ? 'ring-2 ring-blue-500' : ''}`}>
            <img src={p} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleGallery;
