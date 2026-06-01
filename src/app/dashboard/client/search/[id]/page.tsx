'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clientAPI } from '@/services/client/client-api';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faMapMarkerAlt, faStar, faInfoCircle, 
  faCar, faGasPump, faCogs, faUsers, faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function ParkingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [entity, setEntity] = useState<any>(null);
  const [type, setType] = useState<'parking' | 'vehicle'>('parking');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Try to fetch as vehicle first
      const vehicleData = await mobilityAPI.getVehiculeById(params.id as string);
      if (vehicleData) {
        setEntity(vehicleData);
        setType('vehicle');
        if (vehicleData.forRent === false && vehicleData.forSale === true) {
          setResType('ACHAT');
        }
      } else {
        // Fetch as parking
        const parkingData = await clientAPI.getParkingById(params.id as string);
        if (parkingData) {
          setEntity(parkingData);
          setType('parking');
          const parkingVehicles = await clientAPI.getVehiclesByParking(params.id as string);
          setVehicles(parkingVehicles);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      // Fallback to parking if vehicle fetch fails
      try {
        const parkingData = await clientAPI.getParkingById(params.id as string);
        if (parkingData) {
          setEntity(parkingData);
          setType('parking');
          const parkingVehicles = await clientAPI.getVehiclesByParking(params.id as string);
          setVehicles(parkingVehicles);
        }
      } catch (pErr) {
        console.error('Error fetching parking fallback:', pErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const [resType, setResType] = useState<'LOCATION' | 'ACHAT'>('LOCATION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [motif, setMotif] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ESPECES');
  const [processing, setProcessing] = useState(false);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

  if (!entity) return <div className="p-6 text-center">Élément non trouvé</div>;

  const handleConfirmReservation = async () => {
    if (type === 'parking') {
      // Logic for parking reservation (simpler for now)
      alert('Réservation de parking confirmée !');
      return;
    }

    // Vehicle reservation logic (Admin-style)
    try {
      setProcessing(true);
      const reservationData = {
        vehicleId: Number(entity.id),
        dateDebut: resType === 'LOCATION' ? new Date(startDate).toISOString() : new Date().toISOString(),
        dateFin: resType === 'LOCATION' ? new Date(endDate).toISOString() : new Date().toISOString(),
        type: resType,
        motifLocation: motif,
        localisation: localisation === 'bamako' ? 'BAMAKO' : 'HORS_BAMAKO',
        conditionsAcceptees: true,
        paymentMethod: paymentMethod,
        montant: entity.prix || entity.prixJour || 0
      };

      await clientAPI.createReservation(reservationData as any);
      alert('Réservation confirmée avec succès !');
      router.push('/dashboard/client/reservations');
    } catch (err: any) {
      if (err?.message?.includes('token manquant') || err?.message?.includes('Token invalide') || err?.status === 401) {
        console.warn('Session expirée. Redirection ou reconnexion requise.');
        alert('Votre session a expiré ou le jeton de sécurité est manquant. Veuillez vous déconnecter puis vous reconnecter pour réserver.');
      } else {
        console.warn('Erreur lors de la création de la réservation:', err?.message || err);
        alert(`Erreur: ${err?.message || 'Impossible de créer la réservation'}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const getImageUrl = (data: any) => {
    const photo = type === 'parking' ? (data.logo || data.photo) : (Array.isArray(data.photos) ? data.photos[0] : data.photos);
    if (!photo) return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b';
    if (photo.startsWith('http')) return photo;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';
    return `${baseUrl}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Retour à la recherche
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-80 bg-gray-200 relative">
              <img 
                src={getImageUrl(entity)} 
                className="w-full h-full object-cover"
                alt={type === 'parking' ? (entity.nom || entity.name) : `${entity.marque} ${entity.model}`}
              />
              {type === 'vehicle' && (
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-xs font-bold shadow-lg">
                    {entity.forRent ? 'À LOUER' : 'À VENDRE'}
                  </span>
                </div>
              )}
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {type === 'parking' ? (entity.nom || entity.name) : `${entity.marque || entity.marqueRef?.name} ${entity.model || entity.modele}`}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2 mt-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
                    {type === 'parking' ? (entity.adresse || entity.address || 'Dakar, Sénégal') : (entity.parking?.adresse || entity.parking?.address || 'Dakar, Sénégal')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-orange-600">
                    {(type === 'parking' ? (entity.prixHeure || '500') : (entity.prix || entity.prixJour || '---'))?.toLocaleString()} F
                    <span className="text-sm font-normal text-gray-500"> {type === 'parking' ? '/ heure' : (entity.forRent ? '/ jour' : '')}</span>
                  </div>
                  <div className="flex items-center justify-end text-amber-500 font-bold mt-1">
                    <FontAwesomeIcon icon={faStar} className="mr-1" />
                    {entity.rating || '4.8'}
                  </div>
                </div>
              </div>

              {type === 'vehicle' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-50 my-6">
                  <InfoBadge icon={faGasPump} label="Carburant" value={entity.fuelType || 'Essence'} />
                  <InfoBadge icon={faCogs} label="Boîte" value={entity.transmission || 'Manuelle'} />
                  <InfoBadge icon={faCheckCircle} label="Garantie" value={entity.garantie ? 'Oui' : 'Non'} />
                  <InfoBadge icon={faUsers} label="Places" value="5" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-50 my-6">
                  <InfoBadge icon={faCar} label="Capacité" value={`${entity.capacite || '50'} places`} />
                  <InfoBadge icon={faCheckCircle} label="Sécurité" value="24h/7j" />
                  <InfoBadge icon={faInfoCircle} label="Type" value="Couvert" />
                  <InfoBadge icon={faStar} label="Services" value="Lavage" />
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Description</h2>
                <p className="text-gray-600 leading-relaxed">
                  {entity.description || "Aucune description disponible pour cet élément."}
                </p>
              </div>
            </div>
          </div>

          {/* Available Vehicles Section (only for parking) */}
          {type === 'parking' && vehicles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Véhicules disponibles à cet endroit</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <Link key={v.id} href={`/dashboard/client/search/${v.id}`} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 hover:shadow-md transition-all group">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={(Array.isArray(v.photos) ? v.photos[0] : v.photos) || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{v.marque || v.marqueRef?.name} {v.model}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">
                          <span className="flex items-center gap-1"><FontAwesomeIcon icon={faGasPump} /> {v.fuelType}</span>
                          <span className="flex items-center gap-1"><FontAwesomeIcon icon={faCogs} /> {v.transmission}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-orange-600">{v.prix?.toLocaleString() || v.prixJour?.toLocaleString()} F/j</span>
                        <span className="text-[10px] font-black uppercase text-white bg-gray-900 px-3 py-1.5 rounded-lg group-hover:bg-orange-500 transition-colors">Réserver</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-orange-100 p-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
              {type === 'parking' ? 'Réserver une place' : 'Réserver ce véhicule'}
            </h3>
            
            <div className="space-y-4">
              {type === 'vehicle' && (
                <div className="flex p-1 bg-gray-50 rounded-xl">
                  <button 
                    onClick={() => setResType('LOCATION')}
                    disabled={entity.forRent === false}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${entity.forRent === false ? 'opacity-40 cursor-not-allowed text-gray-300' : resType === 'LOCATION' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Location
                  </button>
                  <button 
                    onClick={() => setResType('ACHAT')}
                    disabled={entity.forSale === false}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${entity.forSale === false ? 'opacity-40 cursor-not-allowed text-gray-300' : resType === 'ACHAT' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Achat
                  </button>
                </div>
              )}

              {resType === 'LOCATION' && (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Date d'arrivée</label>
                      <input 
                        type="datetime-local" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Date de fin</label>
                      <input 
                        type="datetime-local" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 text-sm" 
                      />
                    </div>
                  </div>

                  {type === 'vehicle' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Motif de location</label>
                        <select 
                          value={motif}
                          onChange={(e) => setMotif(e.target.value)}
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 text-sm appearance-none"
                        >
                          <option value="">Sélectionnez un motif</option>
                          <option value="Voyage">Voyage</option>
                          <option value="Mariage">Mariage</option>
                          <option value="Mission professionnelle">Mission professionnelle</option>
                          <option value="Tourisme">Tourisme</option>
                          <option value="Usage personnel">Usage personnel</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Localisation</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setLocalisation('bamako')}
                            className={`flex-1 py-3 text-xs font-bold border rounded-xl transition-all ${localisation === 'bamako' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-100 text-gray-400'}`}
                          >
                            À Bamako
                          </button>
                          <button 
                            onClick={() => setLocalisation('hors_bamako')}
                            className={`flex-1 py-3 text-xs font-bold border rounded-xl transition-all ${localisation === 'hors_bamako' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-100 text-gray-400'}`}
                          >
                            Hors Bamako
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Mode de paiement</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 text-sm appearance-none"
                >
                  <option value="ESPECES">Espèces</option>
                  <option value="KKIAPAY">Kkiapay (Mobile Money)</option>
                  <option value="WAVE">Wave</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                </select>
              </div>
            </div>

            <div className="pt-4 space-y-2 border-t border-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prix unitaire</span>
                <span className="font-bold">
                  {(type === 'parking' ? entity.prixHeure : (entity.prix || entity.prixJour))?.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2">
                <span>Total estimé</span>
                <span className="text-orange-500">
                  {(() => {
                    const basePrice = (type === 'parking' ? entity.prixHeure : (entity.prix || entity.prixJour)) || 0;
                    if (resType === 'LOCATION' && startDate && endDate) {
                      const start = new Date(startDate).getTime();
                      const end = new Date(endDate).getTime();
                      const diff = end - start;
                      if (diff > 0) {
                        const units = type === 'parking' 
                          ? Math.ceil(diff / (1000 * 60 * 60)) // Hours
                          : Math.ceil(diff / (1000 * 60 * 60 * 24)); // Days
                        return (units * basePrice).toLocaleString();
                      }
                    }
                    return basePrice.toLocaleString();
                  })()} F
                </span>
              </div>
            </div>

            <button 
              onClick={handleConfirmReservation}
              disabled={processing}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
              {processing ? 'Traitement...' : 'Confirmer la réservation'}
            </button>
            <p className="text-[10px] text-center text-gray-400 font-medium px-4">
              En cliquant sur confirmer, vous acceptez nos conditions d'utilisation et de stationnement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBadge({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-1">
        <FontAwesomeIcon icon={icon} className="text-sm" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}
