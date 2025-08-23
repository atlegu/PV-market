-- Local users table for email/password authentication
CREATE TABLE local_users (
  id TEXT PRIMARY KEY, -- UUID to be compatible with mocha_user_id
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for JWT token management
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY, -- JWT token ID
  user_id TEXT NOT NULL,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('local', 'google')),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES local_users(id) ON DELETE CASCADE
);

-- Update user_profiles to support both auth types
-- Add auth_type column to distinguish between local and OAuth users
ALTER TABLE user_profiles ADD COLUMN auth_type TEXT DEFAULT 'google' CHECK (auth_type IN ('local', 'google'));

-- Create indexes for better performance
CREATE INDEX idx_local_users_email ON local_users(email);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_profiles_auth_type ON user_profiles(auth_type);