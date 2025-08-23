import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { polesService } from '@/services/poles.service';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import { POLE_BRANDS, MUNICIPALITIES, CreatePole, Pole } from '@/shared/types';
import SearchableSelect from '@/react-app/components/SearchableSelect';

export default function EditPolePage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<Partial<CreatePole>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (!user) return;

    const fetchPole = async () => {
      try {
        if (!id) return;
        const pole = await polesService.getPoleById(id);
        
        if (pole) {
          // Sjekk at brukeren eier staven
          if (pole.owner_id !== user.id) {
            setError('Du kan bare redigere dine egne staver');
            setTimeout(() => navigate('/my-poles'), 2000);
            return;
          }
          
          // Sett skjemaet med eksisterende data
          setForm({
            length_cm: pole.length_cm,
            weight_lbs: pole.weight_lbs,
            brand: pole.brand,
            condition_rating: pole.condition_rating,
            status: pole.status as any,
            municipality: pole.municipality,
            postal_code: pole.postal_code,
            flex_rating: pole.flex_rating,
            production_year: pole.production_year,
            internal_notes: pole.internal_notes,
            serial_number: pole.serial_number,
            price_weekly: pole.price_weekly,
            price_sale: pole.price_sale,
          });
        } else {
          setError('Kunne ikke hente staven');
          setTimeout(() => navigate('/my-poles'), 2000);
        }
      } catch (error) {
        console.error('Fetch pole error:', error);
        setError('En feil oppstod');
        setTimeout(() => navigate('/my-poles'), 2000);
      } finally {
        setIsFetching(false);
      }
    };

    fetchPole();
  }, [user, navigate, id, authLoading]);

  const handleDelete = async () => {
    if (!user || !id) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await polesService.deletePole(id);
      navigate('/my-poles');
    } catch (error) {
      console.error('Delete pole error:', error);
      setError('En feil oppstod. Vennligst prøv igjen.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await polesService.updatePole(id, form as any);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-poles');
      }, 2000);
    } catch (error: any) {
      console.error('Update pole error:', error);
      setError(error.message || 'En feil oppstod. Vennligst prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rediger stav</h1>
          <button
            onClick={() => navigate('/my-poles')}
            className="text-gray-600 hover:text-gray-700 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tilbake</span>
          </button>
        </div>

        {/* Success melding */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Staven er oppdatert! Sender deg tilbake...</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kommune *
                </label>
                <select
                  required
                  value={form.municipality || ''}
                  onChange={(e) => setForm({ ...form, municipality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg kommune</option>
                  {MUNICIPALITIES.map((municipality) => (
                    <option key={municipality} value={municipality}>
                      {municipality}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postnummer *
                </label>
                <input
                  type="text"
                  required
                  value={form.postal_code || ''}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="0000"
                />
              </div>
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
                <option value="rented">Utleid</option>
                <option value="reserved">Reservert</option>
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

          {/* Submit Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Slett stav</span>
            </button>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/my-poles')}
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
                    <Save className="w-4 h-4" />
                    <span>Lagre endringer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Bekreft sletting
            </h3>
            <p className="text-gray-600 mb-6">
              Er du sikker på at du vil slette denne staven? Denne handlingen kan ikke angres.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sletter...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Slett stav</span>
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