import { useState } from 'react';
import { X, ArrowRight, Lightbulb } from 'lucide-react';
import type { SearchFilters } from '@/shared/types';

interface PoleAdvisorProps {
  onClose: () => void;
  onRecommendation: (filters: SearchFilters) => void;
}

interface AdvisorForm {
  currentLength: number | undefined;
  currentWeight: number | undefined;
  experience: 'too_soft' | 'perfect' | 'too_stiff' | '';
  bodyWeight: number | undefined;
  gripHeight: number | undefined;
}

export default function PoleAdvisor({ onClose, onRecommendation }: PoleAdvisorProps) {
  const [form, setForm] = useState<AdvisorForm>({
    currentLength: undefined,
    currentWeight: undefined,
    experience: '',
    bodyWeight: undefined,
    gripHeight: undefined,
  });
  const [step, setStep] = useState(1);
  const [recommendations, setRecommendations] = useState<{
    length?: { min: number; max: number };
    weight?: { min: number; max: number };
    reasoning: string[];
  }>({
    reasoning: [],
  });

  const generateRecommendations = () => {
    const reasoning: string[] = [];
    let lengthMin = form.currentLength;
    let lengthMax = form.currentLength;
    let weightMin = form.currentWeight;
    let weightMax = form.currentWeight;

    if (!form.currentLength || !form.currentWeight) {
      reasoning.push('Vennligst fyll ut nåværende stav for å få anbefalinger.');
      return { reasoning };
    }

    // Logic based on experience
    if (form.experience === 'too_soft') {
      if (form.bodyWeight && form.bodyWeight < (form.currentWeight * 0.45)) {
        // If body weight is less than current weight, increase length
        lengthMin = form.currentLength + 10;
        lengthMax = form.currentLength + 15;
        reasoning.push('Siden staven føles for myk og vekten din er under stavens vektmerking, anbefaler vi en lengre stav.');
      } else {
        // Increase weight
        weightMin = form.currentWeight + 5;
        weightMax = form.currentWeight + 10;
        reasoning.push('Siden staven føles for myk, anbefaler vi en stivere stav med høyere vektmerking.');
      }
    } else if (form.experience === 'too_stiff') {
      weightMin = Math.max(100, form.currentWeight - 10);
      weightMax = Math.max(100, form.currentWeight - 5);
      reasoning.push('Siden staven føles for stiv, anbefaler vi en mykerere stav med lavere vektmerking.');
    } else if (form.experience === 'perfect') {
      // Look for similar specs
      lengthMin = form.currentLength - 5;
      lengthMax = form.currentLength + 5;
      weightMin = form.currentWeight - 5;
      weightMax = form.currentWeight + 5;
      reasoning.push('Siden din nåværende stav fungerer bra, ser vi etter lignende staver.');
    }

    // Ensure we stay within valid ranges
    lengthMin = Math.max(365, Math.min(520, lengthMin || 365));
    lengthMax = Math.max(365, Math.min(520, lengthMax || 520));
    weightMin = Math.max(100, Math.min(210, weightMin || 100));
    weightMax = Math.max(100, Math.min(210, weightMax || 210));

    // Additional reasoning based on other factors
    if (form.gripHeight && form.currentLength) {
      const gripRatio = form.gripHeight / form.currentLength;
      if (gripRatio > 0.85) {
        reasoning.push('Du griper høyt på staven, som tyder på at du kan være klar for en lengre stav.');
      } else if (gripRatio < 0.75) {
        reasoning.push('Du griper lavt på staven, som kan tyde på at du trenger mer kontroll.');
      }
    }

    return {
      length: { min: lengthMin, max: lengthMax },
      weight: { min: weightMin, max: weightMax },
      reasoning,
    };
  };

  const handleSubmit = () => {
    const recs = generateRecommendations();
    setRecommendations(recs);
    setStep(3);
  };

  const handleApplyFilters = () => {
    const filters: SearchFilters = {};
    
    if (recommendations.length) {
      filters.length_min = recommendations.length.min;
      filters.length_max = recommendations.length.max;
    }
    
    if (recommendations.weight) {
      filters.weight_min = recommendations.weight.min;
      filters.weight_max = recommendations.weight.max;
    }

    onRecommendation(filters);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Stavveileder</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress */}
          <div className="flex items-center mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= i
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > i ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Current Pole */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fortell oss om din nåværende stav
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lengde (cm)
                    </label>
                    <input
                      type="number"
                      value={form.currentLength || ''}
                      onChange={(e) => setForm({ ...form, currentLength: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="f.eks. 420"
                      min="365"
                      max="520"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vektmerking (lbs)
                    </label>
                    <input
                      type="number"
                      value={form.currentWeight || ''}
                      onChange={(e) => setForm({ ...form, currentWeight: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="f.eks. 155"
                      min="100"
                      max="210"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.currentLength || !form.currentWeight}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Neste</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hvordan opplever du din nåværende stav?
                </h3>
                <div className="space-y-3">
                  {[
                    { value: 'too_soft', label: 'For myk - Staven bøyer seg for mye', desc: 'Du får ikke nok løft eller fart' },
                    { value: 'perfect', label: 'Passe - Staven fungerer bra', desc: 'Du får god løft og kontroll' },
                    { value: 'too_stiff', label: 'For stiv - Staven er vanskelig å bøye', desc: 'Du sliter med å få staven til å bøye seg' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                        form.experience === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={form.experience === option.value}
                        onChange={(e) => setForm({ ...form, experience: e.target.value as any })}
                        className="sr-only"
                      />
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Tilleggsinformasjon (valgfritt)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Din vekt (kg)
                    </label>
                    <input
                      type="number"
                      value={form.bodyWeight || ''}
                      onChange={(e) => setForm({ ...form, bodyWeight: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="f.eks. 70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gripehøyde (cm fra bunn)
                    </label>
                    <input
                      type="number"
                      value={form.gripHeight || ''}
                      onChange={(e) => setForm({ ...form, gripHeight: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="f.eks. 350"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-700 font-medium"
                >
                  Tilbake
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.experience}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Få anbefalinger
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Recommendations */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Våre anbefalinger for deg
                </h3>
                
                {recommendations.length && recommendations.weight && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Anbefalt stavspesifikasjon:</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Lengde:</span>
                        <div className="font-semibold text-purple-700">
                          {recommendations.length.min} - {recommendations.length.max} cm
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Vektmerking:</span>
                        <div className="font-semibold text-purple-700">
                          {recommendations.weight.min} - {recommendations.weight.max} lbs
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Begrunnelse:</h4>
                  {recommendations.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-600 hover:text-gray-700 font-medium"
                >
                  Tilbake
                </button>
                <div className="space-x-3">
                  <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-700 font-medium px-4 py-2"
                  >
                    Lukk
                  </button>
                  {recommendations.length && recommendations.weight && (
                    <button
                      onClick={handleApplyFilters}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                    >
                      Søk etter anbefalte staver
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
