// app/dashboard/admin/settings/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { settingsAPI, AdminProfile } from '@/services/admin/settingsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faUser, 
  faCamera, 
  faSpinner,
  faCheckCircle,
  faEnvelope,
  faPhone,
  faCalendar,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await settingsAPI.getAdminProfile();
      setProfile(data);
      setForm({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        phone: data.phone || '',
      });
      setImagePreview(data.image || null);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 5MB' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updated = await settingsAPI.updateAdminProfile(form, imageFile || undefined);
      setProfile(updated);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setImageFile(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-orange-500 animate-spin mb-4" />
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Profil Administrateur</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles et votre photo de profil</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Section Photo de profil */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-5xl text-orange-400" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-all"
                >
                  <FontAwesomeIcon icon={faCamera} className="text-sm" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                JPG, PNG ou GIF. Max 5MB
              </p>
              {profile?.image && !imageFile && (
                <p className="text-xs text-green-600 mt-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                  Photo actuelle
                </p>
              )}
            </div>

            {/* Informations rapides */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 text-gray-400 mr-3" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faPhone} className="w-4 text-gray-400 mr-3" />
                  <span>{profile?.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 text-gray-400 mr-3" />
                  <span>Membre depuis {new Date(profile?.createdAt || '').toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faIdCard} className="w-4 text-gray-400 mr-3" />
                  <span className="capitalize">{profile?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Informations personnelles</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+223 XX XX XX XX"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <FontAwesomeIcon icon={message.type === 'success' ? faCheckCircle : faSpinner} />
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-8 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}