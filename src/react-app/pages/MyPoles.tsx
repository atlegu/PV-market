import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { polesService } from '@/services/poles.service';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package, Star, MapPin, Grid3x3, List, Edit2 } from 'lucide-react';
import type { Pole } from '@/shared/types';
import { getBrandLogoUrl, getBrandColor } from '@/react-app/utils/brandLogos';

export default function MyPolesPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [poles, setPoles] = useState<Pole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tilgjengelig for leie';
      case 'for_sale':
        return 'Til salgs';
      case 'rented':
        return 'Utleid';
      case 'reserved':
        return 'Reservert';
      case 'unavailable':
        return 'I bruk';
      default:
        return status;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mine staver</h1>
          <p className="text-gray-600 mt-2">
            Administrer stavene dine og se aktivitet
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-blue-600'
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
                  ? 'bg-white shadow-sm text-blue-600'
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
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Legg til stav</span>
          </Link>
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
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Legg til første stav</span>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poles.map((pole) => (
            <div
              key={pole.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Pole Brand Logo/Visual */}
              <div className={`h-48 bg-gradient-to-br ${getBrandColor(pole.brand)} flex items-center justify-center rounded-t-xl relative overflow-hidden`}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-3 mx-auto">
                    <span className="text-white font-bold text-2xl">
                      {pole.brand.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg">{pole.brand}</p>
                  <p className="text-white/80 text-sm mt-1">
                    {pole.length_cm}cm / {pole.weight_lbs}lbs
                  </p>
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
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pole.status)}`}>
                    {getStatusText(pole.status)}
                  </span>
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
                    <p className="text-sm font-medium text-blue-600">
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
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 text-center"
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
                {poles.map((pole) => (
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
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pole.status)}`}>
                        {getStatusText(pole.status)}
                      </span>
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
                          className="text-blue-600 hover:text-blue-900"
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