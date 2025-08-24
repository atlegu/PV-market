import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { polesService } from '@/services/poles.service';
import { supabase } from '@/lib/supabase';
import SearchFilters from '@/react-app/components/SearchFilters';
import PoleCard from '@/react-app/components/PoleCard';
import PoleAdvisor from '@/react-app/components/PoleAdvisor';
import { Compass, TrendingUp, Users, Lightbulb, Search } from 'lucide-react';
import type { Pole, SearchFilters as SearchFiltersType } from '@/shared/types';

export default function HomePage() {
  const { user } = useSupabaseAuth();
  const [poles, setPoles] = useState<Pole[]>([]);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalPoles, setTotalPoles] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const searchPoles = async () => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const data = await polesService.getAllPoles(filters as any);
      setPoles(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load featured poles and count on mount
  useEffect(() => {
    // Only get total pole count on mount, don't search automatically
    getTotalPoleCount();
    getTotalUserCount();
  }, []);
  
  const getTotalPoleCount = async () => {
    try {
      // Use the database function that bypasses RLS to get true total
      const { data, error } = await supabase
        .rpc('get_total_pole_count');
      
      if (error) {
        console.error('Error fetching total count:', error);
      } else {
        console.log('Total poles count from function:', data);
        setTotalPoles(data || 0);
      }
    } catch (error) {
      console.error('Error fetching total count:', error);
    }
  };

  const getTotalUserCount = async () => {
    try {
      // Use the database function that bypasses RLS to get true total
      const { data, error } = await supabase
        .rpc('get_total_user_count');
      
      if (error) {
        console.error('Error fetching user count:', error);
      } else {
        setTotalUsers(data || 0);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 bg-clip-text text-transparent mb-6">
          PV Market
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Norges største plattform for deling og salg av staver. 
          Søk blant staver som er tilgjengelige for leie eller kjøp.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-900" />
              <span className="text-2xl font-bold text-gray-900">{totalPoles}</span>
            </div>
            <p className="text-gray-600">Staver registrert</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="w-6 h-6 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{totalUsers}</span>
            </div>
            <p className="text-gray-600">Registrerte brukere</p>
          </div>
        </div>

      </div>

      {/* Search Filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={searchPoles}
        isLoading={isLoading}
      />

      {/* Pole Advisor CTA */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Lightbulb className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Usikker på hvilken stav du trenger?</h2>
        </div>
        <p className="text-gray-600 mb-4 text-center">
          Bruk vår intelligente stavveileder for å finne den perfekte staven basert på din nåværende utvikling.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => setShowAdvisor(true)}
            className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-800 hover:to-indigo-700"
          >
            Bruk stavveileder
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mb-8">
        {hasSearched && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoading ? 'Søker...' : `${poles.length} staver funnet`}
            </h2>
            {poles.length > 0 && (
              <div className="text-sm text-gray-600">
                Sortert etter nyeste først
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : poles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poles.map((pole) => (
              <PoleCard key={pole.id} pole={pole} />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ingen staver funnet
            </h3>
            <p className="text-gray-600 mb-6">
              Prøv å justere søkekriteriene dine eller sjekk tilbake senere.
            </p>
            <button
              onClick={() => setFilters({})}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Nullstill søk
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-blue-900" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Velkommen til PV Market
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Bruk søkefilteret ovenfor for å finne staver som passer dine behov, 
              eller klikk på "Vis alle tilgjengelige staver" for å se alle tilgjengelige staver.
            </p>
            <button
              onClick={searchPoles}
              className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-800 hover:to-indigo-700 inline-flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Vis alle tilgjengelige staver</span>
            </button>
          </div>
        )}
      </div>

      {/* Welcome Section for Non-Users */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Bli med i PV Market-fellesskapet
          </h2>
          <p className="text-blue-50 mb-6">
            Registrer deg for å legge ut dine egne staver eller kontakte eiere av staver du er interessert i.
          </p>
          <a
            href="/login"
            className="bg-white text-blue-900 px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-block hover:bg-orange-50"
          >
            Kom i gang
          </a>
        </div>
      )}

      {/* Pole Advisor Modal */}
      {showAdvisor && (
        <PoleAdvisor 
          onClose={() => setShowAdvisor(false)}
          onRecommendation={(recommendation) => {
            setFilters(recommendation);
            setShowAdvisor(false);
            searchPoles();
          }}
        />
      )}
    </div>
  );
}
