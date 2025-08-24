import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type CreatePole = Database['public']['Tables']['poles']['Insert'];
type UpdatePole = Database['public']['Tables']['poles']['Update'];

export const polesService = {
  // Get all available poles
  async getAllPoles(filters?: {
    length_min?: number;
    length_max?: number;
    weight_min?: number;
    weight_max?: number;
    municipality?: string;
    brand?: string;
    condition_min?: number;
    status?: string[];
  }) {
    let query = supabase
      .from('poles')
      .select('*')
      .order('length_cm', { ascending: true });
    
    // Only filter by status if explicitly provided
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.length_min) {
      query = query.gte('length_cm', filters.length_min);
    }
    if (filters?.length_max) {
      query = query.lte('length_cm', filters.length_max);
    }
    if (filters?.weight_min) {
      query = query.gte('weight_lbs', filters.weight_min);
    }
    if (filters?.weight_max) {
      query = query.lte('weight_lbs', filters.weight_max);
    }
    if (filters?.municipality) {
      query = query.eq('municipality', filters.municipality);
    }
    if (filters?.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters?.condition_min) {
      query = query.gte('condition_rating', filters.condition_min);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Get single pole with owner info
  async getPoleById(id: string) {
    // First get the pole
    const { data: pole, error: poleError } = await supabase
      .from('poles')
      .select('*')
      .eq('id', id)
      .single();

    if (poleError) throw poleError;
    
    // Then get the owner's profile
    if (pole?.owner_id) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('name, email, club_name')
        .eq('user_id', pole.owner_id)
        .single();
      
      if (!profileError && profile) {
        return { ...pole, user_profiles: profile };
      }
    }
    
    return pole;
  },

  // Get user's poles
  async getUserPoles(userId: string) {
    const { data, error } = await supabase
      .from('poles')
      .select('*')
      .eq('owner_id', userId)
      .order('length_cm', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create pole
  async createPole(pole: Omit<CreatePole, 'owner_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('poles')
      .insert({
        ...pole,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update pole
  async updatePole(id: string, updates: UpdatePole) {
    const { data, error } = await supabase
      .from('poles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete pole
  async deletePole(id: string) {
    const { error } = await supabase
      .from('poles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to pole changes (realtime)
  subscribeToPoles(callback: (payload: any) => void) {
    return supabase
      .channel('poles-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poles',
        },
        callback
      )
      .subscribe();
  },
};