import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing from environment variables.");
}

// Fallbacks prevent the app from immediately crashing during initialization
const url = supabaseUrl || "https://zpwafdohkujadgoavjpk.supabase.co";
const key = supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd2FmZG9oa3VqYWRnb2F2anBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMTA2NjMsImV4cCI6MjA5MDU4NjY2M30.qs4jkCPadQesGbHcwT1uklPyeDF4ooXawI2NK6T8kmc";

export const supabase = createClient(url, key);

// Expose to window for debugging and to ease the transition from window.__convex
if (typeof window !== 'undefined') {
  (window as any).__supabase = supabase;
}
