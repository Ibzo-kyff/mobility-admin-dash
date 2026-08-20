'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { mobilityAPI } from '@/services/mobility-api';

import {
  User,
  MapPin,
  Shield,
  Save,
  Building,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ParkingSettingsPage() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ═══════════════════════════════════════════════════════
  // PROFILE
  // ═══════════════════════════════════════════════════════

  const [profileData, setProfileData] = useState({
    prenom: '',
    nom: '',
    email: '',
    phone: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] =
    useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ═══════════════════════════════════════════════════════
  // PARKING
  // ═══════════════════════════════════════════════════════

  const [parkingData, setParkingData] = useState({
    id: null as number | null,
    name: '',
    address: '',
    city: '',
    zipCode: '',
    email: '',
    phone: '',
    capacity: '',
    hoursOfOperation: '',
    description: '',
    status: 'ACTIVE',
    logo: null as string | null,
  });

  const [parkingLoading, setParkingLoading] = useState(false);

  const [parkingLogo, setParkingLogo] = useState<File | null>(null);

  const [parkingLogoPreview, setParkingLogoPreview] =
    useState<string | null>(null);

  const parkingLogoRef = React.useRef<HTMLInputElement>(null);

  // ═══════════════════════════════════════════════════════
  // SECURITY
  // ═══════════════════════════════════════════════════════

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Afficher / masquer les mots de passe
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ═══════════════════════════════════════════════════════
  // LOAD USER
  // ═══════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════
  // LOAD PARKING
  // ═══════════════════════════════════════════════════════

  useEffect(() => {
    const loadMyParking = async () => {
      setParkingLoading(true);

      try {
        const parkings = await mobilityAPI.getParkings();
        const parking = parkings?.[0];

        if (parking) {
          setParkingData({
            id: parking.id ?? null,
            name: parking.name || '',
            address: parking.address || '',
            city: parking.city || '',
            zipCode: parking.zipCode || '',
            email: parking.email || '',
            phone: parking.phone || '',
            capacity: String(parking.capacity ?? ''),
            hoursOfOperation: parking.hoursOfOperation || '',
            description: parking.description || '',
            status: parking.status || 'ACTIVE',
            logo: parking.logo || null,
          });

          if (parking.logo) {
            setParkingLogoPreview(parking.logo);
          }
        }
      } catch (err: any) {
        console.error(
          'Erreur chargement parking:',
          err
        );
      } finally {
        setParkingLoading(false);
      }
    };

    if (user) {
      loadMyParking();
    }
  }, [user]);

  // ═══════════════════════════════════════════════════════
  // PROFILE SUBMIT
  // ═══════════════════════════════════════════════════════

  const handleProfileSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (profileImage) {
        const formData = new FormData();

        formData.append(
          'prenom',
          profileData.prenom
        );

        formData.append(
          'nom',
          profileData.nom
        );

        formData.append(
          'email',
          profileData.email
        );

        formData.append(
          'phone',
          profileData.phone
        );

        formData.append(
          'image',
          profileImage
        );

        await mobilityAPI.updateCurrentUser(
          formData
        );
      } else {
        await mobilityAPI.updateCurrentUser(
          profileData
        );
      }

      await refreshUser();

      setSuccessMsg(
        'Profil mis à jour avec succès.'
      );

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);

    } catch (err: any) {
      setErrorMsg(
        err?.message ||
        'Erreur lors de la mise à jour du profil.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // PARKING SUBMIT
  // ═══════════════════════════════════════════════════════

  const handleParkingSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!parkingData.id) {
      setErrorMsg(
        'Aucun parking trouvé pour cet utilisateur.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (parkingLogo) {
        const formData = new FormData();

        formData.append(
          'name',
          parkingData.name
        );

        formData.append(
          'address',
          parkingData.address
        );

        formData.append(
          'city',
          parkingData.city
        );

        if (parkingData.zipCode) {
          formData.append(
            'zipCode',
            parkingData.zipCode
          );
        }

        formData.append(
          'email',
          parkingData.email
        );

        if (parkingData.phone) {
          formData.append(
            'phone',
            parkingData.phone
          );
        }

        formData.append(
          'capacity',
          String(
            Number(parkingData.capacity) || 0
          )
        );

        if (
          parkingData.hoursOfOperation
        ) {
          formData.append(
            'hoursOfOperation',
            parkingData.hoursOfOperation
          );
        }

        if (parkingData.description) {
          formData.append(
            'description',
            parkingData.description
          );
        }

        formData.append(
          'status',
          parkingData.status
        );

        formData.append(
          'logo',
          parkingLogo
        );

        await mobilityAPI.updateParking(
          parkingData.id,
          formData
        );

      } else {

        const payload = {
          name: parkingData.name,
          address: parkingData.address,
          city: parkingData.city,
          zipCode:
            parkingData.zipCode || null,
          email: parkingData.email,
          phone:
            parkingData.phone || null,
          capacity:
            Number(parkingData.capacity) || 0,
          hoursOfOperation:
            parkingData.hoursOfOperation ||
            null,
          description:
            parkingData.description ||
            null,
          status: parkingData.status,
        };

        await mobilityAPI.updateParking(
          parkingData.id,
          payload
        );
      }

      setSuccessMsg(
        'Informations du parking mises à jour avec succès.'
      );

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);

    } catch (err: any) {

      setErrorMsg(
        err?.message ||
        'Erreur lors de la mise à jour du parking.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // SECURITY SUBMIT
  // ═══════════════════════════════════════════════════════

  const handleSecuritySubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = securityData;

    // Vérification mot de passe actuel
    if (!currentPassword.trim()) {
      setErrorMsg(
        'Veuillez saisir votre mot de passe actuel.'
      );
      return;
    }

    // Vérification nouveau mot de passe
    if (!newPassword.trim()) {
      setErrorMsg(
        'Veuillez saisir un nouveau mot de passe.'
      );
      return;
    }

    // Minimum 6 caractères
    if (newPassword.length < 6) {
      setErrorMsg(
        'Le nouveau mot de passe doit contenir au moins 6 caractères.'
      );
      return;
    }

    // Confirmation
    if (!confirmPassword.trim()) {
      setErrorMsg(
        'Veuillez confirmer votre nouveau mot de passe.'
      );
      return;
    }

    // Comparaison
    if (newPassword !== confirmPassword) {
      setErrorMsg(
        'Les mots de passe ne correspondent pas.'
      );
      return;
    }

    // Éviter même mot de passe
    if (currentPassword === newPassword) {
      setErrorMsg(
        "Le nouveau mot de passe doit être différent de l'ancien."
      );
      return;
    }

    setLoading(true);

    try {

      await mobilityAPI.updateCurrentUser({
        password: newPassword,
        currentPassword: currentPassword,
      } as any);

      setSuccessMsg(
        'Mot de passe mis à jour avec succès.'
      );

      // Nettoyer les champs
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Remettre les champs en mode caché
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);

    } catch (err: any) {

      console.error(
        'Erreur changement mot de passe:',
        err
      );

      setErrorMsg(
        err?.message ||
        'Impossible de mettre à jour le mot de passe.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // IMAGE PROFILE
  // ═══════════════════════════════════════════════════════

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (file) {
      setProfileImage(file);

      setProfileImagePreview(
        URL.createObjectURL(file)
      );
    }
  };

  // ═══════════════════════════════════════════════════════
  // LOGO PARKING
  // ═══════════════════════════════════════════════════════

  const handleParkingLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (file) {
      setParkingLogo(file);

      setParkingLogoPreview(
        URL.createObjectURL(file)
      );
    }
  };

  // ═══════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════

  const tabs = [
    {
      id: 'profile',
      label: 'Profil personnel',
      icon: User,
    },
    {
      id: 'parking',
      label: 'Informations Parking',
      icon: Building,
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: Shield,
    },
  ];

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Paramètres
        </h1>

        <p className="text-slate-500 mt-2 font-medium">
          Gérez vos informations personnelles et les détails de votre parking.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ═══════════════════════════════════════ */}
        {/* SIDEBAR */}
        {/* ═══════════════════════════════════════ */}

        <div className="w-full lg:w-72 flex-shrink-0">

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">

            {tabs.map((tab) => {

              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100/50'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >

                  <Icon
                    className={`w-5 h-5 ${
                      activeTab === tab.id
                        ? 'text-orange-500'
                        : 'text-slate-400'
                    }`}
                  />

                  {tab.label}

                </button>
              );
            })}

          </div>

        </div>

        {/* ═══════════════════════════════════════ */}
        {/* CONTENT */}
        {/* ═══════════════════════════════════════ */}

        <div className="flex-1">

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">

            {/* SUCCESS */}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl flex items-center gap-3">

                <CheckCircle2 className="w-5 h-5" />

                <span className="font-bold">
                  {successMsg}
                </span>

              </div>
            )}

            {/* ERROR */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-center gap-3">

                <AlertCircle className="w-5 h-5" />

                <span className="font-bold">
                  {errorMsg}
                </span>

              </div>
            )}

            {/* ═══════════════════════════════════════ */}
            {/* PROFILE */}
            {/* ═══════════════════════════════════════ */}

            {activeTab === 'profile' && (

              <div className="animate-fadeIn">

                <div className="mb-8">

                  <h2 className="text-xl font-black text-slate-900 mb-1">
                    Profil Personnel
                  </h2>

                  <p className="text-sm text-slate-500">
                    Mettez à jour vos informations de contact.
                  </p>

                </div>

                <form
                  onSubmit={handleProfileSubmit}
                  className="space-y-6"
                >

                  {/* PHOTO */}
                  <div className="flex items-center gap-6 mb-8">

                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-orange-500/30 overflow-hidden border-4 border-white">

                      {(
                        profileImagePreview ||
                        (user as any)?.photoUrl ||
                        (user as any)?.photo
                      ) ? (

                        <img
                          src={
                            profileImagePreview ||
                            (user as any)?.photoUrl ||
                            (user as any)?.photo
                          }
                          alt="Profil"
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <>
                          {profileData.prenom[0] || 'U'}
                          {profileData.nom[0] || ''}
                        </>

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
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                      >
                        Changer la photo
                      </button>

                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        JPG, GIF ou PNG. Max 2MB.
                      </p>

                    </div>

                  </div>

                  {/* NOM */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">

                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Prénom
                      </label>

                      <input
                        type="text"
                        value={profileData.prenom}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            prenom: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />

                    </div>

                    <div className="space-y-2">

                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Nom
                      </label>

                      <input
                        type="text"
                        value={profileData.nom}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            nom: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />

                    </div>

                    {/* EMAIL */}
                    <div className="space-y-2">

                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Email
                      </label>

                      <div className="relative">

                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          required
                        />

                      </div>

                    </div>

                    {/* TELEPHONE */}
                    <div className="space-y-2">

                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Téléphone
                      </label>

                      <div className="relative">

                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                        <input
                          type="text"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />

                      </div>

                    </div>

                  </div>

                  {/* BUTTON */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-orange-500/20"
                    >

                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}

                      Enregistrer les modifications

                    </button>

                  </div>

                </form>

              </div>
            )}

            {/* ═══════════════════════════════════════ */}
            {/* PARKING */}
            {/* ═══════════════════════════════════════ */}

            {activeTab === 'parking' && (

              <div className="animate-fadeIn">

                <div className="mb-8">

                  <h2 className="text-xl font-black text-slate-900 mb-1">
                    Informations du Parking
                  </h2>

                  <p className="text-sm text-slate-500">
                    Gérez les détails visibles par vos clients.
                  </p>

                </div>

                {parkingLoading ? (

                  <div className="flex justify-center py-16">

                    <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />

                  </div>

                ) : (

                  <form
                    className="space-y-6"
                    onSubmit={handleParkingSubmit}
                  >

                    {/* LOGO */}
                    <div className="flex items-center gap-6 mb-2">

                      <div className="relative w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">

                        {parkingLogoPreview ? (

                          <img
                            src={parkingLogoPreview}
                            alt="Logo parking"
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <Building className="w-10 h-10 text-slate-400" />

                        )}

                      </div>

                      <div>

                        <input
                          type="file"
                          ref={parkingLogoRef}
                          onChange={handleParkingLogoChange}
                          accept="image/*"
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            parkingLogoRef.current?.click()
                          }
                          className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                        >
                          Changer le logo
                        </button>

                        <p className="text-xs text-slate-400 mt-2 font-medium">
                          JPG ou PNG. Max 2MB.
                        </p>

                      </div>

                    </div>

                    {/* NOM PARKING */}
                    <div className="space-y-2">

                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Nom du Parking
                      </label>

                      <div className="relative">

                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                        <input
                          type="text"
                          value={parkingData.name}
                          onChange={(e) =>
                            setParkingData({
                              ...parkingData,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          required
                        />

                      </div>

                    </div>

                    {/* ADRESSE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      <div className="space-y-2 md:col-span-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Adresse
                        </label>

                        <div className="relative">

                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                          <input
                            type="text"
                            value={parkingData.address}
                            onChange={(e) =>
                              setParkingData({
                                ...parkingData,
                                address: e.target.value,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            required
                          />

                        </div>

                      </div>

                      <div className="space-y-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Code postal
                        </label>

                        <input
                          type="text"
                          value={parkingData.zipCode}
                          onChange={(e) =>
                            setParkingData({
                              ...parkingData,
                              zipCode: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />

                      </div>

                    </div>

                    {/* VILLE + CAPACITE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Ville
                        </label>

                        <input
                          type="text"
                          value={parkingData.city}
                          onChange={(e) =>
                            setParkingData({
                              ...parkingData,
                              city: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          required
                        />

                      </div>

                      <div className="space-y-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Capacité (places)
                        </label>

                        <input
                          type="number"
                          min={1}
                          value={parkingData.capacity}
                          onChange={(e) =>
                            setParkingData({
                              ...parkingData,
                              capacity: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          required
                        />

                      </div>

                    </div>

                    {/* EMAIL + TELEPHONE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Email de contact
                        </label>

                        <div className="relative">

                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                          <input
                            type="email"
                            value={parkingData.email}
                            onChange={(e) =>
                              setParkingData({
                                ...parkingData,
                                email: e.target.value,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            required
                          />

                        </div>

                      </div>

                      <div className="space-y-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Téléphone
                        </label>

                        <div className="relative">

                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                          <input
                            type="text"
                            value={parkingData.phone}
                            onChange={(e) =>
                              setParkingData({
                                ...parkingData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          />

                        </div>

                      </div>

                    </div>

                    {/* HORAIRES + STATUT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Horaires d&apos;ouverture
                        </label>

                        <input
                          type="text"
                          placeholder="Ex: Lun-Ven 08h-20h, Sam 09h-18h"
                          value={
                            parkingData.hoursOfOperation
                          }
                          onChange={(e) =>
                            setParkingData({
                              ...parkingData,
                              hoursOfOperation:
                                e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />

                      </div>

                      <div className="space-y-2">

                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Statut
                        </label>

                        <select
                          value={parkingData.status}
                          onChange={(e) =>
                            setParkingData({
                              ...parkingData,
                              status: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        >

                          <option value="ACTIVE">
                            Ouvert
                          </option>

                          <option value="INACTIVE">
                            Fermé
                          </option>

                          <option value="MAINTENANCE">
                            En maintenance
                          </option>

                          <option value="FULL">
                            Complet
                          </option>

                        </select>

                      </div>

                    </div>

                    {/* DESCRIPTION */}
                    <div className="space-y-2">

                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Description
                      </label>

                      <textarea
                        value={parkingData.description}
                        onChange={(e) =>
                          setParkingData({
                            ...parkingData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                      />

                    </div>

                    {/* BUTTON */}
                    <div className="pt-6 border-t border-slate-100 flex justify-end">

                      <button
                        type="submit"
                        disabled={
                          loading ||
                          !parkingData.id
                        }
                        className="flex items-center gap-2 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-orange-500/20"
                      >

                        {loading ? (

                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                        ) : (

                          <Save className="w-5 h-5" />

                        )}

                        Sauvegarder le parking

                      </button>

                    </div>

                  </form>

                )}

              </div>
            )}

            {/* ═══════════════════════════════════════ */}
            {/* SECURITY */}
            {/* ═══════════════════════════════════════ */}

            {activeTab === 'security' && (

              <div className="animate-fadeIn">

                {/* HEADER */}
                <div className="mb-8">

                  <div className="flex items-center gap-3 mb-2">

                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">

                      <Shield className="w-5 h-5 text-orange-500" />

                    </div>

                    <h2 className="text-xl font-black text-slate-900">
                      Sécurité du compte
                    </h2>

                  </div>

                  <p className="text-sm text-slate-500">
                    Modifiez votre mot de passe pour sécuriser votre compte.
                  </p>

                </div>

                {/* INFO SECURITE */}
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl">

                  <div className="flex items-start gap-3">

                    <Shield className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />

                    <div>

                      <p className="font-bold text-orange-800 text-sm">
                        Sécurité recommandée
                      </p>

                      <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                        Utilisez un mot de passe d&apos;au moins 6 caractères.
                        Évitez d&apos;utiliser le même mot de passe sur plusieurs services.
                      </p>

                    </div>

                  </div>

                </div>

                <form
                  className="space-y-6"
                  onSubmit={handleSecuritySubmit}
                >

                  {/* ═════════════════════════════ */}
                  {/* CURRENT PASSWORD */}
                  {/* ═════════════════════════════ */}

                  <div className="space-y-2">

                    <label
                      htmlFor="currentPassword"
                      className="text-xs font-black text-slate-400 uppercase tracking-widest"
                    >
                      Mot de passe actuel
                    </label>

                    <div className="relative">

                      <Lock
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          w-5
                          h-5
                          text-slate-400
                          pointer-events-none
                        "
                      />

                      <input
                        id="currentPassword"
                        type={
                          showCurrentPassword
                            ? 'text'
                            : 'password'
                        }
                        value={
                          securityData.currentPassword
                        }
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            currentPassword:
                              e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="
                          w-full
                          bg-slate-50
                          border
                          border-slate-200
                          rounded-xl
                          pl-12
                          pr-14
                          py-3
                          text-slate-900
                          font-medium
                          focus:outline-none
                          focus:ring-2
                          focus:ring-orange-500/20
                          focus:border-orange-500
                          transition-all
                        "
                        required
                      />

                      {/* EYE BUTTON */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(
                            !showCurrentPassword
                          )
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          w-9
                          h-9
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-slate-400
                          hover:text-orange-500
                          hover:bg-orange-50
                          transition-all
                        "
                        aria-label={
                          showCurrentPassword
                            ? 'Masquer le mot de passe'
                            : 'Afficher le mot de passe'
                        }
                      >

                        {showCurrentPassword ? (

                          <EyeOff className="w-5 h-5" />

                        ) : (

                          <Eye className="w-5 h-5" />

                        )}

                      </button>

                    </div>

                  </div>

                  {/* ═════════════════════════════ */}
                  {/* NEW PASSWORD */}
                  {/* ═════════════════════════════ */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">

                      <label
                        htmlFor="newPassword"
                        className="text-xs font-black text-slate-400 uppercase tracking-widest"
                      >
                        Nouveau mot de passe
                      </label>

                      <div className="relative">

                        <Lock
                          className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            w-5
                            h-5
                            text-slate-400
                            pointer-events-none
                          "
                        />

                        <input
                          id="newPassword"
                          type={
                            showNewPassword
                              ? 'text'
                              : 'password'
                          }
                          value={
                            securityData.newPassword
                          }
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              newPassword:
                                e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          autoComplete="new-password"
                          minLength={6}
                          className="
                            w-full
                            bg-slate-50
                            border
                            border-slate-200
                            rounded-xl
                            pl-12
                            pr-14
                            py-3
                            text-slate-900
                            font-medium
                            focus:outline-none
                            focus:ring-2
                            focus:ring-orange-500/20
                            focus:border-orange-500
                            transition-all
                          "
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              !showNewPassword
                            )
                          }
                          className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-slate-400
                            hover:text-orange-500
                            hover:bg-orange-50
                            transition-all
                          "
                          aria-label={
                            showNewPassword
                              ? 'Masquer le nouveau mot de passe'
                              : 'Afficher le nouveau mot de passe'
                          }
                        >

                          {showNewPassword ? (

                            <EyeOff className="w-5 h-5" />

                          ) : (

                            <Eye className="w-5 h-5" />

                          )}

                        </button>

                      </div>

                      <p className="text-xs text-slate-400">
                        Minimum 6 caractères
                      </p>

                    </div>

                    {/* ═════════════════════════════ */}
                    {/* CONFIRM PASSWORD */}
                    {/* ═════════════════════════════ */}

                    <div className="space-y-2">

                      <label
                        htmlFor="confirmPassword"
                        className="text-xs font-black text-slate-400 uppercase tracking-widest"
                      >
                        Confirmer le mot de passe
                      </label>

                      <div className="relative">

                        <Lock
                          className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            w-5
                            h-5
                            text-slate-400
                            pointer-events-none
                          "
                        />

                        <input
                          id="confirmPassword"
                          type={
                            showConfirmPassword
                              ? 'text'
                              : 'password'
                          }
                          value={
                            securityData.confirmPassword
                          }
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              confirmPassword:
                                e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          autoComplete="new-password"
                          minLength={6}
                          className="
                            w-full
                            bg-slate-50
                            border
                            border-slate-200
                            rounded-xl
                            pl-12
                            pr-14
                            py-3
                            text-slate-900
                            font-medium
                            focus:outline-none
                            focus:ring-2
                            focus:ring-orange-500/20
                            focus:border-orange-500
                            transition-all
                          "
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-slate-400
                            hover:text-orange-500
                            hover:bg-orange-50
                            transition-all
                          "
                          aria-label={
                            showConfirmPassword
                              ? 'Masquer la confirmation'
                              : 'Afficher la confirmation'
                          }
                        >

                          {showConfirmPassword ? (

                            <EyeOff className="w-5 h-5" />

                          ) : (

                            <Eye className="w-5 h-5" />

                          )}

                        </button>

                      </div>

                      {/* INDICATEUR */}
                      {securityData.confirmPassword.length > 0 && (

                        <div
                          className={`flex items-center gap-2 text-xs font-semibold ${
                            securityData.newPassword ===
                            securityData.confirmPassword
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >

                          <CheckCircle2 className="w-4 h-4" />

                          {securityData.newPassword ===
                          securityData.confirmPassword
                            ? 'Les mots de passe correspondent'
                            : 'Les mots de passe ne correspondent pas'}

                        </div>

                      )}

                    </div>

                  </div>

                  {/* ═════════════════════════════ */}
                  {/* SUBMIT */}
                  {/* ═════════════════════════════ */}

                  <div className="pt-6 border-t border-slate-100 flex justify-end">

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !securityData.currentPassword ||
                        !securityData.newPassword ||
                        !securityData.confirmPassword
                      }
                      className="
                        flex
                        items-center
                        gap-2
                        px-8
                        py-3.5
                        bg-orange-500
                        text-white
                        rounded-xl
                        font-bold
                        hover:bg-orange-600
                        transition-all
                        active:scale-95
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        shadow-lg
                        shadow-orange-500/20
                      "
                    >

                      {loading ? (

                        <>
                          <div
                            className="
                              w-5
                              h-5
                              border-2
                              border-white/30
                              border-t-white
                              rounded-full
                              animate-spin
                            "
                          />

                          Mise à jour...

                        </>

                      ) : (

                        <>
                          <Lock className="w-5 h-5" />

                          Mettre à jour le mot de passe
                        </>

                      )}

                    </button>

                  </div>

                </form>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}