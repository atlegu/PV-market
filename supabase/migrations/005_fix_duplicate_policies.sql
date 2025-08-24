-- Drop BOTH existing SELECT policies on poles table
DROP POLICY IF EXISTS "Public poles are viewable by everyone" ON poles;
DROP POLICY IF EXISTS "Users can view own poles" ON poles;
DROP POLICY IF EXISTS "All poles are viewable by everyone" ON poles;

-- Create ONE single policy that allows everyone to view ALL poles
CREATE POLICY "Everyone can view all poles" ON poles
  FOR SELECT 
  USING (true);

-- This single policy replaces both previous policies and ensures:
-- 1. Everyone (authenticated and anonymous) can see ALL poles
-- 2. No filtering based on status or ownership for viewing
-- 3. The pole count will show the true total