import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export default {
  fetch(request: Request): Promise<Response> {
    // TanStack Router handles URL rewriting itself, so we pass the original
    // `request` through untouched — paraglideMiddleware only needs it to
    // resolve the per-request locale (cookie -> Accept-Language -> baseLocale).
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
