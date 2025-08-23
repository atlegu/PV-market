import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { polesService } from '@/services/poles.service';
import { useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { POLE_BRANDS, MUNICIPALITIES, CreatePole } from '@/shared/types';
import SearchableSelect from '@/react-app/components/SearchableSelect';
import { getMunicipalityFromPostalCode } from '@/shared/postalCodes';

export default function AddPolePage() {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<Partial<CreatePole>>({
    status: 'available',
    condition_rating: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await polesService.createPole(form as any);
      setSuccess(true);
      // Vis suksessmelding i 2 sekunder før navigering
      setTimeout(() => {
        navigate('/my-poles');
      }, 2000);
      setError(err.message || 'Kunne ikke registrere staven. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Du må være logget inn for å legge til en stav
          </h1>
          <p className="text-gray-600 mb-6">
            Logg inn for å legge ut dine staver for leie eller salg.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Logg inn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Plus className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Legg til ny stav</h1>
          </div>
          <Link
            to="/add-pole-bulk"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Har du mange staver? Prøv hurtigregistrering →
          </Link>
        </div>

        {/* Success melding */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Staven er registrert! Sender deg til dine staver...</p>
            </div>
          </div>
        )}

        {/* Error melding */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Teknisk informasjon */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Teknisk informasjon</h2>
            
            {/* Lengde og vekt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lengde (cm) *
                </label>
                <input
                  type="number"
                  required
                  value={form.length_cm || ''}
                  onChange={(e) => setForm({ ...form, length_cm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="250"
                  max="520"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vektmerking (lbs) *
                </label>
                <input
                  type="number"
                  required
                  value={form.weight_lbs || ''}
                  onChange={(e) => setForm({ ...form, weight_lbs: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="50"
                  max="210"
                  step="5"
                />
              </div>
            </div>

            {/* Merke og flex */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merke *
                </label>
                <SearchableSelect
                  options={POLE_BRANDS}
                  value={form.brand || ''}
                  onChange={(value) => setForm({ ...form, brand: value })}
                  placeholder="Søk eller velg merke"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flex-rating
                </label>
                <input
                  type="text"
                  value={form.flex_rating || ''}
                  onChange={(e) => setForm({ ...form, flex_rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="f.eks. Medium, 14.6"
                />
              </div>
            </div>

            {/* Tilstand og produksjonsår */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tilstand *
                </label>
                <select
                  required
                  value={form.condition_rating || ''}
                  onChange={(e) => setForm({ ...form, condition_rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg tilstand</option>
                  <option value="1">1 - Dårlig (store skader)</option>
                  <option value="2">2 - Under middels (mindre skader)</option>
                  <option value="3">3 - Middels (normale bruksspor)</option>
                  <option value="4">4 - God (få bruksspor)</option>
                  <option value="5">5 - Utmerket (som ny)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produksjonsår
                </label>
                <input
                  type="number"
                  value={form.production_year || ''}
                  onChange={(e) => setForm({ ...form, production_year: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1990"
                  max={new Date().getFullYear()}
                  placeholder="f.eks. 2023"
                />
              </div>
            </div>

            {/* Serienummer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serienummer
              </label>
              <input
                type="text"
                value={form.serial_number || ''}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Valgfritt"
              />
            </div>
          </div>

          {/* Lokasjon */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Lokasjon</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postnummer *
              </label>
              <input
                type="text"
                required
                value={form.postal_code || ''}
                onChange={(e) => {
                  const postalCode = e.target.value;
                  setForm({ 
                    ...form, 
                    postal_code: postalCode,
                    municipality: getMunicipalityFromPostalCode(postalCode) || form.municipality
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="0000"
              />
              {form.municipality && (
                <p className="mt-2 text-sm text-gray-600">
                  Kommune: {form.municipality}
                </p>
              )}
            </div>
          </div>

          {/* Status og priser */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Status og priser</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={form.status || 'available'}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Tilgjengelig for leie</option>
                <option value="for_sale">Til salgs</option>
                <option value="unavailable">I bruk (ikke tilgjengelig)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ukespris (kr)
                </label>
                <input
                  type="number"
                  value={form.price_weekly || ''}
                  onChange={(e) => setForm({ ...form, price_weekly: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="Valgfritt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salgspris (kr)
                </label>
                <input
                  type="number"
                  value={form.price_sale || ''}
                  onChange={(e) => setForm({ ...form, price_sale: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="Valgfritt"
                />
              </div>
            </div>

            {/* Interne notater */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interne notater
              </label>
              <textarea
                value={form.internal_notes || ''}
                onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Tilleggsinformasjon som kun du kan se..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-700 font-medium px-4 py-2"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Lagrer...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Legg til stav</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}