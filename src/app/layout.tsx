import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stateai.in"),
  title: {
    template: "%s | State AI",
    default: "State AI - Transforming Ideas into AI-Powered Solutions",
  },
  description:
    "State AI is a leading AI development company delivering cutting-edge artificial intelligence, machine learning, and generative AI solutions for businesses worldwide.",
  keywords: [
    "AI development",
    "machine learning",
    "artificial intelligence",
    "generative AI",
    "AI consulting",
    "deep learning",
    "NLP",
    "computer vision",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://stateai.in",
    title: "State AI - Transforming Ideas into AI-Powered Solutions",
    description: "State AI is a leading AI development company delivering cutting-edge artificial intelligence, machine learning, and generative AI solutions for businesses worldwide.",
    siteName: "State AI",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "State AI - Transforming Ideas into AI-Powered Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "State AI - Transforming Ideas into AI-Powered Solutions",
    description: "State AI is a leading AI development company delivering cutting-edge artificial intelligence, machine learning, and generative AI solutions for businesses worldwide.",
    images: ["/assets/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "State AI",
              url: "https://stateai.in",
              logo: "https://stateai.in/icon.png",
              description: "Leading AI development company delivering cutting-edge artificial intelligence solutions.",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}