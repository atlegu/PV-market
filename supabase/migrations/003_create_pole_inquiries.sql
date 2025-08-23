-- Create pole_inquiries table for storing email inquiries
CREATE TABLE IF NOT EXISTS pole_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pole_id UUID REFERENCES poles(id) ON DELETE CASCADE,
  owner_email TEXT NOT NULL,
  inquirer_email TEXT NOT NULL,
  inquirer_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Add RLS policies
ALTER TABLE pole_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view inquiries for their own poles
CREATE POLICY "Users can view inquiries for their poles"
  ON pole_inquiries
  FOR SELECT
  USING (
    owner_email = (SELECT email FROM user_profiles WHERE user_id = auth.uid())
  );

-- Policy: Authenticated users can create inquiries
CREATE POLICY "Authenticated users can create inquiries"
  ON pole_inquiries
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX idx_pole_inquiries_owner_email ON pole_inquiries(owner_email);
CREATE INDEX idx_pole_inquiries_pole_id ON pole_inquiries(pole_id);