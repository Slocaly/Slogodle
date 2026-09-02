import { useMutation } from '@tanstack/react-query'
import { flushOutbox } from '../lib/progress'

// POST /api/progress/sync — flush whatever's queued in the local outbox
// (offline, a dropped request, a day just finished). Pass onSuccess to react
// to a flush landing (e.g. invalidate the cached remote progress).
export function useSyncProgressMutation(onSuccess: () => void) {
  return useMutation({
    mutationFn: flushOutbox,
    onSuccess,
  })
}
