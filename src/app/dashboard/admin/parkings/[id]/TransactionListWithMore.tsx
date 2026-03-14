"use client";

import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface Reservation {
  id: number;
  type: "LOCATION" | "ACHAT";
  date: string;
  user: {
    prenom?: string;
    nom?: string;
    email: string;
  };
}

function TransactionItem({ reservation }: { reservation: Reservation }) {
  const user = reservation.user;
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
          {user?.prenom?.charAt(0) || user?.nom?.charAt(0) || "U"}
        </div>
        <div>
          <p className="font-medium">
            {user?.prenom} {user?.nom}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            reservation.type === "LOCATION"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {reservation.type === "LOCATION" ? "Location" : "Achat"}
        </span>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(reservation.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default function TransactionListWithMore({ reservations }: { reservations: Reservation[] }) {
  const [showAll, setShowAll] = useState(false);

  const displayedReservations = showAll ? reservations : reservations.slice(0, 3);
  const hasMore = reservations.length > 3;

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-orange-600" /> Transactions récentes
        </h2>
        <p className="text-gray-500 text-center py-8">Aucune transaction</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Calendar size={20} className="text-orange-600" /> Transactions récentes
      </h2>
      <div className="space-y-3">
        {displayedReservations.map((res) => (
          <TransactionItem key={res.id} reservation={res} />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center justify-center gap-1 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {showAll ? (
            <>
              <ChevronUp size={16} /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Voir les {reservations.length - 3} autres transactions
            </>
          )}
        </button>
      )}
    </div>
  );
}