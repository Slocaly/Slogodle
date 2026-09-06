import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'
import { paraglideMiddleware } from './paraglide/server.js'
import { getAuth } from './lib/auth.server'
import { claimAnon, myProgress, syncDay } from './lib/progress.server'

const LOGO_KEY_PATTERN = /^\/api\/logos\/([^/]+)$/

// Vite's dev server injects HMR client scripts and style tags inline, so a
// strict CSP is only safe to send for the production build — Observatory
// only ever scans the deployed site anyway.
const CSP = [
  "default-src 'self'",
  // TanStack Start injects per-request inline <script> tags for SSR/hydration
  // data, so a hash or static nonce can't cover them — 'unsafe-inline' is the
  // pragmatic tradeoff here.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (!import.meta.env.DEV) {
    headers.set('Content-Security-Policy', CSP)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

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

async function handleProgressSync(request: Request): Promise<Response> {
  let body: { anonId: string; dayIndex: number; guesses: string[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'malformed request body' }, { status: 400 })
  }
  const result = await syncDay(request.headers, body)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}

async function handleProgressClaim(request: Request): Promise<Response> {
  let body: { anonId: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'malformed request body' }, { status: 400 })
  }
  const result = await claimAnon(request.headers, body.anonId)
  return Response.json(result, { status: result.ok ? 200 : 401 })
}

async function handleProgressMine(request: Request): Promise<Response> {
  const progress = await myProgress(request.headers)
  if (progress === null) {
    return Response.json({ error: 'not authenticated' }, { status: 401 })
  }
  return Response.json(progress)
}

async function route(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const match = url.pathname.match(LOGO_KEY_PATTERN)
  if (match) {
    return serveLogoIcon(match[1])
  }
  if (url.pathname.startsWith('/api/auth/')) {
    return getAuth().handler(request)
  }
  if (url.pathname === '/api/progress/sync' && request.method === 'POST') {
    return handleProgressSync(request)
  }
  if (url.pathname === '/api/progress/claim' && request.method === 'POST') {
    return handleProgressClaim(request)
  }
  if (url.pathname === '/api/progress/mine' && request.method === 'GET') {
    return handleProgressMine(request)
  }
  // TanStack Router handles URL rewriting itself, so we pass the original
  // `request` through untouched — paraglideMiddleware only needs it to
  // resolve the per-request locale (cookie -> Accept-Language -> baseLocale).
  return paraglideMiddleware(request, () => handler.fetch(request))
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }
    return withSecurityHeaders(await route(request))
  },
}
