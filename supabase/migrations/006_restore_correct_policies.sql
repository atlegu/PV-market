-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Everyone can view all poles" ON poles;

-- Recreate the original policies that make sense for a marketplace:
-- 1. Public can only see available/for_sale poles (for buyers)
CREATE POLICY "Public can view available poles" ON poles
  FOR SELECT 
  USING (status IN ('available', 'for_sale'));

-- 2. Users can always see their own poles (all statuses)
CREATE POLICY "Users can view own poles" ON poles
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Note: The total count will need to be fetched with service role key
-- or through a database function that bypasses RLS