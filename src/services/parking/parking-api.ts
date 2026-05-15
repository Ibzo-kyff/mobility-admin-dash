import { getCookie } from 'cookies-next';

class ParkingAPI {
  private get token(): string | null {
    if (typeof window !== 'undefined') {
      const cookieToken = getCookie('accessToken') as string | null;
      if (cookieToken) return cookieToken;

      try {
        return localStorage.getItem('accessToken');
      } catch (e) {
        return null;
      }
    }
    return null;
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

  // === ENDPOINTS RÉELS POUR PARKING (selon doc) ===

  // Véhicules
  async getMyVehicles(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/vehicules/parking/my-vehicles`, { headers: this.getHeaders() });
    return this.handleResponse<any[]>(res);
  }

  async createVehicle(vehicleData: any) {
    const response = await fetch('/api/parking/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData),
    });
    return response.json();
  }

    async deleteVehicle(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/parking/vehicles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Réservations du parking
  async getReservations(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/reservations/parking/all`, { headers: this.getHeaders() });
    return this.handleResponse<any[]>(res);
  }

  // Clients
  async getClients(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/parkings/me/clients`, { headers: this.getHeaders() });
    return this.handleResponse<any[]>(res);
  }

  async updateClientStatus(clientId: number, status: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/parkings/me/clients/${clientId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse<any>(res);
  }

  // Revenue & Analytics → À implémenter côté backend plus tard
  // Pour l'instant on retourne un objet vide pour éviter les crashes
  async getRevenueSummary(): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/parkings/me/revenue`, { headers: this.getHeaders() });
      if (res.status === 404) return { total: 0, thisMonth: 0, daily: [] };
      return this.handleResponse<any>(res);
    } catch {
      return { total: 0, thisMonth: 0, daily: [] };
    }
  }

  async getAnalytics(): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/parkings/me/analytics`, { headers: this.getHeaders() });
      if (res.status === 404) return { occupancyRate: 0 };
      return this.handleResponse<any>(res);
    } catch {
      return { occupancyRate: 0 };
    }
  }
}

export const parkingAPI = new ParkingAPI();