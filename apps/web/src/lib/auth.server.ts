import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./auth-schema.server";

let instance: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!instance) {
    instance = betterAuth({
      database: drizzleAdapter(drizzle(env.DB, { schema }), {
        provider: "sqlite",
        schema,
      }),
      emailAndPassword: { enabled: true },
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
