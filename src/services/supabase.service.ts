import { supabase } from '@/lib/supabase';
import type { 
  Pole, 
  CreatePoleData, 
  SearchFilters, 
  UserProfile, 
  CreateUserProfileData,
  PoleRequest 
} from '@/shared/types';

// ============================================================================
// Authentication Services
// ============================================================================

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });

    if (error) throw error;

    // Create user profile after signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email!,
          name,
          user_type: 'individual'
        });

      if (profileError) console.error('Profile creation error:', profileError);
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================================================
// User Profile Services
// ============================================================================

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return null;
    }

    return data;
  },

  async createOrUpdateProfile(userId: string, profileData: CreateUserProfileData): Promise<UserProfile> {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          user_id: userId,
          email: (await supabase.auth.getUser()).data.user?.email || ''
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
};

// ============================================================================
// Pole Services
// ============================================================================

export const poleService = {
  async searchPoles(filters: SearchFilters): Promise<Pole[]> {
    let query = supabase
      .from('poles')
      .select('*');
    
    // Only filter by status if explicitly provided
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.length_min) {
      query = query.gte('length_cm', filters.length_min);
    }
    if (filters.length_max) {
      query = query.lte('length_cm', filters.length_max);
    }
    if (filters.weight_min) {
      query = query.gte('weight_lbs', filters.weight_min);
    }
    if (filters.weight_max) {
      query = query.lte('weight_lbs', filters.weight_max);
    }
    if (filters.municipality) {
      query = query.eq('municipality', filters.municipality);
    }
    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.condition_min) {
      query = query.gte('condition_rating', filters.condition_min);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPole(id: string): Promise<Pole | null> {
    const { data, error } = await supabase
      .from('poles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get pole error:', error);
      return null;
    }

    return data;
  },

  async createPole(poleData: CreatePoleData): Promise<Pole> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('poles')
      .insert({
        ...poleData,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePole(id: string, poleData: CreatePoleData): Promise<Pole> {
    const { data, error } = await supabase
      .from('poles')
      .update(poleData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePole(id: string): Promise<void> {
    const { error } = await supabase
      .from('poles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getUserPoles(userId: string): Promise<Pole[]> {
    const { data, error } = await supabase
      .from('poles')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// ============================================================================
// Pole Request Services
// ============================================================================

export const requestService = {
  async createRequest(
    poleId: string,
    requestData: {
      request_type: 'rent' | 'buy';
      message?: string;
      rental_start_date?: string;
      rental_end_date?: string;
    }
  ): Promise<PoleRequest> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get pole owner
    const pole = await poleService.getPole(poleId);
    if (!pole) throw new Error('Pole not found');
    if (pole.owner_id === user.id) throw new Error('Cannot request your own pole');

    const { data, error } = await supabase
      .from('pole_requests')
      .insert({
        pole_id: poleId,
        requester_id: user.id,
        owner_id: pole.owner_id,
        ...requestData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserRequests(userId: string): Promise<PoleRequest[]> {
    const { data, error } = await supabase
      .from('pole_requests')
      .select('*')
      .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'declined' | 'completed',
    agreedPrice?: number
  ): Promise<PoleRequest> {
    const updateData: any = { status };
    if (agreedPrice !== undefined) {
      updateData.agreed_price = agreedPrice;
    }

    const { data, error } = await supabase
      .from('pole_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Export all services as a single object for convenience
export const supabaseService = {
  auth: authService,
  profile: profileService,
  pole: poleService,
  request: requestService
};