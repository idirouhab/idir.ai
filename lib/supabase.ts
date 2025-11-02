import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for the live event data (v3 schema - single title + language)
export type LiveEventData = {
  id?: number;
  is_active: boolean;
  title: string;
  event_language: string;
  event_datetime: string;
  timezone: string;
  platform: string;
  platform_url: string;
  created_at?: string;
  updated_at?: string;
};
