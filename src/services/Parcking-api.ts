const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://parkapp-pi.vercel.app/api";

// ===== TYPES =====
export interface User {
  id: number;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  nom?: string;
  prenom?: string;
}

export interface Reservation {
  id: number;
  type: "LOCATION" | "ACHAT";
  date: string;
  status: string;
  user: User;
  vehicleId: number;
}

export interface Vehicle {
  id: number | string;
  marque?: string;
  marqueRef?: { name?: string };
  brand?: string;
  model?: string;
  modele?: string;
  prix?: number;
  prixJour?: number;
  description?: string;
  photos?: string[] | string;
  garantie?: boolean;
  dureeGarantie?: number;
  chauffeur?: boolean;
  status?: string;
  fuelType?: string;
  carburant?: string;
  mileage?: number;
  kilometrage?: number;
  year?: number | null;
  annee?: number | null;
  transmission?: string;
  boite?: string;
  immatriculation?: string;
  plate?: string;
  forRent?: boolean;
  forSale?: boolean;
  parkingId?: number | string;
  parking?: { id?: number | string; name?: string };
  reservations?: Reservation[];
}

export type ParkingStatusType = "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING" | "REJECTED";

export interface Parking {
  id: number;
  name: string;
  address: string;
  capacity: number;
  status: ParkingStatusType | string;
  city?: string;
  zipCode?: string | null;
  phone?: string;
  email?: string;
  description?: string;
  hoursOfOperation?: string | null;
  logo?: string;
  userId?: number;
  user?: User;
  vehicles?: Vehicle[];
}

// ===== FETCH TOUS LES PARKINGS =====
export async function fetchParkingData(): Promise<Parking[]> {
  try {
    const res = await fetch(`${BASE_URL}/parkings`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.log("ERREUR LISTE:", res.status);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Erreur récupération parkings:", error);
    return [];
  }
}

// ===== FETCH PARKING PAR ID =====
export async function getParkingById(id: string, token?: string): Promise<Parking | null> {
  try {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/parkings/${id}`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      console.log("ERREUR DETAIL:", res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Erreur récupération parking:", error);
    return null;
  }
}

// ===== FETCH VEHICULE PAR ID =====
export async function getVehicleById(
  id: string,
  token?: string
): Promise<Vehicle | null> {
  try {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      console.log("ERREUR VEHICULE:", res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Erreur récupération véhicule:", error);
    return null;
  }
}

// ===== ACTIVER / DÉSACTIVER / MODIFIER STATUT =====
export async function updateParkingStatus(
  id: number,
  status: ParkingStatusType | string,
  token?: string
): Promise<boolean> {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/parkings/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (error) {
    console.error("Erreur update status:", error);
    return false;
  }
}

// ===== MODIFIER INFORMATIONS =====
export async function updateParkingInfo(
  id: number,
  data: Partial<Parking>,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Envoi des données à l'API:", data);
    const res = await fetch(`${BASE_URL}/parkings/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erreur API update:", res.status, errorText);
      return { success: false, error: `HTTP ${res.status}: ${errorText}` };
    }

    console.log("Mise à jour réussie");
    return { success: true };
  } catch (error) {
    console.error("Erreur réseau update infos:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

// ===== BLOQUER PARKING =====
export async function blockParking(
  id: number,
  token?: string
): Promise<boolean> {
  return updateParkingStatus(id, "BLOCKED", token);
}

// ===== SUPPRIMER PARKING =====
export async function deleteParkingApi(
  id: number,
  token?: string
): Promise<boolean> {
  try {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/parkings/${id}`, {
      method: "DELETE",
      headers,
    });
    return res.ok;
  } catch (error) {
    console.error("Erreur suppression parking:", error);
    return false;
  }
}

// ===== CRÉER UN PARKING =====
export async function createParking(
  data: Omit<Parking, 'id' | 'user' | 'vehicles'>,
  token?: string
): Promise<Parking> {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/parkings`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Erreur création parking:", error);
    throw error;
  }
}