import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'
import { paraglideMiddleware } from './paraglide/server.js'
import { getAuth } from './lib/auth.server'

const LOGO_KEY_PATTERN = /^\/api\/logos\/([^/]+)$/

async function serveLogoIcon(key: string): Promise<Response> {
  const object = await env.LOGO_BUCKET.get(key)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }
  return new Response(object.body, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export default {
  fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const match = url.pathname.match(LOGO_KEY_PATTERN)
    if (match) {
      return serveLogoIcon(match[1])
    }
    if (url.pathname.startsWith('/api/auth/')) {
      return getAuth().handler(request)
    }
    // TanStack Router handles URL rewriting itself, so we pass the original
    // `request` through untouched — paraglideMiddleware only needs it to
    // resolve the per-request locale (cookie -> Accept-Language -> baseLocale).
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
