import { useMutation } from '@tanstack/react-query'
import { claimProgress } from '../lib/progress'

// POST /api/progress/claim — best-effort; moves any anonymous rows into the
// account. Pass onSuccess to react to the claim landing (e.g. invalidate the
// cached remote progress so it re-reads D1 with those rows included).
export function useClaimProgressMutation(onSuccess: () => void) {
  return useMutation({
    mutationFn: claimProgress,
    onSuccess,
  })
}
