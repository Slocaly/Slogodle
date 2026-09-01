import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { render } from "@react-email/render";
import * as schema from "./auth-schema.server";
import { ResetPasswordEmail } from "../emails/reset-password";

// Plain-text is written by hand rather than derived from the React template
// via `render(..., { plainText: true })`: that path pulls in html-to-text on
// top of the React render, doubling the work for every reset email — not
// worth it for a one-paragraph message on Workers' free-plan CPU budget.
function resetPasswordEmailText(url: string): string {
  return `Reset your Slogodle password: ${url}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`;
}

let instance: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!instance) {
    instance = betterAuth({
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
              from: `Slogodle <${from}>`,
              to: [user.email],
              subject: "Reset your Slogodle password",
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
      account: {
        accountLinking: {
          requireLocalEmailVerified: false,
        },
      },
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
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
    });
  }
  return instance;
}
