import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

interface AccessContextValue {
  hasFullAccess: boolean
  subscriptionStatus: string
  loading: boolean
  refresh: () => Promise<void>
}

const AccessContext = createContext<AccessContextValue | null>(null)

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [hasOverride, setHasOverride] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState('NONE')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setHasOverride(false)
      setSubscriptionStatus('NONE')
      setLoading(false)
      return
    }
    setLoading(true)
    const [{ data: profile }, { data: sub }] = await Promise.all([
      supabase.from('profiles').select('has_full_access_override').eq('id', user.id).maybeSingle(),
      supabase.from('subscriptions').select('status').eq('user_id', user.id).maybeSingle(),
    ])
    setHasOverride(profile?.has_full_access_override ?? false)
    setSubscriptionStatus(sub?.status ?? 'NONE')
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Keep access in sync live when the square-webhook function updates this
  // user's subscription row (e.g. a renewal, failed payment, or cancellation).
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`subscriptions-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` },
        () => refresh()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refresh])

  const hasFullAccess = hasOverride || subscriptionStatus === 'ACTIVE'

  return (
    <AccessContext.Provider value={{ hasFullAccess, subscriptionStatus, loading, refresh }}>
      {children}
    </AccessContext.Provider>
  )
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}
