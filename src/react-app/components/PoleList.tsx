import { MapPin, Star } from 'lucide-react';
import type { Pole } from '@/shared/types';
import { Link } from 'react-router-dom';

interface PoleListProps {
  pole: Pole;
}

export default function PoleList({ pole }: PoleListProps) {
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {pole.brand} - {pole.length_cm}cm
          </h3>
          <p className="text-sm text-gray-600">{pole.weight_lbs} lbs</p>
          {pole.flex_rating && (
            <p className="text-sm text-orange-600 font-semibold mt-1">
              Flex: {pole.flex_rating}
            </p>
          )}
        </div>
        <div className="text-right">
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
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {pole.municipality}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Tilstand:</span>
            {renderStars(pole.condition_rating)}
          </div>
        </div>
        <Link
          to={`/poles/${pole.id}`}
          className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-indigo-700"
        >
          Se detaljer
        </Link>
      </div>
    </div>
  );
}