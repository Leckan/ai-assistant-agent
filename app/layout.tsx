import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
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
  title: "OmniMind AI — Unified Assistant for Gmail, WhatsApp, Telegram & Outlook",
  description:
    "Connect your emails and messaging accounts. An autonomous AI agent generates executive summaries, prioritizes inbox chaos, and sets smart reminders automatically.",
  keywords: [
    "AI personal assistant",
    "Gmail AI summary",
    "WhatsApp AI assistant",
    "Telegram AI summary",
    "Outlook AI assistant",
    "AI reminders",
    "Bento grid",
    "Executive daily digest",
  ],
  authors: [{ name: "OmniMind AI" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#08090d] text-zinc-100 font-sans selection:bg-indigo-600 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
