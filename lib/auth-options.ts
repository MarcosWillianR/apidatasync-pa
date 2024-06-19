import { NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

import api from "@/services/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      credentials: {
        email: {
          label: "email",
          type: "email",
          placeholder: "example@gmail.com",
        },
        password: {
          label: "password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const response = await res.json();

        if (res.ok && response) {
          return { ...response.user, token: response.token };
        } else {
          throw new Error(
            response.message || "Houve um problema ao tentar realizar o login.",
          );
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.accessType = user.accessType;
        token.birth_day = user.birth_day;
        token.cpf = user.cpf;
        token.phone = user.phone;
        token.credits = user.credits;
        token.asaasCustomerId = user.asaasCustomerId;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.email = token.email;
      session.user.accessType = token.accessType;
      session.user.birth_day = token.birth_day;
      session.user.cpf = token.cpf;
      session.user.phone = token.phone;
      session.user.credits = token.credits;
      session.user.asaasCustomerId = token.asaasCustomerId;
      session.user.token = token.token;
      return session;
    },
  },
};
