'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faCamera, 
  faShieldAlt, faSave, faSpinner, faCheckCircle, faIdCard,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
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
    address: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setImagePreview(user.image || null);
    }
  }, [user]);

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
      let payload: any = { ...form };
      
      if (imageFile) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('image', imageFile);
        payload = formData;
      }

      await mobilityAPI.updateCurrentUser(payload);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setImageFile(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Mon Profil</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Gérez vos informations et préférences de compte
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sticky top-24">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 p-1 shadow-lg shadow-orange-500/20">
                  <div className="w-full h-full rounded-[1.8rem] bg-white overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <span className="text-4xl font-black text-orange-500">{user.prenom?.[0]}{user.nom?.[0]}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-xl flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all active:scale-95"
                >
                  <FontAwesomeIcon icon={faCamera} className="text-sm" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              
              <div className="mt-6">
                <h2 className="text-xl font-black text-slate-900">{user.prenom} {user.nom}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Client Privilège</p>
              </div>

              {/* Quick Info Blocks */}
              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                <QuickInfo icon={faEnvelope} value={user.email} />
                <QuickInfo icon={faPhone} value={user.phone || 'Non renseigné'} />
                <QuickInfo icon={faCalendarAlt} value={`Membre depuis ${new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`} />
                <QuickInfo icon={faIdCard} value={`Rôle: ${user.role}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg shadow-inner">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Informations Personnelles</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <FormInput 
                label="Prénom" 
                value={form.prenom} 
                onChange={(v) => setForm({...form, prenom: v})} 
                placeholder="Votre prénom"
              />
              <FormInput 
                label="Nom" 
                value={form.nom} 
                onChange={(v) => setForm({...form, nom: v})} 
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-6">
              <FormInput 
                label="Email" 
                value={form.email} 
                type="email"
                onChange={(v) => setForm({...form, email: v})} 
                placeholder="exemple@mail.com"
              />
              <FormInput 
                label="Téléphone" 
                value={form.phone} 
                type="tel"
                onChange={(v) => setForm({...form, phone: v})} 
                placeholder="+221 XX XXX XX XX"
              />
              <FormInput 
                label="Adresse" 
                value={form.address} 
                onChange={(v) => setForm({...form, address: v})} 
                placeholder="Dakar, Sénégal"
              />
            </div>

            {message && (
              <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 animate-slideIn ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                <FontAwesomeIcon icon={message.type === 'success' ? faCheckCircle : faSpinner} className={message.type === 'error' ? 'animate-spin' : ''} />
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Sauvegarder
                  </>
                )}
              </button>
              
              <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                  <FontAwesomeIcon icon={faShieldAlt} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Compte vérifié</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Protection activée</p>
                </div>
              </div>
            </div>
          </form>

          {/* Account Actions Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Paramètres de sécurité</h4>
             <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                  Changer le mot de passe
                </button>
                <button className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all">
                  Supprimer le compte
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickInfo({ icon, value }: { icon: any, value: string }) {
  return (
    <div className="flex items-center gap-4 text-left p-3 hover:bg-slate-50 rounded-2xl transition-all">
      <div className="w-8 h-8 rounded-xl bg-white border border-slate-50 flex items-center justify-center text-slate-400 shadow-sm">
        <FontAwesomeIcon icon={icon} className="text-xs" />
      </div>
      <p className="text-xs font-bold text-slate-600 truncate">{value}</p>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
        {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-bold text-sm text-slate-700 transition-all placeholder:text-slate-300"
      />
    </div>
  );
}
