import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Sjekker tilkobling...');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Test 1: Check if we can connect
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session check:', sessionData);

      // Test 2: Try to query poles table (should work even without auth for public poles)
      const { error: polesError } = await supabase
        .from('poles')
        .select('count')
        .limit(1);

      if (polesError) {
        throw polesError;
      }

      // Test 3: Check which tables exist
      const { error: tablesError } = await supabase
        .from('poles')
        .select('*')
        .limit(0);

      if (!tablesError) {
        setTables(['poles', 'user_profiles', 'pole_requests', 'saved_searches']);
      }

      setStatus('✅ Supabase er tilkoblet og fungerer!');
      setError(null);
    } catch (err: any) {
      console.error('Supabase error:', err);
      setStatus('❌ Feil ved tilkobling til Supabase');
      setError(err.message || 'Ukjent feil');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6">Supabase Tilkoblingstest</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Status:</h2>
            <p className={error ? 'text-red-600' : 'text-green-600'}>{status}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                <strong>Feilmelding:</strong> {error}
              </p>
            </div>
          )}

          {tables.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Tabeller funnet:</h2>
              <ul className="list-disc list-inside space-y-1">
                {tables.map((table) => (
                  <li key={table} className="text-gray-600">
                    {table}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t">
            <h2 className="font-semibold mb-2">Miljøvariabler:</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>URL:</strong>{' '}
                {import.meta.env.VITE_SUPABASE_URL ? '✅ Satt' : '❌ Mangler'}
              </p>
              <p>
                <strong>Anon Key:</strong>{' '}
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Satt' : '❌ Mangler'}
              </p>
            </div>
          </div>

          <button
            onClick={checkConnection}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Test på nytt
          </button>
        </div>
      </div>
    </div>
  );
}