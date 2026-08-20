import React from 'react';
import Image from 'next/image';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faCar,
  faGasPump,
  faCogs,
  faCalendarAlt,
  faTachometerAlt,
  faShieldAlt,
  faCheckCircle,
  faUserTie,
  faCalendarCheck,
  faClock,
  faMapMarkerAlt,
  faEye,
  faWrench,
  faTimesCircle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

import type { Vehicle } from '../../types';

import { getPhotoUrl } from '@/features/vehicles/utils/photos';

import {
  formatPrice,
  formatMileage,
  formatTransmissionForDisplay,
  getStatusColor,
  getStatusLabel,
} from '@/features/vehicles/utils/format';

import { parkingVehicleTabsActionStyles } from '@/features/vehicles/styles/parkingVehicleTabs';

interface VehicleCardProps {
  vehicle: Vehicle;

  variant: 'grid' | 'list';

  allReservations?: any[];

  /**
   * Voir les détails
   */
  onView: (vehicle: Vehicle) => void;

  /**
   * Changer le statut du véhicule
   */
  onStatusChange: (
    id: string,
    status: string
  ) => void;

  /**
   * Actions :
   * EDIT
   * DELETE
   * RESERVE
   */
  onAction: (
    id: string,
    action: string
  ) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  variant,
  allReservations = [],
  onView,
  onStatusChange,
  onAction,
}) => {
  /**
   * Réservations du véhicule
   */
  const vehicleRes = allReservations.filter(
    (reservation: any) =>
      Number(
        reservation.vehicleId ||
          reservation.vehicle?.id
      ) === Number(vehicle.id) &&
      (
        reservation.status === 'ACCEPTED' ||
        reservation.status === 'PENDING'
      )
  );

  /**
   * Prochaine réservation
   */
  const nextRes =
    vehicleRes.length > 0
      ? vehicleRes
          .filter(
            (reservation: any) =>
              new Date(reservation.dateDebut) >
              new Date()
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.dateDebut).getTime() -
              new Date(b.dateDebut).getTime()
          )[0]
      : null;

  /**
   * ============================
   * VUE LIST
   * ============================
   */
  if (variant === 'list') {
    return (
      <div
        className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 overflow-hidden flex flex-col md:flex-row cursor-pointer"
        onClick={() => onView(vehicle)}
      >
        {/* Image */}
        <div className="w-full md:w-80 p-3 shrink-0">
          <div className="aspect-[16/10] md:h-full relative rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
            {getPhotoUrl(vehicle.photos) ? (
              <Image
                src={getPhotoUrl(vehicle.photos)!}
                alt={`${vehicle.marque ?? ''} ${vehicle.model ?? ''}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200">
                <FontAwesomeIcon
                  icon={faCar}
                  size="2x"
                />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-row gap-1 flex-wrap">
              {vehicle.forSale && (
                <span className="px-2.5 py-1 bg-rose-500/90 backdrop-blur-sm text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">
                  Vente
                </span>
              )}

              {vehicle.forRent && (
                <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">
                  Location
                </span>
              )}
            </div>

            {/* Statut */}
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase border backdrop-blur-md shadow-sm ${getStatusColor(
                  vehicle.status
                )} bg-white/90`}
              >
                {getStatusLabel(vehicle.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">
                  {vehicle.marque ||
                    (vehicle as any).marqueRef?.name}{' '}
                  {vehicle.model ||
                    (vehicle as any).modele}
                </h3>

                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                  {(vehicle as any).annee ||
                    (vehicle as any).year}{' '}
                  •{' '}
                  {(vehicle as any).categorie ||
                    'Standard'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-orange-600 leading-none">
                  {formatPrice(
                    (vehicle as any).prixJour ||
                      (vehicle as any).prix ||
                      0
                  )}
                </p>

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  /jour
                </p>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500">
                <FontAwesomeIcon
                  icon={faGasPump}
                  className="text-orange-500/50"
                  size="sm"
                />
                <span className="truncate">
                  {(vehicle as any).fuelType ||
                    (vehicle as any).carburant ||
                    'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500">
                <FontAwesomeIcon
                  icon={faCogs}
                  className="text-indigo-500/50"
                  size="sm"
                />
                <span className="truncate">
                  {formatTransmissionForDisplay(
                    (vehicle as any).transmission ||
                      (vehicle as any).boite
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500">
                <FontAwesomeIcon
                  icon={faTachometerAlt}
                  className="text-emerald-500/50"
                  size="sm"
                />
                <span className="truncate">
                  {formatMileage(
                    (vehicle as any).mileage ||
                      (vehicle as any).kilometrage ||
                      0
                  )}
                </span>
              </div>

              {(vehicle as any).garantie && (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    size="sm"
                  />
                  Garantie
                </div>
              )}
            </div>

            {/* Réservations */}
            {vehicleRes.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-orange-100">
                  <FontAwesomeIcon
                    icon={faCalendarCheck}
                  />

                  <span>
                    {vehicleRes.length} résa. active(s)
                  </span>
                </div>

                {nextRes && (
                  <span className="text-[10px] font-bold text-slate-400">
                    Prochaine:{' '}
                    {new Date(
                      nextRes.dateDebut
                    ).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  size="xs"
                />
              </div>

              <p className="text-xs font-bold text-slate-500 truncate max-w-[150px]">
                {(vehicle as any).parking?.name ||
                  'Localisation non spécifiée'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Disponible */}
              <button
                type="button"
                title="Mettre le véhicule disponible"
                className={parkingVehicleTabsActionStyles.statusButton(
                  String(vehicle.status) ===
                    'DISPONIBLE',
                  'green'
                )}
                onClick={(e) => {
                  e.stopPropagation();

                  onStatusChange(
                    String(vehicle.id),
                    'DISPONIBLE'
                  );
                }}
              >
                <FontAwesomeIcon
                  icon={faCheckCircle}
                />
              </button>

              {/* Maintenance */}
              <button
                type="button"
                title="Mettre le véhicule en maintenance"
                className={parkingVehicleTabsActionStyles.statusButton(
                  String(vehicle.status) ===
                    'EN_MAINTENANCE',
                  'amber'
                )}
                onClick={(e) => {
                  e.stopPropagation();

                  onStatusChange(
                    String(vehicle.id),
                    'EN_MAINTENANCE'
                  );
                }}
              >
                <FontAwesomeIcon icon={faWrench} />
              </button>

              {/* Indisponible */}
              <button
                type="button"
                title="Rendre le véhicule indisponible"
                className={parkingVehicleTabsActionStyles.statusButton(
                  String(vehicle.status) ===
                    'INDISPONIBLE',
                  'rose'
                )}
                onClick={(e) => {
                  e.stopPropagation();

                  onStatusChange(
                    String(vehicle.id),
                    'INDISPONIBLE'
                  );
                }}
              >
                <FontAwesomeIcon
                  icon={faTimesCircle}
                />
              </button>

              <div className="w-px h-6 bg-slate-100 mx-1" />

              {/* Voir */}
              <button
                type="button"
                title="Voir les détails"
                className="w-10 h-10 bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-orange-600 rounded-xl flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(vehicle);
                }}
              >
                <FontAwesomeIcon icon={faEye} />
              </button>

              {/* Supprimer */}
              <button
                type="button"
                title="Supprimer le véhicule"
                className="w-10 h-10 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();

                  onAction(
                    String(vehicle.id),
                    'DELETE'
                  );
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ============================
   * VUE GRID
   * ============================
   */

  return (
    <div
      className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => onView(vehicle)}
    >
      {/* Image */}
      <div className="p-2">
        <div className="aspect-[16/9] relative rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner border border-slate-50">
          {getPhotoUrl(vehicle.photos) ? (
            <Image
              src={getPhotoUrl(vehicle.photos)!}
              alt={`${vehicle.marque ?? ''} ${vehicle.model ?? ''}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
              <FontAwesomeIcon
                icon={faCar}
                size="3x"
              />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-row gap-1.5 flex-wrap">
            {vehicle.forSale && (
              <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-sm text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                Vente
              </span>
            )}

            {vehicle.forRent && (
              <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                Location
              </span>
            )}
          </div>

          {/* Statut */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase border backdrop-blur-md shadow-sm ${getStatusColor(
                vehicle.status
              )} bg-white/90`}
            >
              {getStatusLabel(vehicle.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 pt-2 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
              {vehicle.marque ||
                (vehicle as any).marqueRef?.name}{' '}
              {vehicle.model ||
                (vehicle as any).modele}
            </h3>

            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">
              {(vehicle as any).annee ||
                (vehicle as any).year}{' '}
              •{' '}
              {(vehicle as any).categorie ||
                'Standard'}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-orange-600 leading-none">
              {formatPrice(
                (vehicle as any).prixJour ||
                  (vehicle as any).prix ||
                  0
              )}
            </p>

            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
              /jour
            </p>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
            <FontAwesomeIcon
              icon={faGasPump}
              className="text-orange-500/50"
            />

            <span className="truncate">
              {(vehicle as any).fuelType ||
                (vehicle as any).carburant ||
                'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
            <FontAwesomeIcon
              icon={faCogs}
              className="text-indigo-500/50"
            />

            <span className="truncate">
              {formatTransmissionForDisplay(
                (vehicle as any).transmission ||
                  (vehicle as any).boite
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-rose-500/50"
            />

            <span className="truncate">
              {(vehicle as any).annee ||
                (vehicle as any).year ||
                'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
            <FontAwesomeIcon
              icon={faTachometerAlt}
              className="text-emerald-500/50"
            />

            <span className="truncate">
              {formatMileage(
                (vehicle as any).mileage ||
                  (vehicle as any).kilometrage ||
                  0
              )}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(vehicle as any).garantie && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
              <FontAwesomeIcon
                icon={faShieldAlt}
                size="xs"
              />
              Garantie
            </span>
          )}

          {(vehicle as any).assurance && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
              <FontAwesomeIcon
                icon={faCheckCircle}
                size="xs"
              />
              Assurance
            </span>
          )}

          {(vehicle as any).chauffeur && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
              <FontAwesomeIcon
                icon={faUserTie}
                size="xs"
              />
              Chauffeur
            </span>
          )}
        </div>

        {/* Réservations */}
        {vehicleRes.length > 0 && (
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                size="sm"
              />

              <span className="text-xs font-black uppercase tracking-tighter">
                {vehicleRes.length} réservation(s)
                active(s)
              </span>
            </div>

            {nextRes && (
              <div className="flex items-center gap-2 px-3 text-[10px] font-bold text-slate-400">
                <FontAwesomeIcon
                  icon={faClock}
                  size="xs"
                />

                <span>
                  Prochaine:{' '}
                  {new Date(
                    nextRes.dateDebut
                  ).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Localisation */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              size="sm"
            />
          </div>

          <p className="text-sm font-bold text-slate-500 truncate">
            {(vehicle as any).parking?.name ||
              'Localisation non spécifiée'}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          {/* Voir */}
          <button
            type="button"
            title="Voir les détails"
            className="w-11 h-11 bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-orange-600 rounded-2xl flex items-center justify-center transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onView(vehicle);
            }}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          {/* Disponible */}
          <button
            type="button"
            title="Mettre le véhicule disponible"
            className={parkingVehicleTabsActionStyles.statusButton(
              String(vehicle.status) ===
                'DISPONIBLE',
              'green'
            )}
            onClick={(e) => {
              e.stopPropagation();

              onStatusChange(
                String(vehicle.id),
                'DISPONIBLE'
              );
            }}
          >
            <FontAwesomeIcon
              icon={faCheckCircle}
            />
          </button>

          {/* Maintenance */}
          <button
            type="button"
            title="Mettre le véhicule en maintenance"
            className={parkingVehicleTabsActionStyles.statusButton(
              String(vehicle.status) ===
                'EN_MAINTENANCE',
              'amber'
            )}
            onClick={(e) => {
              e.stopPropagation();

              onStatusChange(
                String(vehicle.id),
                'EN_MAINTENANCE'
              );
            }}
          >
            <FontAwesomeIcon icon={faWrench} />
          </button>

          {/* Indisponible */}
          <button
            type="button"
            title="Rendre le véhicule indisponible"
            className={parkingVehicleTabsActionStyles.statusButton(
              String(vehicle.status) ===
                'INDISPONIBLE',
              'rose'
            )}
            onClick={(e) => {
              e.stopPropagation();

              onStatusChange(
                String(vehicle.id),
                'INDISPONIBLE'
              );
            }}
          >
            <FontAwesomeIcon
              icon={faTimesCircle}
            />
          </button>

          {/* Supprimer */}
          <button
            type="button"
            title="Supprimer le véhicule"
            className="w-11 h-11 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all ml-auto"
            onClick={(e) => {
              e.stopPropagation();

              onAction(
                String(vehicle.id),
                'DELETE'
              );
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;