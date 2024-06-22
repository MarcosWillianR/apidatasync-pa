"use client";
import React from "react";
import ThemeProvider from "./ThemeToggle/theme-provider";
import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { SupplierProvider } from "@/hooks/useSupplier";
import { ProductProvider } from "@/hooks/useProduct";
export default function Providers({
  session,
  children,
}: {
  session: SessionProviderProps["session"];
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <SupplierProvider>
          <ProductProvider>{children}</ProductProvider>
        </SupplierProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
