import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { isAllowlisted } from "./lib/allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return isAllowlisted(user.email);
    },
    async jwt({ token }) {
      if (token?.email) token.email = String(token.email).toLowerCase();
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
