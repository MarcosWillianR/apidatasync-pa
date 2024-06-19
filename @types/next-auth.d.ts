import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    accessType: string;
    phone?: string;
    credits: number;
    birth_day: string;
    cpf: string;
    asaasCustomerId: string;
    token: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    accessToken?: string;
    firstName: string;
    lastName: string;
    email: string;
    accessType: string;
    phone?: string;
    credits: number;
    birth_day: string;
    cpf: string;
    asaasCustomerId: string;
    token: string;
  }
}
