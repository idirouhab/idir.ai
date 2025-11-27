import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser } from "./users-postgrest";

export const authConfig: NextAuthConfig = {
  basePath: "/api/auth",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await authenticateUser(
          credentials.email as string,
          credentials.password as string
        );

        if (!user || !user.is_active) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict', // SECURITY: Changed from 'lax' to 'strict' for CSRF protection
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: undefined, // Don't set domain to work across localhost
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, check if user exists in database
      if (account?.provider === "google" && profile?.email) {
        try {
          // Check if user exists with this email
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", profile.email)
            .single();

          if (!existingUser) {
            // Create new user for Google OAuth
            const { error } = await supabase.from("users").insert({
              email: profile.email,
              name: profile.name || profile.email.split("@")[0],
              role: "editor", // Default role for OAuth users
              is_active: true, // Auto-approve OAuth users
              password_hash: null, // No password for OAuth users
            });

            if (error) {
              console.error("Error creating OAuth user:", error);
              return false;
            }
          } else if (!existingUser.is_active) {
            // Don't allow inactive users to sign in
            return false;
          }

          return true;
        } catch (error) {
          console.error("Error in OAuth sign in:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // For Google OAuth, fetch user role from database
      if (account?.provider === "google" && token.email) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const { data: dbUser } = await supabase
            .from("users")
            .select("id, role")
            .eq("email", token.email)
            .single();

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
};
