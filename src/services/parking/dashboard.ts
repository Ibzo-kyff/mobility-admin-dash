import { mobilityAPI } from '../mobility-api';
import { parkingAPI } from '../parking/parking-api';

export const parkingDashboardService = {
  async getDashboardData() {
    try {
      // On récupère l'utilisateur actuel pour avoir son parkingId si nécessaire
      const [revenueSummary, analyticsData, reservationsRaw, vehiclesRaw] = await Promise.all([
        parkingAPI.getRevenueSummary(),
        parkingAPI.getAnalytics(),
        parkingAPI.getReservations(),
        parkingAPI.getMyVehicles(),
      ]);

      return {
        revenueSummary,
        analyticsData,
        reservations: reservationsRaw,
        vehicles: vehiclesRaw
      };
    } catch (error) {
      console.error('Erreur parking dashboard service:', error);
      throw error;
    }
  }
};
