import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("color-scheme");var m=document.querySelector('meta[name="color-scheme"]');if(m){m.content=(s==="light"||s==="dark")?s:"light dark";}var d=s==="dark"||(!s&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.classList.toggle("light",!d);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
