// types/index.ts
export type UserRole = 'CLIENT' | 'PARKING' | 'ADMIN';


export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';

export interface User {
  id: number;
  email: string;
  phone: string;
  nom: string;
  prenom: string;
  role: 'CLIENT' | 'PARKING' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  emailVerified: boolean;
  address?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  accessToken?: string;
  parkingId?: number | null;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  role: 'CLIENT' | 'PARKING' | 'ADMIN';
  emailVerified: boolean;
  nom: string;
  prenom: string;
  id: number;
  parkingId?: number | null;
  email?: string;
}

export interface RegisterResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'CLIENT' | 'PARKING' | 'ADMIN';
  emailVerified: boolean;
}

export * from './vehicle';

export interface ReservationData {
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  options: string[];
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  role: 'CLIENT' | 'PARKING' | 'ADMIN';
  status?: 'PENDING';
  emailVerified?: boolean;
  isOnline?: boolean;
  connectionCount?: number;
}


export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}