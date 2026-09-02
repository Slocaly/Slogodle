import { useQuery } from '@tanstack/react-query'
import { fetchMyProgress } from '../lib/progress'

// Never refetches on its own — only a successful claim or sync invalidates
// it (see useClaimProgressMutation / useSyncProgressMutation).
export function useRemoteProgressQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-progress', userId],
    queryFn: () => fetchMyProgress(),
    enabled: !!userId,
    staleTime: Infinity,
  })
}
