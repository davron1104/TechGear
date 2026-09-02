import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAccountRoute =
        nextUrl.pathname.startsWith("/account") ||
        /^\/(ru|uz|en)\/account/.test(nextUrl.pathname);

      if (isAdminRoute) {
        return isLoggedIn && auth?.user?.role === "ADMIN";
      }
      if (isAccountRoute) {
        return isLoggedIn;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as any;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Empty here, added in Node.js auth.ts
} satisfies NextAuthConfig;
