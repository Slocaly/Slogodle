import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";

let instance: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!instance) {
    instance = betterAuth({
      database: drizzleAdapter(drizzle(env.DB), { provider: "sqlite" }),
      emailAndPassword: { enabled: true },
      socialProviders: {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      },
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
    });
  }
  return instance;
}
