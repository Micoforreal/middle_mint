import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider"
import Navbar from "@/components/Navbar";
import { EscrowProvider } from "@/lib/EscrowContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Middlemint",
  description: "Trustless Freelance Bridge on Solana",
  keywords: ['Web3', 'web3 jobs', 'freelance', 'web3 freelance', 'solana'],
  icons: [
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
        className={`font-sans bg-[#0f1014] text-white`}>
        <AppWalletProvider>
          <EscrowProvider>
            <Navbar />
            <main>
              {children}
            </main>
            <ToastContainer
              position="top-left"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </EscrowProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}
