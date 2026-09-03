"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateParkingInfo } from "@/services/Parcking-api";
import { mobilityAPI } from "@/services/mobility-api";
import { X, Save, Edit } from "lucide-react";

interface Parking {
  id: number;
  name: string;
  address: string;
  city?: string;
  capacity: number;
  email?: string;
  phone?: string;
  description?: string;
}

export default function EditParkingInline({
  parking,
  onUpdate,
}: {
  parking: Parking;
  onUpdate?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: parking.name,
    address: parking.address,
    city: parking.city || "",
    capacity: parking.capacity,
    email: parking.email || "",
    phone: parking.phone || "",
    description: parking.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = mobilityAPI.getToken() || localStorage.getItem("token");
      const result = await updateParkingInfo(parking.id, formData, token || undefined);
      if (result.success) {
        setIsEditing(false);
        if (onUpdate) {
          onUpdate();
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95"
      >
        <Edit size={16} /> Modifier les informations
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-4 sm:p-6 mt-4 w-full">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Edit size={18} className="text-orange-600" /> Modifier le parking
        </h2>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du parking *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (places) *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleNumberChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} /> {isSubmitting ? "Modification..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}