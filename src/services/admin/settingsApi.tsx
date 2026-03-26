// services/admin/settingsApi.ts
import { mobilityAPI } from '../mobility-api';

export interface AdminProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone?: string;
  image?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalParkings: number;
  totalVehicles: number;
  totalReservations: number;
  activeParkings: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: 'user' | 'reservation' | 'parking' | 'vehicle';
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  userId?: number;
  userName?: string;
  action: string;
  entity?: string;
  entityId?: string | number;
  details: string;
  ip?: string;
}

export interface TopParking {
  id: number;
  name: string;
  reservations: number;
  logo?: string;
}

export interface HourlyData {
  hour: string;
  reservations: number;
}

export interface MonthlyTrend {
  month: string;
  users: number;
  reservations: number;
}

export interface AnalyticsData {
  monthlyTrends: MonthlyTrend[];
  topParkings: TopParking[];
  hourlyActivity: HourlyData[];
  userDistribution: {
    clients: number;
    parkings: number;
    admins: number;
  };
  totalUsers: number;
  totalReservations: number;
  totalVehicles: number;
  totalParkings: number;
}

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'PENDING' | 'CLOSED';
  createdAt: string;
  updatedAt?: string;
  userId?: number;
}

export interface NotificationSettings {
  email: {
    userRegistration: boolean;
    reservationUpdates: boolean;
    systemAlerts: boolean;
    marketing: boolean;
  };
  push: {
    userActivity: boolean;
    criticalAlerts: boolean;
  };
}

