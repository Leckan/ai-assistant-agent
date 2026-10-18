import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import IntegrationsView from "@/app/dashboard/components/IntegrationsView";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations & MCP Platforms — OmniMind AI",
  description:
    "Connect Gmail, WhatsApp, Slack, Outlook, Discord, LinkedIn, Telegram, and developer tools via Model Context Protocol (MCP) servers.",
};

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-zinc-100 selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Open in Dashboard</span>
          </Link>
        </div>

        {/* Integrations View */}
        <IntegrationsView />
      </main>

      <Footer />
    </div>
  );
}
