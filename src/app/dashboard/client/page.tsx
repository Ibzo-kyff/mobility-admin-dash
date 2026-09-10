"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { redirect } from 'next/navigation';
import PageLoader from "@/components/common/PageLoader";
import { clientAPI } from '@/services/client/client-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faCar,
  faCreditCard,
  faStar,
  faSearch,
  faHistory,
  faChartLine,
  faClock,
  faTag,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import StatsCard from '@/components/ui/StatsCard';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

interface ClientStats {
  activeReservations: number;
  totalVehicles: number;
  loyaltyPoints: number;
  totalSpent: number;
}

interface ReservationItem {
  id: string | number;
  status: string;
  date?: string;
  dateDebut?: string;
  createdAt: string;
  prix?: string | number;
  vehicle?: {
    marque?: string;
    model?: string;
    photos?: string | string[];
  };
  vehicule?: {
    marque?: string;
    model?: string;
    photos?: string | string[];
  };
  parking?: {
    nom?: string;
    name?: string;
    logo?: string;
  };
}

interface MarqueItem {
  id?: string | number;
  name: string;
  logo?: string;
  logoUrl?: string;
}

export default function ClientDashboard() {
  redirect('/dashboard/client/search');
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    activeReservations: 0,
    totalVehicles: 0,
    loyaltyPoints: 1250,
    totalSpent: 85000
  });
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationItem[]>([]);
  const [marques, setMarques] = useState<MarqueItem[]>([]);
  const [currentMarqueIndex, setCurrentMarqueIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorisCount, setFavorisCount] = useState(0);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, marquesData] = await Promise.all([
        clientAPI.getDashboardStats(user!.id),
        clientAPI.getMarques()
      ]);
      
      setUpcomingReservations(dashboardData.reservations);
      setMarques(marquesData || []);
      setStats({
        activeReservations: dashboardData.activeReservations,
        totalVehicles: dashboardData.totalVehicles,
        loyaltyPoints: dashboardData.loyaltyPoints,
        totalSpent: dashboardData.totalSpent
      });
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      if (error?.message?.includes('Token invalide') || error?.status === 401) {
        console.warn('Session expirée ou token invalide. Veuillez vous reconnecter.');
      } else {
        console.warn('Erreur lors de la récupération des données:', error?.message || err);
      }
      setError("Erreur lors du chargement des données. Veuillez vous reconnecter si le problème persiste.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  useEffect(() => {
    const fetchFavorisCount = async () => {
      const { favorisService } = await import('@/services/client/favoris-service');
      const favs = await favorisService.getFavoris();
      setFavorisCount(favs.length);
    };
    fetchFavorisCount();

    const handleUpdate = () => fetchFavorisCount();
    window.addEventListener('favorisUpdated', handleUpdate);
    return () => window.removeEventListener('favorisUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    if (marques.length > 0) {
      const interval = setInterval(() => {
        setCurrentMarqueIndex((prev) => (prev + 1) % marques.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [marques]);

  // loadDashboardData definition moved up

  if (loading) {
    return (
      <PageLoader
        fullScreen={false}
        text="Espace Client"
        subtext="Chargement de vos véhicules et réservations..."
      />
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {error} <br />
        <button onClick={loadDashboardData} className="underline mt-2">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, <span className="text-orange-500">{user?.prenom || 'Client'}</span>
          </h1>
          <p className="text-gray-500 hidden sm:block">Gérez vos réservations et vos véhicules en toute simplicité.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/client/search" 
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <FontAwesomeIcon icon={faSearch} />
            Réserver
          </Link>
          <button
            title="Actualiser les statistiques"
            onClick={loadDashboardData}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon icon={faChartLine} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Réservations Actives" value={stats.activeReservations} icon={faCalendarCheck} color="bg-blue-500" />
        <StatsCard title="Marques Disponibles" value={marques.length} icon={faTag} color="bg-purple-500" />
        <StatsCard title="Véhicules en favoris" value={favorisCount} icon={faHeart} color="bg-rose-500" />
        <StatsCard title="Points Fidélité" value={stats.loyaltyPoints} icon={faStar} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prochaines réservations */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-orange-500" />
              Prochaines Réservations
            </h2>
            <Link href="/dashboard/client/reservations" className="text-sm text-orange-600 hover:underline font-medium">
              Voir tout
            </Link>
          </div>

          {upcomingReservations.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Aucune réservation à venir</p>
              <Link href="/dashboard/client/search" className="mt-2 text-orange-500 font-bold hover:underline inline-block">
                Trouver un parking
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((res: ReservationItem) => (
                <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50/30 transition-colors border border-transparent hover:border-orange-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 sm:w-24 sm:h-16 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm border border-gray-200 overflow-hidden shrink-0 group-hover:shadow-md transition-all relative">
                      {(() => {
                        const veh = res.vehicle || res.vehicule;
                        const vehPhotos = veh?.photos;
                        let vehImage = null;
                        if (Array.isArray(vehPhotos) && vehPhotos.length > 0) vehImage = vehPhotos[0];
                        else if (typeof vehPhotos === 'string' && vehPhotos.trim().startsWith('[')) {
                          try { const parsed = JSON.parse(vehPhotos as string); if (parsed.length) vehImage = parsed[0]; } catch { /* ignore */ }
                        }
                        else if (typeof vehPhotos === 'string' && vehPhotos.trim().length > 0) vehImage = vehPhotos;
                        
                        const parkImage = res.parking?.logo;
                        const imageUrl = vehImage || parkImage;
                        
                        if (imageUrl) {
                          const fullImg = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                          return (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={fullImg} 
                                alt="Image" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   target.style.display = 'none';
                                   const nextSibling = target.nextElementSibling as HTMLElement;
                                   if (nextSibling) nextSibling.style.display = 'block';
                                }}
                              />
                              <span className="hidden">
                                <FontAwesomeIcon icon={faCalendarCheck} className="text-xl" />
                              </span>
                            </>
                          );
                        }
                        return <FontAwesomeIcon icon={faCalendarCheck} className="text-xl" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {res.parking?.nom || res.parking?.name || 
                         ((res.vehicle || res.vehicule) ? `${(res.vehicle || res.vehicule)?.marque || ''} ${(res.vehicle || res.vehicule)?.model || ''}`.trim() : null) || 
                         `Réservation #${res.id}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {res.date || res.dateDebut ? new Date((res.date || res.dateDebut) as string).toLocaleDateString('fr-FR') : new Date(res.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{res.prix || '2.500'} F</p>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                        res.status === 'APPROVED' || res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    <FontAwesomeIcon icon={faHistory} className="text-gray-300 group-hover:text-orange-400 transition-colors cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Rapides */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Actions Rapides</h2>
            <div className="space-y-3">
              <QuickActionLink 
                icon={faCar} 
                title="Gérer mes véhicules" 
                href="/dashboard/client/vehicles" 
                color="text-purple-600 bg-purple-50"
              />
              <QuickActionLink 
                icon={faHistory} 
                title="Mon Historique" 
                href="/dashboard/client/reservations" 
                color="text-blue-600 bg-blue-50"
              />
              <QuickActionLink 
                icon={faCreditCard} 
                title="Mes Paiements" 
                href="/dashboard/client/billing" 
                color="text-emerald-600 bg-emerald-50"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between h-[215px]">
            <FontAwesomeIcon icon={faCar} className="absolute -right-4 -bottom-4 text-white/5 text-8xl pointer-events-none" />
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-3 relative z-10">Nos Marques Partenaires</h3>
            
            {marques.length > 0 ? (
              <div className="relative w-full flex-1 overflow-hidden z-10">
                <div 
                  className="absolute left-0 top-0 h-full flex gap-4 transition-transform duration-700 ease-in-out translate-x-[var(--tx)]"
                  style={{ '--tx': `-${currentMarqueIndex * 116}px` } as React.CSSProperties}
                >
                  {marques.map((marque, index) => {
                    const logoStr = marque.logo || marque.logoUrl;
                    const fullLogoUrl = logoStr
                      ? (logoStr.startsWith('http') ? logoStr : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app'}${logoStr.startsWith('/') ? '' : '/'}${logoStr}`)
                      : null;
                    
                    return (
                      <div key={marque.id || index} className="w-[100px] h-[120px] shrink-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex flex-col items-center justify-center p-3 hover:bg-white/20 transition-all group">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-inner p-2 group-hover:scale-110 transition-transform duration-300">
                          {fullLogoUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={fullLogoUrl} 
                                alt={marque.name} 
                                className="w-full h-full object-contain drop-shadow-md"
                                onError={(e) => {
                                   (e.target as HTMLImageElement).style.display = 'none';
                                   e.currentTarget.parentElement?.classList.add('fallback-icon');
                                }}
                              />
                            </>
                          ) : (
                            <FontAwesomeIcon icon={faCar} className="text-xl text-orange-400 drop-shadow-md fallback-icon" />
                          )}
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider text-center line-clamp-1 w-full">
                          {marque.name}
                        </h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center relative z-10">
                <p className="text-slate-400 text-sm">Chargement...</p>
              </div>
            )}
            
            <div className="flex justify-center gap-1.5 mt-2 flex-wrap max-h-4 overflow-hidden relative z-10">
              {marques.slice(0, 15).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentMarqueIndex % Math.max(1, marques.slice(0, 15).length) ? 'w-6 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionLink({ icon, title, href, color }: { icon: import('@fortawesome/fontawesome-svg-core').IconProp, title: string, href: string, color: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <span className="font-medium text-gray-700 group-hover:text-gray-900 flex-1">{title}</span>
      <FontAwesomeIcon icon={faHistory} className="text-gray-300 group-hover:text-gray-400 text-xs" />
    </Link>
  );
}
