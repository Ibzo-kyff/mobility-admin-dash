// hooks/useUser.ts
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { mobilityAPI } from '@/services/mobility-api';
import { useState } from 'react';
import type { User } from '@/types';

export function useUser() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await mobilityAPI.updateCurrentUser(data);
      return updatedUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${mobilityAPI.getToken()}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    updateProfile,
    uploadAvatar,
  };
}