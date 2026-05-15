'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faParking, faStar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function FavoritesPage() {
  const favorites = [
    { id: 1, name: 'Parking Central', location: 'Dakar, Plateau', rating: 4.8, price: '2500 F/jour' },
    { id: 2, name: 'Parking Aéroport', location: 'AIBD, Thiès', rating: 4.5, price: '5000 F/jour' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Favoris</h1>
          <p className="text-gray-500">Retrouvez vos parkings préférés ici.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.length > 0 ? (
          favorites.map((fav) => (
            <div key={fav.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                  <FontAwesomeIcon icon={faParking} className="text-xl" />
                </div>
                <button className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                  <FontAwesomeIcon icon={faHeart} />
                </button>
              </div>
              <h3 className="font-bold text-lg text-gray-800">{fav.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                <span>{fav.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center text-amber-500 text-sm font-bold">
                  <FontAwesomeIcon icon={faStar} className="mr-1" />
                  {fav.rating}
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-orange-600 font-bold text-sm">{fav.price}</span>
              </div>
              <button className="w-full mt-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition-colors">
                Réserver à nouveau
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <FontAwesomeIcon icon={faHeart} className="text-4xl text-gray-200 mb-4" />
            <p className="text-gray-500">Vous n'avez pas encore de favoris.</p>
          </div>
        )}
      </div>
    </div>
  );
}
