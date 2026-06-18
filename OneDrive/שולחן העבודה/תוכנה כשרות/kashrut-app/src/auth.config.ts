import type { NextAuthConfig } from "next-auth";

// Lightweight config for Edge Runtime (no Prisma, no Node.js APIs).
// Used by the proxy middleware. Full config with DB adapter is in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
