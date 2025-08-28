import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { polesService } from '@/services/poles.service';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package, Star, MapPin, Grid3x3, List, Edit2, Search, Filter, X, ChevronDown } from 'lucide-react';
import type { Pole } from '@/shared/types';
import { POLE_BRANDS } from '@/shared/types';

const getBrandLogoPath = (brand: string): string | null => {
  const brandMap: Record<string, string> = {
    // Altius variants
    'Altius Carbon Elite': '/brand-logos/altius-carbon-elite.svg',
    'Altius Fiberglass': '/brand-logos/altius-fiberglass.svg',
    'Altius Suhr Adrenaline': '/brand-logos/altius-suhr-adrenaline.svg',
    'Altius': '/brand-logos/altius.svg',
    
    // Essx variants
    'Essx': '/brand-logos/essx.svg',
    'Essx Launch': '/brand-logos/essx-launch.svg',
    'Essx Power X': '/brand-logos/essx-power-x.svg',
    'Essx Recoil': '/brand-logos/essx-recoil.svg',
    'Essx Recoil Advanced': '/brand-logos/essx-recoil-advanced.svg',
    
    // Fibersport variants
    'Fibersport Carbon': '/brand-logos/fibersport-carbon.svg',
    'Fibersport Carbon +': '/brand-logos/fibersport-carbon-plus.svg',
    'Fibersport Non-Carbon': '/brand-logos/fibersport-non-carbon.svg',
    'Fibersport': '/brand-logos/fibersport.svg',
    
    // Nordic variants
    'Nordic': '/brand-logos/nordic.svg',
    'Nordic Bifrost Glassfiber': '/brand-logos/nordic-bifrost-glassfiber.svg',
    'Nordic Bifrost Hybrid': '/brand-logos/nordic-bifrost-hybrid.svg',
    'Nordic Evolution': '/brand-logos/nordic-evolution.svg',
    'Nordic HiFly': '/brand-logos/nordic-hifly.svg',
    'Nordic Spirit': '/brand-logos/nordic.svg',
    'Nordic Valhalla': '/brand-logos/nordic.svg',
    
    // Pacer variants
    'Pacer': '/brand-logos/pacer.svg',
    'Pacer Carbon FX': '/brand-logos/pacer-carbon-fx.svg',
    'Pacer One': '/brand-logos/pacer-one.svg',
    'Pacer Composite': '/brand-logos/pacer-composite.svg',
    'Pacer Mystic': '/brand-logos/pacer-mystic.svg',
    'Pacer FX': '/brand-logos/pacer.svg',
    
    // Others
    'UCS Spirit': '/brand-logos/ucs-spirit.svg',
    'UCS': '/brand-logos/ucs-spirit.svg',
    'Gill': '/brand-logos/gill.svg',
    'Gill Pacer': '/brand-logos/gill.svg',
    'Annen': '/brand-logos/annen.svg',
  };
  
  // Try exact match first
  if (brandMap[brand]) {
    return brandMap[brand];
  }
  
  // Try to find base brand by checking if the brand starts with known base brands
  const baseBrands = ['Altius', 'Essx', 'Fibersport', 'Nordic', 'Pacer', 'UCS', 'Gill'];
  for (const baseBrand of baseBrands) {
    if (brand.toLowerCase().startsWith(baseBrand.toLowerCase())) {
      return `/brand-logos/${baseBrand.toLowerCase()}.svg`;
    }
  }
  
  return null;
};

