import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      poles: {
        Row: {
          id: string;
          owner_id: string;
          length_cm: number;
          weight_lbs: number;
          brand: string;
          condition_rating: number;
          status: 'available' | 'rented' | 'reserved' | 'for_sale' | 'unavailable';
          municipality: string;
          postal_code: string;
          flex_rating: string | null;
          production_year: number | null;
          image_urls: any | null;
          internal_notes: string | null;
          serial_number: string | null;
          price_weekly: number | null;
          price_sale: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['poles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['poles']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string | null;
          phone: string | null;
          user_type: 'individual' | 'club';
          club_name: string | null;
          org_number: string | null;
          municipality: string | null;
          postal_code: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      pole_requests: {
        Row: {
          id: string;
          pole_id: string;
          requester_id: string;
          owner_id: string;
          request_type: 'rent' | 'buy';
          status: 'pending' | 'accepted' | 'declined' | 'completed';
          message: string | null;
          rental_start_date: string | null;
          rental_end_date: string | null;
          agreed_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pole_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pole_requests']['Insert']>;
      };
    };
  };
}