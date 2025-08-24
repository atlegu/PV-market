import { useState } from 'react';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { polesService } from '@/services/poles.service';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Save, Trash2, ListPlus } from 'lucide-react';
import { POLE_BRANDS } from '@/shared/types';
import { getMunicipalityFromPostalCode } from '@/shared/postalCodes';

interface PoleRow {
  id: string;
  length_cm: number | null;
  weight_lbs: number | null;
  flex_rating: string;
  brand: string;
  condition_rating: number;
  status: 'available' | 'for_sale' | 'unavailable';
}

export default function AddPoleBulkPage() {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  
  // Felles lokasjonsinfo
  const [municipality, setMunicipality] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Staver
  const [poles, setPoles] = useState<PoleRow[]>([
    {
      id: crypto.randomUUID(),
      length_cm: null,
      weight_lbs: null,
      flex_rating: '',
      brand: '',
      condition_rating: 3,
      status: 'available'
    }
  ]);

  const addRow = () => {
    setPoles([...poles, {
      id: crypto.randomUUID(),
      length_cm: null,
      weight_lbs: null,
      flex_rating: '',
      brand: '',
      condition_rating: 3,
      status: 'available'
    }]);
  };

  const removeRow = (id: string) => {
    setPoles(poles.filter(p => p.id !== id));
  };

  const updatePole = (id: string, field: keyof PoleRow, value: any) => {
    setPoles(poles.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    // Validering
    if (!postalCode) {
      setError('Postnummer må fylles ut');
      return;
    }
    
    // Auto-set municipality if not set
    if (!municipality) {
      const mun = getMunicipalityFromPostalCode(postalCode);
      if (!mun) {
        setError('Ugyldig postnummer');
        return;
      }
      setMunicipality(mun);
    }

    const validPoles = poles.filter(p => 
      p.length_cm && p.weight_lbs && p.brand
    );

    if (validPoles.length === 0) {
      setError('Ingen gyldige staver å registrere');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessCount(0);
    
    try {
      let successful = 0;
      const errors: string[] = [];
      
      // Send hver stav individuelt
      for (const pole of validPoles) {
        try {
          await polesService.createPole({
            length_cm: pole.length_cm as number,
            weight_lbs: pole.weight_lbs as number,
            brand: pole.brand,
            condition_rating: pole.condition_rating,
            status: pole.status,
            municipality,
            postal_code: postalCode,
            flex_rating: pole.flex_rating || undefined,
          } as any);
          successful++;
        } catch (err) {
          errors.push(`Stav ${pole.length_cm}cm/${pole.weight_lbs}lbs feilet`);
        }
      }
      
      setSuccessCount(successful);
      
      if (errors.length > 0) {
        setError(`${successful} av ${validPoles.length} staver registrert. Feil: ${errors.join(', ')}`);
      } else {
        // Alle staver registrert - naviger etter kort pause
        setTimeout(() => {
          navigate('/my-poles');
        }, 2000);
      }
    } catch (error) {
      console.error('Bulk create error:', error);
      setError('En feil oppstod. Vennligst prøv igjen.');
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
            Du må være logget inn for å legge til staver
          </h1>
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ListPlus className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Hurtigregistrering av staver</h1>
          </div>
          <Link
            to="/add-pole"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Bytt til standard registrering →
          </Link>
        </div>

        <p className="text-gray-600 mb-6">
          Registrer flere staver raskt. Pris og notater kan legges til senere via redigering.
        </p>

        {/* Success melding */}
        {successCount > 0 && !error && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">
                {successCount} stav{successCount > 1 ? 'er' : ''} registrert! Sender deg til dine staver...
              </p>
            </div>
          </div>
        )}

        {/* Error melding */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Felles lokasjon */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Lokasjon for alle staver</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postnummer *
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setPostalCode(code);
                  const mun = getMunicipalityFromPostalCode(code);
                  if (mun) {
                    setMunicipality(mun);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="0000"
              />
              {municipality && (
                <p className="mt-2 text-sm text-gray-600">
                  Kommune: {municipality}
                </p>
              )}
            </div>
          </div>

          {/* Staver tabell */}
          <div className="overflow-x-auto -mx-8 px-8">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                    Lengde (cm) *
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pl-2">
                    Vekt (lbs) *
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pl-2">
                    Flex
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pl-2">
                    Merke *
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pl-2">
                    Tilstand
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pl-2">
                    Status
                  </th>
                  <th className="pb-2 pl-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {poles.map((pole) => (
                  <tr key={pole.id} className="group">
                    <td className="py-2">
                      <input
                        type="number"
                        value={pole.length_cm || ''}
                        onChange={(e) => updatePole(pole.id, 'length_cm', e.target.value ? Number(e.target.value) : null)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="250"
                        max="520"
                        step="1"
                        placeholder="cm"
                      />
                    </td>
                    <td className="py-2 pl-2">
                      <input
                        type="number"
                        value={pole.weight_lbs || ''}
                        onChange={(e) => updatePole(pole.id, 'weight_lbs', e.target.value ? Number(e.target.value) : null)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="50"
                        max="210"
                        step="1"
                        placeholder="lbs"
                      />
                    </td>
                    <td className="py-2 pl-2">
                      <input
                        type="text"
                        value={pole.flex_rating}
                        onChange={(e) => updatePole(pole.id, 'flex_rating', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="14.6"
                      />
                    </td>
                    <td className="py-2 pl-2">
                      <input
                        type="text"
                        list={`brands-${pole.id}`}
                        value={pole.brand}
                        onChange={(e) => updatePole(pole.id, 'brand', e.target.value)}
                        className="w-40 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Skriv for å søke"
                      />
                      <datalist id={`brands-${pole.id}`}>
                        {POLE_BRANDS.map((brand) => (
                          <option key={brand} value={brand} />
                        ))}
                      </datalist>
                    </td>
                    <td className="py-2 pl-2">
                      <select
                        value={pole.condition_rating}
                        onChange={(e) => updatePole(pole.id, 'condition_rating', Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">1 - Dårlig</option>
                        <option value="2">2 - Under middels</option>
                        <option value="3">3 - Middels</option>
                        <option value="4">4 - God</option>
                        <option value="5">5 - Utmerket</option>
                      </select>
                    </td>
                    <td className="py-2 pl-2">
                      <select
                        value={pole.status}
                        onChange={(e) => updatePole(pole.id, 'status', e.target.value as any)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="available">Til leie</option>
                        <option value="for_sale">Til salgs</option>
                        <option value="unavailable">I bruk</option>
                      </select>
                    </td>
                    <td className="py-2 pl-2">
                      {poles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(pole.id)}
                          className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Fjern rad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legg til rad knapp */}
          <button
            type="button"
            onClick={addRow}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Legg til rad</span>
          </button>

          {/* Submit knapper */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
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
                  <span>Registrerer...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Registrer staver</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}