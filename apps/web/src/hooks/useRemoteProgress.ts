import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRemoteProgressQuery } from './useRemoteProgressQuery'
import { useClaimProgressMutation } from './useClaimProgressMutation'
import { useSyncProgressMutation } from './useSyncProgressMutation'

// Fetches D1's authoritative progress for the signed-in user. Claiming any
// anonymous rows into the account and flushing the local sync outbox both
// happen automatically (on login, on mount/reconnect); a finished game
// triggers the returned `syncProgress` directly.
export function useRemoteProgress(userId: string | undefined) {
  const queryClient = useQueryClient()

  function invalidateProgress() {
    if (userId) void queryClient.invalidateQueries({ queryKey: ['my-progress', userId] })
  }

  const { mutate: claimProgress } = useClaimProgressMutation(invalidateProgress)
  const { mutate: syncProgress } = useSyncProgressMutation(invalidateProgress)

  useEffect(() => {
    if (userId) claimProgress()
  }, [userId])

  useEffect(() => {
    syncProgress()
    window.addEventListener('online', syncProgress)
    return () => window.removeEventListener('online', syncProgress)
  }, [])

  const progressQuery = useRemoteProgressQuery(userId)

  return { data: progressQuery.data, syncProgress }
}
