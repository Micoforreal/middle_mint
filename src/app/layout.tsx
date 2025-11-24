import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider"
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Middlemint",
  description: "Trustless Freelance Bridge on Solana",
  keywords:['Web3','web3 jobs','freelance','web3 freelance','solana'],
  icons:[
    '/icon.png'
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#0f1014] text-white`}>
          <AppWalletProvider>

            <Navbar />
            <main>
              {children}
            </main>
          </AppWalletProvider>
      </body>
    </html>
  );
}
