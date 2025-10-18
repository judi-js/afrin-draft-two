import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import { authConfig } from "./auth.config";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Fetch user by ID instead of email
async function getUser(id: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`
      SELECT u.*, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ${id};
    `;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ id: z.string().uuid(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { id, password } = parsedCredentials.data;

          const user = await getUser(id);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
