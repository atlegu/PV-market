-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create poles table
CREATE TABLE poles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  length_cm INTEGER NOT NULL CHECK (length_cm >= 250 AND length_cm <= 520),
  weight_lbs INTEGER NOT NULL CHECK (weight_lbs >= 50 AND weight_lbs <= 210),
  brand TEXT NOT NULL,
  condition_rating INTEGER NOT NULL CHECK (condition_rating >= 1 AND condition_rating <= 5),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'reserved', 'for_sale', 'unavailable')),
  municipality TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  flex_rating TEXT,
  production_year INTEGER,
  image_urls JSONB,
  internal_notes TEXT,
  serial_number TEXT,
  price_weekly INTEGER,
  price_sale INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'club')),
  club_name TEXT,
  org_number TEXT,
  municipality TEXT,
  postal_code TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pole_requests table
CREATE TABLE pole_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pole_id UUID REFERENCES poles(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('rent', 'buy')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  message TEXT,
  rental_start_date DATE,
  rental_end_date DATE,
  agreed_price INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_searches table
CREATE TABLE saved_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_params JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_poles_owner ON poles(owner_id);
CREATE INDEX idx_poles_status ON poles(status);
CREATE INDEX idx_poles_location ON poles(municipality, postal_code);
CREATE INDEX idx_poles_specs ON poles(length_cm, weight_lbs);
CREATE INDEX idx_requests_pole ON pole_requests(pole_id);
CREATE INDEX idx_requests_status ON pole_requests(status);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE poles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pole_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poles
-- Anyone can view available poles
CREATE POLICY "Public poles are viewable by everyone" ON poles
  FOR SELECT USING (status IN ('available', 'for_sale'));

-- Users can view their own poles regardless of status
CREATE POLICY "Users can view own poles" ON poles
  FOR SELECT USING ((SELECT auth.uid()) = owner_id);

-- Users can insert their own poles
CREATE POLICY "Users can insert own poles" ON poles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = owner_id);

-- Users can update their own poles
CREATE POLICY "Users can update own poles" ON poles
  FOR UPDATE USING ((SELECT auth.uid()) = owner_id);

-- Users can delete their own poles
CREATE POLICY "Users can delete own poles" ON poles
  FOR DELETE USING ((SELECT auth.uid()) = owner_id);

-- RLS Policies for user_profiles
-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- RLS Policies for pole_requests
-- Users can view requests they're involved in
CREATE POLICY "Users can view relevant requests" ON pole_requests
  FOR SELECT USING ((SELECT auth.uid()) IN (requester_id, owner_id));

-- Users can create requests
CREATE POLICY "Users can create requests" ON pole_requests
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = requester_id);

-- Owners can update request status
CREATE POLICY "Owners can update requests" ON pole_requests
  FOR UPDATE USING ((SELECT auth.uid()) = owner_id);

-- RLS Policies for saved_searches
-- Users can only see their own saved searches
CREATE POLICY "Users can view own searches" ON saved_searches
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own searches" ON saved_searches
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own searches" ON saved_searches
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own searches" ON saved_searches
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Functions for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_poles_updated_at BEFORE UPDATE ON poles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pole_requests_updated_at BEFORE UPDATE ON pole_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();