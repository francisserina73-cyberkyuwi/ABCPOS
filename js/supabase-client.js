/**
 * Supabase Client Initialization
 * Import this in every file that needs to access Supabase
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to check if Supabase is configured
export function isSupabaseConfigured() {
  return SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
         SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error) {
  console.error('Supabase Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export default supabase;

