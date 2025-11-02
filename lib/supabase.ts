import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for the live event data
export type LiveEventData = {
  id?: number;
  is_active: boolean;
  en_title: string;
  en_date: string;
  en_time: string;
  en_platform: string;
  en_platform_url: string;
  es_title: string;
  es_date: string;
  es_time: string;
  es_platform: string;
  es_platform_url: string;
  updated_at?: string;
};
