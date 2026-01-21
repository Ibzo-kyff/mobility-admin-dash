interface User {
  name: string;
  email: string;
  role: string;
}

interface Vehicule {
  id: string;
  marqueRef?: { name: string };
  marque?: string;
  model?: string;
  modele?: string;
  year?: number;
  annee?: number;
  categorie?: string;
  mileage?: number;
  kilometrage?: number;
  prix?: number;
  prixJour?: number;
  prixAchat?: number;
  fuelType?: string;
  carburant?: string;
  transmission?: string;
  places?: number;
  photos?: string[];
  forSale?: boolean;
  forRent?: boolean;
  status?: string;
  disponible?: boolean;
}

interface ReservationData {
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  options: string[];
}

class MobilityAPI {
  token: string | null;
  user: User | null;

  constructor() {
    // NE PAS accéder à localStorage dans le constructeur
    this.token = null;
    this.user = null;
    
    // Initialiser uniquement si on est côté client
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Erreur API');
    }
    return response.json();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Vérifier si on est côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else if (this.token) {
      // Utiliser le token stocké en mémoire pour SSR
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private getFormDataHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    
    // Vérifier si on est côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else if (this.token) {
      // Utiliser le token stocké en mémoire pour SSR
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);
    if (data.token) {
      this.setToken(data.token);
      this.user = data.user;
      
      // Stocker uniquement si on est côté client
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  }

  async register(userData: { name: string; email: string; password: string; role: string }): Promise<{ token: string; user: User }> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('role', userData.role);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/register`, {
      method: 'POST',
      body: formData,
      headers: this.getFormDataHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data.token) {
      this.setToken(data.token);
      this.user = data.user;
      
      // Stocker uniquement si on est côté client
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  }

  logout() {
    // Supprimer uniquement si on est côté client
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.token = null;
    this.user = null;
  }

  setToken(token: string) {
    this.token = token;
    
    // Stocker uniquement si on est côté client
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  async getVehicules(filters: Record<string, any> = {}): Promise<Vehicule[]> {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/vehicules${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getVehiculeById(id: string): Promise<Vehicule> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/vehicules/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getMarques(): Promise<{ name: string }[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/marques`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async createReservation(reservationData: ReservationData): Promise<any> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/reservations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reservationData),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/users/me`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getParkings(): Promise<any[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/parkings`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getStats(): Promise<{ totalVehicules: number; totalParkings: number }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/vehicules/parking/stats`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }
}

// Exportez une instance, pas la classe
export const mobilityAPI = new MobilityAPI();