-- Create a function to get total pole count (bypasses RLS)
CREATE OR REPLACE FUNCTION get_total_pole_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with elevated privileges
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM poles);
END;
$$;

-- Create a function to get total user count (bypasses RLS)  
CREATE OR REPLACE FUNCTION get_total_user_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM user_profiles);
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION get_total_pole_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_total_user_count() TO anon, authenticated;