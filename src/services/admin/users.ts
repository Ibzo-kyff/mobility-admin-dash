// services/admin/users.ts
import { mobilityAPI } from '../mobility-api';
import type { User } from '@/types';

class AdminUsersService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api'}/auth`;

  private async getHeaders() {
    const token = mobilityAPI.getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users`, {
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du chargement des utilisateurs');
    }
    
    return response.json();
  }

  async getUserById(id: number): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du chargement de l\'utilisateur');
    }
    
    return response.json();
  }

  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    // Créer un FormData pour l'upload d'image
    const formData = new FormData();
    
    // Ajouter tous les champs au FormData
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'emailVerified') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mobilityAPI.getToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de l\'utilisateur');
    }
    
    return response.json();
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Pour la mise à jour sans image, on utilise FormData car le backend attend multipart/form-data
    const formData = new FormData();
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'emailVerified') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${mobilityAPI.getToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
    
    return response.json();
  }

  async updateUserWithImage(id: number, userData: Partial<User>, imageFile: File): Promise<User> {
    const formData = new FormData();
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'emailVerified') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    formData.append('image', imageFile);

    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${mobilityAPI.getToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
    
    return response.json();
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  }

  async updateUserStatus(id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<User> {
    return this.updateUser(id, { status });
  }

  async updateUserRole(id: number, role: 'CLIENT' | 'PARKING' | 'ADMIN'): Promise<User> {
    return this.updateUser(id, { role });
  }
}

export const adminUsersService = new AdminUsersService();