const getBrandInitials = (brand: string): string => {
  const words = brand.split(' ');
  if (words.length > 1) {
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
  return brand.slice(0, 2).toUpperCase();
};

const getBrandColor = (brand: string): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-red-500 to-red-600',
    'from-yellow-500 to-yellow-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
  ];
  
  let hash = 0;
  for (let i = 0; i < brand.length; i++) {
    hash = brand.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

type SortOption = 'length_asc' | 'length_desc' | 'weight_asc' | 'weight_desc' | 'brand_asc' | 'brand_desc' | 'condition_asc' | 'condition_desc' | 'created_asc' | 'created_desc';

interface MyPolesFilters {
  search: string;
  brand: string;
  lengthMin: string;
  lengthMax: string;
  weightMin: string;
  weightMax: string;
  flexRating: string;
  condition: string;
  status: string;
}

export default function MyPolesPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [poles, setPoles] = useState<Pole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [filters, setFilters] = useState<MyPolesFilters>({
    search: '',
    brand: '',
    lengthMin: '',
    lengthMax: '',
    weightMin: '',
    weightMax: '',
    flexRating: '',
    condition: '',
    status: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (!user) return;

    const fetchPoles = async () => {
      try {
        if (user) {
          const data = await polesService.getUserPoles(user.id);
          setPoles(data);
        }
      } catch (error) {
        console.error('Fetch poles error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoles();
  }, [user, navigate, authLoading]);

  // Filter and sort poles
  const filteredAndSortedPoles = useMemo(() => {
    let result = [...poles];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(pole => 
        pole.brand.toLowerCase().includes(search) ||
        pole.serial_number?.toLowerCase().includes(search) ||
        pole.internal_notes?.toLowerCase().includes(search) ||
        pole.flex_rating?.toLowerCase().includes(search)
      );
    }

    if (filters.brand) {
      result = result.filter(pole => pole.brand === filters.brand);
    }

    if (filters.lengthMin) {
      result = result.filter(pole => pole.length_cm >= parseInt(filters.lengthMin));
    }

    if (filters.lengthMax) {
      result = result.filter(pole => pole.length_cm <= parseInt(filters.lengthMax));
    }

    if (filters.weightMin) {
      result = result.filter(pole => pole.weight_lbs >= parseInt(filters.weightMin));
    }

    if (filters.weightMax) {
      result = result.filter(pole => pole.weight_lbs <= parseInt(filters.weightMax));
    }

    if (filters.flexRating) {
      result = result.filter(pole => pole.flex_rating?.includes(filters.flexRating));
    }

    if (filters.condition) {
      result = result.filter(pole => pole.condition_rating === parseInt(filters.condition));
    }

    if (filters.status) {
      result = result.filter(pole => pole.status === filters.status);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'length_asc':
          return a.length_cm - b.length_cm;
        case 'length_desc':
          return b.length_cm - a.length_cm;
        case 'weight_asc':
          return a.weight_lbs - b.weight_lbs;
        case 'weight_desc':
          return b.weight_lbs - a.weight_lbs;
        case 'brand_asc':
          return a.brand.localeCompare(b.brand);
        case 'brand_desc':
          return b.brand.localeCompare(a.brand);
        case 'condition_asc':
          return a.condition_rating - b.condition_rating;
        case 'condition_desc':
          return b.condition_rating - a.condition_rating;
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [poles, filters, sortBy]);

  // Get unique values for filter dropdowns
  const uniqueFlexRatings = useMemo(() => {
    const flexRatings = poles.map(pole => pole.flex_rating).filter(Boolean);
    return [...new Set(flexRatings)].sort();
  }, [poles]);

  const updateFilter = (key: keyof MyPolesFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      lengthMin: '',
      lengthMax: '',
      weightMin: '',
      weightMax: '',
      flexRating: '',
      condition: '',
      status: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Handle status update
  const handleStatusUpdate = useCallback(async (poleId: string, newStatus: string) => {
    setUpdatingStatus(poleId);
    try {
      await polesService.updatePole(poleId, { status: newStatus as any });
      
      // Update local state
      setPoles(prevPoles => 
        prevPoles.map(pole => 
          pole.id === Number(poleId) ? { ...pole, status: newStatus as any } : pole
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Kunne ikke oppdatere status. Prøv igjen.');
    } finally {
      setUpdatingStatus(null);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'for_sale':
        return 'bg-blue-100 text-blue-800';
      case 'rented':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-orange-100 text-orange-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mine staver</h1>
          <p className="text-gray-600 mt-2">
            {filteredAndSortedPoles.length} av {poles.length} staver
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Kortvisning"
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="text-sm font-medium">Kort</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Listevisning"
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">Liste</span>
            </button>
          </div>
          <Link
            to="/add-pole"
            className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-800 hover:to-indigo-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Legg til stav</span>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="p-4">
          {/* Search and Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Søk i merke, serienummer, notater..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="created_desc">Nyeste først</option>
                <option value="created_asc">Eldste først</option>
                <option value="length_asc">Lengde: Lav til høy</option>
                <option value="length_desc">Lengde: Høy til lav</option>
                <option value="weight_asc">Vekt: Lav til høy</option>
                <option value="weight_desc">Vekt: Høy til lav</option>
                <option value="brand_asc">Merke: A-Z</option>
                <option value="brand_desc">Merke: Z-A</option>
                <option value="condition_asc">Tilstand: Lav til høy</option>
                <option value="condition_desc">Tilstand: Høy til lav</option>
              </select>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg border transition-all flex items-center space-x-2 ${
                  showFilters
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtre</span>
                {hasActiveFilters && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                    {Object.values(filters).filter(v => v !== '').length}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
                  title="Nullstill filtre"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Brand filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merke</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => updateFilter('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Alle merker</option>
                    {POLE_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Length range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lengde (cm)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.lengthMin}
                      onChange={(e) => updateFilter('lengthMin', e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="250"
                      max="520"
                    />
                    <input
                      type="number"
                      value={filters.lengthMax}
                      onChange={(e) => updateFilter('lengthMax', e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="250"
                      max="520"
                    />
                  </div>
                </div>

                {/* Weight range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vekt (lbs)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.weightMin}
                      onChange={(e) => updateFilter('weightMin', e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="50"
                      max="210"
                    />
                    <input
                      type="number"
                      value={filters.weightMax}
                      onChange={(e) => updateFilter('weightMax', e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="50"
                      max="210"
                    />
                  </div>
                </div>

                {/* Flex rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flex-rating</label>
                  <select
                    value={filters.flexRating}
                    onChange={(e) => updateFilter('flexRating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Alle flex-ratings</option>
                    {uniqueFlexRatings.map((flex) => (
                      <option key={flex} value={flex}>
                        {flex}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tilstand</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => updateFilter('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Alle tilstander</option>
                    <option value="5">5 - Perfekt</option>
                    <option value="4">4 - God</option>
                    <option value="3">3 - Middels</option>
                    <option value="2">2 - Under middels</option>
                    <option value="1">1 - Dårlig</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Alle statuser</option>
                    <option value="available">Tilgjengelig for leie</option>
                    <option value="for_sale">Til salgs</option>
                    <option value="rented">Utleid</option>
                    <option value="reserved">Reservert</option>
                    <option value="unavailable">I bruk</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Poles Grid or List */}
      {poles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ingen staver lagt til ennå
          </h3>
          <p className="text-gray-600 mb-6">
            Legg til din første stav for å begynne å tjene penger på ubrukt utstyr.
          </p>
          <Link
            to="/add-pole"
            className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-800 hover:to-indigo-700 inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Legg til første stav</span>
          </Link>
        </div>
      ) : filteredAndSortedPoles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ingen staver matcher søkekriteriene
          </h3>
          <p className="text-gray-600 mb-6">
            Prøv å justere filtrene eller søkeordene dine.
          </p>
          <button
            onClick={clearFilters}
            className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-800 hover:to-indigo-700"
          >
            Nullstill filtre
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPoles.map((pole) => (
            <div
              key={pole.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Brand Logo or Placeholder - Updated */}
              <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-t-xl relative overflow-hidden">
                {getBrandLogoPath(pole.brand) ? (
                  <img 
                    src={getBrandLogoPath(pole.brand)!} 
                    alt={pole.brand}
                    className="max-h-32 max-w-[80%] object-contain"
                    onError={(e) => {
                      // If image fails to load, hide it and show fallback
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`${getBrandLogoPath(pole.brand) ? 'hidden' : 'flex'} flex-col items-center justify-center`}
                  style={{ display: getBrandLogoPath(pole.brand) ? 'none' : undefined }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${getBrandColor(pole.brand)} rounded-2xl flex items-center justify-center mb-3 shadow-lg`}>
                    <span className="text-white font-bold text-2xl">
                      {getBrandInitials(pole.brand)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{pole.brand}</p>
                </div>
                
                {/* Length badge in corner */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <span className="text-sm font-bold text-gray-700">
                    {pole.length_cm}cm
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {pole.length_cm}cm - {pole.weight_lbs} lbs
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">{pole.brand}</p>
                    {pole.flex_rating && (
                      <p className="text-sm text-orange-600 font-semibold mt-1">
                        Flex: {pole.flex_rating}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={pole.status}
                      onChange={(e) => handleStatusUpdate(pole.id.toString(), e.target.value)}
                      disabled={updatingStatus === pole.id.toString()}
                      className={`px-3 py-1 pr-7 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none ${getStatusColor(pole.status)} ${updatingStatus === pole.id.toString() ? 'opacity-50' : ''} hover:opacity-80 transition-opacity`}
                      title="Klikk for å endre status"
                    >
                      <option value="available">Tilgjengelig for leie</option>
                      <option value="for_sale">Til salgs</option>
                      <option value="rented">Utleid</option>
                      <option value="reserved">Reservert</option>
                      <option value="unavailable">I bruk</option>
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-600" />
                  </div>
                </div>

                {/* Condition */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-600">Tilstand:</span>
                  {renderStars(pole.condition_rating)}
                </div>

                {/* Location */}
                <div className="flex items-center space-x-1 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {pole.municipality}, {pole.postal_code}
                  </span>
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-100 pt-3 mb-4">
                  {pole.price_weekly && (
                    <p className="text-sm font-medium text-green-600">
                      {pole.price_weekly} kr/uke
                    </p>
                  )}
                  {pole.price_sale && (
                    <p className="text-sm font-medium text-orange-600">
                      {pole.price_sale} kr
                    </p>
                  )}
                  {!pole.price_weekly && !pole.price_sale && (
                    <p className="text-sm text-gray-500">Pris på forespørsel</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`/poles/${pole.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium text-center hover:bg-gray-200 transition-colors"
                  >
                    Se detaljer
                  </Link>
                  <Link
                    to={`/edit-pole/${pole.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-2 px-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-indigo-700 text-center"
                  >
                    Rediger
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Listevisning */
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lengde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vekt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flex
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merke
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tilstand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedPoles.map((pole) => (
                  <tr key={pole.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pole.length_cm} cm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pole.weight_lbs} lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pole.flex_rating || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pole.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex">
                        {renderStars(pole.condition_rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={pole.status}
                          onChange={(e) => handleStatusUpdate(pole.id.toString(), e.target.value)}
                          disabled={updatingStatus === pole.id.toString()}
                          className={`px-3 py-1.5 pr-8 rounded-full text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none ${getStatusColor(pole.status)} ${updatingStatus === pole.id.toString() ? 'opacity-50' : ''} hover:opacity-80 transition-opacity`}
                          title="Klikk for å endre status"
                        >
                          <option value="available">Tilgjengelig for leie</option>
                          <option value="for_sale">Til salgs</option>
                          <option value="rented">Utleid</option>
                          <option value="reserved">Reservert</option>
                          <option value="unavailable">I bruk</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/poles/${pole.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Se detaljer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          to={`/edit-pole/${pole.id}`}
                          className="text-orange-600 hover:text-orange-700"
                          title="Rediger"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}