export const formatPrice = (price: number | null | undefined): string => {
  const v = Number(price || 0);
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
};

export const formatMileage = (m: number | null | undefined): string => {
  const v = Number(m || 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K km`;
  return `${v} km`;
};

export const normalizeTransmission = (t?: string | null): string | null => {
  if (!t) return null;
  const trans = t.toUpperCase();
  if (trans.includes('MANUAL') || trans.includes('MANUELLE')) return 'MANUELLE';
  if (trans.includes('AUTOMATIC') || trans.includes('AUTOMATIQUE')) return 'AUTOMATIQUE';
  if (trans.includes('SEMI')) return 'SEMI-AUTOMATIQUE';
  return trans;
};

export const formatTransmissionForDisplay = (t?: string | null): string => {
  const normalized = normalizeTransmission(t);
  if (!normalized) return 'N/A';
  if (normalized === 'MANUELLE') return 'Manuelle';
  if (normalized === 'AUTOMATIQUE') return 'Automatique';
  if (normalized === 'SEMI-AUTOMATIQUE') return 'Semi-Auto';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
};

export const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'DISPONIBLE':
      return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case 'EN_MAINTENANCE':
      return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'INDISPONIBLE':
      return 'text-rose-600 bg-rose-50 border-rose-100';
    default:
      return 'text-slate-400 bg-slate-50 border-slate-100';
  }
};

export const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'DISPONIBLE':
      return 'Disponible';
    case 'EN_MAINTENANCE':
      return 'En maintenance';
    case 'INDISPONIBLE':
      return 'Indisponible';
    default:
      return 'Statut inconnu';
  }
};

export default { formatPrice, formatMileage, normalizeTransmission, formatTransmissionForDisplay, getStatusColor, getStatusLabel };
