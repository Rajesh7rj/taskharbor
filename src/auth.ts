import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authenticateUser } from "@/features/auth/server/authenticate-user";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  providers: [
    Credentials({
      name: "Email and password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      authorize: async (credentials) => {
        return authenticateUser(credentials);
      },
    }),
  ],

  callbacks: {
    authorized({ auth: session, request }) {
      const isAuthenticated = Boolean(session?.user);
      const pathname = request.nextUrl.pathname;
      const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tasks");

      if (isProtectedRoute) {
        return isAuthenticated;
      }

      if (pathname === "/login" && isAuthenticated) {
        return Response.redirect(
          new URL("/dashboard", request.nextUrl),
        );
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user && token.sub && token.role) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }

      return session;
    },
  },
});
