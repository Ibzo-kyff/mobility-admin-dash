//services/mobility-api.ts
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import type { User, Vehicule, LoginResponse, RegisterData, RegisterResponse, ReservationData, ApiError, Parking, Reservation } from '@/types';

class MobilityAPI {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    // Chargement depuis les cookies (uniquement côté client)
    if (typeof window !== 'undefined') {
      this.token = getCookie('accessToken') as string | null || localStorage.getItem('accessToken');
      this.refreshToken = getCookie('refreshToken') as string | null || localStorage.getItem('refreshToken');

      const userStr = getCookie('user') as string | null || localStorage.getItem('user');
      try {
        this.user = userStr ? JSON.parse(userStr) : null;
      } catch {
        this.user = null;
      }
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
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details || (errorData.message && errorData.error ? errorData.message : '');
        } catch {}
      }

      const error: ApiError = { 
        message: errorMessage,
        details: errorDetails,
        status: response.status
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
    const isProd = process.env.NODE_ENV === 'production';

    if (this.token) {
      setCookie('accessToken', this.token, {
        maxAge: 30 * 60,           // 30 minutes (aligné avec le backend)
        secure: isProd,
        sameSite: 'strict',
        path: '/',
      });
    }

    if (this.refreshToken) {
      setCookie('refreshToken', this.refreshToken, {
        maxAge: 7 * 24 * 60 * 60, // 7 jours
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
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('user');
  }

  // ==================== Méthodes d'authentification ====================

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/login`,
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

  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/google`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    const data: LoginResponse = await this.handleResponse(response);

    this.token = data.accessToken;
    this.refreshToken = data.refreshToken;

    this.user = {
      id: data.id,
      email: data.email || '',
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

  async loginWithFacebook(accessToken: string): Promise<LoginResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/facebook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      }
    );

    const data: LoginResponse = await this.handleResponse(response);

    this.token = data.accessToken;
    this.refreshToken = data.refreshToken;

    this.user = {
      id: data.id,
      email: data.email || '',
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
      // Format des données pour correspondre au backend
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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        }
      );
      
      const data: RegisterResponse = await this.handleResponse(response);
      
      // Stocker les tokens
      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      // Créer l'objet user partiel (l'ID sera récupéré par getCurrentUser)
      this.user = {
        id: 0, // Temporaire, sera mis à jour par getCurrentUser
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  async refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/refresh-token`,
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
      this.logout(); // Déconnexion si le refresh token est invalide
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('Non authentifié. Veuillez vous connecter.');
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/users/me`,
        {
          headers: this.getHeaders(),
        }
      );
      
      // Vérifier si le token a expiré
      if (response.status === 401) {
        try {
          // Essayer de rafraîchir le token
          await this.refreshAccessToken();
          // Réessayer la requête avec le nouveau token
          const retryResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/users/me`,
            {
              headers: this.getHeaders(),
            }
          );
          
          const userData = await this.handleResponse<User & { accessToken?: string }>(retryResponse);
          
          // Mettre à jour l'utilisateur avec les données du serveur
          this.user = {
            ...userData,
            accessToken: this.token
          };
          
          this.saveToStorage();
          
          return this.user;
        } catch (_refreshError) {
          this.logout();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
      }
      
      const userData = await this.handleResponse<User & { accessToken?: string }>(response);
      
      // Mettre à jour l'utilisateur avec les données du serveur
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

  async getVehicules(filters: Record<string, string> = {}): Promise<Vehicule[]> {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/vehicules${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, { 
      headers: this.getHeaders() 
    });
    
    return this.handleResponse<Vehicule[]>(response);
  }

  async getVehiculeById(id: string): Promise<Vehicule> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/vehicules/${id}`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<Vehicule>(response);
  }

  async getMarques(): Promise<{ name: string }[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/marques`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<{ name: string }[]>(response);
  }

  async createReservation(reservationData: ReservationData): Promise<unknown> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/reservations`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(reservationData),
      }
    );
    
    return this.handleResponse(response);
  }

  async getParkings(): Promise<Parking[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/parkings`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<Parking[]>(response);
  }

  async getMyParking(): Promise<Parking> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/parkings/me`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<Parking>(response);
  }

  async updateParking(parkingId: string | number | null, data: Record<string, unknown> | FormData): Promise<Parking> {
    const isFormData = data instanceof FormData;
    const headers = this.getHeaders();

    if (isFormData && (headers as Record<string, string>)['Content-Type']) {
      delete (headers as Record<string, string>)['Content-Type'];
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/parkings/${parkingId}`,
      {
        method: 'PUT',
        headers: headers,
        body: isFormData ? data : JSON.stringify(data),
      }
    );

    return this.handleResponse<Parking>(response);
  }

  async getStats(): Promise<{ totalVehicules: number; totalParkings: number }> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/vehicules/parking/stats`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<{ totalVehicules: number; totalParkings: number }>(response);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/forgot-password`,
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
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/reset-password`,
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
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/verify-email-otp`,
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
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/send-verification-email`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<{ message: string }>(response);
  }

  async updateUserProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/users/${userId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    
    const updatedUser = await this.handleResponse<User>(response);
    
    // Mettre à jour l'utilisateur local si c'est l'utilisateur courant
    if (this.user && this.user.id === userId) {
      this.user = { ...this.user, ...updatedUser };
      this.saveToStorage();
    }
    
    return updatedUser;
  }

  async updateCurrentUser(data: Partial<User> | FormData): Promise<User> {
    if (!this.user) {
      throw new Error('Non authentifié');
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/users/me`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    
    const updatedUser = await this.handleResponse<User>(response);
    
    // Mettre à jour l'utilisateur local
    this.user = { ...this.user, ...updatedUser };
    this.saveToStorage();
    
    return updatedUser;
  }

  // Méthodes utilitaires
  isAuthenticated(): boolean {
    return !!this.token;
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

  // Méthode pour la compatibilité avec votre code existant
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

  // Méthode pour la compatibilité avec votre code existant
  async registerOld(userData: { name: string; email: string; password: string; role: string }): Promise<{ token: string; user: User }> {
    const [nom, prenom] = userData.name.split(' ');
    const registerData: RegisterData = {
      nom: nom || '',
      prenom: prenom || '',
      email: userData.email,
      phone: '', // Vous devrez ajouter le téléphone si nécessaire
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
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/users`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<User[]>(response);
  }

  async getAllReservations(): Promise<Reservation[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations/all`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<Reservation[]>(response);
  }

  async getUserReservations(userId?: number): Promise<Reservation[]> {
    if (!userId && !this.user) {
      throw new Error('Non authentifié');
    }
    
    const id = userId || this.user?.id;
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${id}`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<Reservation[]>(response);
  }

  async getParkingReservations(parkingId?: number | null): Promise<Reservation[]> {
    if (!parkingId && !this.user?.parkingId) {
      throw new Error('Parking ID non trouvé');
    }
    
    const id = parkingId || this.user?.parkingId;
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations/parking/${id}`,
      {
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<Reservation[]>(response);
  }

  async updateReservationStatus(reservationId: string, status: string, reason?: string): Promise<Reservation> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
    const response = await fetch(
      `${baseUrl}/reservations/${reservationId}/status`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(reason ? { status, reason } : { status }),
      }
    );
    
    return this.handleResponse(response);
  }

  async deleteVehicule(vehicleId: string): Promise<void> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vehicules/${vehicleId}`,
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
    
    // Si c'est du FormData, on laisse le navigateur définir le Content-Type avec le boundary
    if (isFormData && (headers as Record<string, string>)['Content-Type']) {
      delete (headers as Record<string, string>)['Content-Type'];
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vehicules/${vehicleId}`,
      {
        method: 'PUT',
        headers: headers,
        body: isFormData ? data : JSON.stringify(data),
      }
    );
    
    return this.handleResponse<Vehicule>(response);
  }
    // ==================== MÉTHODES ADMIN ====================

  async getAdminVehicules(): Promise<Vehicule[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/vehicules/admin`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse<Vehicule[]>(response);
  }

  async getAdminReservations(): Promise<Reservation[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/reservations/admin/all`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse<Reservation[]>(response);
  }

  async updateReservation(id: number | string, data: Partial<Reservation>): Promise<Reservation> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/reservations/admin/${id}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse(response);
  }
}

// Exportez une instance singleton
export const mobilityAPI = new MobilityAPI();