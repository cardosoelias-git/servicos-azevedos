import { useEffect, useState } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';

export function useRealtimeItem<T extends { id: string | number }>(
  table: string,
  id: string | number,
  initialData?: T
) {
  const [item, setItem] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error);
      } else {
        setItem(data);
      }
      setLoading(false);
    };

    if (!initialData) {
      fetchItem();
    }

    const channel = supabase
      .channel(`public:${table}:id=eq.${id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log(`Realtime change in ${table} for ID ${id}:`, payload);
          
          if (payload.eventType === 'UPDATE') {
            setItem(payload.new as T);
          } else if (payload.eventType === 'DELETE') {
            setItem(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, id]);

  return { item, setItem, loading, error };
}
