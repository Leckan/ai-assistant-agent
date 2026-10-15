"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  User,
  Mail,
  ShieldCheck,
  Database,
  Calendar,
  LogOut,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Edit2,
  Save,
  MessageSquare,
  Layers,
  Inbox,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { insforge, type UserRecord } from "@/lib/insforge";

export default function DashboardPage() {
  const router = useRouter();
  const { user, dbUser, isLoading, signOut, refreshUser } = useAuth();

  const [dbData, setDbData] = useState<UserRecord | null>(dbUser);
  const [loadingDb, setLoadingDb] = useState(false);
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (dbUser) {
      setDbData(dbUser);
      setEditName(dbUser.name || "");
    }
  }, [dbUser]);

  // Fetch live fresh record directly from InsForge database public.users table
  const fetchLiveDatabaseRecord = async () => {
    if (!user) return;
    setLoadingDb(true);
    setFeedbackMsg(null);
    try {
      const { data, error } = await insforge.database
        .from("users")
        .select("*")
        .eq("id", user.id);

      if (!error && data && data.length > 0) {
        setDbData(data[0] as UserRecord);
        setEditName(data[0].name || "");
        setFeedbackMsg("Database record reloaded successfully!");
      }
    } catch (err) {
      console.error("Failed to query users table:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !editName.trim()) return;
    setSavingName(true);
    setFeedbackMsg(null);

    try {
      // 1. Update in InsForge database public.users table
      const { error: dbError } = await insforge.database
        .from("users")
        .update({
          name: editName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      // 2. Also update profile on auth object
      await insforge.auth.setProfile({ name: editName.trim() });

      if (dbError) {
        setFeedbackMsg(`Error updating name: ${dbError.message}`);
      } else {
        setFeedbackMsg("Display name updated and saved in InsForge database!");
        setIsEditing(false);
        await refreshUser();
        await fetchLiveDatabaseRecord();
      }
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-sm font-mono">Loading InsForge authenticated session...</span>
        </div>
      </div>
    );
  }

  const userProviders = dbData?.providers || user.providers || ["email"];
  const isGoogle = userProviders.some((p) => p.toLowerCase().includes("google") || p.toLowerCase().includes("gmail"));

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#08090d]/85 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-wider hidden sm:inline">Landing Page</span>
          </Link>
          <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0d0f18] rounded-[7px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="font-bold tracking-tight text-white">
              Omni<span className="text-indigo-400">Mind</span> Dashboard
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            InsForge Session Active
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#121524] via-[#0e101a] to-[#08090d] p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {/* User Avatar */}
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
                      {(dbData?.name || user.email || user.phone || "U")[0]}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {dbData?.name || user.profile?.name || user.email?.split("@")[0] || dbData?.phone || "User"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified User
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{dbData?.phone ? dbData.phone : user.email}</span>
                  {dbData?.email && dbData.phone && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span>{dbData.email}</span>
                    </>
                  )}
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs font-mono text-indigo-400">
                    Provider:{" "}
                    {dbData?.verification_method
                      ? `Phone (${dbData.verification_method.toUpperCase()} via Sent.dm)`
                      : isGoogle
                      ? "Gmail (Google OAuth)"
                      : "Email/Password"}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchLiveDatabaseRecord}
                disabled={loadingDb}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? "animate-spin" : ""}`} />
                <span>Refresh DB State</span>
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

        {/* Database & Authentication Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: InsForge Database Record (Live inspection) */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/[0.08] shadow-lg relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  InsForge Database: <span className="font-mono text-indigo-400">public.users</span>
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/[0.06]">
                PostgreSQL Table
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              This record was verified and synchronized into the InsForge PostgreSQL database under the{" "}
              <code className="text-indigo-300 bg-indigo-950/40 px-1 py-0.5 rounded">users</code> table.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">User ID (Primary Key)</span>
                <span className="font-mono text-zinc-200 select-all truncate">{dbData?.id || user.id}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Display Name</span>
                {isEditing ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 rounded bg-black/60 border border-indigo-500 text-white text-xs w-full focus:outline-none"
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={savingName}
                      className="p-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                      title="Save"
                    >
                      {savingName ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-200">{dbData?.name || "Not set"}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-zinc-500 hover:text-indigo-400 p-0.5"
                      title="Edit name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Email Address</span>
                <span className="text-zinc-200 truncate">{dbData?.email || user.email || "None (Phone Authentication)"}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Phone Number</span>
                <span className="font-mono text-zinc-200 truncate">{dbData?.phone || user.phone || "Not linked"}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Authentication Provider</span>
                <span className="font-mono text-indigo-300 font-semibold uppercase text-[11px]">
                  {dbData?.provider || user.provider || (isGoogle ? "google" : user.phone ? "phone" : "email")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Verification Method Used</span>
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

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Created Date</span>
                <span className="font-mono text-zinc-400 text-[11px]">
                  {dbData?.created_at ? new Date(dbData.created_at).toLocaleString() : "Just now"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col gap-1">
                <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Last Login Date</span>
                <span className="font-mono text-cyan-400 text-[11px]">
                  {dbData?.last_login_at
                    ? new Date(dbData.last_login_at).toLocaleString()
                    : new Date().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Raw JSON inspection toggle */}
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
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">Connected Channels</h2>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  4 Available
                </span>
              </div>

              <div className="space-y-3">
                {/* Gmail channel */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                      M
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Gmail</h4>
                      <p className="text-[10px] text-zinc-400">
                        {isGoogle ? "Connected via Google OAuth" : "Ready to connect"}
                      </p>
                    </div>
                  </div>
                  {isGoogle ? (
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400">
                      Standby
                    </span>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      W
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">WhatsApp</h4>
                      <p className="text-[10px] text-zinc-400">Business webhook</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400">
                    Standby
                  </span>
                </div>

                {/* Telegram */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-xs">
                      TG
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Telegram</h4>
                      <p className="text-[10px] text-zinc-400">Bot token bridge</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400">
                    Standby
                  </span>
                </div>

                {/* Outlook */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
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
              <Link
                href="/#simulator"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs hover:from-indigo-500 hover:to-violet-500 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Assistant Simulator</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
