import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  full_name: string;
  gender: string;
  age: number;
  created_at: string;
  updated_at: string;
};

export type AnalysisHistory = {
  id: string;
  user_id: string;
  media_type: 'text' | 'image' | 'video' | 'audio';
  content: string;
  result_status: string;
  confidence_score: number;
  explanation: string;
  metadata: Record<string, unknown>;
  created_at: string;
};
