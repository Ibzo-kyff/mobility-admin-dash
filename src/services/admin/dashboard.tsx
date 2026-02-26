import { mobilityAPI } from '../mobility-api';

export interface AdminStats {
  totalUsers: number;
  totalVehicules: number;
  totalParkings: number;
  pendingApprovals: number;
  totalReservations: number;
  reservationsThisMonth: number;
  newUsersThisMonth: number;
  activeReservations: number;
}

export const adminDashboardService = {
  async getStats(): Promise<AdminStats> {
    const [users, vehicules, parkings, reservations] = await Promise.all([
      mobilityAPI.getAllUsers(),
      mobilityAPI.getAdminVehicules(),
      mobilityAPI.getParkings(),
      mobilityAPI.getAdminReservations(),
    ]);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const reservationsThisMonth = reservations.filter((r: any) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const newUsersThisMonth = users.filter((u: any) => {
      const d = new Date(u.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Réservations actives = tout sauf terminées/annulées (à adapter selon tes statuts)
    const activeReservations = reservations.filter((r: any) => 
      !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status || '')
    ).length;

    return {
      totalUsers: users.length,
      totalVehicules: vehicules.length,
      totalParkings: parkings.length,
      pendingApprovals: users.filter((u: any) => u.status === 'PENDING').length,
      totalReservations: reservations.length,
      reservationsThisMonth,
      newUsersThisMonth,
      activeReservations,
    };
  },

  async getPendingUsers(limit = 10) {
    const users = await mobilityAPI.getAllUsers();
    return users
      .filter((u: any) => u.status === 'PENDING')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async getRecentReservations(limit = 8) {
    const reservations = await mobilityAPI.getAdminReservations();
    return reservations
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
};