import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { ResendOTP } from "./ResendOTP";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({ verify: ResendOTP }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      if (redirectTo.includes(".vercel.app/")) {
        return redirectTo;
      }

      const baseUrl = process.env.SITE_URL!.replace(/\/$/, "");
      const wwwBaseUrl = baseUrl.replace("https://", "https://www.");

      if (redirectTo.startsWith("?") || redirectTo.startsWith("/")) {
        return `${baseUrl}${redirectTo}`;
      }
      if (redirectTo.startsWith(baseUrl) || redirectTo.startsWith(wwwBaseUrl)) {
        return redirectTo;
      }
      throw new Error(`Invalid redirect: ${redirectTo}`);
    }
  }
});
