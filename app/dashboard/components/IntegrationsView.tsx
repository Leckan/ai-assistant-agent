"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Layers,
  Search,
  Settings,
  Unplug,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Mail,
  Zap,
  Server,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Radio
} from "lucide-react";
import {
  PLATFORM_INTEGRATIONS,
  type PlatformIntegration,
} from "@/lib/mcp/platform-tools";
import McpSettingsDialog from "./McpSettingsDialog";
import { executeGmailMcpTool } from "@/lib/mcp/gmail-service";
import { useAuth } from "@/lib/auth-context";
import {
  insforge,
  fetchUserIntegrations,
  persistUserIntegration,
  type UserIntegrationRecord,
} from "@/lib/insforge";

interface IntegrationsViewProps {
  userId?: string;
}

export default function IntegrationsView({ userId }: IntegrationsViewProps) {
  const { user, dbUser } = useAuth();
  const activeUserId = userId || user?.id || dbUser?.id || "usr_guest_demo92418";

  const [integrations, setIntegrations] = useState<PlatformIntegration[]>(PLATFORM_INTEGRATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbSaving, setDbSaving] = useState(false);
  
  // Dialog state
  const [activeSettingsPlatform, setActiveSettingsPlatform] = useState<PlatformIntegration | null>(null);
  
  // Connection modal / prompt state for Gmail & other platforms
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectModalPlatform, setConnectModalPlatform] = useState<PlatformIntegration | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ title: string; message: string; type: "success" | "info" } | null>(null);

  // Load saved connection state directly from InsForge Database (public.user_integrations)
  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseIntegrations() {
      setLoadingDb(true);
      try {
        const { data: dbRecords, error } = await fetchUserIntegrations(activeUserId);

        if (!error && dbRecords && dbRecords.length > 0 && isMounted) {
          setIntegrations((prev) =>
            prev.map((item) => {
              const matched = dbRecords.find((r) => r.platform_id === item.id);
              if (matched) {
                return {
                  ...item,
                  status: matched.status as "connected" | "disconnected",
                  connectedAccount: matched.connected_account || item.connectedAccount,
                  lastSynced: matched.last_synced || item.lastSynced,
                  latencyMs: matched.latency_ms || item.latencyMs,
                };
              }
              return item;
            })
          );
        } else if ((!dbRecords || dbRecords.length === 0) && isMounted) {
          // If first time for this user, seed their initial default states to the InsForge database
          for (const item of PLATFORM_INTEGRATIONS) {
            if (item.status === "connected") {
              await persistUserIntegration(activeUserId, {
                platform_id: item.id,
                status: item.status,
                connected_account: item.connectedAccount,
                last_synced: item.lastSynced,
                latency_ms: item.latencyMs,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load integrations from InsForge database:", err);
      } finally {
        if (isMounted) setLoadingDb(false);
      }
    }

    loadDatabaseIntegrations();

    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  // Persist updated platform state to InsForge database public.user_integrations table
  const savePlatformToDatabase = async (
    platformId: string,
    status: "connected" | "disconnected",
    connectedAccount?: string | null,
    lastSynced?: string,
    latencyMs?: number
  ) => {
    setDbSaving(true);
    try {
      const { error } = await persistUserIntegration(activeUserId, {
        platform_id: platformId,
        status,
        connected_account: connectedAccount,
        last_synced: lastSynced,
        latency_ms: latencyMs,
      });

      if (error) {
        console.warn("Failed to persist integration to InsForge DB:", error.message);
      }

      // Also sync user's snapshot in public.users if authenticated
      if (user?.id) {
        const snapshot = integrations.map((i) =>
          i.id === platformId ? { id: i.id, status, connectedAccount, lastSynced } : { id: i.id, status: i.status }
        );
        await insforge.database
          .from("users")
          .update({
            integrations: snapshot,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
    } catch (err) {
      console.error("Error saving to InsForge DB:", err);
    } finally {
      setDbSaving(false);
    }
  };

  // Disconnect handler
  const handleDisconnect = async (id: string) => {
    const updated = integrations.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "disconnected" as const,
            lastSynced: "Disconnected",
          }
        : item
    );
    setIntegrations(updated);

    // Save disconnection state to InsForge database
    await savePlatformToDatabase(id, "disconnected", null, "Disconnected");

    const platform = integrations.find((i) => i.id === id);
    setNotificationMsg({
      title: `${platform?.name || "Platform"} Disconnected`,
      message: `The MCP server bridge for ${platform?.name || "this platform"} has been disconnected and updated in InsForge DB.`,
      type: "info",
    });

    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Connect handler
  const handleInitiateConnect = (platform: PlatformIntegration) => {
    if (platform.id === "gmail") {
      setConnectModalPlatform(platform);
    } else {
      // Direct instant connection for other platforms
      performConnect(platform.id);
    }
  };

  const performConnect = async (id: string, customEmail?: string) => {
    setConnectingId(id);
    try {
      if (id === "gmail") {
        // Run real MCP handshake with Gmail MCP server
        const res = await executeGmailMcpTool("gmail_get_profile", {});
        const emailAddress = customEmail || res.result?.emailAddress || "alex.mercer@omnimind.ai";
        const latency = res.latencyMs || 82;

        // Also fetch initial emails to warm up the cache
        await executeGmailMcpTool("gmail_list_messages", { q: "label:INBOX", maxResults: 10 });

        const updated = integrations.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "connected" as const,
                connectedAccount: emailAddress,
                lastSynced: "Just now",
                latencyMs: latency,
              }
            : item
        );
        setIntegrations(updated);

        // Save connection state directly to InsForge database
        await savePlatformToDatabase(id, "connected", emailAddress, "Just now", latency);

        setNotificationMsg({
          title: "Gmail MCP Connected & Saved to InsForge!",
          message: `Connected to ${emailAddress} and persisted in InsForge PostgreSQL database (user_integrations table).`,
          type: "success",
        });
      } else {
        // Simulated connection delay for other platforms
        await new Promise((resolve) => setTimeout(resolve, 600));
        const latency = Math.floor(Math.random() * 40) + 60;

        const updated = integrations.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "connected" as const,
                lastSynced: "Just now",
                latencyMs: latency,
              }
            : item
        );
        setIntegrations(updated);

        // Save connection state directly to InsForge database
        const targetItem = integrations.find((i) => i.id === id);
        await savePlatformToDatabase(id, "connected", targetItem?.connectedAccount || null, "Just now", latency);

        const platform = integrations.find((i) => i.id === id);
        setNotificationMsg({
          title: `${platform?.name} Connected & Saved`,
          message: `Successfully connected ${platform?.name} and saved state to InsForge database.`,
          type: "success",
        });
      }
    } catch (err: any) {
      setNotificationMsg({
        title: "Connection Failed",
        message: err.message || "Failed to establish MCP handshake.",
        type: "info",
      });
    } finally {
      setConnectingId(null);
      setConnectModalPlatform(null);
      setTimeout(() => setNotificationMsg(null), 5000);
    }
  };

  // Filtered platforms
  const categories = ["All", "Email", "Chat", "Workspace", "Social", "Developer"];

  const filteredIntegrations = integrations.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tools.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter((i) => i.status === "connected").length;
  const totalMcpTools = integrations.reduce((acc, curr) => acc + curr.tools.length, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between text-xs text-indigo-950 dark:text-indigo-200 shadow-xl transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm">{notificationMsg.title}</p>
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                {notificationMsg.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 shrink-0">
              <Layers className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Platform Integrations
                </h2>
                <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  {connectedCount} Connected
                </span>
                <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
                  {totalMcpTools} MCP Tools
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Connect your inboxes, messaging apps, and developer platforms through official Model Context Protocol (MCP) servers. The autonomous AI agent triages information with zero private model training.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-2 text-xs font-mono text-indigo-700 dark:text-indigo-300">
              <span className={`w-2 h-2 rounded-full ${loadingDb ? "bg-amber-400 animate-ping" : dbSaving ? "bg-cyan-400 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
              <span>{loadingDb ? "Loading InsForge DB..." : dbSaving ? "Saving to InsForge..." : "InsForge DB Synced"}</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-zinc-300">
              <Server className="w-4 h-4 text-emerald-500" />
              <span>MCP v2024-11-05</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms or tools..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Integrations Clean Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIntegrations.map((item) => {
          const isConnected = item.status === "connected";
          const isConnecting = connectingId === item.id;

          return (
            <div
              key={item.id}
              className={`glass-panel p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 group relative ${
                isConnected
                  ? "border-slate-200/90 dark:border-white/[0.12] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 shadow-lg shadow-slate-900/5 dark:shadow-black/20"
                  : "border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.14] opacity-90 hover:opacity-100"
              }`}
            >
              {/* Card Top: Category and Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-zinc-400 font-medium">
                  {item.category}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono rounded-full border transition-all ${
                    isConnected
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-zinc-800/80 border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              {/* Platform Logo in the Center */}
              <div className="flex flex-col items-center text-center my-4">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.12] shadow-md shadow-slate-900/10 dark:shadow-black/40 flex items-center justify-center p-3.5 group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src={item.logo}
                    alt={`${item.name} logo`}
                    width={52}
                    height={52}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>

                {/* Platform Name */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.name}
                </h3>

                {/* Two-Line Description */}
                <div className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-snug line-clamp-2 h-9 flex flex-col justify-center">
                  <span>{item.twoLineDesc[0]}</span>
                  <span>{item.twoLineDesc[1]}</span>
                </div>

                {/* MCP Tools Counter Pill */}
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                  <Server className="w-3 h-3" />
                  <span>{item.tools.length} MCP Tools available</span>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    {/* Settings Button (Opens MCP tools and actions dialog) */}
                    <button
                      onClick={() => setActiveSettingsPlatform(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/[0.1] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                      <span>Settings</span>
                    </button>

                    {/* Disconnect Button (Replaces Connect button) */}
                    <button
                      onClick={() => handleDisconnect(item.id)}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      title="Disconnect platform"
                    >
                      <Unplug className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  /* Connect Button (When disconnected) */
                  <button
                    onClick={() => handleInitiateConnect(item)}
                    disabled={isConnecting}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting via MCP...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Connect {item.name}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gmail Specific Connection Handshake Modal */}
      {connectModalPlatform && connectModalPlatform.id === "gmail" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
            onClick={() => setConnectModalPlatform(null)}
          />

          <div className="relative z-10 w-full max-w-md p-6 bg-white dark:bg-[#0d101c] rounded-3xl border border-slate-200 dark:border-white/[0.12] shadow-2xl text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center p-2.5 shadow-md">
                <Image
                  src="/gmail.svg"
                  alt="Gmail"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="text-lg font-bold">Connect Gmail Inbox via MCP</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Model Context Protocol Server Handshake
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Connect your Gmail account to enable autonomous AI inbox triage, priority filtering, and instant thread synthesis. Scopes are restricted to reading, organizing, and drafting replies.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs font-mono space-y-1.5 text-slate-700 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Protocol:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">JSON-RPC 2.0 (MCP)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Server Endpoint:</span>
                <span className="text-emerald-600 dark:text-emerald-400">gmail-mcp-server v1.4</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account:</span>
                <span>alex.mercer@omnimind.ai</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConnectModalPlatform(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => performConnect("gmail")}
                disabled={connectingId === "gmail"}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {connectingId === "gmail" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Authorize & Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MCP Settings & Tools Dialog */}
      {activeSettingsPlatform && (
        <McpSettingsDialog
          platform={activeSettingsPlatform}
          isOpen={!!activeSettingsPlatform}
          onClose={() => setActiveSettingsPlatform(null)}
          onDisconnect={(id) => {
            handleDisconnect(id);
            setActiveSettingsPlatform(null);
          }}
        />
      )}
    </div>
  );
}
