import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import "@uploadthing/react/styles.css";
import { Inter } from "next/font/google";
import "./globals.css";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} overflow-hidden`}>
        <Providers session={session}>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
