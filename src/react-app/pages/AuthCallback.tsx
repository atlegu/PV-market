import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.search);
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setError(err.message || 'Innlogging feilet. Prøv igjen.');
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Logger deg inn...
              </h2>
              <p className="text-gray-600">
                Vent litt mens vi fullfører innloggingen din.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Innlogging vellykket!
              </h2>
              <p className="text-gray-600">
                Velkommen til PV Market. Du blir omdirigert til profilen din...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Noe gikk galt
              </h2>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-800 hover:to-indigo-700"
              >
                Prøv igjen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
