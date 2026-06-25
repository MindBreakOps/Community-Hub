import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The supabase client constructor automatically appends /rest/v1 to the URL
export const supabase = createClient(supabaseUrl, supabaseAnonKey);