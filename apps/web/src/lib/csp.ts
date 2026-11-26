import type { Brand } from "../brands";

export function buildCsp(brand: Brand): string {
  return [
    "default-src 'self'",
    // TanStack Start injects per-request inline <script> tags for SSR/hydration
    // data, so a hash or static nonce can't cover them — 'unsafe-inline' is the
    // pragmatic tradeoff here.
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Sticker logos are drawn on a canvas and shown as data: URLs.
    brand.stickerLogos ? "img-src 'self' data:" : "img-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
