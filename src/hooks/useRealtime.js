import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function useRealtime(table, filter, onEvent) {
  useEffect(() => {
    const config = { event: '*', schema: 'public', table }
    if (filter) config.filter = filter

    const channel = supabase
      .channel(`realtime:${table}${filter ? `:${filter}` : ''}`)
      .on('postgres_changes', config, onEvent)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, filter]) // eslint-disable-line react-hooks/exhaustive-deps
}
