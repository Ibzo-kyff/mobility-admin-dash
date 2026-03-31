// types/index.ts
export interface Marque {
  id: number;
  name: string;
  logoUrl?: string;
  isCustom?: boolean;
}

export interface Parking {
  id: number;
  userId: number;
  name: string;
  address: string;
  city: string;
  zipCode?: string | null;
  email: string;
  phone: string | null;
  description: string | null;
  capacity: number;
  hoursOfOperation: string | null;
  status: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    phone: string;
  };
  vehicles?: any[];
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