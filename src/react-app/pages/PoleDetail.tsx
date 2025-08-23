import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { polesService } from '@/services/poles.service';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Star, User, Mail, Building, Edit } from 'lucide-react';
import type { Pole } from '@/shared/types';

export default function PoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [pole, setPole] = useState<Pole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPole = async () => {
      try {
        if (!id) return;
        const data = await polesService.getPoleById(id);
        setPole(data);
      } catch (error) {
        console.error('Fetch pole error:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPole();
    }
  }, [id, navigate]);

  const handleEmailInquiry = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!pole || !(pole as any).user_profiles) {
      alert('Kunne ikke finne kontaktinformasjon for denne staven.');
      return;
    }

    // Set default message and show modal
    setEmailMessage(`Hei! 

Jeg er interessert i staven din (${pole.brand} ${pole.length_cm}cm/${pole.weight_lbs}lbs) som er listet på PV Market. 

Kan du kontakte meg for mer informasjon?

Mvh`);
    setShowEmailModal(true);
  };

  const sendEmailInquiry = async () => {
    console.log('Send email clicked');
    
    if (!pole || !(pole as any).user_profiles) {
      console.error('No pole or user profiles');
      return;
    }

    const userProfile = (pole as any).user_profiles;
    setIsSubmitting(true);
    
    try {
      // Get current user's profile
      const { data: inquirerProfile } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('user_id', user!.id)
        .single();

      console.log('Inquirer profile:', inquirerProfile);

      // For now, just use mailto until Edge Function is deployed
      // This ensures the feature works immediately
      const subject = `Forespørsel om stav: ${pole.brand} ${pole.length_cm}cm/${pole.weight_lbs}lbs`;
      const body = emailMessage + `\n\nFra: ${inquirerProfile?.name || 'Ukjent'}\nE-post: ${inquirerProfile?.email || user!.email}`;
      
      // Create mailto link
      const mailtoLink = `mailto:${userProfile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      console.log('Opening mailto:', mailtoLink);
      
      // Open email client
      window.open(mailtoLink, '_self');
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailMessage('');
        alert('E-postklienten din har blitt åpnet med forespørselen. Send e-posten for å kontakte eieren.');
      }, 1000);
      
    } catch (error) {
      console.error('Email error:', error);
      alert('Det oppstod en feil. Prøv igjen senere.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-200 rounded-xl h-96 animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!pole) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Stav ikke funnet</h1>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Tilbake til søk
        </button>
      </div>
    );
  }

  const isOwner = user?.id === pole.owner_id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Tilbake</span>
      </button>

      {/* Pole Image */}
      <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center mb-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">
              {pole.length_cm / 100}m
            </span>
          </div>
          <p className="text-xl text-gray-700 font-medium">{pole.brand}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {pole.length_cm}cm - {pole.weight_lbs} lbs
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pole.status)}`}>
                {getStatusText(pole.status)}
              </span>
            </div>
            <p className="text-xl text-gray-600 font-medium">{pole.brand}</p>
          </div>

          {/* Condition */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Tilstand</h3>
            <div className="flex items-center space-x-2">
              {renderStars(pole.condition_rating)}
              <span className="text-gray-600">({pole.condition_rating}/5)</span>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Lokasjon</h3>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {pole.municipality}, {pole.postal_code}
              </span>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Spesifikasjoner</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Lengde:</span>
                <span className="font-medium">{pole.length_cm} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vektmerking:</span>
                <span className="font-medium">{pole.weight_lbs} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Merke:</span>
                <span className="font-medium">{pole.brand}</span>
              </div>
              {pole.flex_rating && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Flex:</span>
                  <span className="font-medium">{pole.flex_rating}</span>
                </div>
              )}
              {pole.production_year && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Produksjonsår:</span>
                  <span className="font-medium">{pole.production_year}</span>
                </div>
              )}
              {pole.serial_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Serienummer:</span>
                  <span className="font-medium">{pole.serial_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pricing & Actions */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Priser</h3>
            <div className="space-y-3">
              {pole.price_weekly && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ukesleie:</span>
                  <span className="text-xl font-bold text-green-600">
                    {pole.price_weekly} kr/uke
                  </span>
                </div>
              )}
              {pole.price_sale && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Salgspris:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {pole.price_sale} kr
                  </span>
                </div>
              )}
              {!pole.price_weekly && !pole.price_sale && (
                <p className="text-gray-500 text-center">Pris på forespørsel</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {!isOwner && (pole as any).user_profiles && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Kontaktinformasjon</h3>
              <div className="space-y-3">
                {(pole as any).user_profiles.club_name && (
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Klubb</p>
                      <p className="font-medium">{(pole as any).user_profiles.club_name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Kontaktperson</p>
                    <p className="font-medium">{(pole as any).user_profiles.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">E-post</p>
                    <p className="font-medium">{(pole as any).user_profiles.email}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <button
                    onClick={() => handleEmailInquiry()}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send e-post med forespørsel</span>
                  </button>
                </div>
              </div>
            </div>
          )}


          {isOwner && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  Dette er din stav
                </p>
                <p className="text-blue-600 text-sm">
                  Du kan redigere detaljer eller se forespørsler i "Mine staver".
                </p>
              </div>
              <Link
                to={`/edit-pole/${pole.id}`}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Rediger stav</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Send forespørsel</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Din melding til eieren:
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Skriv din melding her..."
              />
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>Meldingen vil bli sendt til: <strong>{(pole as any).user_profiles?.name}</strong></p>
              <p>E-post: <strong>{(pole as any).user_profiles?.email}</strong></p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailMessage('');
                }}
                className="flex-1 text-gray-600 hover:text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-lg"
                disabled={isSubmitting}
              >
                Avbryt
              </button>
              <button
                onClick={sendEmailInquiry}
                disabled={isSubmitting || !emailMessage.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Sender...</span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send e-post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
