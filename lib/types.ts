import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "patient" | "doctor" | "admin";
      specialty?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "patient" | "doctor" | "admin";
    specialty?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "patient" | "doctor" | "admin";
    specialty?: string;
  }
}
