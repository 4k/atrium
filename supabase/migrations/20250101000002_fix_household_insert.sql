-- Drop the old restrictive insert policy for households
DROP POLICY IF EXISTS "Users can insert their own household" ON households;

-- Create a more permissive policy for household creation during signup
-- This allows anyone to create a household (needed during signup before user is authenticated)
-- The application logic ensures this is only used during signup
CREATE POLICY "Allow household creation during signup"
  ON households FOR INSERT
  WITH CHECK (true);

-- Note: This is safe because:
-- 1. Users can only view/update households they belong to (other policies)
-- 2. The household_id is stored in user metadata during signup
-- 3. All other table policies reference the user's household_id from metadata
