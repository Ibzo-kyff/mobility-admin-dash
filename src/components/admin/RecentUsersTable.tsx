// components/admin/RecentUsersTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faEye,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import type { User } from '@/types';

export default function RecentUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await mobilityAPI.getAllUsers();
      const pendingUsers = allUsers
        .filter((u: User) => u.status === 'PENDING')
        .slice(0, 5);
      setUsers(pendingUsers);
    } catch (error) {
      console.error('Error loading pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      setProcessingId(userId);
      await mobilityAPI.updateUserProfile(userId, { status: 'APPROVED' });
      await loadPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: number) => {
    try {
      setProcessingId(userId);
      await mobilityAPI.updateUserProfile(userId, { status: 'BLOCKED' });
      await loadPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-orange-500 text-2xl" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune demande d'approbation en attente</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date d'inscription
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.image ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.image}
                        alt={`${user.prenom} ${user.nom}`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {user.prenom?.[0]}{user.nom?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}
                </span>
                {!user.emailVerified && (
                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Non vérifié
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.phone || 'Non renseigné'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/admin/users/${user.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processingId === user.id}
                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={processingId === user.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}