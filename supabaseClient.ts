
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key missing in environment variables');
} else {
    console.log('Supabase Client Initializing with URL:', supabaseUrl);
    // Não logar a chave anon inteira por segurança, apenas o prefixo
    console.log('Supabase Anon Key loaded (starts with):', supabaseAnonKey.substring(0, 10));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
