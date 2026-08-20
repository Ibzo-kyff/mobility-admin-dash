import { useCallback, useEffect, useState } from 'react';
import type { ReservationState } from '../types';

export const useReservation = () => {
  const [reservationType, setReservationType] = useState<'LOCATION' | 'ACHAT' | null>(null);
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<string | null>(null);
  const [selectedLocalisation, setSelectedLocalisation] = useState<string | null>(null);
  const [autreMotif, setAutreMotif] = useState('');
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [currentReservation, setCurrentReservation] = useState<ReservationState | null>(null);

  const selectReservationType = useCallback((type: 'LOCATION' | 'ACHAT') => {
    setReservationType(type);
    setSelectedMotif(null);
    setSelectedLocalisation(null);
    setAutreMotif('');
    setConditionsAccepted(false);

    if (type === 'LOCATION') {
      const now = new Date();
      const defaultStart = new Date(now);
      defaultStart.setHours(8, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setDate(defaultEnd.getDate() + 1);
      setStartDateTime(defaultStart);
      setEndDateTime(defaultEnd);
    }
  }, []);

  const calculateDurationAndPrice = useCallback((start: Date | null, end: Date | null, vehiclePrice?: number) => {
    if (!start || !end) return { diffDays: 0, diffHours: 0 };
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) {
      setSelectedDays(0);
      setCalculatedPrice(0);
      return { diffDays: 0, diffHours: 0 };
    }
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);
    setSelectedDays(diffDays);
    if (vehiclePrice) setCalculatedPrice(diffDays * vehiclePrice);
    return { diffDays, diffHours };
  }, []);

  const prepareReservation = useCallback((vehicleId: string | number, vehiclePrice?: number) => {
    const temp: ReservationState = {
      vehicleId,
      dateDebut: startDateTime ? startDateTime.toISOString() : null,
      dateFin: endDateTime ? endDateTime.toISOString() : null,
      type: reservationType ?? undefined,
      motifLocation: selectedMotif ?? (autreMotif ? autreMotif : undefined),
      localisation: selectedLocalisation ?? undefined,
      conditionsAcceptees: reservationType === 'LOCATION' ? conditionsAccepted : undefined,
      montant: reservationType === 'LOCATION' ? calculatedPrice || vehiclePrice || 0 : vehiclePrice || 0,
    };
    setCurrentReservation(temp);
    return temp;
  }, [reservationType, startDateTime, endDateTime, selectedMotif, selectedLocalisation, autreMotif, conditionsAccepted, calculatedPrice]);

  useEffect(() => {
    if (reservationType === 'LOCATION' && startDateTime && endDateTime) {
      calculateDurationAndPrice(startDateTime, endDateTime);
    }
  }, [startDateTime, endDateTime, reservationType, calculateDurationAndPrice]);

  return {
    reservationType,
    startDateTime,
    endDateTime,
    selectedMotif,
    selectedLocalisation,
    autreMotif,
    conditionsAccepted,
    selectedDays,
    calculatedPrice,
    currentReservation,
    setCurrentReservation,
    setReservationType: selectReservationType,
    setStartDateTime,
    setEndDateTime,
    setSelectedMotif,
    setSelectedLocalisation,
    setAutreMotif,
    setConditionsAccepted,
    calculateDurationAndPrice,
    prepareReservation,
  } as const;
};

export default useReservation;
// (kept single implementation above)
