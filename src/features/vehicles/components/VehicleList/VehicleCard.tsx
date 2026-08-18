import React from 'react';
import type { Vehicle } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faGasPump, faCogs, faCalendarAlt, faTachometerAlt, faEye, faCheckCircle, faWrench, faTimesCircle, faTrash, faShield, faCheck, faUserTie } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { getPhotoUrl } from '../../utils/photos';
import { formatPrice, formatMileage, formatTransmissionForDisplay } from '../../utils/format';

interface Props {
  vehicle: Vehicle;
  variant?: 'grid' | 'list';
  onEdit?: (v: Vehicle) => void;
  onDelete?: (v: Vehicle) => void;
  onReserve?: (v: Vehicle) => void;
  onView?: (v: Vehicle) => void;
  onStatusChange?: (id: string | number, status: string) => void;
  onAction?: (id: string | number, action: string) => void;
}

const VehicleCard: React.FC<Props> = ({ vehicle, variant = 'grid', onEdit, onDelete, onReserve, onView, onStatusChange, onAction }) => {
  const photo = getPhotoUrl(Array.isArray(vehicle.photos) ? vehicle.photos[0] : (vehicle.photos as any)) ?? '';

  const handleView = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onView?.(vehicle);
  };

  const status = String(vehicle.status ?? '');

  const StatusButton = ({ type, active, children, onClick }: { type: 'green' | 'amber' | 'rose'; active: boolean; children: React.ReactNode; onClick?: () => void }) => {
    const map: Record<string, string> = {
      green: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
      amber: active ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-amber-50 hover:bg-amber-100 text-amber-600',
      rose: active ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-rose-50 hover:bg-rose-100 text-rose-500',
    };
    return (
      <button type="button" className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${map[type]}`} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
        {children}
      </button>
    );
  };

  if (variant === 'list') {
    return (
      <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 overflow-hidden flex flex-col md:flex-row cursor-pointer" onClick={handleView}>
        <div className="p-4 md:w-48 md:flex-shrink-0">
          <div className="aspect-[16/9] relative rounded-[1rem] overflow-hidden bg-slate-100 shadow-inner border border-slate-50">
            {photo ? (
              <Image src={photo} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200"><FontAwesomeIcon icon={faCar} size="3x" /></div>
            )}
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">{vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}</h3>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">{vehicle.annee || vehicle.year} • {vehicle.categorie || 'Standard'}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-orange-600 leading-none">{formatPrice(vehicle.prixJour || vehicle.prix || 0)}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">/jour</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faGasPump} className="text-orange-500/50" /><span className="truncate">{vehicle.fuelType || vehicle.carburant || 'N/A'}</span></div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faCogs} className="text-indigo-500/50" /><span className="truncate">{formatTransmissionForDisplay(vehicle.transmission || vehicle.boite)}</span></div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faCalendarAlt} className="text-rose-500/50" /><span className="truncate">{vehicle.annee || vehicle.year || 'N/A'}</span></div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faTachometerAlt} className="text-emerald-500/50" /><span className="truncate">{formatMileage(vehicle.mileage || vehicle.kilometrage || 0)}</span></div>
          </div>

          <div className="mt-auto flex items-center gap-2">
            <button title="Voir les détails" className="w-11 h-11 bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-orange-600 rounded-2xl flex items-center justify-center transition-all" onClick={(e) => { e.stopPropagation(); handleView(e); }}><FontAwesomeIcon icon={faEye} /></button>
            <StatusButton type="green" active={status === 'DISPONIBLE'} onClick={() => onStatusChange?.(vehicle.id, 'DISPONIBLE')}><FontAwesomeIcon icon={faCheckCircle} /></StatusButton>
            <StatusButton type="amber" active={status === 'EN_MAINTENANCE'} onClick={() => onStatusChange?.(vehicle.id, 'EN_MAINTENANCE')}><FontAwesomeIcon icon={faWrench} /></StatusButton>
            <StatusButton type="rose" active={status === 'INDISPONIBLE'} onClick={() => onStatusChange?.(vehicle.id, 'INDISPONIBLE')}><FontAwesomeIcon icon={faTimesCircle} /></StatusButton>
            <button title="Supprimer le véhicule" className="w-11 h-11 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all ml-auto" onClick={(e) => { e.stopPropagation(); onAction?.(vehicle.id, 'DELETE'); }}><FontAwesomeIcon icon={faTrash} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={vehicle.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer" onClick={handleView}>
      <div className="p-2">
        <div className="aspect-[16/9] relative rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner border border-slate-50">
          {photo ? (
            <Image src={photo} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200"><FontAwesomeIcon icon={faCar} size="3x" /></div>
          )}
          <div className="absolute top-3 left-3 flex flex-row gap-1.5 flex-wrap">
            {vehicle.forSale && (<span className="px-3 py-1 bg-rose-500/90 backdrop-blur-sm text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">Vente</span>)}
            {vehicle.forRent && (<span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">Location</span>)}
          </div>
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase border backdrop-blur-md shadow-sm ${status === 'DISPONIBLE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : status === 'EN_MAINTENANCE' ? 'text-amber-600 bg-amber-50 border-amber-100' : status === 'INDISPONIBLE' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>{status === 'DISPONIBLE' ? 'Disponible' : status === 'EN_MAINTENANCE' ? 'En maintenance' : status === 'INDISPONIBLE' ? 'Indisponible' : 'Statut inconnu'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-2 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">{vehicle.marque || vehicle.marqueRef?.name} {vehicle.model || vehicle.modele}</h3>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">{vehicle.annee || vehicle.year} • {vehicle.categorie || 'Standard'}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-orange-600 leading-none">{formatPrice(vehicle.prixJour || vehicle.prix || 0)}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">/jour</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faGasPump} className="text-orange-500/50" /><span className="truncate">{vehicle.fuelType || vehicle.carburant || 'N/A'}</span></div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faCogs} className="text-indigo-500/50" /><span className="truncate">{formatTransmissionForDisplay(vehicle.transmission || vehicle.boite)}</span></div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faCalendarAlt} className="text-rose-500/50" /><span className="truncate">{vehicle.annee || vehicle.year || 'N/A'}</span></div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500"><FontAwesomeIcon icon={faTachometerAlt} className="text-emerald-500/50" /><span className="truncate">{formatMileage(vehicle.mileage || vehicle.kilometrage || 0)}</span></div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {vehicle.garantie && (<span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100"><FontAwesomeIcon icon={faShield} size="xs" /> Garantie</span>)}
          {vehicle.assurance && (<span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100"><FontAwesomeIcon icon={faCheck} size="xs" /> Assurance</span>)}
          {vehicle.chauffeur && (<span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100"><FontAwesomeIcon icon={faUserTie} size="xs" /> Chauffeur</span>)}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <button title="Voir les détails" className="w-11 h-11 bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-orange-600 rounded-2xl flex items-center justify-center transition-all" onClick={(e) => { e.stopPropagation(); handleView(e); }}><FontAwesomeIcon icon={faEye} /></button>
          <StatusButton type="green" active={status === 'DISPONIBLE'} onClick={() => onStatusChange?.(vehicle.id, 'DISPONIBLE')}><FontAwesomeIcon icon={faCheckCircle} /></StatusButton>
          <StatusButton type="amber" active={status === 'EN_MAINTENANCE'} onClick={() => onStatusChange?.(vehicle.id, 'EN_MAINTENANCE')}><FontAwesomeIcon icon={faWrench} /></StatusButton>
          <StatusButton type="rose" active={status === 'INDISPONIBLE'} onClick={() => onStatusChange?.(vehicle.id, 'INDISPONIBLE')}><FontAwesomeIcon icon={faTimesCircle} /></StatusButton>
          <button title="Supprimer le véhicule" className="w-11 h-11 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all ml-auto" onClick={(e) => { e.stopPropagation(); onAction?.(vehicle.id, 'DELETE'); }}><FontAwesomeIcon icon={faTrash} /></button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
