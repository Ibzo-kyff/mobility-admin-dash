// types/index.ts
export interface Marque {
  id: number;
  name: string;
  logoUrl?: string;
  isCustom?: boolean;
}

export interface Parking {
  id: number;
  name?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Vehicule {
  id: string;
  marqueRef?: Marque;
  marque?: string;
  model?: string;
  modele?: string;
  prix?: number;
  prixJour?: number;
  photos?: string[] | string;
  dureeGarantie?: number;
  mileage?: number;
  kilometrage?: number;
  transmission?: string;
  boite?: string;
  fuelType?: string;
  carburant?: string;
  carteGrise?: boolean;
  assurance?: boolean;
  vignette?: boolean;
  forRent?: boolean;
  forSale?: boolean;
  description?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  stats?: {
    vues: number;
    reservations: number;
  };
  parking?: Parking;
  garantie?: boolean;
  chauffeur?: boolean;
  dureeAssurance?: number;
  annee?: number;
  year?: number;
  categorie?: string;
}

export interface ApiError {
  message: string;
  details?: string;
  status?: number;
}