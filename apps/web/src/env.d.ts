// Committed, hand-written companion to the generated (and gitignored)
// `worker-configuration.d.ts`. `wrangler types` only emits the bindings
// declared in `wrangler.jsonc` (LOGO_BUCKET, DB); the auth secrets below are
// supplied via `.dev.vars` / `wrangler secret put`, so they have to be declared
// here or `env.ADMIN_EMAIL` & co. don't type-check.
//
// `env` from "cloudflare:workers" is typed as `Cloudflare.Env`, so that is the
// interface that actually has to be augmented; the bare global `Env` is
// augmented too so both spellings stay in sync.
//
// All entries are optional on purpose: none of them is guaranteed to be present
// at runtime, and the admin check in `session.server.ts` depends on being forced
// to handle the missing case (it must fail closed).

export {};

interface AuthEnv {
  ADMIN_EMAIL?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  // Password-reset emails go out through Resend (Cloudflare Email Sending
  // requires the paid Workers plan). RESEND_API_KEY comes from
  // resend.com/api-keys; EMAIL_FROM must be on a domain verified in Resend.
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

declare global {
  namespace Cloudflare {
    interface Env extends AuthEnv {}
  }

  interface Env extends AuthEnv {}
}
