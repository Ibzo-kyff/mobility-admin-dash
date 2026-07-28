import { getCookie } from 'cookies-next';
import type { ApiError } from '@/types';
import { mobilityAPI } from './mobility-api';

interface NotificationItem {
  id?: number;
  title?: string;
  message?: string;
  type?: string;
  [key: string]: unknown;
}

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

      const error = new Error(errorMessage) as Error & ApiError;
      error.details = errorDetails;
      error.status = response.status;
      throw error;
    }

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  async getNotifications(params: { userId?: number; parkingId?: number } = {}): Promise<NotificationItem[]> {
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

      const data = await this.handleResponse<unknown>(response);

      // Essayer de trouver le tableau de notifications dans la réponse
      let notifications: NotificationItem[] = [];
      if (Array.isArray(data)) {
        notifications = data as NotificationItem[];
      } else if (data && typeof data === 'object') {
        const payload = data as Record<string, unknown>;
        notifications = (payload.notifications as NotificationItem[] | undefined)
          || (payload.data as NotificationItem[] | undefined)
          || (Object.values(payload).find((value): value is NotificationItem[] => Array.isArray(value)) ?? []);
      }

      // Déduplication (pour éviter les doublons intempestifs) identique à l'app mobile
      const uniqueNotifications = notifications.filter((notification, index, self) => {
        const key = `${notification.title ?? ''}_${notification.message ?? ''}_${notification.type ?? ''}`;
        const firstIndex = self.findIndex((n) =>
          `${n.title ?? ''}_${n.message ?? ''}_${n.type ?? ''}` === key
        );
        return firstIndex === index;
      });
      
      return uniqueNotifications;
    } catch (error) {
      console.warn('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: number): Promise<void> {
    if (!this.token) return;
    const url = `${this.baseUrl}/notifications/${id}/read`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async deleteNotification(id: number): Promise<void> {
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
