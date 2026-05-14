/*
  # Add Subscriptions and User Preferences

  ## New Tables
  
  ### `subscriptions`
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, references auth.users)
  - `plan_type` (text: 'free', 'plus')
  - `status` (text: 'active', 'cancelled', 'expired')
  - `started_at` (timestamptz)
  - `expires_at` (timestamptz)
  - `created_at` (timestamptz, auto-generated)
  
  ### `user_preferences`
  - `id` (uuid, primary key, references auth.users)
  - `theme` (text: 'dark', 'light', default 'dark')
  - `language` (text: 'en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', default 'en')
  - `notifications_enabled` (boolean, default true)
  - `created_at` (timestamptz, auto-generated)
  - `updated_at` (timestamptz, auto-generated)
  
  ## Security
  - Enable RLS on all new tables
  - Users can only access their own subscription data
  - Users can only access and update their own preferences
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'plus')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'zh', 'ja', 'ar')),
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger for user_preferences updated_at
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Insert default subscription for existing users
INSERT INTO subscriptions (user_id, plan_type, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Insert default preferences for existing users
INSERT INTO user_preferences (id, theme, language)
SELECT id, 'dark', 'en'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_preferences)
ON CONFLICT (id) DO NOTHING;
