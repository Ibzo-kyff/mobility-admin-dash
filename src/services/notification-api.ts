import { getCookie } from 'cookies-next';
import type { ApiError } from '@/types';
import { mobilityAPI } from './mobility-api';

class NotificationAPI {
  private get baseUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
  }

  private get token() {
    return mobilityAPI.getToken() || (typeof window !== 'undefined' ? (getCookie('accessToken') as string | null || localStorage.getItem('accessToken')) : null);
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
          errorDetails = errorData.details || (errorData.message && errorData.error ? errorData.message : '');
        } catch {}
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

  async getNotifications(params: { userId?: number; parkingId?: number } = {}): Promise<any[]> {
    if (!this.token) {
      return [];
    }

    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.parkingId) queryParams.append('parkingId', params.parkingId.toString());

    const url = `${this.baseUrl}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<any>(response);
      
      // Essayer de trouver le tableau de notifications dans la réponse
      let notifications = [];
      if (Array.isArray(data)) {
        notifications = data;
      } else if (data && typeof data === 'object') {
        notifications = data.notifications || data.data || Object.values(data).find(Array.isArray) || [];
      }
      
      // Déduplication (pour éviter les doublons intempestifs) identique à l'app mobile
      const uniqueNotifications = notifications.filter((notification: any, index: number, self: any[]) => {
        const key = `${notification.title}_${notification.message}_${notification.type}`;
        const firstIndex = self.findIndex(n =>
          `${n.title}_${n.message}_${n.type}` === key
        );
        return firstIndex === index;
      });
      
      return uniqueNotifications;
    } catch (error) {
      console.warn('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: number): Promise<any> {
    if (!this.token) return;
    const url = `${this.baseUrl}/notifications/${id}/read`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async deleteNotification(id: number): Promise<any> {
    if (!this.token) return;
    const url = `${this.baseUrl}/notifications/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const notificationAPI = new NotificationAPI();
