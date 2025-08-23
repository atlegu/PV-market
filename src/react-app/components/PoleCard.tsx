import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar } from 'lucide-react';
import type { Pole } from '@/shared/types';

interface PoleCardProps {
  pole: Pole;
}

export default function PoleCard({ pole }: PoleCardProps) {
  const formatPrice = (price: number | undefined, type: 'weekly' | 'sale') => {
    if (!price) return null;
    return type === 'weekly' ? `${price} kr/uke` : `${price} kr`;
  };

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

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100">
      {/* Pole Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-2 mx-auto">
            <span className="text-white font-bold text-lg">
              {pole.length_cm / 100}m
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">{pole.brand}</p>
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
          <span className="text-sm text-gray-500">({pole.condition_rating}/5)</span>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-1 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {pole.municipality}, {pole.postal_code}
          </span>
        </div>

        {/* Additional Info */}
        <div className="space-y-1 mb-4">
          {pole.flex_rating && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Flex:</span> {pole.flex_rating}
            </p>
          )}
          {pole.production_year && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-600">{pole.production_year}</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              {pole.price_weekly && (
                <p className="text-sm font-medium text-green-600">
                  {formatPrice(pole.price_weekly, 'weekly')}
                </p>
              )}
              {pole.price_sale && (
                <p className="text-sm font-medium text-blue-600">
                  {formatPrice(pole.price_sale, 'sale')}
                </p>
              )}
              {!pole.price_weekly && !pole.price_sale && (
                <p className="text-sm text-gray-500">Pris på forespørsel</p>
              )}
            </div>
            <Link
              to={`/poles/${pole.id}`}
              onClick={() => console.log('Link clicked, navigating to:', `/poles/${pole.id}`)}
              className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              Se detaljer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}