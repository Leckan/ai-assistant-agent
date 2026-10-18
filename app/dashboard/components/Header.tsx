"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react";
import { NavTabId, MAIN_NAV_ITEMS, PRICING_NAV_ITEM } from "./Sidebar";
import { useTheme } from "@/lib/theme-context";

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
  onRefreshDb,
  loadingDb = false,
}: HeaderProps) {
  const { theme, toggleTheme, setTheme } = useTheme();

  // Find current tab details
  const currentItem =
    MAIN_NAV_ITEMS.find((item) => item.id === activeTab) ||
    (activeTab === "pricing" ? PRICING_NAV_ITEM : MAIN_NAV_ITEMS[0]);

  const Icon = currentItem.icon;

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/85 dark:bg-[#08090d]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left: Collapse toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle icon button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition-colors"
          title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08] hidden sm:block" />

        {/* Active Breadcrumb with Large Solid Icon Preview */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl ${currentItem.iconBg} flex items-center justify-center text-white shadow-sm shrink-0`}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
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
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden md:block">
              {currentItem.description}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions, Theme Switcher, Live DB Status, Search */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-zinc-400 text-xs hover:border-slate-300 dark:hover:border-white/[0.16] transition-colors cursor-pointer">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <span className="text-slate-500 dark:text-zinc-400">Quick search...</span>
          <kbd className="text-[10px] font-mono bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] px-1.5 py-0.5 rounded text-slate-500 dark:text-zinc-400 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Light / Dark Mode Theme Switcher */}
        <div
          className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.08] shadow-2xs"
          role="group"
          aria-label="Theme mode switcher"
        >
          <button
            type="button"
            onClick={() => (theme === "light" ? toggleTheme() : setTheme("light"))}
            aria-pressed={theme === "light"}
            title="Switch to Light Mode"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              theme === "light"
                ? "bg-white text-amber-600 shadow-xs border border-slate-200/80"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sun className="w-3.5 h-3.5 fill-amber-500/20" />
            <span className="hidden sm:inline">Light</span>
          </button>

          <button
            type="button"
            onClick={() => (theme === "dark" ? toggleTheme() : setTheme("dark"))}
            aria-pressed={theme === "dark"}
            title="Switch to Dark Mode"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              theme === "dark"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* InsForge live session status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span>InsForge Synced</span>
        </div>

        {/* DB Reload button if applicable */}
        {onRefreshDb && (
          <button
            onClick={onRefreshDb}
            disabled={loadingDb}
            title="Reload live database state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 rounded-xl transition-colors disabled:opacity-50"
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
