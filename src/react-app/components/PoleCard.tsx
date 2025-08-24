import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar } from 'lucide-react';
import type { Pole } from '@/shared/types';

interface PoleCardProps {
  pole: Pole;
}

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
  
  return brandMap[brand] || null;
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
      {/* Brand Logo or Placeholder */}
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
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
              <p className="text-sm text-blue-600 font-semibold mt-1">
                Flex: {pole.flex_rating}
              </p>
            )}
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