import { useCallback, useEffect, useState } from 'react';
import { vehiclesAPI } from '../../../services/vehicles-api';
import { fetchParkingData } from '../../../services/Parcking-api';

export const useReferenceData = () => {
  const [marques, setMarques] = useState<Array<{ name: string }>>([]);
  const [parkings, setParkings] = useState<any[]>([]);
  const [myParking, setMyParking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMarques = useCallback(async () => {
    try {
      const data = await vehiclesAPI.getMarques();
      setMarques(data || []);
      return data;
    } catch (err) {
      console.warn('Erreur chargement marques', err);
      setMarques([]);
      return [];
    }
  }, []);

  const loadParkings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchParkingData();
      setParkings(data || []);
      return data;
    } catch (err) {
      console.warn('Erreur chargement parkings', err);
      setParkings([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyParking = useCallback(async () => {
    try {
      const data = await vehiclesAPI.getMyParking();
      setMyParking(data);
      return data;
    } catch (err) {
      console.warn('Erreur chargement myParking', err);
      setMyParking(null);
      return null;
    }
  }, []);

  useEffect(() => {
    loadMarques();
    loadParkings();
    loadMyParking();
  }, [loadMarques, loadParkings, loadMyParking]);

  return {
    marques,
    parkings,
    myParking,
    loading,
    loadMarques,
    loadParkings,
    loadMyParking,
  } as const;
};

export default useReferenceData;
