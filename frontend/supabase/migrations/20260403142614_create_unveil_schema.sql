/*
  # Unveil Platform Database Schema

  ## Overview
  This migration sets up the complete database schema for the Unveil AI-content detection platform.

  ## New Tables
  
  ### `user_profiles`
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text, required)
  - `gender` (text, required)
  - `age` (integer, required)
  - `created_at` (timestamptz, auto-generated)
  - `updated_at` (timestamptz, auto-generated)
  
  ### `analysis_history`
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, references auth.users)
  - `media_type` (text: 'text', 'image', 'video', 'audio')
  - `content` (text, stores text content or file path)
  - `result_status` (text: 'LOW', 'MEDIUM', 'HIGH', 'AUTHENTIC', 'SUSPICIOUS', 'SYNTHETIC')
  - `confidence_score` (numeric, 0-100)
  - `explanation` (text, detailed analysis explanation)
  - `metadata` (jsonb, stores additional metadata)
  - `created_at` (timestamptz, auto-generated)
  
  ## Security
  - Enable RLS on all tables
  - Users can only access their own profile data
  - Users can only access their own analysis history
  - Authenticated users can insert their own records
  - Users can update their own profiles
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  gender text NOT NULL,
  age integer NOT NULL CHECK (age >= 13 AND age <= 120),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analysis_history table
CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('text', 'image', 'video', 'audio')),
  content text NOT NULL,
  result_status text NOT NULL,
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  explanation text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for analysis_history
CREATE POLICY "Users can view own analysis history"
  ON analysis_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis"
  ON analysis_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_media_type ON analysis_history(media_type);
