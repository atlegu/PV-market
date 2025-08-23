-- Update CHECK constraints for poles table to allow smaller values
-- SQLite doesn't support ALTER TABLE to modify constraints, so we need to recreate the table

-- Create temporary table with new constraints
CREATE TABLE poles_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  length_cm INTEGER NOT NULL CHECK (length_cm >= 250 AND length_cm <= 520),
  weight_lbs INTEGER NOT NULL CHECK (weight_lbs >= 50 AND weight_lbs <= 210),
  brand TEXT NOT NULL,
  condition_rating INTEGER NOT NULL CHECK (condition_rating >= 1 AND condition_rating <= 5),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'reserved', 'for_sale', 'unavailable')),
  municipality TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  flex_rating TEXT,
  production_year INTEGER,
  image_urls TEXT,
  internal_notes TEXT,
  serial_number TEXT,
  price_weekly INTEGER,
  price_sale INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data
INSERT INTO poles_new SELECT * FROM poles;

-- Drop old table
DROP TABLE poles;

-- Rename new table
ALTER TABLE poles_new RENAME TO poles;

-- Recreate indexes
CREATE INDEX idx_poles_status ON poles(status);
CREATE INDEX idx_poles_location ON poles(municipality, postal_code);
CREATE INDEX idx_poles_specs ON poles(length_cm, weight_lbs);
CREATE INDEX idx_poles_owner ON poles(owner_id);