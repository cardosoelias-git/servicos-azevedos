import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseAnonKey && 
                    supabaseUrl !== '' && 
                    supabaseAnonKey !== '' &&
                    !supabaseUrl.includes('placeholder') &&
                    supabaseUrl.includes('supabase.co');

export const supabase: SupabaseClient = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-application-name': 'servicos-azevedo',
        },
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder');

export async function checkSupabaseConnection(): Promise<{ success: boolean; message?: string }> {
  if (!isConfigured) {
    return { success: false, message: 'Supabase não configurado no .env.local' };
  }
  
  try {
    const { error } = await supabase.from('clientes').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('❌ Erro de conexão:', err);
    return { success: false, message: err.message || 'Erro de rede ou DNS' };
  }
}

export function useSupabase(): boolean {
  return Boolean(isConfigured);
}

export { isConfigured };
