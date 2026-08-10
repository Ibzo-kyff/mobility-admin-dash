'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faCheckCircle,
  faTimesCircle,
  faShieldAlt,
  faImage,
  faUser,
  faCalendarCheck,
  faPlus,
  faArrowRight,
  faCheck,
  faChevronLeft,
  faTag,
  faClock,
  faList,
  faExclamationTriangle,
  faTimes,
  faGasPump,
  faCogs,
  faCalendarAlt,
  faTachometerAlt,
  faArrowLeft,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons';
import { vehiclesAPI } from '@/services/vehicles-api';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PremiumVehicleForm({ onSuccess, hideHeader = false }: { onSuccess?: () => void; hideHeader?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [marquesList, setMarquesList] = useState<{ name: string }[]>([]);

  // Form State
  const [plate, setPlate] = useState("");
  const [marque, setMarque] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mileage, setMileage] = useState(0);
  const [fuelType, setFuelType] = useState("ESSENCE");
  const [transmission, setTransmission] = useState("MANUAL");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [forSale, setForSale] = useState(true);
  const [forRent, setForRent] = useState(true);
  const [garantie, setGarantie] = useState(false);
  const [dureeGarantie, setDureeGarantie] = useState(0);
  const [chauffeur, setChauffeur] = useState(false);
  const [assurance, setAssurance] = useState(false);
  const [dureeAssurance, setDureeAssurance] = useState(0);
  const [carteGrise, setCarteGrise] = useState(false);
  const [vignette, setVignette] = useState(false);
  const [category, setCategory] = useState("Standard");
  const [parkingId, setParkingId] = useState("");

  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: string;
  }>({ show: false, type: 'success', message: '' });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';

  useEffect(() => {
    loadMarques();
    const userStr = getCookie('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr as string);
        setParkingId(user.parkingId?.toString() || "");
      } catch (e) { }
    }
  }, []);

  const loadMarques = async () => {
    try {
      const data = await vehiclesAPI.getMarques();
      setMarquesList(Array.isArray(data) ? data : []);
    } catch (e) { }
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, details?: string) => {
    setNotification({ show: true, type, message, details });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 6000);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const data = new FormData();

      if (parkingId) data.append('parkingId', parkingId);
      data.append('plate', plate);
      data.append('marque', marque);
      data.append('model', model);
      data.append('prix', price.toString());
      data.append('annee', year.toString());
      data.append('mileage', mileage.toString());
      data.append('fuelType', fuelType);
      data.append('transmission', transmission);
      data.append('description', description);
      data.append('categorie', category);
      data.append('forSale', String(forSale));
      data.append('forRent', String(forRent));
      data.append('garantie', String(garantie));
      data.append('assurance', String(assurance));
      data.append('chauffeur', String(chauffeur));
      data.append('carteGrise', String(carteGrise));
      data.append('vignette', String(vignette));
      if (garantie) data.append('dureeGarantie', dureeGarantie.toString());
      if (assurance) data.append('dureeAssurance', dureeAssurance.toString());

      photos.forEach(photo => data.append('photos', photo));

      await vehiclesAPI.createVehicule(data);
      showNotification('success', "Véhicule créé avec succès", "Le véhicule a été ajouté à votre catalogue et est en attente d'approbation.");
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      } else {
        setTimeout(() => router.push('/dashboard/parking/vehicles'), 2000);
      }
    } catch (error: any) {
      showNotification('error', "Échec de la création", error.message || "Une erreur est survenue lors de l'enregistrement du véhicule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Page */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fadeIn">
          <div>
            <button 
              onClick={() => router.push('/dashboard/parking/vehicles')}
              className="flex items-center gap-2 text-black hover:text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Retour à la flotte
            </button>
            <h1 className="text-4xl font-black text-black tracking-tight leading-tight">
              Nouveau <span className="text-orange-500 text-stroke-thin">Véhicule</span>
            </h1>
            <p className="text-black font-bold text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-orange-500"></span>
              Interface d'ajout premium
            </p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-black'}`}>
                01. Informations
             </div>
             <div className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 2 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-black'}`}>
                02. Services & Options
             </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
        {saving && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
             <p className="text-black font-black uppercase tracking-widest text-xs">Création en cours...</p>
          </div>
        )}

        <div className="p-8 sm:p-16">
          {step === 1 ? (
            <div className="space-y-12 animate-fadeIn">
              {/* Photo Upload Section - Admin Style */}
              <div className="relative group">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Galerie Photos ({photos.length}/10)
                  </h3>
                  {photos.length > 0 && (
                    <button 
                      onClick={() => setPhotos([])}
                      className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                      Tout effacer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((file, index) => {
                    const previewUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : '';
                    return (
                      <div key={index} className="relative aspect-square rounded-3xl overflow-hidden group/photo border-4 border-white shadow-xl hover:-translate-y-1 transition-all duration-300">
                        {previewUrl && <Image src={previewUrl} alt="" fill className="object-cover" unoptimized />}
                        <button
                          title="Supprimer"
                          onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all shadow-lg scale-75 group-hover/photo:scale-100"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 w-full bg-orange-500 text-white text-[8px] font-black uppercase text-center py-1.5 tracking-widest">Principale</div>
                        )}
                      </div>
                    );
                  })}
                  {photos.length < 10 && (
                    <label className="aspect-square rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all text-black hover:text-orange-500 group relative">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faPlus} className="text-orange-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Ajouter</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && setPhotos(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 10))} />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Grid - Admin Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Immatriculation *</label>
                  <input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-black transition-all" placeholder="AA-000-XX" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Marque *</label>
                  <input type="text" list="marques-list-premium" value={marque} onChange={(e) => setMarque(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-black transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Modèle *</label>
                  <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-black transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Prix (FCFA) *</label>
                  <div className="relative">
                    <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-6 py-4 bg-orange-50 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-orange-600 text-xl transition-all" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-orange-300">FCFA</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Année</label>
                  <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Kilométrage (km)</label>
                  <input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-black transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Catégorie</label>
                  <select title="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-black transition-all appearance-none cursor-pointer">
                    <option value="Standard">Standard</option>
                    <option value="Économique">Économique</option>
                    <option value="Luxe">Luxe</option>
                    <option value="4x4">4x4 / SUV</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Carburant</label>
                  <select title="Carburant" value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black appearance-none cursor-pointer">
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIQUE">Électrique</option>
                    <option value="HYBRIDE">Hybride</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Transmission</label>
                  <select title="Transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black appearance-none cursor-pointer">
                    <option value="MANUAL">Manuelle</option>
                    <option value="AUTOMATIC">Automatique</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-bold text-black resize-none transition-all focus:ring-4 focus:ring-orange-500/10" placeholder="Décrivez l'état général du véhicule..." />
                </div>
              </div>

              {/* Availability Toggles - Admin Style */}
              <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="flex-1">
                  <p className="text-sm font-black text-black uppercase tracking-widest">Disponibilités obligatoires</p>
                  <p className="text-xs font-bold text-black mt-1">Choisissez les modes d'exploitation du véhicule</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setForSale(!forSale)} 
                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center gap-2 ${forSale ? 'bg-orange-500 text-white border-orange-600 shadow-xl shadow-orange-500/20' : 'bg-white text-black border-slate-100'}`}
                  >
                    <FontAwesomeIcon icon={faTag} />
                    Vente
                  </button>
                  <button 
                    onClick={() => setForRent(!forRent)} 
                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center gap-2 ${forRent ? 'bg-indigo-500 text-white border-indigo-600 shadow-xl shadow-indigo-500/20' : 'bg-white text-black border-slate-100'}`}
                  >
                    <FontAwesomeIcon icon={faClockRegular} />
                    Location
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-12 border-t border-slate-50">
                <button
                  onClick={() => {
                    if (!plate || !marque || !model || price <= 0 || photos.length === 0) {
                      showNotification('warning', "Informations incomplètes", "Veuillez remplir tous les champs marqués d'une astérisque et ajouter au moins une photo.");
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center gap-6 group shadow-2xl shadow-slate-900/20"
                >
                  Configurer les services
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-fadeIn">
               <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border border-orange-100 mb-10">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Configuration des services
                  </p>
                  <p className="text-sm font-bold text-black leading-relaxed">
                    Activez les garanties, assurances et services optionnels pour ce véhicule. Ces informations seront visibles par les clients.
                  </p>
               </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { id: 'garantie', label: 'Garantie', state: garantie, setter: setGarantie, icon: faShieldAlt, color: 'emerald' },
                  { id: 'assurance', label: 'Assurance', state: assurance, setter: setAssurance, icon: faCheckCircle, color: 'blue' },
                  { id: 'chauffeur', label: 'Chauffeur', state: chauffeur, setter: setChauffeur, icon: faUser, color: 'purple' },
                  { id: 'carteGrise', label: 'Carte Grise', state: carteGrise, setter: setCarteGrise, icon: faList, color: 'rose' },
                  { id: 'vignette', label: 'Vignette', state: vignette, setter: setVignette, icon: faCalendarCheck, color: 'amber' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => opt.setter(!opt.state)}
                    className={`flex flex-col items-center gap-6 p-10 rounded-[3rem] border transition-all duration-500 group/opt ${opt.state ? `bg-white border-${opt.color}-200 shadow-2xl shadow-slate-200/50` : 'bg-slate-50 border-slate-100 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
                  >
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl transition-transform group-hover/opt:scale-110 ${opt.state ? `bg-${opt.color}-100 text-${opt.color}-500` : 'bg-slate-200 text-black'}`}>
                      <FontAwesomeIcon icon={opt.icon} />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${opt.state ? 'text-black' : 'text-black'}`}>{opt.label}</span>
                      {opt.state && <FontAwesomeIcon icon={faCheck} className={`text-[10px] text-${opt.color}-500`} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Duration inputs for Garantie/Assurance if active */}
              {(garantie || assurance) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-slideUp">
                   {garantie && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Durée Garantie (mois)</label>
                        <input type="number" value={dureeGarantie} onChange={(e) => setDureeGarantie(Number(e.target.value))} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none font-bold" />
                     </div>
                   )}
                   {assurance && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Durée Assurance (mois)</label>
                        <input type="number" value={dureeAssurance} onChange={(e) => setDureeAssurance(Number(e.target.value))} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none font-bold" />
                     </div>
                   )}
                </div>
              )}

              <div className="flex gap-6 pt-12 border-t border-slate-50">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-10 py-5 bg-white border border-slate-200 text-black rounded-3xl font-black text-sm uppercase tracking-widest hover:text-black hover:border-slate-400 transition-all flex items-center gap-3"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                  Précédent
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 px-12 py-5 bg-orange-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-orange-500/40 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                >
                  {saving ? 'Enregistrement en cours...' : 'Finaliser la création'}
                  {!saving && (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <datalist id="marques-list-premium">
        {marquesList.map((m, i) => (
          <option key={i} value={m.name} />
        ))}
      </datalist>

      {/* Notification Toast - Admin Premium Style */}
      {notification.show && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-top-full duration-700 w-full max-w-lg px-4">
          <div className={`relative px-10 py-8 rounded-[3rem] border backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex items-start gap-6 overflow-hidden ${
            notification.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-900' : 
            notification.type === 'error' ? 'bg-rose-50/90 border-rose-100 text-rose-900' : 
            'bg-amber-50/90 border-amber-100 text-amber-900'
          }`}>
             {/* Decorative element */}
             <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

             <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl flex-shrink-0 ${
               notification.type === 'success' ? 'bg-emerald-500 text-white' : 
               notification.type === 'error' ? 'bg-rose-500 text-white' : 
               'bg-amber-500 text-white'
             }`}>
                <FontAwesomeIcon icon={notification.type === 'success' ? faCheck : (notification.type === 'error' ? faTimes : faExclamationTriangle)} className="text-2xl" />
             </div>
             <div className="flex-1 pt-1">
                <h3 className="font-black text-lg uppercase tracking-tight leading-none mb-2">{notification.message}</h3>
                {notification.details && <p className="text-xs font-bold opacity-60 leading-relaxed italic border-l-2 border-current pl-4">{notification.details}</p>}
             </div>
             <button title="Fermer" onClick={() => setNotification(prev => ({...prev, show: false}))} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faTimes} className="text-sm opacity-30 hover:opacity-100" />
             </button>
          </div>
        </div>
      )}

      {/* Font for styling */}
      <style jsx global>{`
        .text-stroke-thin {
          -webkit-text-stroke: 1px currentColor;
          color: transparent;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
