import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { POLE_BRANDS, MUNICIPALITIES } from '@/shared/types';
import type { SearchFilters as SearchFiltersType } from '@/shared/types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export default function SearchFilters({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  isLoading = false 
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      {/* Search Button at Top */}
      <div className="flex justify-center mb-6">
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Search className="w-5 h-5" />
          <span>{isLoading ? 'Søker...' : 'Søk etter staver'}</span>
        </button>
      </div>

      {/* Quick Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lengde (cm)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Fra"
              value={filters.length_min || ''}
              onChange={(e) => updateFilter('length_min', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="250"
              max="520"
              step="5"
            />
            <input
              type="number"
              placeholder="Til"
              value={filters.length_max || ''}
              onChange={(e) => updateFilter('length_max', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="250"
              max="520"
              step="5"
            />
          </div>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vekt (lbs)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Fra"
              value={filters.weight_min || ''}
              onChange={(e) => updateFilter('weight_min', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="50"
              max="210"
              step="5"
            />
            <input
              type="number"
              placeholder="Til"
              value={filters.weight_max || ''}
              onChange={(e) => updateFilter('weight_max', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="50"
              max="210"
              step="5"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kommune
          </label>
          <select
            value={filters.municipality || ''}
            onChange={(e) => updateFilter('municipality', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Alle kommuner</option>
            {MUNICIPALITIES.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'available', label: 'Tilgjengelig', color: 'bg-green-100 text-green-800 border-green-300' },
            { value: 'for_sale', label: 'Til salgs', color: 'bg-blue-100 text-blue-800 border-blue-300' },
            { value: 'rented', label: 'Utleid', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
            { value: 'reserved', label: 'Reservert', color: 'bg-orange-100 text-orange-800 border-orange-300' },
            { value: 'unavailable', label: 'I bruk', color: 'bg-red-100 text-red-800 border-red-300' },
          ].map((status) => {
            const isSelected = filters.status?.includes(status.value);
            return (
              <button
                key={status.value}
                onClick={() => {
                  const currentStatus = filters.status || [];
                  if (isSelected) {
                    updateFilter('status', currentStatus.filter(s => s !== status.value));
                  } else {
                    updateFilter('status', [...currentStatus, status.value]);
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                  isSelected ? status.color : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Filter className="w-4 h-4" />
          <span>{showAdvanced ? 'Skjul' : 'Vis'} avanserte filtre</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            <span>Nullstill</span>
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merke
            </label>
            <select
              value={filters.brand || ''}
              onChange={(e) => updateFilter('brand', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Alle merker</option>
              {POLE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postnummer
            </label>
            <input
              type="text"
              placeholder="0000"
              value={filters.postal_code || ''}
              onChange={(e) => updateFilter('postal_code', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              pattern="[0-9]{4}"
              maxLength={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min. tilstand
            </label>
            <select
              value={filters.condition_min || ''}
              onChange={(e) => updateFilter('condition_min', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Alle tilstander</option>
              <option value="1">1 stjerne og opp</option>
              <option value="2">2 stjerner og opp</option>
              <option value="3">3 stjerner og opp</option>
              <option value="4">4 stjerner og opp</option>
              <option value="5">Kun 5 stjerner</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
