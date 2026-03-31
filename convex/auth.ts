import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { ResendOTP } from "./ResendOTP";

const providers: any[] = [Password({ verify: ResendOTP })];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
} else {
  console.warn(
    "Skipping Google provider: AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET not set.",
  );
}

let _authInit: any;
try {
  _authInit = convexAuth({
    providers,
    callbacks: {
      async redirect({ redirectTo }) {
        if (
          typeof redirectTo === "string" &&
          redirectTo.includes(".vercel.app/")
        ) {
          return redirectTo;
        }

        const siteEnv =
          process.env.SITE_URL ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : undefined);

        if (!siteEnv) {
          if (!redirectTo || redirectTo === "/") return "/";
          if (
            redirectTo.startsWith("http://") ||
            redirectTo.startsWith("https://") ||
            redirectTo.startsWith("?") ||
            redirectTo.startsWith("/")
          ) {
            return redirectTo;
          }
          console.warn(
            `No SITE_URL configured; rejecting redirectTo=${redirectTo}`,
          );
          return "/";
        }

        const baseUrl = siteEnv.replace(/\/$/, "");

        // Build a set of allowed origins based on the configured SITE_URL.
        // Accept both the `www` and non-`www` variants so users who visit
        // either https://arcbase.one or https://www.arcbase.one will be
        // accepted when SITE_URL is set to one of them.
        const allowedOrigins = new Set<string>();
        try {
          const parsedBase = new URL(baseUrl);
          const hostNoWww = parsedBase.hostname.replace(/^www\./i, "");
          // base origin as configured
          allowedOrigins.add(parsedBase.origin);
          // non-www
          allowedOrigins.add(`${parsedBase.protocol}//${hostNoWww}`);
          // www
          allowedOrigins.add(`${parsedBase.protocol}//www.${hostNoWww}`);
        } catch (e) {
          // If URL parsing fails, fall back to simple string checks
          allowedOrigins.add(baseUrl);
        }

        if (
          typeof redirectTo === "string" &&
          (redirectTo.startsWith("?") || redirectTo.startsWith("/"))
        ) {
          return `${baseUrl}${redirectTo}`;
        }

        if (
          typeof redirectTo === "string" &&
          (redirectTo.startsWith("http://") ||
            redirectTo.startsWith("https://"))
        ) {
          try {
            const parsed = new URL(redirectTo);
            if (allowedOrigins.has(parsed.origin)) {
              return redirectTo;
            }
          } catch (e) {
            // fall through to error below
          }
        }

        throw new Error(`Invalid redirect: ${redirectTo}`);
      },
    },
  });
} catch (e) {
  console.error("convexAuth initialization failed:", e);
  _authInit = {
    // Provide a safe no-op `auth` with `addHttpRoutes` so imports that
    // call `auth.addHttpRoutes(...)` (e.g. convex/http.ts) don't throw.
    auth: {
      addHttpRoutes: (_router: any) => {
        console.warn("auth.addHttpRoutes noop: auth not initialized");
      },
    },
    signIn: async () => {
      throw new Error("Auth not initialized");
    },
    signOut: async () => {
      throw new Error("Auth not initialized");
    },
    store: undefined,
  };
}

export const { auth, signIn, signOut, store } = _authInit;
