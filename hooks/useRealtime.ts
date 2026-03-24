import { useEffect, useState } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtime<T extends { id: string | number }>(
  table: string,
  initialData: T[] = [],
  callback?: (payload: any) => void
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // 1. Fetch inicial
    const fetchData = async () => {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && result) {
        setData(result);
      }
      setLoading(false);
    };

    fetchData();

    // 2. Inscrição Realtime
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload) => {
          console.log(`Realtime change in ${table}:`, payload);
          
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new as T, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                item.id === (payload.new as T).id ? (payload.new as T) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter((item) => item.id !== (payload.old as T).id)
            );
          }

          if (callback) callback(payload);
        }
      )
      .subscribe();

    // 3. Sincronização entre abas em modo Local (localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `azevedo_${table}` && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch (err) {
          console.error(`Erro ao sincronizar aba para ${table}:`, err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [table]);

  return { data, setData, loading };
}
