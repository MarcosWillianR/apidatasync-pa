import { NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

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
        return {
          ...token,
          ...user,
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        firstName: token.firstName,
        lastName: token.lastName,
        email: token.email,
        accessType: token.accessType,
        birth_day: token.birth_day,
        cpf: token.cpf,
        phone: token.phone,
        credits: token.credits,
        asaasCustomerId: token.asaasCustomerId,
        token: token.token,
      }
      return session;
    },
  },
};
