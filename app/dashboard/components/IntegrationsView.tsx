"use client";

import React, { useState } from "react";
import { Layers } from "lucide-react";

interface ChannelIntegration {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  category: "Email" | "Chat" | "Messaging" | "Workspace";
  iconBg: string;
  iconLetter: string;
  lastSynced: string;
}

const INITIAL_INTEGRATIONS: ChannelIntegration[] = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Google Workspace & personal Gmail inbox integration with OAuth 2.0",
    status: "connected",
    category: "Email",
    iconBg: "bg-red-600",
    iconLetter: "M",
    lastSynced: "2 mins ago",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Sent.dm webhook integration for 2-way AI assistant WhatsApp chat",
    status: "connected",
    category: "Chat",
    iconBg: "bg-emerald-600",
    iconLetter: "W",
    lastSynced: "Just now",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    description: "Bot token bridge with instant command execution and summaries",
    status: "connected",
    category: "Chat",
    iconBg: "bg-sky-600",
    iconLetter: "TG",
    lastSynced: "5 mins ago",
  },
  {
    id: "sentdm",
    name: "Sent.dm SMS & WhatsApp Gateway",
    description: "Carrier-grade transactional OTP and conversational AI delivery engine",
    status: "connected",
    category: "Messaging",
    iconBg: "bg-indigo-600",
    iconLetter: "S",
    lastSynced: "Active",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Office 365 Exchange and Microsoft Graph calendar & mail synchronization",
    status: "disconnected",
    category: "Email",
    iconBg: "bg-blue-600",
    iconLetter: "O",
    lastSynced: "Never",
  },
  {
    id: "slack",
    name: "Slack Workspace",
    description: "Incoming webhooks and slash commands for team updates and digests",
    status: "disconnected",
    category: "Workspace",
    iconBg: "bg-purple-600",
    iconLetter: "#",
    lastSynced: "Never",
  },
  {
    id: "notion",
    name: "Notion Knowledge Base",
    description: "Automatically log briefing takeaways and action items into Notion databases",
    status: "disconnected",
    category: "Workspace",
    iconBg: "bg-neutral-800",
    iconLetter: "N",
    lastSynced: "Never",
  },
];

export default function IntegrationsView() {
  const [integrations, setIntegrations] = useState<ChannelIntegration[]>(INITIAL_INTEGRATIONS);

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "connected" ? "disconnected" : "connected",
              lastSynced: item.status === "connected" ? "Disconnected" : "Just now",
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Large Solid Emerald Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 shrink-0">
              <Layers className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Connected Integrations
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  4 Active Channels
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                OmniMind connects into your communication channels without replacing existing apps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid with Large Solid-Colored Brand Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between hover:border-indigo-500/30 dark:hover:border-white/[0.16] transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                {/* Large Solid-Colored Icon Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-slate-900/15 dark:shadow-black/40 group-hover:scale-105 transition-transform`}
                >
                  {item.iconLetter}
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-mono rounded border uppercase ${
                    item.status === "connected"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-zinc-800/80 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">
                Synced: {item.lastSynced}
              </span>
              <button
                onClick={() => toggleConnection(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  item.status === "connected"
                    ? "bg-slate-100 hover:bg-rose-50 dark:bg-white/[0.06] dark:hover:bg-rose-500/20 text-slate-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-white/[0.08]"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                }`}
              >
                {item.status === "connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
