import { getCookie } from 'cookies-next';
import type { User, Vehicule, ReservationData } from '@/types';
import { mobilityAPI } from '../mobility-api';

class ClientAPI {
  private get token(): string | null {
    return mobilityAPI.getToken();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = this.token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let message = `Erreur ${response.status}`;
      if (contentType?.includes('application/json')) {
        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {}
      }
      const err: any = new Error(message);
      err.status = response.status;
      throw err;
    }

    if (contentType?.includes('application/json')) return response.json();
    return (await response.text()) as unknown as T;
  }

  private get baseUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
  }

  // === VÉHICULES ===
  
  async getUserVehicles(userId: number): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/vehicules/user/${userId}`, { headers: this.getHeaders() });
      if (res.status === 404) {
        const fallbackRes = await fetch(`${this.baseUrl}/vehicules?userId=${userId}`, { headers: this.getHeaders() });
        return this.handleResponse<any[]>(fallbackRes);
      }
      return this.handleResponse<any[]>(res);
    } catch (error) {
      console.error('Error in getUserVehicles:', error);
      throw error;
    }
  }

  async addVehicle(data: Partial<Vehicule> | FormData): Promise<Vehicule> {
    const isFormData = data instanceof FormData;
    const headers = this.getHeaders();
    if (isFormData && (headers as any)['Content-Type']) {
      delete (headers as any)['Content-Type'];
    }

    const res = await fetch(`${this.baseUrl}/vehicules`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse<Vehicule>(res);
  }

  async updateVehicle(id: string, data: Partial<Vehicule> | FormData): Promise<Vehicule> {
    const isFormData = data instanceof FormData;
    const headers = this.getHeaders();
    if (isFormData && (headers as any)['Content-Type']) {
      delete (headers as any)['Content-Type'];
    }

    const res = await fetch(`${this.baseUrl}/vehicules/${id}`, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse<Vehicule>(res);
  }

  async deleteVehicle(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/vehicules/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // === RÉSERVATIONS ===

  async getUserReservations(userId: number): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/reservations/user/${userId}`, { headers: this.getHeaders() });
      if (res.status === 404) {
        const fallbackRes = await fetch(`${this.baseUrl}/reservations?userId=${userId}`, { headers: this.getHeaders() });
        return this.handleResponse<any[]>(fallbackRes);
      }
      return this.handleResponse<any[]>(res);
    } catch (error) {
      console.error('Error in getUserReservations:', error);
      throw error;
    }
  }

  async createReservation(data: ReservationData): Promise<any> {
    const res = await fetch(`${this.baseUrl}/reservations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  // === DASHBOARD STATS & ACTIVITY ===

  async getDashboardStats(userId: number) {
    const [reservationsRaw, vehiclesRaw] = await Promise.all([
      this.getUserReservations(userId),
      this.getUserVehicles(userId)
    ]);

    const reservations = Array.isArray(reservationsRaw) ? reservationsRaw : 
                         (reservationsRaw && typeof reservationsRaw === 'object' && Array.isArray((reservationsRaw as any).reservations)) ? (reservationsRaw as any).reservations :
                         (reservationsRaw && typeof reservationsRaw === 'object' && Array.isArray((reservationsRaw as any).data)) ? (reservationsRaw as any).data : [];

    const vehicles = Array.isArray(vehiclesRaw) ? vehiclesRaw : 
                     (vehiclesRaw && typeof vehiclesRaw === 'object' && Array.isArray((vehiclesRaw as any).vehicles)) ? (vehiclesRaw as any).vehicles :
                     (vehiclesRaw && typeof vehiclesRaw === 'object' && Array.isArray((vehiclesRaw as any).data)) ? (vehiclesRaw as any).data : [];

    const activeReservations = reservations.filter((r: any) => 
      ['APPROVED', 'CONFIRMED', 'PENDING'].includes(r.status?.toUpperCase())
    ).length;

    const totalSpent = reservations
      .filter((r: any) => ['APPROVED', 'CONFIRMED', 'COMPLETED', 'ACTIVE'].includes(r.status?.toUpperCase()))
      .reduce((sum: number, r: any) => {
        // Nettoyage de la chaîne de prix (ex: "2 500 F" -> 2500)
        const prixStr = String(r.prix || r.prixJour || '0').replace(/[^0-9.-]+/g, '');
        return sum + (Number(prixStr) || 0);
      }, 0);

    // Points de fidélité = 1 point pour chaque 100 F dépensés (ou ajustez selon vos besoins)
    const loyaltyPoints = Math.floor(totalSpent / 100);

    return {
      activeReservations,
      totalVehicles: vehicles.length,
      totalSpent,
      loyaltyPoints,
      reservations: reservations.slice(0, 5) // Recent ones
    };
  }

  async getMarques() {
    return mobilityAPI.getMarques();
  }

  // === PROFIL ===

  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    return mobilityAPI.updateUserProfile(userId, data);
  }

  // === PARKING BROWSER ===

  async getParkings(): Promise<any[]> {
    return mobilityAPI.getParkings();
  }

  async getParkingById(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/parkings/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(res);
  }

  async getVehiclesByParking(parkingId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/vehicules?parkingId=${parkingId}`, { headers: this.getHeaders() });
    return this.handleResponse<any[]>(res);
  }
}

export const clientAPI = new ClientAPI();
