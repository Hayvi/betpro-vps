-- BetPro VPS Database Schema
-- Run this on your PostgreSQL instance

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Role enum
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'sub_admin', 'user');

-- Profiles (users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plain_pw TEXT,
  role app_role NOT NULL,
  created_by UUID REFERENCES profiles(id),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_by ON profiles(created_by);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('transfer', 'credit', 'debit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  target_user_id UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_requester ON withdrawal_requests(requester_id);
CREATE INDEX idx_withdrawal_requests_target ON withdrawal_requests(target_user_id);

-- Bet slips
CREATE TABLE bet_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  total_stake NUMERIC(12,2) NOT NULL,
  accumulator_odds NUMERIC(10,4),
  potential_win NUMERIC(12,2),
  promo_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bet_slips_user ON bet_slips(user_id);
CREATE INDEX idx_bet_slips_status ON bet_slips(status);

-- Individual bets
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  match_id TEXT,
  bet_type TEXT,
  odds NUMERIC(10,4) NOT NULL,
  stake NUMERIC(12,2) NOT NULL,
  potential_win NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_created_at ON bets(created_at DESC);

-- Presence sessions
CREATE TABLE presence_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  UNIQUE(user_id, session_id)
);

CREATE INDEX idx_presence_sessions_last_seen ON presence_sessions(last_seen_at);
CREATE INDEX idx_presence_sessions_ended ON presence_sessions(ended_at);

-- Presence history (archived sessions)
CREATE TABLE presence_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  started_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_presence_history_user ON presence_history(user_id, started_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create initial super admin (password: changeme123)
-- Hash generated with: SELECT crypt('changeme123', gen_salt('bf'));
INSERT INTO profiles (username, password_hash, plain_pw, role, balance)
VALUES (
  'root_admin',
  '$2a$06$rKh8XQ8Y8Y8Y8Y8Y8Y8Y8.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'changeme123',
  'super_admin',
  0
);

-- NOTE: Generate a real bcrypt hash for production!
-- You can use: node -e "console.log(require('bcrypt').hashSync('yourpassword', 10))"
