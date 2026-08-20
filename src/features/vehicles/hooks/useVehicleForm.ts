import { useCallback, useState } from 'react';
import type { VehicleFormState, Vehicle } from '../types';
import type { Vehicule } from '../../../types/vehicle';
import { vehiclesAPI } from '../../../services/vehicles-api';

const emptyState = (): VehicleFormState => ({
  marque: '',
  model: '',
  price: null,
  year: null,
  mileage: null,
  fuelType: '',
  transmission: '',
  description: '',
  garantie: false,
  assurance: false,
  chauffeur: false,
  carteGrise: null,
  vignette: null,
  photos: [],
});

export const useVehicleForm = (initial?: Partial<VehicleFormState> | Vehicle | Vehicule) => {
  const init: VehicleFormState = { ...emptyState(), ...(initial as Partial<VehicleFormState>) };
  // If initial is a Vehicle or Vehicule, map fields
  if ((initial as any)?.id) {
    const v = initial as Vehicle | Vehicule;
    init.marque = v.marque ?? init.marque;
    init.model = v.model ?? init.model;
    init.price = ((v as any).price) ?? init.price;
    init.year = ((v as any).year) ?? init.year;
    init.mileage = ((v as any).mileage) ?? init.mileage;
    init.fuelType = v.fuelType ?? init.fuelType;
    init.transmission = v.transmission ?? init.transmission;
    init.description = v.description ?? init.description;
    // Normalize photos: Vehicule.photos may be string or string[]; Vehicle.photos may already be array
    if (v.photos) {
      if (Array.isArray(v.photos)) {
        init.photos = v.photos as string[];
      } else if (typeof v.photos === 'string') {
        init.photos = [v.photos];
      } else {
        // fallback, attempt to coerce
        try {
          init.photos = (v.photos as any) ? Array.from(v.photos as any) : init.photos;
        } catch (e) {
          // leave as default
        }
      }
    }
  }

  const [form, setForm] = useState<VehicleFormState>(init);
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback((key: keyof VehicleFormState, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const addPhotoFile = useCallback((file: File) => {
    setForm((f) => ({ ...f, photos: [...f.photos, file] }));
  }, []);

  const removePhotoAt = useCallback((index: number) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  }, []);

  const toFormData = useCallback(() => {
    const fd = new FormData();
    fd.append('marque', form.marque || '');
    fd.append('model', form.model || '');
    if (form.price !== null && form.price !== undefined) fd.append('price', String(form.price));
    if (form.year !== null && form.year !== undefined) fd.append('year', String(form.year));
    if (form.mileage !== null && form.mileage !== undefined) fd.append('mileage', String(form.mileage));
    fd.append('fuelType', form.fuelType || '');
    fd.append('transmission', form.transmission || '');
    fd.append('description', form.description || '');
    fd.append('garantie', String(Boolean(form.garantie)));
    fd.append('assurance', String(Boolean(form.assurance)));
    fd.append('chauffeur', String(Boolean(form.chauffeur)));
    if (form.carteGrise) fd.append('carteGrise', form.carteGrise);
    if (form.vignette) fd.append('vignette', form.vignette);
    // photos
    form.photos.forEach((p, idx) => {
      if (p instanceof File) {
        fd.append('photos', p, p.name || `photo_${idx}`);
      } else if (typeof p === 'string') {
        fd.append('existingPhotos[]', p);
      }
    });
    return fd;
  }, [form]);

  const createVehicle = useCallback(async () => {
    setSubmitting(true);
    try {
      const fd = toFormData();
      const res = await vehiclesAPI.createVehicule(fd);
      return res;
    } finally {
      setSubmitting(false);
    }
  }, [toFormData]);

  const updateVehicle = useCallback(async (id: string | number) => {
    setSubmitting(true);
    try {
      const fd = toFormData();
      const res = await vehiclesAPI.updateVehicule(String(id), fd);
      return res;
    } finally {
      setSubmitting(false);
    }
  }, [toFormData]);

  return {
    form,
    setField,
    addPhotoFile,
    removePhotoAt,
    toFormData,
    createVehicle,
    updateVehicle,
    submitting,
  } as const;
};

export default useVehicleForm;
