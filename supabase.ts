
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: The app will not work without these variables.
// You can get these from your Supabase project settings > API
const supabaseUrl = process.env.SUPABASE_URL || 'https://eokcpibwuobyzyuzdwwi.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva2NwaWJ3dW9ieXp5dXpkd3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMDc3MzksImV4cCI6MjA3ODU4MzczOX0.sUIEx3bqOLfizSmgYHKOpTQnIlCtT-4fJW9VU-pjUNk';

const isSupabaseConfigured = supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
