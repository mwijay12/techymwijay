import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import CustomCursor from "@/components/ui/custom-cursor";
import ScrollProgress from "@/components/ui/scroll-progress";
import ElectronTitleBar from "@/components/layout/ElectronTitleBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mwijaytech.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#6366f1" },
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Mwijay Tech — AI Voice Studio & Developer Vault",
    template: "%s | Mwijay Tech",
  },
  description: "Personal AI productivity OS with Swahili-English voice dictation, encrypted developer vault, TZS spending tracker, todo system, and AI memory. Built by Davie Mwijay in Tanzania 🇹🇿.",
  keywords: [
    "AI voice studio Tanzania",
    "Swahili speech to text",
    "developer vault encrypted",
    "Mwijay Tech",
    "TZS spending tracker",
    "Tanzania productivity app",
    "offline AI assistant",
  ],
  authors: [{ name: "Davie Mwijay", url: APP_URL }],
  creator: "Davie Mwijay",
  publisher: "Mwijay Tech",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mwijay Tech",
  },
  openGraph: {
    type: "website",
    locale: "en_TZ",
    url: APP_URL,
    siteName: "Mwijay Tech",
    title: "Mwijay Tech — AI Voice Studio & Developer Vault",
    description: "Personal AI productivity OS with Swahili-English voice, encrypted vault, and more. Built in Tanzania 🇹🇿",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Mwijay Tech — AI Voice Studio",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mwijay Tech — AI Productivity OS",
    description: "Swahili-English voice dictation, encrypted vault, AI memory. Built in Tanzania 🇹🇿",
    images: ["/opengraph-image"],
    creator: "@mwijaytech",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mwijay Tech" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Mwijay Tech" />
        <meta name="msapplication-TileColor" content="#6366f1" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.elevenlabs.io" />
        <link rel="preconnect" href="https://api.groq.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans bg-brand-dark text-brand-text antialiased selection:bg-brand-primary/30 selection:text-white`}>
        <AuthProvider>
          <AnalyticsProvider>
            <AppProviders>
              <ElectronTitleBar />
              <CustomCursor />
              <ScrollProgress />
              <div className="noise-overlay" />
              <div className="electron-content-wrapper">
                {children}
              </div>
            </AppProviders>
          </AnalyticsProvider>
        </AuthProvider>
        <Script
          src="https://js.puter.com/v2/"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
