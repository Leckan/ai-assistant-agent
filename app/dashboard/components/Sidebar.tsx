"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Layers,
  Bell,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from "lucide-react";

export type NavTabId =
  | "dashboard"
  | "ai-agent"
  | "briefing"
  | "integrations"
  | "alerts"
  | "settings"
  | "pricing";

export interface NavItem {
  id: NavTabId;
  label: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
  iconBg: string; // Solid-colored background class or hex
  shadowColor: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "System overview & stats",
    badge: "Live",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: LayoutDashboard,
    iconBg: "bg-blue-600",
    shadowColor: "shadow-blue-600/30",
  },
  {
    id: "ai-agent",
    label: "AI Agent",
    description: "Autonomous task engine",
    badge: "Active",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    icon: Bot,
    iconBg: "bg-violet-600",
    shadowColor: "shadow-violet-600/30",
  },
  {
    id: "briefing",
    label: "Briefing",
    description: "Daily intelligence digest",
    badge: "New",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: FileText,
    iconBg: "bg-amber-600",
    shadowColor: "shadow-amber-600/30",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Channels & connections",
    badge: "4 active",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: Layers,
    iconBg: "bg-emerald-600",
    shadowColor: "shadow-emerald-600/30",
  },
  {
    id: "alerts",
    label: "Alerts",
    description: "Urgent notifications",
    badge: "3 unread",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    icon: Bell,
    iconBg: "bg-rose-600",
    shadowColor: "shadow-rose-600/30",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Account & preferences",
    icon: Settings,
    iconBg: "bg-slate-600",
    shadowColor: "shadow-slate-600/30",
  },
];

export const PRICING_NAV_ITEM: NavItem = {
  id: "pricing",
  label: "Pricing Settings",
  description: "Subscription & billing",
  badge: "Pro",
  badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  icon: CreditCard,
  iconBg: "bg-pink-600",
  shadowColor: "shadow-pink-600/30",
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: NavTabId;
  onSelectTab: (id: NavTabId) => void;
  userName?: string;
  userEmailOrPhone?: string;
  avatarUrl?: string;
  onSignOut?: () => void;
}

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  userName = "Alex Mercer",
  userEmailOrPhone = "alex@omnimind.ai",
  avatarUrl,
  onSignOut,
}: SidebarProps) {
  return (
    <aside
      className={`relative z-30 flex flex-col h-screen bg-[#0d0f18] border-r border-white/[0.08] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-20" : "w-72"
      }`}
      aria-label="Sidebar navigation"
    >
      {/* Top Header: Logo + App Name + Collapse Toggle */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-white/[0.08]">
        <Link
          href="/"
          className={`flex items-center gap-3 overflow-hidden group ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
          title="OmniMind Home"
        >
          {/* Large Logo Icon with solid-colored gradient/background */}
          <div className="relative shrink-0 w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#0a0c14] rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d0f18]" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  Omni<span className="text-indigo-400">Mind</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 truncate">
                Autonomous Assistant
              </span>
            </div>
          )}
        </Link>

        {/* Collapse / Expand toggle button (visible when expanded) */}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors"
            title="Collapse sidebar (Ctrl+B)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Main Navigation
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                6 modules
              </span>
            </div>
          )}

          <nav className="space-y-1.5" aria-label="Main menu">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3.5 rounded-xl transition-all duration-200 text-left ${
                      isCollapsed
                        ? "justify-center p-2.5"
                        : "px-3 py-2.5"
                    } ${
                      isActive
                        ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    {/* Large Icon with Solid-Colored Background */}
                    <div
                      className={`shrink-0 w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center text-white shadow-md ${item.shadowColor} transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? "ring-2 ring-white/30" : ""
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isActive ? "text-white" : "text-zinc-200"
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full border ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </button>

                  {/* Floating tooltip when sidebar is collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
                      <div className="px-3 py-2 bg-[#161926] text-white text-xs rounded-xl shadow-2xl border border-white/[0.12] whitespace-nowrap flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.2 text-[9px] font-mono rounded border ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Pricing Settings Option & Account/Collapse Control */}
      <div className="p-3 border-t border-white/[0.08] space-y-2 bg-[#0a0c14]/50">
        {!isCollapsed && (
          <div className="px-3 pt-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Billing & Tier
            </span>
          </div>
        )}

        {/* Pricing Settings Menu Option */}
        <div className="relative group">
          <button
            onClick={() => onSelectTab("pricing")}
            className={`w-full flex items-center gap-3.5 rounded-xl transition-all duration-200 text-left ${
              isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
            } ${
              activeTab === "pricing"
                ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            {/* Large Icon with Solid-Colored Background (Pink/Fuchsia) */}
            <div
              className={`shrink-0 w-11 h-11 rounded-xl ${PRICING_NAV_ITEM.iconBg} flex items-center justify-center text-white shadow-md ${PRICING_NAV_ITEM.shadowColor} transition-transform duration-200 group-hover:scale-105 ${
                activeTab === "pricing" ? "ring-2 ring-white/30" : ""
              }`}
            >
              <CreditCard className="w-6 h-6 stroke-[2]" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-sm font-semibold truncate ${
                      activeTab === "pricing" ? "text-white" : "text-zinc-200"
                    }`}
                  >
                    {PRICING_NAV_ITEM.label}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full border ${PRICING_NAV_ITEM.badgeColor}`}
                  >
                    {PRICING_NAV_ITEM.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {PRICING_NAV_ITEM.description}
                </p>
              </div>
            )}
          </button>

          {/* Collapsed Tooltip for Pricing */}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
              <div className="px-3 py-2 bg-[#161926] text-white text-xs rounded-xl shadow-2xl border border-white/[0.12] whitespace-nowrap flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Pricing Settings</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono rounded border bg-pink-500/20 text-pink-300 border-pink-500/30">
                    Pro
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400">Subscription & billing</span>
              </div>
            </div>
          )}
        </div>

        {/* User Card / Expand Toggle Button in Collapsed Mode */}
        {isCollapsed ? (
          <div className="pt-2 flex flex-col items-center gap-2">
            <button
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="w-11 h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              title="Expand sidebar (Ctrl+B)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Collapsed user avatar */}
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1.5px] cursor-pointer"
              title={`${userName} (${userEmailOrPhone})`}
              onClick={() => onSelectTab("settings")}
            >
              <div className="w-full h-full bg-[#0d0f18] rounded-[10px] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono font-bold text-xs text-indigo-300 uppercase">
                    {(userName || "U")[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2">
              <div
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                onClick={() => onSelectTab("settings")}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shrink-0">
                  <div className="w-full h-full bg-[#0d0f18] rounded-[7px] flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-mono font-bold text-xs text-indigo-300 uppercase">
                        {(userName || "U")[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">
                      {userName}
                    </span>
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate block">
                    {userEmailOrPhone}
                  </span>
                </div>
              </div>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
