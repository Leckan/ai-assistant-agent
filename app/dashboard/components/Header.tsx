"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { NavTabId, MAIN_NAV_ITEMS, PRICING_NAV_ITEM } from "./Sidebar";

interface HeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileMenu: () => void;
  activeTab: NavTabId;
  userName?: string;
  isDbLive?: boolean;
  onRefreshDb?: () => void;
  loadingDb?: boolean;
}

export default function Header({
  isCollapsed,
  onToggleCollapse,
  onOpenMobileMenu,
  activeTab,
  userName = "Alex Mercer",
  isDbLive = true,
  onRefreshDb,
  loadingDb = false,
}: HeaderProps) {
  // Find current tab details
  const currentItem =
    MAIN_NAV_ITEMS.find((item) => item.id === activeTab) ||
    (activeTab === "pricing" ? PRICING_NAV_ITEM : MAIN_NAV_ITEMS[0]);

  const Icon = currentItem.icon;

  return (
    <header className="sticky top-0 z-20 h-20 bg-[#08090d]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Collapse toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] border border-white/[0.08]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle icon button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
          title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-indigo-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

        {/* Active Breadcrumb with Large Solid Icon Preview */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl ${currentItem.iconBg} flex items-center justify-center text-white shadow-sm shrink-0`}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                {currentItem.label}
              </h1>
              {currentItem.badge && (
                <span
                  className={`hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono rounded-full border ${currentItem.badgeColor}`}
                >
                  {currentItem.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 hidden md:block">
              {currentItem.description}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions, Live DB Status, Search */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Search pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-xs hover:border-white/[0.16] transition-colors cursor-pointer">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-400">Quick search...</span>
          <kbd className="text-[10px] font-mono bg-white/[0.06] border border-white/[0.1] px-1.5 py-0.5 rounded text-zinc-400">
            ⌘K
          </kbd>
        </div>

        {/* InsForge live session status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>InsForge Synced</span>
        </div>

        {/* DB Reload button if applicable */}
        {onRefreshDb && (
          <button
            onClick={onRefreshDb}
            disabled={loadingDb}
            title="Reload live database state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? "animate-spin" : ""}`} />
            <span className="hidden lg:inline">Sync DB</span>
          </button>
        )}

        {/* Simulator link */}
        <Link
          href="/#simulator"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs hover:from-indigo-500 hover:to-violet-500 transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Simulator</span>
        </Link>
      </div>
    </header>
  );
}
