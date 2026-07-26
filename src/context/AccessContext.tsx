import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { extractFunctionError } from '../lib/functionError'

interface AccessContextValue {
  hasFullAccess: boolean
  subscriptionStatus: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  loading: boolean
  refresh: () => Promise<void>
  cancelSubscription: () => Promise<{ error: string | null }>
}

const AccessContext = createContext<AccessContextValue | null>(null)

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [hasOverride, setHasOverride] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState('NONE')
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setHasOverride(false)
      setSubscriptionStatus('NONE')
      setCancelAtPeriodEnd(false)
      setCurrentPeriodEnd(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const [{ data: profile }, { data: sub }] = await Promise.all([
      supabase.from('profiles').select('has_full_access_override').eq('id', user.id).maybeSingle(),
      supabase
        .from('subscriptions')
        .select('status, cancel_at_period_end, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])
    setHasOverride(profile?.has_full_access_override ?? false)
    setSubscriptionStatus(sub?.status ?? 'NONE')
    setCancelAtPeriodEnd(sub?.cancel_at_period_end ?? false)
    setCurrentPeriodEnd(sub?.current_period_end ?? null)
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

  const cancelSubscription = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke('cancel-subscription')
    if (error) {
      return { error: await extractFunctionError(error, 'Cancellation failed') }
    }
    if (data?.error) {
      return { error: data.error as string }
    }
    await refresh()
    return { error: null }
  }, [refresh])

  const hasFullAccess = hasOverride || subscriptionStatus === 'ACTIVE'

  return (
    <AccessContext.Provider
      value={{
        hasFullAccess,
        subscriptionStatus,
        cancelAtPeriodEnd,
        currentPeriodEnd,
        loading,
        refresh,
        cancelSubscription,
      }}
    >
      {children}
    </AccessContext.Provider>
  )
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}
