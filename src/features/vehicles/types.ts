export type VehicleStatus = 'DISPONIBLE' | 'EN_MAINTENANCE' | 'INDISPONIBLE' | 'available' | 'unavailable' | 'maintenance' | string;

export interface Vehicle {
  id: string | number;
  marque?: string;
  model?: string;
  modele?: string;
  annee?: number | null;
  year?: number | null;
  prix?: number | null;
  price?: number | null;
  prixJour?: number | null;
  mileage?: number | null;
  kilometrage?: number | null;
  fuelType?: string | null;
  carburant?: string | null;
  transmission?: string | null;
  boite?: string | null;
  description?: string | null;
  status?: VehicleStatus;
  forSale?: boolean;
  forRent?: boolean;
  garantie?: boolean;
  assurance?: boolean;
  chauffeur?: boolean;
  carteGrise?: boolean | string | null;
  vignette?: boolean | string | null;
  photos?: Array<string | { url?: string } | File>;
  parkingId?: string | number | null;
  parking?: any;
  [key: string]: any;
}

export interface FleetStats {
  total: number;
  forSale: number;
  forRent: number;
  withReservations: number;
  activeReservations: number;
  monthlyActivity: { month: string; sales: number; rentals: number }[];
  distribution: { name: string; value: number; color: string }[];
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationState {
  visible: boolean;
  type: NotificationType;
  message: string;
  details?: string;
  timeoutMs?: number;
}

export interface VehicleFormState {
  marque: string;
  model: string;
  price: number | null;
  year: number | null;
  mileage: number | null;
  fuelType: string;
  transmission: string;
  description: string;
  garantie?: boolean;
  assurance?: boolean;
  chauffeur?: boolean;
  carteGrise?: File | string | null;
  vignette?: File | string | null;
  photos: Array<string | File>;
}

export interface ReservationState {
  vehicleId?: string | number;
  dateDebut?: string | null;
  dateFin?: string | null;
  type?: 'LOCATION' | 'ACHAT' | string;
  motifLocation?: string | null;
  localisation?: string | null;
  conditionsAcceptees?: boolean | null;
  montant?: number | null;
}

export default {};
