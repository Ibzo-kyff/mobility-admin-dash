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

class MobilityAPI {
  private token: string | null;
  private refreshToken: string | null;
  private user: User | null;

  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      
      const userStr = localStorage.getItem('user');
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
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData.details || '';
        } catch {
          // Si le JSON est invalide, on garde le message d'erreur par défaut
        }
      }
      
      const error: ApiError = { message: errorMessage };
      if (errorDetails) error.details = errorDetails;
      throw error;
    }
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    // Pour les réponses non-JSON (comme du texte simple)
    return response.text() as unknown as T;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      if (this.token) localStorage.setItem('accessToken', this.token);
      if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken);
      if (this.user) localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  private clearStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );
      
      const data: LoginResponse = await this.handleResponse(response);
      
      // Stocker les tokens
      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      // Créer l'objet user
      this.user = {
        id: data.id,
        email: email,
        phone: '', // Le backend ne renvoie pas le phone dans la réponse login
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        status: 'APPROVED', // Par défaut après login réussi
        emailVerified: data.emailVerified,
        parkingId: data.parkingId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessToken: data.accessToken
      };
      
      this.saveToStorage();
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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
        } catch (refreshError) {
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

  async getVehicules(filters: Record<string, any> = {}): Promise<Vehicule[]> {
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

  async createReservation(reservationData: ReservationData): Promise<any> {
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

  async getParkings(): Promise<any[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/parkings`,
      { 
        headers: this.getHeaders() 
      }
    );
    
    return this.handleResponse<any[]>(response);
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

  async updateCurrentUser(data: Partial<User>): Promise<User> {
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
}

// Exportez une instance singleton
export const mobilityAPI = new MobilityAPI();