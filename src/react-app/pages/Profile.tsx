import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/react-app/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Building, MapPin, Phone, Edit } from 'lucide-react';
import { CreateUserProfile, MUNICIPALITIES } from '@/shared/types';
import type { UserProfile } from '@/shared/types';

export default function ProfilePage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CreateUserProfile>({
    user_type: 'individual',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (!user) return;

    const fetchProfile = async () => {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data) {
          setProfile(data);
          
          setForm({
            name: data.name || '',
            phone: data.phone || '',
            user_type: data.user_type,
            club_name: data.club_name || '',
            org_number: data.org_number || '',
            municipality: data.municipality || '',
            postal_code: data.postal_code || '',
          });
        } else {
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, authLoading]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          ...form,
          user_id: user.id,
          email: user.email,
        })
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        setIsEditing(false);
      } else {
        alert('Noe gikk galt. Prøv igjen.');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      alert('Noe gikk galt. Prøv igjen.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img
              src={(user as any)?.google_user_data?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=3b82f6&color=ffffff`}
              alt="Profile"
              className="w-16 h-16 rounded-full ring-4 ring-blue-500/20"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.name || (user as any)?.google_user_data?.name || user.name || 'Din profil'}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          {profile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>Rediger</span>
            </button>
          )}
        </div>

        {!isEditing && profile ? (
          /* View Mode */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Navn</p>
                  <p className="font-medium">{profile.name || 'Ikke oppgitt'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-medium">{profile.phone || 'Ikke oppgitt'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Brukertype</p>
                <p className="font-medium">
                  {profile.user_type === 'club' ? 'Klubb' : 'Privatperson'}
                </p>
              </div>
            </div>

            {profile.user_type === 'club' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Klubbnavn</p>
                  <p className="font-medium">{profile.club_name || 'Ikke oppgitt'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Org.nr</p>
                  <p className="font-medium">{profile.org_number || 'Ikke oppgitt'}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Kommune</p>
                  <p className="font-medium">{profile.municipality || 'Ikke oppgitt'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Postnummer</p>
                <p className="font-medium">{profile.postal_code || 'Ikke oppgitt'}</p>
              </div>
            </div>

            {profile.user_type === 'club' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${profile.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <p className="font-medium text-gray-900">
                    {profile.is_verified ? 'Verifisert klubb' : 'Under verifisering'}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.is_verified 
                    ? 'Din klubb er verifisert og kan motta forespørsler.'
                    : 'Vi gjennomgår klubbinformasjonen din. Dette tar vanligvis 1-2 virkedager.'
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brukertype *
              </label>
              <select
                value={form.user_type}
                onChange={(e) => setForm({ ...form, user_type: e.target.value as 'individual' | 'club' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="individual">Privatperson</option>
                <option value="club">Klubb</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Navn
                </label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ditt navn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+47 123 45 678"
                />
              </div>
            </div>

            {form.user_type === 'club' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Klubbnavn *
                  </label>
                  <input
                    type="text"
                    value={form.club_name || ''}
                    onChange={(e) => setForm({ ...form, club_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Navn på idrettslaget"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organisasjonsnummer
                  </label>
                  <input
                    type="text"
                    value={form.org_number || ''}
                    onChange={(e) => setForm({ ...form, org_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456789"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kommune
                </label>
                <select
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
                  Postnummer
                </label>
                <input
                  type="text"
                  value={form.postal_code || ''}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0000"
                  pattern="[0-9]{4}"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              {profile && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-600 hover:text-gray-700 font-medium px-4 py-2"
                >
                  Avbryt
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Lagrer...' : 'Lagre profil'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
