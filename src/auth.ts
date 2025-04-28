import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prismaDB } from "./lib/connect-db";
import { verifyPassword } from "./utils/verifyPassword";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig = {
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedCredentials = credentialsSchema.safeParse(credentials);

        if (validatedCredentials.success) {
          const { email, password } = validatedCredentials.data;

          const user = await prismaDB.user.findUnique({ where: { email } });

          if (!user) return null;

          const passwordsMatch = await verifyPassword(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
              iConsent: user.iConsent,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.iConsent = user.iConsent;
        token.id = user.id;
      }

      if (trigger === "update") {
        const updatedUser = await prismaDB.user.findUnique({
          where: { id: token.id as string },
          select: { iConsent: true },
        });

        token.iConsent = updatedUser?.iConsent;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.iConsent = token.iConsent as boolean;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
