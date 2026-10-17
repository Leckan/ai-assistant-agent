"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Zap,
  FileText,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Save,
  Sparkles,
  Smartphone,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Inbox,
  Clock,
  ExternalLink,
} from "lucide-react";
import { type UserRecord } from "@/lib/insforge";

interface DashboardViewProps {
  user: {
    id: string;
    email: string | null;
    phone?: string | null;
    provider?: string;
    providers?: string[];
    profile?: { name?: string; avatar_url?: string } | null;
  };
  dbData: UserRecord | null;
  loadingDb: boolean;
  onRefreshDb: () => void;
  onUpdateName: (newName: string) => Promise<void>;
  savingName: boolean;
  feedbackMsg: string | null;
  onNavigateTab: (tab: "dashboard" | "ai-agent" | "briefing" | "integrations" | "alerts" | "settings" | "pricing") => void;
}

export default function DashboardView({
  user,
  dbData,
  loadingDb,
  onRefreshDb,
  onUpdateName,
  savingName,
  feedbackMsg,
  onNavigateTab,
}: DashboardViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(dbData?.name || user.profile?.name || "");

  const handleSave = async () => {
    if (!editName.trim()) return;
    await onUpdateName(editName);
    setIsEditing(false);
  };

  const userProviders = dbData?.providers || user.providers || ["email"];
  const isGoogle = userProviders.some((p) =>
    p.toLowerCase().includes("google") || p.toLowerCase().includes("gmail")
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#121524] via-[#0e101a] to-[#08090d] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* User Avatar with Solid Gradient Edge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-600/20 shrink-0">
              <div className="w-full h-full bg-[#0d0f18] rounded-[14px] flex items-center justify-center overflow-hidden">
                {user.profile?.avatar_url || dbData?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile?.avatar_url || dbData?.avatar_url || ""}
                    alt={dbData?.name || user.email || user.phone || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold font-mono text-indigo-300 uppercase">
                    {(dbData?.name || user.profile?.name || user.email || user.phone || "U")[0]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Welcome back,{" "}
                  {dbData?.name || user.profile?.name || user.email?.split("@")[0] || dbData?.phone || "User"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
                <span>{dbData?.phone ? dbData.phone : user.email}</span>
                {dbData?.email && dbData.phone && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>{dbData.email}</span>
                  </>
                )}
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-mono text-indigo-400">
                  {dbData?.verification_method
                    ? `Phone (${dbData.verification_method.toUpperCase()} via Sent.dm)`
                    : isGoogle
                    ? "Gmail (Google OAuth)"
                    : "Email / Password"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefreshDb}
              disabled={loadingDb}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? "animate-spin" : ""}`} />
              <span>Refresh DB State</span>
            </button>
            <button
              onClick={() => onNavigateTab("ai-agent")}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Agent</span>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs font-mono text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Large Solid-Colored Icon Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Unread Inbox Items */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-blue-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Inbox Processed
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                142
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18% triage speed</span>
              </div>
            </div>

            {/* Large Icon with Solid Blue Background */}
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Mail className="w-7 h-7 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Metric 2: AI Autonomous Actions */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-violet-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                AI Agent Actions
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                89
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-violet-300">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <span>Zero manual intervention</span>
              </div>
            </div>

            {/* Large Icon with Solid Violet Background */}
            <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
              <Zap className="w-7 h-7 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Metric 3: Executive Briefings */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-amber-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Executive Digests
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                12
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Next digest at 8:00 AM</span>
              </div>
            </div>

            {/* Large Icon with Solid Amber Background */}
            <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30 group-hover:scale-105 transition-transform">
              <FileText className="w-7 h-7 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Metric 4: Connected Channels */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-emerald-500/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Active Channels
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                4 / 7
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Webhooks OK</span>
              </div>
            </div>

            {/* Large Icon with Solid Emerald Background */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Layers className="w-7 h-7 stroke-[2]" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards with Large Solid Icons */}
      <div>
        <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 mb-4">
          Quick Assistant Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab("ai-agent")}
            className="p-4 rounded-2xl bg-[#0e101a] border border-white/[0.08] hover:border-violet-500/40 hover:bg-[#131624] text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-violet-600/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                AI Inbox Sweep
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Scan urgent threads & draft replies
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("briefing")}
            className="p-4 rounded-2xl bg-[#0e101a] border border-white/[0.08] hover:border-amber-500/40 hover:bg-[#131624] text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-600/25 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                Generate Briefing
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Compile today&apos;s 2-minute digest
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("integrations")}
            className="p-4 rounded-2xl bg-[#0e101a] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#131624] text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                Connect New App
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Add Slack, WhatsApp, or Sent.dm
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("alerts")}
            className="p-4 rounded-2xl bg-[#0e101a] border border-white/[0.08] hover:border-rose-500/40 hover:bg-[#131624] text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-600/25 group-hover:scale-105 transition-transform">
              <Bell className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                Manage Alerts
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure VIP thresholds & SMS
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Database & Authentication Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: InsForge Database Record */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/[0.08] shadow-lg relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Database className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  InsForge Database: <span className="font-mono text-indigo-400">public.users</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  PostgreSQL synchronized user profile & session
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/[0.06]">
              PostgreSQL Table
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
              <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
                User ID (Primary Key)
              </span>
              <span className="font-mono text-zinc-200 select-all truncate">
                {dbData?.id || user.id}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
              <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
                Display Name
              </span>
              {isEditing ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 rounded bg-black/60 border border-indigo-500 text-white text-xs w-full focus:outline-none"
                  />
                  <button
                    onClick={handleSave}
                    disabled={savingName}
                    className="p-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                    title="Save"
                  >
                    {savingName ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-200">
                    {dbData?.name || user.profile?.name || "Not set"}
                  </span>
                  <button
                    onClick={() => {
                      setEditName(dbData?.name || user.profile?.name || "");
                      setIsEditing(true);
                    }}
                    className="text-zinc-500 hover:text-indigo-400 p-0.5"
                    title="Edit name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
              <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <span className="text-zinc-200 truncate">
                {dbData?.email || user.email || "None (Phone Authentication)"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
              <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
                Phone Number
              </span>
              <span className="font-mono text-zinc-200 truncate">
                {dbData?.phone || user.phone || "Not linked"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
              <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
                Authentication Provider
              </span>
              <span className="font-mono text-indigo-300 font-semibold uppercase text-[11px]">
                {dbData?.provider || user.provider || (isGoogle ? "google" : user.phone ? "phone" : "email")}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
              <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
                Verification Method Used
              </span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="uppercase">
                  {dbData?.verification_method
                    ? `${dbData.verification_method.toUpperCase()} OTP (Sent.dm)`
                    : isGoogle
                    ? "Google OAuth 2.0"
                    : "Email OTP Code"}
                </span>
              </div>
            </div>
          </div>

          <details className="mt-4 text-xs group">
            <summary className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-mono text-[11px] list-none flex items-center gap-1.5">
              <span>View Raw PostgreSQL JSON Payload</span>
            </summary>
            <pre className="mt-2 p-3 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-[11px] text-zinc-300 overflow-x-auto">
              {JSON.stringify(dbData || user, null, 2)}
            </pre>
          </details>
        </div>

        {/* Card 2: Connected Communication Channels */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                  <Inbox className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Channels</h3>
                  <p className="text-xs text-zinc-400">Live connectors</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                4 Active
              </span>
            </div>

            <div className="space-y-3">
              {/* Gmail */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    M
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Gmail</h4>
                    <p className="text-[10px] text-zinc-400">
                      {isGoogle ? "Connected via Google OAuth" : "OAuth Ready"}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
                  Active
                </span>
              </div>

              {/* WhatsApp */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    W
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">WhatsApp</h4>
                    <p className="text-[10px] text-zinc-400">Sent.dm Webhook Bridge</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
                  Active
                </span>
              </div>

              {/* Telegram */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    TG
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Telegram</h4>
                    <p className="text-[10px] text-zinc-400">Bot token connected</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
                  Active
                </span>
              </div>

              {/* Outlook */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    O
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Outlook</h4>
                    <p className="text-[10px] text-zinc-400">Microsoft Graph</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400">
                  Standby
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => onNavigateTab("integrations")}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs hover:from-indigo-500 hover:to-violet-500 transition-colors flex items-center justify-center gap-2"
            >
              <span>Manage All Integrations</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
