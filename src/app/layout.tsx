import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import { AuthProvider } from "@/contexts/AuthContext";
import CustomCursor from "@/components/ui/custom-cursor";
import ScrollProgress from "@/components/ui/scroll-progress";
import ElectronTitleBar from "@/components/layout/ElectronTitleBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mwijay Tech - Web Building, Automation & Creative Tech Solutions",
  description: "We build stunning websites, intelligent automation, and creative tech solutions. Web development, AI integration, and digital transformation services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <AppProviders>
            <ElectronTitleBar />
            <CustomCursor />
            <ScrollProgress />
            <div className="noise-overlay" />
            {/* Add top padding when running in Electron to account for title bar */}
            <div className="electron-content-wrapper">
              {children}
            </div>
          </AppProviders>
        </AuthProvider>
        <Script
          src="https://js.puter.com/v2/"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
