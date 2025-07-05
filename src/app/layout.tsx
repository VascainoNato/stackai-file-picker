import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { SWRProvider } from "./components/ui/SWRWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Stack AI - Indexer",
  description: "Indexer for Stack AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${roboto.variable} 
          antialiased
        `}
        style={{ fontFamily: "var(--font-roboto), var(--font-geist-sans), var(--font-geist-mono), sans-serif" }}
      >
        <SWRProvider>
          {children}
        </SWRProvider>
      </body>
    </html>
  );
}