import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Shield, Users, Zap, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
// Using local type instead of schema for simpler validation
type LoginData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { user, loading: authLoading, signIn } = useSupabaseAuth();
  const navigate = useNavigate();
  
  const [loginMethod, setLoginMethod] = useState<'google' | 'email'>('google');
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check both types of authentication
    const token = localStorage.getItem('auth_token');
    if (user || token) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setErrors({ general: 'Google-innlogging er ikke tilgjengelig ennå' });
  };

  const validateForm = () => {
    const fieldErrors: Record<string, string> = {};
    
    // Manual validation
    if (!formData.email || !formData.email.includes('@')) {
      fieldErrors.email = 'Ugyldig e-postadresse';
    }
    
    if (!formData.password || formData.password.length < 1) {
      fieldErrors.password = 'Passord er påkrevd';
    }
    
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        throw new Error(error.message || 'Innlogging feilet');
      }

      // Successful login - navigate to home
      navigate('/');
    } catch (error: any) {
      console.error('Email login error full details:', {
        error,
        type: typeof error,
        isError: error instanceof Error,
        message: error?.message
      });
      
      // Better error handling
      let errorMessage = 'Innlogging feilet. Prøv igjen.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = error.message || error.error || 'Ukjent feil oppstod';
        if (errorMessage === '[object Object]') {
          errorMessage = 'En feil oppstod ved innlogging. Vennligst prøv igjen.';
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">PV</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Logg inn til PV Market
          </h1>
          <p className="text-gray-600 mt-2">
            Få tilgang til Norges største marked for staver
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLoginMethod('google')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'google'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Google
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                E-post
              </button>
            </div>

            {loginMethod === 'google' ? (
              <>
                {/* Benefits */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Kontakt eiere direkte</h3>
                      <p className="text-sm text-gray-600">Send forespørsler om leie eller kjøp</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Legg ut dine staver</h3>
                      <p className="text-sm text-gray-600">Tjén penger på ubrukt utstyr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Trygg og sikker</h3>
                      <p className="text-sm text-gray-600">Verifiserte klubber og brukere</p>
                    </div>
                  </div>
                </div>

                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Logg inn med Google</span>
                </button>
              </>
            ) : (
              /* Email/Password Form */
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-postadresse
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="din@epost.no"
                    required
                  />
                  {errors.email && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Passord
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Skriv inn passordet ditt"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.submit}
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Logg inn</span>
                    </>
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Har du ikke en konto ennå?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                      Opprett konto her
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* Privacy Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Ved å logge inn godtar du våre{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  vilkår for bruk
                </a>{' '}
                og{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  personvernpolicy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Non-profit Notice */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            PV Market er en non-profit plattform laget for stavmiljøet i Norge
          </p>
        </div>
      </div>
    </div>
  );
}
