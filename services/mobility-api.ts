interface User {
  name: string;
  email: string;
  role: string;
  // Ajoutez d'autres champs si besoin
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
  // Ajoutez d'autres champs
}

interface ReservationData {
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  options: string[];
}

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
  getFormDataHeaders() {
    const headers: HeadersInit = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
};

class MobilityAPI {
  token: string | null;
  user: User | null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Erreur API');
    }
    return response.json();
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: API_CONFIG.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);
    if (data.token) {
      this.setToken(data.token);
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async register(userData: { name: string; email: string; password: string; role: string }): Promise<{ token: string; user: User }> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('role', userData.role);

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData,
      headers: API_CONFIG.getFormDataHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data.token) {
      this.setToken(data.token);
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
    this.user = null;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  async getVehicules(filters: Record<string, any> = {}): Promise<Vehicule[]> {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_CONFIG.BASE_URL}/vehicules${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(url, { headers: API_CONFIG.getHeaders() });
    return this.handleResponse(response);
  }

  async getVehiculeById(id: string): Promise<Vehicule> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/vehicules/${id}`, { headers: API_CONFIG.getHeaders() });
    return this.handleResponse(response);
  }

  async getMarques(): Promise<{ name: string }[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/marques`, { headers: API_CONFIG.getHeaders() });
    return this.handleResponse(response);
  }

  async createReservation(reservationData: ReservationData): Promise<any> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reservations`, {
      method: 'POST',
      headers: API_CONFIG.getHeaders(),
      body: JSON.stringify(reservationData),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/users/me`, { headers: API_CONFIG.getHeaders() });
    return this.handleResponse(response);
  }

  async getParkings(): Promise<any[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/parkings`, { headers: API_CONFIG.getHeaders() });
    return this.handleResponse(response);
  }

  async getStats(): Promise<{ totalVehicules: number; totalParkings: number }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/vehicules/parking/stats`, { headers: API_CONFIG.getHeaders() });
    return this.handleResponse(response);
  }
}

export const mobilityAPI = new MobilityAPI();