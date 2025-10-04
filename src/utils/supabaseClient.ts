// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

class SupabaseSingleton {
  private static instance: any = null;
  
  static getInstance() {
    if (!this.instance) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
      }
      
      console.log('Creating Supabase client instance...');
      
      this.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
    }
    
    return this.instance;
  }
}

// Create and export the singleton instance
export const supabase = SupabaseSingleton.getInstance();
export default supabase;