class SettingsAPI {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = mobilityAPI.getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
    
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Erreur API');
    }
    
    return response.json();
  }

  async getAdminProfile(): Promise<AdminProfile> {
    const user = await mobilityAPI.getCurrentUser();
    return {
      id: user.id,
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email,
      phone: user.phone,
      image: user.image,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  async updateAdminProfile(data: Partial<AdminProfile>, imageFile?: File): Promise<AdminProfile> {
    if (!mobilityAPI.getCurrentUserSync()) {
      throw new Error('Non authentifié');
    }

    const token = mobilityAPI.getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
    const url = `${baseUrl}/auth/users/me`;

    if (imageFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'id' && key !== 'createdAt' && key !== 'role' && key !== 'status') {
          formData.append(key, String(value));
        }
      });
      formData.append('image', imageFile);

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }
      
      const result = await response.json();
      return result.user || result;
    } else {
      const updateData: any = {};
      if (data.nom !== undefined) updateData.nom = data.nom;
      if (data.prenom !== undefined) updateData.prenom = data.prenom;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }
      
      const result = await response.json();
      const updatedUser = result.user || result;
      
      return {
        id: updatedUser.id,
        nom: updatedUser.nom || '',
        prenom: updatedUser.prenom || '',
        email: updatedUser.email,
        phone: updatedUser.phone,
        image: updatedUser.image,
        role: updatedUser.role,
        status: updatedUser.status,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
      };
    }
  }

  async getSystemStats(): Promise<SystemStats> {
    const [users, parkings, vehicles, reservations] = await Promise.all([
      mobilityAPI.getAllUsers().catch(() => []),
      mobilityAPI.getParkings().catch(() => []),
      mobilityAPI.getAdminVehicules().catch(() => []),
      mobilityAPI.getAdminReservations().catch(() => []),
    ]);

    const pendingUsers = users.filter(u => u.status === 'PENDING').length;
    const approvedUsers = users.filter(u => u.status === 'APPROVED').length;
    const rejectedUsers = users.filter(u => u.status === 'REJECTED').length;

    return {
      totalUsers: users.length,
      totalParkings: parkings.length,
      totalVehicles: vehicles.length,
      totalReservations: reservations.length,
      activeParkings: parkings.filter(p => p.status === 'ACTIVE').length,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      recentActivity: this.generateRecentActivity(users, reservations, vehicles),
    };
  }

  private generateRecentActivity(users: any[], reservations: any[], vehicles: any[]): ActivityItem[] {
    const activities: ActivityItem[] = [];
    
    // Activités des 5 derniers utilisateurs
    users.slice(0, 5).forEach(user => {
      activities.push({
        id: user.id,
        type: 'user',
        action: 'Nouvel utilisateur',
        user: `${user.prenom} ${user.nom}`,
        timestamp: user.createdAt,
        details: `Inscription avec le rôle ${user.role}`,
      });
    });
    
    // Activités des 5 dernières réservations
    reservations.slice(0, 5).forEach(res => {
      activities.push({
        id: res.id,
        type: 'reservation',
        action: 'Réservation',
        user: res.user?.nom ? `${res.user.prenom} ${res.user.nom}` : 'Utilisateur',
        timestamp: res.createdAt,
        details: `Réservation ${res.type === 'ACHAT' ? "d'achat" : "de location"} - Statut: ${res.status}`,
      });
    });
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    const [users, parkings, vehicles, reservations] = await Promise.all([
      mobilityAPI.getAllUsers().catch(() => []),
      mobilityAPI.getParkings().catch(() => []),
      mobilityAPI.getAdminVehicules().catch(() => []),
      mobilityAPI.getAdminReservations().catch(() => []),
    ]);

    // Distribution des utilisateurs par rôle
    const userDistribution = {
      clients: users.filter(u => u.role === 'CLIENT').length,
      parkings: users.filter(u => u.role === 'PARKING').length,
      admins: users.filter(u => u.role === 'ADMIN').length,
    };

    // Calculer les tendances mensuelles (6 derniers mois)
    const monthlyTrends = this.calculateMonthlyTrends(users, reservations);
    
    // Calculer les top parkings par nombre de réservations
    const topParkings = this.calculateTopParkings(parkings, reservations);
    
    // Calculer l'activité horaire
    const hourlyActivity = this.calculateHourlyActivity(reservations);

    return {
      monthlyTrends,
      topParkings,
      hourlyActivity,
      userDistribution,
      totalUsers: users.length,
      totalReservations: reservations.length,
      totalVehicles: vehicles.length,
      totalParkings: parkings.length,
    };
  }

  private calculateMonthlyTrends(users: any[], reservations: any[]): MonthlyTrend[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const trends: MonthlyTrend[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();

      const monthUsers = users.filter(u => {
        const createdAt = new Date(u.createdAt);
        return createdAt.getMonth() === monthIndex && createdAt.getFullYear() === year;
      }).length;

      const monthReservations = reservations.filter(r => {
        const createdAt = new Date(r.createdAt);
        return createdAt.getMonth() === monthIndex && createdAt.getFullYear() === year;
      }).length;

      trends.push({
        month: months[monthIndex],
        users: monthUsers,
        reservations: monthReservations,
      });
    }

    return trends;
  }

  private calculateTopParkings(parkings: any[], reservations: any[]): TopParking[] {
    const parkingReservations = new Map<number, { count: number; name: string; logo?: string }>();
    
    parkings.forEach(p => {
      parkingReservations.set(p.id, { count: 0, name: p.name, logo: p.logo });
    });
    
    reservations.forEach(r => {
      if (r.vehicle?.parkingId) {
        const current = parkingReservations.get(r.vehicle.parkingId);
        if (current) {
          current.count++;
        }
      }
    });
    
    const sorted = Array.from(parkingReservations.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        reservations: data.count,
        logo: data.logo,
      }))
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 5);
    
    return sorted;
  }

  private calculateHourlyActivity(reservations: any[]): HourlyData[] {
    const hours = ['00h-04h', '04h-08h', '08h-12h', '12h-16h', '16h-20h', '20h-24h'];
    const hourlyData: HourlyData[] = [];
    
    hours.forEach(hourRange => {
      let hourReservations = 0;
      
      if (hourRange === '00h-04h') {
        hourReservations = reservations.filter(r => {
          const hour = new Date(r.createdAt).getHours();
          return hour >= 0 && hour < 4;
        }).length;
      } else if (hourRange === '04h-08h') {
        hourReservations = reservations.filter(r => {
          const hour = new Date(r.createdAt).getHours();
          return hour >= 4 && hour < 8;
        }).length;
      } else if (hourRange === '08h-12h') {
        hourReservations = reservations.filter(r => {
          const hour = new Date(r.createdAt).getHours();
          return hour >= 8 && hour < 12;
        }).length;
      } else if (hourRange === '12h-16h') {
        hourReservations = reservations.filter(r => {
          const hour = new Date(r.createdAt).getHours();
          return hour >= 12 && hour < 16;
        }).length;
      } else if (hourRange === '16h-20h') {
        hourReservations = reservations.filter(r => {
          const hour = new Date(r.createdAt).getHours();
          return hour >= 16 && hour < 20;
        }).length;
      } else if (hourRange === '20h-24h') {
        hourReservations = reservations.filter(r => {
          const hour = new Date(r.createdAt).getHours();
          return hour >= 20 && hour < 24;
        }).length;
      }
      
      hourlyData.push({
        hour: hourRange,
        reservations: hourReservations,
      });
    });
    
    return hourlyData;
  }

  async getRecentLogs(limit: number = 50, page: number = 1): Promise<{ logs: LogEntry[]; total: number }> {
    // À implémenter avec un vrai endpoint
    return {
      logs: [],
      total: 0,
    };
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    // À implémenter avec un vrai endpoint
    return [];
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket> {
    // À implémenter
    return {} as SupportTicket;
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    // À implémenter
    return {
      email: {
        userRegistration: true,
        reservationUpdates: true,
        systemAlerts: true,
        marketing: false,
      },
      push: {
        userActivity: true,
        criticalAlerts: true,
      },
    };
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    // À implémenter
    return settings;
  }
}

export const settingsAPI = new SettingsAPI();