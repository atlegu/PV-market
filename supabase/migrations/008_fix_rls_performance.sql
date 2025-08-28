-- Fix RLS performance issues by wrapping auth.uid() in subqueries
-- This ensures the function is evaluated once per query, not per row

-- Drop existing policies for poles table
DROP POLICY IF EXISTS "Public can view available poles" ON poles;
DROP POLICY IF EXISTS "Users can view own poles" ON poles;
DROP POLICY IF EXISTS "Users can insert own poles" ON poles;
DROP POLICY IF EXISTS "Users can update own poles" ON poles;
DROP POLICY IF EXISTS "Users can delete own poles" ON poles;
DROP POLICY IF EXISTS "Public poles are viewable by everyone" ON poles;

-- Recreate poles policies with performance optimization
CREATE POLICY "Public can view available poles" ON poles
  FOR SELECT 
  USING (status IN ('available', 'for_sale'));

CREATE POLICY "Users can view own poles" ON poles
  FOR SELECT 
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can insert own poles" ON poles
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can update own poles" ON poles
  FOR UPDATE 
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can delete own poles" ON poles
  FOR DELETE 
  USING ((SELECT auth.uid()) = owner_id);

-- Drop existing policies for user_profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recreate user_profiles policies with performance optimization
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);

-- Drop existing policies for pole_requests table
DROP POLICY IF EXISTS "Users can view relevant requests" ON pole_requests;
DROP POLICY IF EXISTS "Users can create requests" ON pole_requests;
DROP POLICY IF EXISTS "Owners can update requests" ON pole_requests;

-- Recreate pole_requests policies with performance optimization
CREATE POLICY "Users can view relevant requests" ON pole_requests
  FOR SELECT 
  USING ((SELECT auth.uid()) IN (requester_id, owner_id));

CREATE POLICY "Users can create requests" ON pole_requests
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = requester_id);

CREATE POLICY "Owners can update requests" ON pole_requests
  FOR UPDATE 
  USING ((SELECT auth.uid()) = owner_id);

-- Drop existing policies for saved_searches table
DROP POLICY IF EXISTS "Users can view own searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can insert own searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can update own searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can delete own searches" ON saved_searches;

-- Recreate saved_searches policies with performance optimization
CREATE POLICY "Users can view own searches" ON saved_searches
  FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own searches" ON saved_searches
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own searches" ON saved_searches
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own searches" ON saved_searches
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);

-- Add comment explaining the optimization
COMMENT ON TABLE poles IS 'RLS policies optimized with (SELECT auth.uid()) to prevent re-evaluation per row';