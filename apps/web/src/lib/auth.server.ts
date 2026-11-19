import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { render } from "@react-email/render";
import * as schema from "./auth-schema.server";
import {
  ResetPasswordEmail,
  resetPasswordEmailSubject,
  resetPasswordEmailText,
} from "../emails/reset-password";
import { BRANDS, brand } from "../brands";
import { buildAuthOptionsFragment } from "./auth-config";

let instance: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!instance) {
    instance = betterAuth({
      // trustedOrigins + (in production) the .slogodle.com cross-subdomain cookie.
      ...buildAuthOptionsFragment(
        Object.values(BRANDS).map((b) => b.origin),
        import.meta.env.DEV,
      ),
      account: {
        accountLinking: {
          requireLocalEmailVerified: false,
        },
      },
      baseURL: env.BETTER_AUTH_URL,
      database: drizzleAdapter(drizzle(env.DB, { schema }), {
        provider: "sqlite",
        schema,
      }),
      emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }, request) => {
          const apiKey = env.RESEND_API_KEY;
          const from = env.EMAIL_FROM;
          // Read the origin off the actual incoming request rather than
          // env.BETTER_AUTH_URL — same fallback better-auth itself uses when
          // `baseURL` isn't configured, so it works whether or not that env
          // var is set (it wasn't, in production, which is why this was
          // silently failing closed before).
          const siteUrl = request
            ? new URL(request.url).origin
            : env.BETTER_AUTH_URL;
          if (!apiKey || !from || !siteUrl) {
            console.error(
              "RESEND_API_KEY or EMAIL_FROM is not set, or the site origin couldn't be determined; cannot send password reset email",
            );
            return;
          }
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${brand.name} <${from}>`,
              to: [user.email],
              subject: resetPasswordEmailSubject(),
              html: await render(
                ResetPasswordEmail({
                  url,
                  logoImageUrl: `${siteUrl}/email/slogodle-wordmark.png`,
                }),
              ),
              text: resetPasswordEmailText(url),
            }),
          });
          if (!response.ok) {
            console.error(
              "Failed to send password reset email via Resend:",
              response.status,
              await response.text(),
            );
          }
        },
      },
      secret: env.BETTER_AUTH_SECRET,
      socialProviders: {
        github: {
          // Better Auth types `clientId` as a required `string` (unlike
          // `clientSecret`), while the secret is genuinely optional at runtime
          // until the owner provisions the GitHub OAuth App — coerce rather
          // than pretend the binding is always present.
          clientId: env.GITHUB_CLIENT_ID ?? "",
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      },
    });
  }
  return instance;
}
