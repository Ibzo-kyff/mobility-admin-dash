import { getCookie } from 'cookies-next';
import type { Vehicule, ApiError } from '@/types';

class VehiclesAPI {
    private get token(): string | null {
        if (typeof window !== 'undefined') {
            const cookieToken = getCookie('accessToken') as string | null;
            if (cookieToken) return cookieToken;

            // Fallback sur le localStorage si le cookie est absent (certains navigateurs ou config)
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
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            let errorMessage = `Erreur ${response.status}`;
            let errorDetails = '';

            if (contentType?.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                    errorDetails = errorData.details || '';
                } catch { }
            }

            const error = new Error(errorMessage) as any;
            error.details = errorDetails;
            error.status = response.status;
            throw error;
        }

        if (contentType?.includes('application/json')) {
            return response.json();
        }

        return response.text() as unknown as T;
    }

    private get baseUrl() {
        return process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
    }

    async getAllVehiculesAdmin(): Promise<Vehicule[]> {
        const response = await fetch(`${this.baseUrl}/vehicules/admin`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<Vehicule[]>(response);
    }

    async getVehiculeById(id: string): Promise<Vehicule> {
        const response = await fetch(`${this.baseUrl}/vehicules/${id}`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<Vehicule>(response);
    }

    async createVehicule(data: Partial<Vehicule> | FormData): Promise<Vehicule> {
        const isFormData = data instanceof FormData;
        const headers: any = this.getHeaders();

        if (isFormData) {
            delete headers['Content-Type'];
        }

        const response = await fetch(`${this.baseUrl}/vehicules`, {
            method: 'POST',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data),
        });
        return this.handleResponse<Vehicule>(response);
    }

    async updateVehicule(id: string, data: Partial<Vehicule> | FormData): Promise<Vehicule> {
        const isFormData = data instanceof FormData;
        const headers = this.getHeaders();

        if (isFormData && (headers as any)['Content-Type']) {
            delete (headers as any)['Content-Type'];
        }

        const response = await fetch(`${this.baseUrl}/vehicules/${id}`, {
            method: 'PUT',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data),
        });
        return this.handleResponse<Vehicule>(response);
    }

    async deleteVehicule(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/vehicules/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getVehicules(filters: Record<string, any> = {}): Promise<Vehicule[]> {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${this.baseUrl}/vehicules${queryParams ? `?${queryParams}` : ''}`;
        const response = await fetch(url, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<Vehicule[]>(response);
    }

    async getMarques(): Promise<{ name: string }[]> {
        const response = await fetch(`${this.baseUrl}/marques`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<{ name: string }[]>(response);
    }

    async getVehicleStats(): Promise<{ totalVehicules: number; totalParkings: number }> {
        try {
            const response = await fetch(`${this.baseUrl}/vehicules/parking/stats`, {
                headers: this.getHeaders(),
            });
            return await this.handleResponse<{ totalVehicules: number; totalParkings: number }>(response);
        } catch (error) {
            console.warn("Could not fetch vehicle stats (unauthorized or unavailable), using fallback", error);
            // Fallback to default stats if unauthenticated or error
            return { totalVehicules: 500, totalParkings: 50 };
        }
    }
    async getMyParking(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/parkings/me`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
}

export const vehiclesAPI = new VehiclesAPI();
