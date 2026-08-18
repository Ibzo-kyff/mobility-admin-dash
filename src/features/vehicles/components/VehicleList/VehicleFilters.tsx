import React from 'react';

interface Props {
  search?: string;
  onSearch?: (s: string) => void;
  onStatusChange?: (status: string) => void;
}

const VehicleFilters: React.FC<Props> = ({ search = '', onSearch, onStatusChange }) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <input
        className="border p-2 rounded flex-1"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
      <select onChange={(e) => onStatusChange && onStatusChange(e.target.value)} className="border p-2 rounded">
        <option value="">Tous</option>
        <option value="DISPONIBLE">Disponible</option>
        <option value="INDISPONIBLE">Indisponible</option>
        <option value="EN_MAINTENANCE">En maintenance</option>
      </select>
    </div>
  );
};

export default VehicleFilters;
