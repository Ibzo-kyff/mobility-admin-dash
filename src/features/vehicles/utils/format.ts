export const formatPrice = (price: number | null | undefined): string => {
  const v = Number(price || 0);
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
};

export const formatMileage = (mileage: number | null | undefined): string => {
  const v = Number(mileage || 0);
  return `${new Intl.NumberFormat('fr-FR').format(v)} km`;
};

export const normalizeTransmission = (input?: string | null): string => {
  if (!input) return '';
  const s = String(input).trim().toLowerCase();
  if (['manual', 'manuelle', 'manuel', 'm', 'manuale', 'manu'].includes(s)) return 'manual';
  if (['auto', 'automatic', 'automatique', 'a', 'automatico'].includes(s)) return 'automatic';
  return s;
};

export const formatTransmissionForDisplay = (input?: string | null): string => {
  const norm = normalizeTransmission(input);
  if (norm === 'manual') return 'Manuelle';
  if (norm === 'automatic') return 'Automatique';
  // fallback: capitalize first letter
  if (!norm) return 'N/A';
  return norm.charAt(0).toUpperCase() + norm.slice(1);
};

export default { formatPrice, formatMileage, normalizeTransmission, formatTransmissionForDisplay };
