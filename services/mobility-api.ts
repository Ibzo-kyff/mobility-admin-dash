// mobility-api.ts

interface User {
  id: number;
  email: string;
  phone: string;
  nom: string;
  prenom: string;
  role: 'CLIENT' | 'PARKING' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'BLOCKED';
  emailVerified: boolean;
  address?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  accessToken?: string;
  parkingId?: number | null;
}

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  role: 'CLIENT' | 'PARKING' | 'ADMIN';
  emailVerified: boolean;
  nom: string;
  prenom: string;
  id: number;
  parkingId?: number | null;
}

interface RegisterResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'CLIENT' | 'PARKING' | 'ADMIN';
  emailVerified: boolean;
}

interface Vehicule {
  id: string;
  marqueRef?: { name: string };
  marque?: string;
  modele?: string;
  annee?: number;
  prix?: number;
  photos?: string[];
  forSale?: boolean;
  forRent?: boolean;
  status?: string;
}

interface ReservationData {
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  options: string[];
}

interface RegisterData {
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

interface ApiError {
  message: string;
  details?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';

class MobilityAPI {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      this.user = userStr ? JSON.parse(userStr) : null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let message = `Erreur ${response.status}`;
      let details = '';

      if (contentType?.includes('application/json')) {
        const error = await response.json();
        message = error.message || message;
        details = error.details || '';
      }

      throw { message, details } as ApiError;
    }

    return contentType?.includes('application/json')
      ? response.json()
      : (response.text() as unknown as T);
  }

  private getHeaders(auth = true): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (auth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private saveToStorage() {
    if (!this.token || typeof window === 'undefined') return;
    localStorage.setItem('accessToken', this.token);
    if (this.refreshToken)
      localStorage.setItem('refreshToken', this.refreshToken);
    if (this.user) localStorage.setItem('user', JSON.stringify(this.user));
  }

  private clearStorage() {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }

  /* ================= AUTH ================= */

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<LoginResponse>(response);

    this.token = data.accessToken;
    this.refreshToken = data.refreshToken;

    this.user = {
      id: data.id,
      email,
      phone: '',
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
      status: 'APPROVED',
      emailVerified: data.emailVerified,
      parkingId: data.parkingId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessToken: data.accessToken,
    };

    this.saveToStorage();
    return data;
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({
        ...userData,
        status: userData.status ?? 'PENDING',
        emailVerified: userData.emailVerified ?? false,
        isOnline: userData.isOnline ?? false,
        connectionCount: userData.connectionCount ?? 0,
      }),
    });

    const data = await this.handleResponse<RegisterResponse>(response);

    this.token = data.accessToken;
    this.refreshToken = data.refreshToken;

    this.user = {
      id: 0,
      email: data.email,
      phone: userData.phone,
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
      status: 'PENDING',
      emailVerified: data.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessToken: data.accessToken,
    };

    this.saveToStorage();
    return data;
  }

  logout() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.clearStorage();
  }

  /* ================= DATA ================= */

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/users/me`, {
      headers: this.getHeaders(),
    });

    const user = await this.handleResponse<User>(response);
    this.user = { ...user, accessToken: this.token ?? undefined };
    this.saveToStorage();
    return this.user;
  }

  async getVehicules(filters: Record<string, any> = {}): Promise<Vehicule[]> {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/vehicules${query ? `?${query}` : ''}`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  async getVehiculeById(id: string): Promise<Vehicule> {
    const response = await fetch(`${API_URL}/vehicules/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getMarques(): Promise<{ name: string }[]> {
    const response = await fetch(`${API_URL}/marques`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createReservation(data: ReservationData) {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  /* ================= UTILS ================= */

  isAuthenticated() {
    return !!this.token;
  }

  getCurrentUserSync() {
    return this.user;
  }

  getToken() {
    return this.token;
  }
}

export const mobilityAPI = new MobilityAPI();
