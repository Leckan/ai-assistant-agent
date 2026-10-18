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
  Radio,
  Key,
  Lock,
  Globe,
  AlertCircle
} from "lucide-react";
import {
  PLATFORM_INTEGRATIONS,
  type PlatformIntegration,
} from "@/lib/mcp/platform-tools";
import McpSettingsDialog from "./McpSettingsDialog";
import {
  executeGmailMcpTool,
  verifyGoogleMcpToken,
  checkGoogleOAuthConfigured,
  OFFICIAL_GMAIL_MCP_ENDPOINT,
} from "@/lib/mcp/gmail-service";
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

  // Multi-user Google OAuth 2.0 configuration status (.env)
  const [googleOAuthConfig, setGoogleOAuthConfig] = useState<{
    isConfigured: boolean;
    clientId?: string | null;
    redirectUri?: string;
    checked: boolean;
  }>({ isConfigured: false, checked: false });

  // Tab mode in Gmail connect modal: 'oauth' (default) vs 'manual'
  const [gmailAuthTab, setGmailAuthTab] = useState<"oauth" | "manual">("oauth");

  // Official Gmail MCP Server OAuth 2.0 Bearer Access Token state
  const [gmailModalToken, setGmailModalToken] = useState("");
  const [testingModalToken, setTestingModalToken] = useState(false);
  const [modalTokenStatus, setModalTokenStatus] = useState<{
    valid?: boolean;
    message?: string;
    toolsCount?: number;
    latencyMs?: number;
  } | null>(null);

  // Load saved Bearer token if present
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("omnimind_gmail_bearer_token");
      if (savedToken) setGmailModalToken(savedToken);
    } catch {}
  }, []);

  // Check Google OAuth configuration status in .env on mount
  useEffect(() => {
    let mounted = true;
    checkGoogleOAuthConfigured().then((res) => {
      if (mounted) {
        setGoogleOAuthConfig({
          isConfigured: res.isConfigured,
          clientId: res.clientId,
          redirectUri: res.redirectUri,
          checked: true,
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for return from multi-user Google OAuth flow callback in URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const connectedPlatform = urlParams.get("connected");
    const accountEmail = urlParams.get("account");
    const errorParam = urlParams.get("error");

    if (connectedPlatform === "gmail") {
      const email = accountEmail || "Google Account";
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === "gmail"
            ? {
                ...item,
                status: "connected" as const,
                connectedAccount: email,
                lastSynced: "Just now",
                latencyMs: 82,
              }
            : item
        )
      );

      setNotificationMsg({
        title: "Gmail Connected via Google OAuth 2.0!",
        message: `Successfully authenticated ${email} with official Google Gmail MCP server. Credentials securely stored in InsForge database.`,
        type: "success",
      });

      // Clean query params from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      setNotificationMsg({
        title: "Google OAuth Notice",
        message:
          errorParam === "google_oauth_not_configured"
            ? "Google OAuth credentials not configured in .env. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            : decodeURIComponent(errorParam),
        type: "info",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
                // If it's gmail and previously had fake "alex.mercer@omnimind.ai" without active token, show disconnected
                const isFakeGmail =
                  matched.platform_id === "gmail" &&
                  matched.connected_account === "alex.mercer@omnimind.ai" &&
                  !matched.settings?.accessToken;

                if (isFakeGmail) {
                  return {
                    ...item,
                    status: "disconnected" as const,
                    connectedAccount: undefined,
                    lastSynced: undefined,
                    latencyMs: undefined,
                    settings: undefined,
                  };
                }

                return {
                  ...item,
                  status: matched.status as "connected" | "disconnected",
                  connectedAccount: matched.connected_account || item.connectedAccount,
                  lastSynced: matched.last_synced || item.lastSynced,
                  latencyMs: matched.latency_ms || item.latencyMs,
                  settings: matched.settings || item.settings,
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
    latencyMs?: number,
    settings?: Record<string, any>
  ) => {
    setDbSaving(true);
    try {
      const { error } = await persistUserIntegration(activeUserId, {
        platform_id: platformId,
        status,
        connected_account: connectedAccount,
        last_synced: lastSynced,
        latency_ms: latencyMs,
        settings,
      });

      if (error) {
        console.warn("Failed to persist integration to InsForge DB:", error.message);
      }

      // Also sync user's snapshot in public.users if authenticated
      if (user?.id) {
        const snapshot = integrations.map((i) =>
          i.id === platformId
            ? { id: i.id, status, connectedAccount, lastSynced, settings }
            : { id: i.id, status: i.status }
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
    await savePlatformToDatabase(id, "disconnected", null, "Disconnected", 0, {});

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

  // Direct redirect to initiate multi-user Google OAuth 2.0 flow
  const handleStartGoogleOAuth = () => {
    const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/integrations";
    window.location.href = `/api/auth/google/gmail?userId=${encodeURIComponent(
      activeUserId
    )}&redirect=${encodeURIComponent(returnUrl)}`;
  };

  const handleTestModalToken = async () => {
    if (!gmailModalToken.trim()) {
      setModalTokenStatus({
        valid: false,
        message: "Please enter a valid Google OAuth 2.0 Bearer token (starts with ya29...).",
      });
      return;
    }

    setTestingModalToken(true);
    setModalTokenStatus(null);
    try {
      const res = await verifyGoogleMcpToken(gmailModalToken.trim());
      setModalTokenStatus({
        valid: res.valid,
        message: res.message,
        toolsCount: res.tools?.length,
        latencyMs: res.latencyMs,
      });
    } catch (err: any) {
      setModalTokenStatus({
        valid: false,
        message: err.message || "Failed to verify token with Google MCP server",
      });
    } finally {
      setTestingModalToken(false);
    }
  };

  const performConnect = async (id: string, customEmail?: string, token?: string) => {
    setConnectingId(id);
    try {
      if (id === "gmail") {
        const activeToken = (token !== undefined ? token : gmailModalToken).trim();
        if (activeToken && typeof window !== "undefined") {
          try {
            localStorage.setItem("omnimind_gmail_bearer_token", activeToken);
          } catch {}
        }

        // Run real MCP handshake with Gmail MCP server, forwarding activeUserId for multi-user resolution
        const res = await executeGmailMcpTool(
          "gmail_get_profile",
          {},
          activeToken || undefined,
          activeUserId
        );
        const emailAddress = customEmail || res.result?.emailAddress || "Connected Google Account";
        const latency = res.latencyMs || 82;

        // Also fetch initial emails to warm up the cache
        await executeGmailMcpTool(
          "gmail_list_messages",
          { q: "label:INBOX", maxResults: 10 },
          activeToken || undefined,
          activeUserId
        );

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

        // Save connection state directly to InsForge database with OAuth 2.0 configuration
        await savePlatformToDatabase(id, "connected", emailAddress, "Just now", latency, {
          endpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
          authType: "OAuth 2.0 Bearer Token",
          hasBearerToken: !!activeToken,
          tokenPreview: activeToken ? `${activeToken.substring(0, 10)}...` : undefined,
          connectedAt: new Date().toISOString(),
        });

        // Close modal if open
        setConnectModalPlatform(null);

        setNotificationMsg({
          title: activeToken
            ? "Official Gmail MCP Connected!"
            : "Gmail MCP Connected & Saved to InsForge!",
          message: activeToken
            ? `Connected to ${OFFICIAL_GMAIL_MCP_ENDPOINT} with OAuth 2.0 Bearer token (${emailAddress}).`
            : `Connected to ${emailAddress} and persisted in InsForge PostgreSQL database (user_integrations table).`,
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
        await savePlatformToDatabase(
          id,
          "connected",
          targetItem?.connectedAccount || null,
          "Just now",
          latency
        );

        setConnectModalPlatform(null);
        setNotificationMsg({
          title: `${integrations.find((i) => i.id === id)?.name || "Platform"} Connected & Saved`,
          message: `Successfully connected ${integrations.find((i) => i.id === id)?.name} and saved state to InsForge database.`,
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Connect failed:", err);
      setNotificationMsg({
        title: "Connection Failed",
        message: err.message || "Failed to establish MCP handshake.",
        type: "info",
      });
    } finally {
      setConnectingId(null);
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

      {/* Gmail Specific Connection Handshake Modal (Multi-User Google OAuth 2.0) */}
      {connectModalPlatform && connectModalPlatform.id === "gmail" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
            onClick={() => setConnectModalPlatform(null)}
          />

          <div className="relative z-10 w-full max-w-lg p-6 bg-white dark:bg-[#0d101c] rounded-3xl border border-slate-200 dark:border-white/[0.12] shadow-2xl text-slate-900 dark:text-white space-y-5">
            {/* Modal Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center p-2.5 shadow-md shrink-0">
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
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Connect Official Gmail MCP</h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-300 dark:border-emerald-500/30">
                    Google Cloud
                  </span>
                </div>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3 h-3" />
                  {OFFICIAL_GMAIL_MCP_ENDPOINT}
                </p>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-white/[0.04] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setGmailAuthTab("oauth")}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  gmailAuthTab === "oauth"
                    ? "bg-white dark:bg-white/[0.12] text-indigo-600 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Google OAuth 2.0 (Multi-User)</span>
              </button>
              <button
                type="button"
                onClick={() => setGmailAuthTab("manual")}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  gmailAuthTab === "manual"
                    ? "bg-white dark:bg-white/[0.12] text-indigo-600 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Bearer Token / Sandbox</span>
              </button>
            </div>

            {/* TAB 1: Multi-User Google OAuth 2.0 Flow */}
            {gmailAuthTab === "oauth" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Authenticate your personal or Google Workspace account through Google&apos;s standard OAuth 2.0 consent screen. Each team member connects their own Gmail inbox with automated token refresh.
                </p>

                {/* Environment Configuration Status Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs font-mono space-y-2 text-slate-700 dark:text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Google OAuth Client:</span>
                    {googleOAuthConfig.isConfigured ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Configured in .env
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Awaiting Keys in .env
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">Redirect Callback:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 truncate max-w-[240px]">
                      {googleOAuthConfig.redirectUri || "http://localhost:3000/api/auth/google/callback"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">Multi-User Storage:</span>
                    <span className="text-slate-800 dark:text-zinc-200">
                      InsForge PostgreSQL (user_integrations)
                    </span>
                  </div>
                </div>

                {/* If credentials are not configured in .env, display clear guidance */}
                {!googleOAuthConfig.isConfigured && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Set Google Credentials in .env:</span>
                    </div>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
                      Add your Google Cloud OAuth Client ID & Secret to your <code className="font-mono font-semibold">.env</code> or <code className="font-mono font-semibold">.env.local</code> file:
                    </p>
                    <div className="p-2 rounded-xl bg-black/10 dark:bg-black/40 font-mono text-[10px] text-slate-800 dark:text-zinc-300 space-y-0.5">
                      <div>GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com</div>
                      <div>GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-key</div>
                    </div>
                  </div>
                )}

                {/* Primary Google Sign-In Action */}
                <div className="pt-1 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleStartGoogleOAuth}
                    className="w-full py-3.5 px-5 rounded-2xl bg-white dark:bg-[#151928] hover:bg-slate-50 dark:hover:bg-[#1c2236] text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-300 dark:border-white/20 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Authorize with Google</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConnectModalPlatform(null)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => performConnect("gmail")}
                      disabled={connectingId === "gmail"}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {connectingId === "gmail" ? "Connecting..." : "Connect Sandbox Demo"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Direct Bearer Token / Advanced */}
            {gmailAuthTab === "manual" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Provide a pre-generated Google OAuth 2.0 Bearer access token directly. Required scopes: <code className="text-indigo-600 dark:text-indigo-400 font-mono">gmail.readonly</code>, <code className="text-indigo-600 dark:text-indigo-400 font-mono">gmail.compose</code>.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-500" />
                      OAuth 2.0 Bearer Access Token
                    </label>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      Header: Authorization: Bearer
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={gmailModalToken}
                      onChange={(e) => {
                        setGmailModalToken(e.target.value);
                        setModalTokenStatus(null);
                      }}
                      placeholder="Paste Google OAuth 2.0 token (ya29.a0AfH6...)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleTestModalToken}
                      disabled={testingModalToken || !gmailModalToken.trim()}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors disabled:opacity-40 shrink-0 flex items-center gap-1.5"
                    >
                      {testingModalToken ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </>
                      )}
                    </button>
                  </div>

                  {modalTokenStatus && (
                    <div
                      className={`p-2.5 rounded-xl text-[11px] font-mono border ${
                        modalTokenStatus.valid
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30"
                      }`}
                    >
                      {modalTokenStatus.message}
                      {modalTokenStatus.toolsCount !== undefined && (
                        <span className="block mt-0.5 text-[10px]">
                          Remote MCP Server verified: {modalTokenStatus.toolsCount} tools available ({modalTokenStatus.latencyMs}ms)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConnectModalPlatform(null);
                      setModalTokenStatus(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => performConnect("gmail", undefined, gmailModalToken)}
                    disabled={connectingId === "gmail"}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {connectingId === "gmail" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting to MCP...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {gmailModalToken.trim() ? "Connect with Token" : "Authorize & Connect"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MCP Settings & Tools Dialog */}
      {activeSettingsPlatform && (
        <McpSettingsDialog
          platform={activeSettingsPlatform}
          isOpen={!!activeSettingsPlatform}
          userId={activeUserId}
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
