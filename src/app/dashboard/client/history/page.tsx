'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory, faCalendarAlt, faFileInvoiceDollar, faChevronRight,
  faCar, faMapMarkerAlt, faClock, faCheckCircle, faTimesCircle,
  faSearch, faFilter, faArrowRight, faWallet, faCalendarCheck,
  faInfoCircle, faSync
} from '@fortawesome/free-solid-svg-icons';
import { clientAPI } from '@/services/client/client-api';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function HistoryPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, completed, canceled

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await clientAPI.getUserReservations(user!.id);
      // Filter for past reservations (completed, canceled, or rejected)
      // or just show everything but in a history context
      setReservations(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = 
        res.vehicle?.marque?.toLowerCase().includes(search.toLowerCase()) ||
        res.vehicle?.model?.toLowerCase().includes(search.toLowerCase()) ||
        res.id.toString().includes(search);
      
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'completed' && res.status === 'COMPLETED') ||
        (filter === 'canceled' && (res.status === 'CANCELED' || res.status === 'REJECTED'));
        
      return matchesSearch && matchesFilter;
    });
  }, [reservations, search, filter]);

  const stats = useMemo(() => {
    const completed = reservations.filter(r => r.status === 'COMPLETED').length;
    const spent = reservations
      .filter(r => r.status === 'COMPLETED' || r.status === 'ACCEPTED')
      .reduce((sum, r) => sum + (Number(r.montant || r.prix) || 0), 0);
    
    return { completed, spent };
  }, [reservations]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 sm:px-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/20">
              <FontAwesomeIcon icon={faHistory} className="text-2xl" />
            </div>
            Historique des Activités
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-2 ml-1 uppercase tracking-widest">
            Retrouvez toutes vos transactions et réservations passées
          </p>
        </div>

        <div className="flex gap-4">
          <StatCard 
            icon={faCalendarCheck} 
            label="Terminées" 
            value={stats.completed.toString()} 
            color="text-emerald-500 bg-emerald-50" 
          />
          <StatCard 
            icon={faWallet} 
            label="Total Dépensé" 
            value={`${stats.spent.toLocaleString()} F`} 
            color="text-orange-500 bg-orange-50" 
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Rechercher par véhicule ou ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-bold text-sm transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <FilterButton active={filter === 'all'} label="Tout" onClick={() => setFilter('all')} />
          <FilterButton active={filter === 'completed'} label="Terminé" onClick={() => setFilter('completed')} />
          <FilterButton active={filter === 'canceled'} label="Annulé" onClick={() => setFilter('canceled')} />
        </div>

        <button 
          onClick={fetchHistory}
          className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-orange-500 transition-all active:scale-95 border border-slate-50"
        >
          <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faInfoCircle} className="text-3xl" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Aucun historique trouvé</h3>
            <p className="text-slate-400 font-bold text-sm mt-2">Vos activités apparaîtront ici dès que vous aurez effectué des réservations.</p>
            <Link 
              href="/dashboard/client/search"
              className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-8 shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all"
            >
              Faire ma première réservation
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="bg-white px-6 py-4 rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-50 flex items-center gap-4 min-w-[160px]">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-xl shadow-inner`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
        active 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
        : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function HistoryItem({ item }: { item: any }) {
  const getPhotoUrl = (photos: any) => {
    if (!photos) return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b';
    const photo = Array.isArray(photos) ? photos[0] : photos;
    if (typeof photo !== 'string') return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b';
    if (photo.startsWith('http')) return photo;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';
    return `${baseUrl}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'ACCEPTED':
      case 'APPROVED':
      case 'CONFIRMED':
        return { icon: faCheckCircle, color: 'text-emerald-500 bg-emerald-50', label: status === 'COMPLETED' ? 'Terminé' : 'Confirmé' };
      case 'CANCELED':
      case 'CANCELLED':
      case 'REJECTED':
        return { icon: faTimesCircle, color: 'text-rose-500 bg-rose-50', label: 'Annulé' };
      default:
        return { icon: faClock, color: 'text-orange-500 bg-orange-50', label: 'En cours' };
    }
  };

  const status = getStatusConfig(item.status);
  const dateStr = item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Date inconnue';

  return (
    <div className="bg-white rounded-[2.5rem] p-4 sm:p-6 shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-2xl transition-all">
      <div className="w-full md:w-32 h-24 rounded-[1.5rem] overflow-hidden shadow-inner flex-shrink-0">
        <img src={getPhotoUrl(item.vehicle?.photos)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Vehicle" />
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Véhicule</p>
          <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors">
            {item.vehicle?.marque} {item.vehicle?.model}
          </h4>
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
            {item.parking?.nom || item.parking?.name || 'Dakar'}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
          <p className="text-sm font-bold text-slate-700">{dateStr}</p>
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
            <FontAwesomeIcon icon={faClock} />
            #{item.id}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant</p>
          <p className="text-sm font-black text-slate-900">{(item.montant || item.prix || 0).toLocaleString()} F</p>
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-emerald-500" />
            Payé
          </p>
        </div>

        <div className="flex items-center justify-start md:justify-end">
          <div className={`px-4 py-2 rounded-full ${status.color} flex items-center gap-2`}>
            <FontAwesomeIcon icon={status.icon} className="text-xs" />
            <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto flex justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
        <Link 
          href={`/dashboard/client/search/${item.vehicle?.id || item.id}`}
          className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>
    </div>
  );
}
