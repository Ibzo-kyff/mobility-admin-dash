// services/mobility-api.ts
console.log("🟢 [1] Début chargement mobility-api.ts");

import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import type { User, Vehicule, LoginResponse, RegisterData, RegisterResponse, ReservationData, ApiError } from '@/types';

console.log("🟢 [2] Imports réussis");

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
console.log("🟢 [2b] API_BASE_URL:", API_BASE_URL);

class MobilityAPI {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    console.log("🟢 [3] Constructor MobilityAPI appelé, isClient:", this.isClient);
    
    // Ne pas charger les cookies côté serveur
    if (this.isClient) {
      this.loadFromCookies();
    }
  }

  private loadFromCookies() {
    console.log("🟢 [4] Chargement depuis les cookies");
    try {
      this.token = getCookie('accessToken') as string | null;
      this.refreshToken = getCookie('refreshToken') as string | null;
      console.log("🟢 [5] Token chargé:", this.token ? "Présent" : "Absent");

      const userStr = getCookie('user') as string | null;
      if (userStr) {
        this.user = JSON.parse(userStr);
        console.log("🟢 [6] Utilisateur chargé:", this.user ? "Présent" : "Absent");
      }
    } catch (error) {
      console.error("🔴 Erreur chargement cookies:", error);
      this.token = null;
      this.refreshToken = null;
      this.user = null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}`;
      let errorDetails = '';

      if (contentType?.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData.details || '';
        } catch {}
      }

      const error: ApiError = { 
        message: errorMessage,
        status: response.status,
        details: errorDetails 
      };
      throw error;
    }

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private saveToStorage() {
    if (!this.isClient) return;
    
    const isProd = process.env.NODE_ENV === 'production';

    if (this.token) {
      setCookie('accessToken', this.token, {
        maxAge: 15 * 60,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
      });
    }

    if (this.refreshToken) {
      setCookie('refreshToken', this.refreshToken, {
        maxAge: 7 * 24 * 60 * 60,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
      });
    }

    if (this.user) {
      setCookie('user', JSON.stringify(this.user), {
        maxAge: 7 * 24 * 60 * 60,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
      });
    }
  }

  private clearStorage() {
    if (!this.isClient) return;
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('user');
  }

  // ==================== Méthodes d'authentification ====================

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );

    const data: LoginResponse = await this.handleResponse(response);

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
      parkingId: data.parkingId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessToken: data.accessToken,
    };

    this.saveToStorage();
    return data;
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const backendData = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        address: userData.address || '',
        role: userData.role,
        status: userData.status || 'PENDING',
        emailVerified: userData.emailVerified || false,
        isOnline: userData.isOnline || false,
        connectionCount: userData.connectionCount || 0
      };
      
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        }
      );
      
      const data: RegisterResponse = await this.handleResponse(response);
      
      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      this.user = {
        id: 0,
        email: data.email,
        phone: userData.phone,
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        status: userData.status || 'PENDING',
        emailVerified: data.emailVerified,
        address: userData.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessToken: data.accessToken
      };
      
      this.saveToStorage();
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.clearStorage();
  }

  setToken(token: string) {
    this.token = token;
  }

  async refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/refresh-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        }
      );
      
      const data = await this.handleResponse<{ accessToken: string; refreshToken: string }>(response);
      
      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.saveToStorage();
      
      return data;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('Non authentifié. Veuillez vous connecter.');
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/users/me`,
        {
          headers: this.getHeaders(),
        }
      );
      
      if (response.status === 401) {
        try {
          await this.refreshAccessToken();
          const retryResponse = await fetch(
            `${API_BASE_URL}/auth/users/me`,
            {
              headers: this.getHeaders(),
            }
          );
          
          const userData = await this.handleResponse<User & { accessToken?: string }>(retryResponse);
          
          this.user = {
            ...userData,
            accessToken: this.token
          };
          
          this.saveToStorage();
          
          return this.user;
        } catch (refreshError) {
          this.logout();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
      }
      
      const userData = await this.handleResponse<User & { accessToken?: string }>(response);
      
      this.user = {
        ...userData,
        accessToken: this.token
      };
      
      this.saveToStorage();
      
      return this.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async getVehicules(filters: Record<string, any> = {}): Promise<Vehicule[]> {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/vehicules${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, { 
      headers: this.getHeaders() 
    });
    
    return this.handleResponse<Vehicule[]>(response);
  }

  async getVehiculeById(id: string): Promise<Vehicule> {
    const response = await fetch(
      `${API_BASE_URL}/vehicules/${id}`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<Vehicule>(response);
  }

  async getMarques(): Promise<{ name: string }[]> {
    const response = await fetch(
      `${API_BASE_URL}/marques`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<{ name: string }[]>(response);
  }

  async createReservation(reservationData: ReservationData): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/reservations`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(reservationData),
      }
    );
    
    return this.handleResponse(response);
  }

  async getParkings(): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/parkings`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<any[]>(response);
  }

  async getParkingById(id: number): Promise<any> {
    console.log("🟢 getParkingById appelé avec id:", id, "URL:", `${API_BASE_URL}/parkings/${id}`);
    try {
      const response = await fetch(
        `${API_BASE_URL}/parkings/${id}`,
        { 
          headers: this.getHeaders() 
        }
      );
      console.log("🟢 getParkingById réponse status:", response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error("🔴 getParkingById erreur:", error);
      throw error;
    }
  }

  async updateParkingStatus(id: number, status: string): Promise<any> {
    console.log("🟢 updateParkingStatus appelé avec id:", id, "status:", status);
    try {
      const response = await fetch(
        `${API_BASE_URL}/parkings/${id}/status`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      console.log("🟢 updateParkingStatus réponse status:", response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error("🔴 updateParkingStatus erreur:", error);
      throw error;
    }
  }

  async updateParkingInfo(id: number, data: any): Promise<any> {
    console.log("🟢 updateParkingInfo appelé avec id:", id, "data:", data);
    try {
      const response = await fetch(
        `${API_BASE_URL}/parkings/${id}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );
      console.log("🟢 updateParkingInfo réponse status:", response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error("🔴 updateParkingInfo erreur:", error);
      throw error;
    }
  }

  async blockParking(id: number): Promise<any> {
    return this.updateParkingStatus(id, 'BLOCKED');
  }

  async getStats(): Promise<{ totalVehicules: number; totalParkings: number }> {
    const response = await fetch(
      `${API_BASE_URL}/vehicules/parking/stats`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<{ totalVehicules: number; totalParkings: number }>(response);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );
    
    return this.handleResponse<{ message: string }>(response);
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/auth/reset-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: newPassword }),
      }
    );
    
    return this.handleResponse<{ message: string }>(response);
  }

  async verifyEmailWithOTP(email: string, otp: string): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/auth/verify-email-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      }
    );
    
    return this.handleResponse<{ message: string }>(response);
  }

  async sendVerificationEmail(): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/auth/send-verification-email`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<{ message: string }>(response);
  }

  async updateUserProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await fetch(
      `${API_BASE_URL}/auth/users/${userId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    
    const updatedUser = await this.handleResponse<User>(response);
    
    if (this.user && this.user.id === userId) {
      this.user = { ...this.user, ...updatedUser };
      this.saveToStorage();
    }
    
    return updatedUser;
  }

  async updateCurrentUser(data: Partial<User>): Promise<User> {
    if (!this.user) {
      throw new Error('Non authentifié');
    }
    
    const response = await fetch(
      `${API_BASE_URL}/auth/users/me`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    
    const updatedUser = await this.handleResponse<User>(response);
    
    this.user = { ...this.user, ...updatedUser };
    this.saveToStorage();
    
    return updatedUser;
  }

  // Méthodes utilitaires
  isAuthenticated(): boolean {
    const result = this.isClient && !!this.token;
    console.log("🟢 isAuthenticated appelé, isClient:", this.isClient, "token présent:", !!this.token, "retourne:", result);
    return result;
  }

  getCurrentUserSync(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  async checkAuthStatus(): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  async loginOld(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.login(email, password);
    return {
      token: data.accessToken,
      user: {
        id: data.id,
        email: email,
        phone: '',
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        status: 'APPROVED',
        emailVerified: data.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessToken: data.accessToken
      }
    };
  }

  async registerOld(userData: { name: string; email: string; password: string; role: string }): Promise<{ token: string; user: User }> {
    const [nom, prenom] = userData.name.split(' ');
    const registerData: RegisterData = {
      nom: nom || '',
      prenom: prenom || '',
      email: userData.email,
      phone: '',
      password: userData.password,
      role: userData.role as 'CLIENT' | 'PARKING' | 'ADMIN'
    };
    
    const data = await this.register(registerData);
    return {
      token: data.accessToken,
      user: {
        id: 0,
        email: data.email,
        phone: '',
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        status: 'PENDING',
        emailVerified: data.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessToken: data.accessToken
      }
    };
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.token) {
      throw new Error('Non authentifié');
    }
    
    const response = await fetch(
      `${API_BASE_URL}/auth/users`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<User[]>(response);
  }

  async getAllReservations(): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/reservations/all`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<any[]>(response);
  }

  async getUserReservations(userId?: number): Promise<any[]> {
    if (!userId && !this.user) {
      throw new Error('Non authentifié');
    }
    
    const id = userId || this.user?.id;
    
    const response = await fetch(
      `${API_BASE_URL}/reservations/user/${id}`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<any[]>(response);
  }

  async getParkingReservations(parkingId?: number | null): Promise<any[]> {
    if (!parkingId && !this.user?.parkingId) {
      throw new Error('Parking ID non trouvé');
    }
    
    const id = parkingId || this.user?.parkingId;
    
    const response = await fetch(
      `${API_BASE_URL}/reservations/parking/${id}`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<any[]>(response);
  }

  async updateReservationStatus(reservationId: string, status: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/reservations/${reservationId}/status`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    
    return this.handleResponse(response);
  }

  async deleteVehicule(vehicleId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/vehicules/${vehicleId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse(response);
  }

  async updateVehicule(vehicleId: string, data: Partial<Vehicule> | FormData): Promise<Vehicule> {
    const isFormData = data instanceof FormData;
    const headers = this.getHeaders();
    
    if (isFormData && (headers as any)['Content-Type']) {
      delete (headers as any)['Content-Type'];
    }

    const response = await fetch(
      `${API_BASE_URL}/vehicules/${vehicleId}`,
      {
        method: 'PUT',
        headers: headers,
        body: isFormData ? data : JSON.stringify(data),
      }
    );
    
    return this.handleResponse<Vehicule>(response);
  }

  // ==================== MÉTHODES ADMIN ====================

  async getAdminVehicules(): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/vehicules/admin`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse<any[]>(response);
  }

  async getAdminReservations(): Promise<any[]> {
    console.log("🟢 getAdminReservations appelé");
    try {
      const response = await fetch(
        `${API_BASE_URL}/reservations/admin/all`,
        { headers: this.getHeaders() }
      );
      console.log("🟢 getAdminReservations réponse status:", response.status);
      return this.handleResponse<any[]>(response);
    } catch (error) {
      console.error("🔴 getAdminReservations erreur:", error);
      throw error;
    }
  }
}

console.log("🟢 [7] Classe MobilityAPI définie");

// Exportez une instance singleton
export const mobilityAPI = new MobilityAPI();
console.log("🟢 [8] Instance mobilityAPI créée et exportée");