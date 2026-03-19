import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar se as variáveis de ambiente estão configuradas
const isConfigured = supabaseUrl && supabaseAnonKey && 
                    supabaseUrl !== '' && 
                    supabaseAnonKey !== '' &&
                    !supabaseUrl.includes('placeholder');

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

// Função para verificar conexão com Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!isConfigured) {
    console.warn('⚠️ Supabase não configurado. Usando localStorage.');
    return false;
  }
  
  try {
    const { error } = await supabase.from('clientes').select('count').limit(1);
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return false;
    }
    console.log('✅ Conectado ao Supabase com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro de conexão:', err);
    return false;
  }
}

// Função para verificar se deve usar localStorage ou Supabase
export function useSupabase(): boolean {
  return isConfigured;
}

export { isConfigured };
