"use client";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { ProductProvider } from "@/hooks/useProduct";
import { SupplierProvider } from "@/hooks/useSupplier";
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "ApiDataSync - Dashboard",
// };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupplierProvider>
      <ProductProvider>
        <Header />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="w-full pt-16">{children}</main>
        </div>
      </ProductProvider>
    </SupplierProvider>
  );
}
