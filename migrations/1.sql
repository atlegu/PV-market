
-- Users table to extend Mocha auth with profile data
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mocha_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'club')),
  club_name TEXT,
  org_number TEXT,
  municipality TEXT,
  postal_code TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pole vault poles table
CREATE TABLE poles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  length_cm INTEGER NOT NULL CHECK (length_cm >= 365 AND length_cm <= 520),
  weight_lbs INTEGER NOT NULL CHECK (weight_lbs >= 100 AND weight_lbs <= 210),
  brand TEXT NOT NULL,
  condition_rating INTEGER NOT NULL CHECK (condition_rating >= 1 AND condition_rating <= 5),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'reserved', 'for_sale', 'unavailable')),
  municipality TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  flex_rating TEXT,
  production_year INTEGER,
  image_urls TEXT, -- JSON array of image URLs
  internal_notes TEXT,
  serial_number TEXT,
  price_weekly INTEGER, -- Price in NOK for weekly rental
  price_sale INTEGER, -- Price in NOK for sale
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pole requests/transactions
CREATE TABLE pole_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pole_id INTEGER NOT NULL,
  requester_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('rent', 'buy')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  message TEXT,
  rental_start_date DATE,
  rental_end_date DATE,
  agreed_price INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved searches for notifications
CREATE TABLE saved_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  search_params TEXT NOT NULL, -- JSON object with search criteria
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_poles_status ON poles(status);
CREATE INDEX idx_poles_location ON poles(municipality, postal_code);
CREATE INDEX idx_poles_specs ON poles(length_cm, weight_lbs);
CREATE INDEX idx_poles_owner ON poles(owner_id);
CREATE INDEX idx_requests_status ON pole_requests(status);
CREATE INDEX idx_requests_pole ON pole_requests(pole_id);
