'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { mobilityAPI } from '@/services/mobility-api';
import { 
  User, 
  MapPin, 
  Shield, 
  Bell, 
  Save, 
  Building,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ParkingSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    prenom: '',
    nom: '',
    email: '',
    phone: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Parking Form State (Mocked since not explicitly available in User model without expansion)
  const [parkingData, setParkingData] = useState({
    name: 'Parking Central',
    address: '123 Avenue de la Mobilité, Dakar',
    capacity: '150',
    description: 'Parking sécurisé au centre-ville.',
  });

  // Security Form State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      // Send the new password to the API
      await mobilityAPI.updateCurrentUser({ 
        password: securityData.newPassword,
        currentPassword: securityData.currentPassword // Backend might require this to verify
      } as any);
      setSuccessMsg('Mot de passe mis à jour avec succès.');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (profileImage) {
        // Use FormData if there is an image
        const formData = new FormData();
        formData.append('prenom', profileData.prenom);
        formData.append('nom', profileData.nom);
        formData.append('email', profileData.email);
        formData.append('phone', profileData.phone);
        formData.append('image', profileImage); // Backend expects 'image'
        
        await mobilityAPI.updateCurrentUser(formData);
      } else {
        await mobilityAPI.updateCurrentUser(profileData);
      }
      
      await refreshUser();
      setSuccessMsg('Profil mis à jour avec succès.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil personnel', icon: User },
    { id: 'parking', label: 'Informations Parking', icon: Building },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres</h1>
        <p className="text-slate-500 mt-2 font-medium">Gérez vos informations personnelles et les détails de votre parking.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
                  activeTab === tab.id 
                    ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
            
            {/* Messages */}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <span className="font-bold">{errorMsg}</span>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-xl font-black text-slate-900 mb-1">Profil Personnel</h2>
                  <p className="text-sm text-slate-500">Mettez à jour vos informations de contact.</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-orange-500/30 overflow-hidden border-4 border-white">
                      {(profileImagePreview || (user as any)?.photoUrl || (user as any)?.photo) ? (
                        <img 
                          src={profileImagePreview || (user as any)?.photoUrl || (user as any)?.photo} 
                          alt="Profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>{profileData.prenom[0] || 'U'}{profileData.nom[0] || ''}</>
                      )}
                    </div>
                    
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                      >
                        Changer la photo
                      </button>
                      <p className="text-xs text-slate-400 mt-2 font-medium">JPG, GIF ou PNG. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Prénom</label>
                      <input 
                        type="text" 
                        value={profileData.prenom}
                        onChange={e => setProfileData({...profileData, prenom: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nom</label>
                      <input 
                        type="text" 
                        value={profileData.nom}
                        onChange={e => setProfileData({...profileData, nom: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="email" 
                          value={profileData.email}
                          onChange={e => setProfileData({...profileData, email: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          value={profileData.phone}
                          onChange={e => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-orange-500/20"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: PARKING */}
            {activeTab === 'parking' && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-xl font-black text-slate-900 mb-1">Informations du Parking</h2>
                  <p className="text-sm text-slate-500">Gérez les détails visibles par vos clients.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSuccessMsg('Informations parking mises à jour.'); setTimeout(() => setSuccessMsg(''), 3000); }}>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nom du Parking</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={parkingData.name}
                        onChange={e => setParkingData({...parkingData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Adresse complète</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea 
                        value={parkingData.address}
                        onChange={e => setParkingData({...parkingData, address: e.target.value})}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      value={parkingData.description}
                      onChange={e => setParkingData({...parkingData, description: e.target.value})}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg">
                      <Save className="w-5 h-5" />
                      Sauvegarder le parking
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-xl font-black text-slate-900 mb-1">Sécurité du compte</h2>
                  <p className="text-sm text-slate-500">Modifiez votre mot de passe et vos paramètres de sécurité.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSecuritySubmit}>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mot de passe actuel</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        value={securityData.currentPassword}
                        onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        value={securityData.newPassword}
                        onChange={e => setSecurityData({...securityData, newPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirmer le mot de passe</label>
                      <input 
                        type="password" 
                        value={securityData.confirmPassword}
                        onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-orange-500/20"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-xl font-black text-slate-900 mb-1">Préférences de notification</h2>
                  <p className="text-sm text-slate-500">Gérez comment et quand vous souhaitez être contacté.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'email-res', label: 'Nouvelles réservations', desc: 'Recevoir un email pour chaque nouvelle réservation.' },
                    { id: 'email-cancel', label: 'Annulations', desc: 'Être notifié lorsqu\'un client annule.' },
                    { id: 'push-alerts', label: 'Alertes système', desc: 'Recevoir des notifications push pour les alertes urgentes.' },
                  ].map(notif => (
                    <label key={notif.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="relative flex items-center pt-1">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{notif.label}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{notif.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
