import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { Menu, X, Search, Plus, User, LogOut, Info } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useSupabaseAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Søk', href: '/', icon: Search },
    { name: 'Legg til stav', href: '/add-pole', icon: Plus },
    { name: 'Mine staver', href: '/my-poles', icon: User },
    { name: 'Om tjenesten', href: '/about', icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-indigo-800 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">PV</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 bg-clip-text text-transparent">
                PV Market
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-orange-100 text-orange-700 shadow-sm font-semibold'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                  <img
                    src={
                      user.user_metadata?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || '')}&background=3b82f6&color=ffffff`
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-blue-500/20"
                  />
                  <button
                    onClick={signOut}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Logg ut"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-800 hover:to-indigo-700"
                >
                  Logg inn
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-md">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg flex items-center space-x-2 ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm font-medium">
              PV Market - En non-profit plattform for stavmiljøet i Norge.
            </p>
            <p className="text-sm mt-2">
              © stavhopp.no llc, all rights reserved, contact atle@stavhopp.no for questions
            </p>
            <p className="text-xs mt-3 text-gray-500">
              Laget med ❤️ for å gjøre stavhopp mer tilgjengelig
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
