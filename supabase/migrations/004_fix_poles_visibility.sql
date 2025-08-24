-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Public poles are viewable by everyone" ON poles;

-- Create a new policy that allows everyone to view ALL poles
-- This allows users to see all poles in the marketplace
CREATE POLICY "All poles are viewable by everyone" ON poles
  FOR SELECT USING (true);

-- Note: The other policies remain unchanged:
-- - Users can still only INSERT/UPDATE/DELETE their own poles
-- - This only changes the SELECT/viewing permissions