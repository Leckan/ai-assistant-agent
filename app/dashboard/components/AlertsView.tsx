"use client";

import React, { useState } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Trash2,
  Filter,
  Check,
} from "lucide-react";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  source: string;
  time: string;
  severity: "urgent" | "warning" | "success" | "info";
  iconBg: string;
  isRead: boolean;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "1",
    title: "Urgent: Unsigned Advisory Agreement",
    description: "Mark from Benchmark Capital requested your signature on Section 4B before noon.",
    source: "Gmail (VIP)",
    time: "12m ago",
    severity: "urgent",
    iconBg: "bg-rose-600",
    isRead: false,
  },
  {
    id: "2",
    title: "Sent.dm SMS Gateway Auto-Reload",
    description: "Your SMS balance dipped below $10.00. Automatic reload of $50 succeeded.",
    source: "Sent.dm Gateway",
    time: "1h ago",
    severity: "success",
    iconBg: "bg-emerald-600",
    isRead: false,
  },
  {
    id: "3",
    title: "Potential Calendar Conflict Detected",
    description: "Investor Q&A overlaps with Team Sync by 15 minutes. AI suggested a 15m delay.",
    source: "Google Calendar",
    time: "3h ago",
    severity: "warning",
    iconBg: "bg-amber-600",
    isRead: false,
  },
  {
    id: "4",
    title: "New WhatsApp Channel Connected",
    description: "Sent.dm verified inbound webhook for +1 (555) 019-2831.",
    source: "WhatsApp Integration",
    time: "Yesterday",
    severity: "info",
    iconBg: "bg-blue-600",
    isRead: true,
  },
];

export default function AlertsView() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Large Solid Rose Icon */}
            <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 shrink-0">
              <Bell className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  System Alerts & VIP Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Real-time escalation rules for high-priority messages, webhooks, and billing events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((item) => (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              item.isRead
                ? "bg-[#0c0e17]/60 border-white/[0.04] opacity-80"
                : "glass-panel border-white/[0.08] hover:border-white/[0.16]"
            }`}
          >
            {/* Large Solid-Colored Icon Badge */}
            <div
              className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center text-white shrink-0 shadow-md`}
            >
              {item.severity === "urgent" && <ShieldAlert className="w-6 h-6 stroke-[2]" />}
              {item.severity === "warning" && <AlertTriangle className="w-6 h-6 stroke-[2]" />}
              {item.severity === "success" && <CheckCircle2 className="w-6 h-6 stroke-[2]" />}
              {item.severity === "info" && <Info className="w-6 h-6 stroke-[2]" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/[0.06] text-zinc-400">
                  Source: {item.source}
                </span>
              </div>
            </div>

            <button
              onClick={() => removeAlert(item.id)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete alert"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
