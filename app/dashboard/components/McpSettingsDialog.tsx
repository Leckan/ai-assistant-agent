"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Play,
  CheckCircle,
  Clock,
  Terminal,
  Server,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Mail,
  Shield,
  FileCode,
  Sliders,
  Send,
  Eye,
  Star,
  Tag,
  Paperclip,
  AlertCircle,
  AlertTriangle,
  Key,
  Lock,
  Globe,
  ExternalLink,
  User,
  UserCheck,
} from "lucide-react";
import type { PlatformIntegration, McpToolDefinition } from "@/lib/mcp/platform-tools";
import {
  executeGmailMcpTool,
  verifyGoogleMcpToken,
  checkGoogleOAuthConfigured,
  OFFICIAL_GMAIL_MCP_ENDPOINT,
  type GmailMessage,
  type GmailProfile,
  EMPTY_GMAIL_PROFILE,
} from "@/lib/mcp/gmail-service";

interface McpSettingsDialogProps {
  platform: PlatformIntegration;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: (id: string) => void;
  userId?: string;
}

export default function McpSettingsDialog({
  platform,
  isOpen,
  onClose,
  onDisconnect,
  userId = "user_default_exec",
}: McpSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<"tools" | "inbox-runner" | "config">("tools");
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition>(platform.tools[0]);
  
  // Interactive tool runner state
  const [toolParams, setToolParams] = useState<Record<string, any>>({});
  const [executingTool, setExecutingTool] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionLatency, setExecutionLatency] = useState<number | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Gmail Live state
  const [inboxEmails, setInboxEmails] = useState<GmailMessage[]>([]);
  const [profile, setProfile] = useState<GmailProfile>(EMPTY_GMAIL_PROFILE);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("label:INBOX");
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);

  // OAuth 2.0 Bearer Access Token state for official https://gmailmcp.googleapis.com/mcp/v1
  const [bearerToken, setBearerToken] = useState<string>("");
  const [verifyingToken, setVerifyingToken] = useState<boolean>(false);
  const [tokenVerificationResult, setTokenVerificationResult] = useState<{
    tested: boolean;
    valid?: boolean;
    message?: string;
    toolsCount?: number;
    latencyMs?: number;
  }>({ tested: false });

  // Google OAuth .env backend config status
  const [googleOAuthConfig, setGoogleOAuthConfig] = useState<{
    checked: boolean;
    isConfigured: boolean;
    clientId?: string | null;
    redirectUri?: string;
  }>({ checked: false, isConfigured: false });

  // Google Cloud Gmail API Enablement Alert
  const [apiActivationAlert, setApiActivationAlert] = useState<{
    needed: boolean;
    url: string;
    projectId?: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && platform.id === "gmail") {
      checkGoogleOAuthConfigured().then((cfg) => {
        setGoogleOAuthConfig({
          checked: true,
          isConfigured: cfg.isConfigured,
          clientId: cfg.clientId,
          redirectUri: cfg.redirectUri,
        });
      });
    }
  }, [isOpen, platform.id]);

  // Load saved token from platform settings or storage if available
  useEffect(() => {
    if (platform.settings?.accessToken) {
      setBearerToken(platform.settings.accessToken);
      return;
    }
    try {
      const savedToken = localStorage.getItem("omnimind_gmail_bearer_token");
      if (savedToken) {
        setBearerToken(savedToken);
      }
    } catch {
      // Ignore
    }
  }, [platform.settings]);

  const handleSaveAndVerifyToken = async (tokenToTest = bearerToken) => {
    if (!tokenToTest.trim()) {
      setTokenVerificationResult({
        tested: true,
        valid: false,
        message: "Please enter a valid Google OAuth 2.0 Bearer access token.",
      });
      return;
    }

    setVerifyingToken(true);
    setTokenVerificationResult({ tested: false });

    try {
      try {
        localStorage.setItem("omnimind_gmail_bearer_token", tokenToTest.trim());
      } catch {}

      const res = await verifyGoogleMcpToken(tokenToTest.trim());
      setTokenVerificationResult({
        tested: true,
        valid: res.valid,
        message: res.message,
        toolsCount: res.tools?.length,
        latencyMs: res.latencyMs,
      });

      if (res.valid) {
        handleFetchGmailInbox("label:INBOX", tokenToTest.trim());
      }
    } catch (err: any) {
      setTokenVerificationResult({
        tested: true,
        valid: false,
        message: err.message || "Failed to verify token with https://gmailmcp.googleapis.com/mcp/v1",
      });
    } finally {
      setVerifyingToken(false);
    }
  };

  // Initialize tool parameters when selected tool changes
  useEffect(() => {
    if (selectedTool) {
      const defaults: Record<string, any> = {};
      selectedTool.parameters.forEach((param) => {
        if (param.default !== undefined) {
          defaults[param.name] = param.default;
        } else if (param.type === "string") {
          defaults[param.name] = "";
        } else if (param.type === "number") {
          defaults[param.name] = 10;
        } else if (param.type === "boolean") {
          defaults[param.name] = false;
        } else if (param.type === "array") {
          defaults[param.name] = [];
        }
      });
      setToolParams(defaults);
      setExecutionResult(null);
      setExecutionLatency(null);
    }
  }, [selectedTool]);

  // Load initial emails when opening Gmail dialog
  useEffect(() => {
    if (isOpen && platform.id === "gmail") {
      handleFetchGmailInbox("label:INBOX");
    }
  }, [isOpen, platform.id]);

  if (!isOpen) return null;

  // Handle Fetching Gmail Inbox via MCP
  const handleFetchGmailInbox = async (query = "label:INBOX", tokenOverride?: string) => {
    setFetchingEmails(true);
    const token = tokenOverride !== undefined ? tokenOverride : (bearerToken || undefined);
    try {
      const [messagesRes, profileRes] = await Promise.all([
        executeGmailMcpTool("gmail_list_messages", { q: query, maxResults: 15 }, token, userId),
        executeGmailMcpTool("gmail_get_profile", {}, token, userId),
      ]);

      const disabledAlert =
        messagesRes.error?.data?.type === "GMAIL_API_DISABLED"
          ? messagesRes.error
          : profileRes.error?.data?.type === "GMAIL_API_DISABLED"
          ? profileRes.error
          : null;

      if (disabledAlert) {
        setApiActivationAlert({
          needed: true,
          url:
            disabledAlert.data?.activationUrl ||
            `https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=${disabledAlert.data?.projectId || "18240900817"}`,
          projectId: disabledAlert.data?.projectId || "18240900817",
          message:
            disabledAlert.message ||
            "The Gmail API is disabled in your Google Cloud Project. Please enable it in Google Cloud Console.",
        });
      } else if (messagesRes.success) {
        setApiActivationAlert(null);
      }

      if (messagesRes.success && messagesRes.result?.messages) {
        setInboxEmails(messagesRes.result.messages);
        setExecutionLatency(messagesRes.latencyMs);
      }
      if (profileRes.success && profileRes.result) {
        setProfile(profileRes.result);
      }
    } catch (err) {
      console.error("Failed to fetch Gmail via MCP:", err);
    } finally {
      setFetchingEmails(false);
    }
  };

  // Run Selected MCP Tool
  const handleRunTool = async () => {
    setExecutingTool(true);
    setExecutionResult(null);

    try {
      if (platform.id === "gmail") {
        const token = bearerToken || undefined;
        const res = await executeGmailMcpTool(selectedTool.name, toolParams, token, userId);
        setExecutionResult(res.result);
        setExecutionLatency(res.latencyMs);

        if (res.error?.data?.type === "GMAIL_API_DISABLED") {
          setApiActivationAlert({
            needed: true,
            url:
              res.error.data.activationUrl ||
              `https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=${res.error.data.projectId || "18240900817"}`,
            projectId: res.error.data.projectId || "18240900817",
            message: res.error.message,
          });
        }

        // If listing messages was run, also update the live inbox state
        if (
          (selectedTool.name === "gmail_list_messages" || selectedTool.name === "search_threads") &&
          res.result?.messages
        ) {
          setInboxEmails(res.result.messages);
        } else if (selectedTool.name === "gmail_get_profile" && res.result) {
          setProfile(res.result);
        }
      } else {
        // Simulated execution for other MCP server platforms
        await new Promise((resolve) => setTimeout(resolve, 140));
        setExecutionLatency(Math.floor(Math.random() * 50) + 60);
        setExecutionResult({
          status: "SUCCESS",
          mcpServer: platform.mcpServerName,
          toolCalled: selectedTool.name,
          receivedAt: new Date().toISOString(),
          parameters: toolParams,
          simulatedOutput: `Tool '${selectedTool.name}' completed execution successfully through ${platform.name} MCP bridge.`,
        });
      }
    } catch (err: any) {
      setExecutionResult({ error: err.message || "MCP execution failed" });
    } finally {
      setExecutingTool(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0c0e17] rounded-3xl border border-slate-200 dark:border-white/[0.12] shadow-2xl shadow-slate-950/20 dark:shadow-black/70 overflow-hidden text-slate-900 dark:text-zinc-100">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] shadow-md flex items-center justify-center p-2.5 shrink-0">
              <Image
                src={platform.logo}
                alt={platform.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {platform.name} Settings
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-500" />
                  {platform.mcpServerName} v{platform.mcpVersion}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Protocol: {platform.protocolVersion}
                </span>
                {platform.connectedAccount && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[200px] sm:max-w-none">
                      {platform.connectedAccount}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center gap-2 overflow-x-auto bg-slate-50/30 dark:bg-black/20">
          <button
            onClick={() => setActiveTab("tools")}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "tools"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Available MCP Tools ({platform.tools.length})</span>
          </button>

          {platform.id === "gmail" && (
            <button
              onClick={() => setActiveTab("inbox-runner")}
              className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "inbox-runner"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <Mail className="w-4 h-4 text-red-500" />
              <span>Live MCP Inbox Explorer</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-md">
                Live
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("config")}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "config"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Permissions & Bridge Settings</span>
          </button>
        </div>

        {/* Tab 1: Available MCP Tools & Actions */}
        {activeTab === "tools" && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tools List (5 Cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Select Tool to Test
                </span>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  {platform.tools.length} Registered
                </span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {platform.tools.map((tool) => {
                  const isSelected = selectedTool.name === tool.name;
                  return (
                    <div
                      key={tool.name}
                      onClick={() => setSelectedTool(tool)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-md shadow-indigo-600/10"
                          : "bg-slate-50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06] hover:border-indigo-300 dark:hover:border-white/[0.15]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {tool.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                            tool.category === "read"
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : tool.category === "write"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                              : "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                          }`}
                        >
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 mt-1">
                        {tool.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {tool.actionSummary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Tool Playground & Schema (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedTool.displayName}
                      </h4>
                      <code className="text-xs px-2 py-0.5 rounded bg-slate-200/70 dark:bg-white/[0.08] text-slate-700 dark:text-zinc-300 font-mono">
                        {selectedTool.name}
                      </code>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
                      {selectedTool.description}
                    </p>
                  </div>

                  <button
                    onClick={handleRunTool}
                    disabled={executingTool}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all shrink-0 disabled:opacity-50"
                  >
                    {executingTool ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>{executingTool ? "Executing..." : "Run Tool"}</span>
                  </button>
                </div>

                {/* Parameters Schema Form */}
                <div className="mt-4 space-y-3">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-500 dark:text-zinc-400 block">
                    Parameters Schema ({selectedTool.parameters.length})
                  </span>

                  {selectedTool.parameters.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-xs text-slate-500 dark:text-zinc-400 font-mono">
                      No parameters required. Invokes directly with empty payload.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTool.parameters.map((param) => (
                        <div key={param.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                              {param.name}
                              {param.required && <span className="text-rose-500 ml-0.5">*</span>}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {param.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {param.description}
                          </p>
                          <input
                            type="text"
                            value={toolParams[param.name] ?? ""}
                            onChange={(e) =>
                              setToolParams((prev) => ({
                                ...prev,
                                [param.name]: e.target.value,
                              }))
                            }
                            placeholder={param.default !== undefined ? String(param.default) : "Enter value..."}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Output Console */}
                {executionResult && (
                  <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        MCP Tool Execution Result
                      </span>
                      {executionLatency && (
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                          ⚡ {executionLatency}ms
                        </span>
                      )}
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>

                    {/* Quick Action Button if Gmail API is disabled */}
                    {(executionResult?.data?.type === "GMAIL_API_DISABLED" ||
                      executionResult?.message?.includes("Gmail API is disabled") ||
                      apiActivationAlert?.needed) && (
                      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>The Gmail API is disabled in Google Cloud Project ({executionResult?.data?.projectId || apiActivationAlert?.projectId || "18240900817"}).</span>
                        </div>
                        <a
                          href={executionResult?.data?.activationUrl || apiActivationAlert?.url || "https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=18240900817"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold shrink-0 transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <span>Enable Gmail API in Google Cloud</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-mono">JSON-RPC 2.0 Compliant</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                  Standard: Model Context Protocol (MCP)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Gmail MCP Inbox Explorer */}
        {activeTab === "inbox-runner" && platform.id === "gmail" && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Google Cloud Gmail API Enablement Alert */}
            {apiActivationAlert?.needed && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 dark:border-amber-400/20 backdrop-blur-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Action Required: Enable Gmail API in Google Cloud
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          Project {apiActivationAlert.projectId || "18240900817"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                        Google requires enabling the Gmail API for your Google Cloud project before live emails can be queried. Click below to enable it in 1 click, then refresh.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={apiActivationAlert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <span>Enable Gmail API ↗</span>
                    </a>
                    <button
                      onClick={() => handleFetchGmailInbox()}
                      disabled={fetchingEmails}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.12] text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${fetchingEmails ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Top Mailbox Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Connected Account
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                  {profile.emailAddress || platform.connectedAccount || platform.settings?.email || "Not Connected"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Unread Messages
                </span>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {profile.unreadMessagesTotal ? `${profile.unreadMessagesTotal} Unread` : `${inboxEmails.filter((m) => m.unread).length} Unread`}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Total Synced Threads
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {profile.threadsTotal ? profile.threadsTotal : (inboxEmails.length > 0 ? inboxEmails.length : "--")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  MCP Protocol Latency
                </span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {executionLatency ? `${executionLatency}ms` : "Real Google API"}
                </p>
              </div>
            </div>

            {/* Filter Bar & Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchGmailInbox(searchQuery)}
                  placeholder="Filter inbox via MCP query (e.g. is:unread, label:IMPORTANT, stripe)..."
                  className="w-full pl-9 pr-24 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleFetchGmailInbox(searchQuery)}
                  disabled={fetchingEmails}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {fetchingEmails ? "Syncing..." : "Search"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFetchGmailInbox("label:INBOX")}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fetchingEmails ? "animate-spin" : ""}`} />
                  <span>Refresh Inbox</span>
                </button>

                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors border ${
                    showRawJson
                      ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-100 dark:bg-white/[0.06] border-transparent text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{showRawJson ? "Hide MCP JSON" : "Raw MCP Payload"}</span>
                </button>
              </div>
            </div>

            {/* Raw JSON-RPC View Toggle */}
            {showRawJson && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-300 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-zinc-400">
                  <span>JSON-RPC 2.0 Response payload from gmail_list_messages</span>
                  <span>{inboxEmails.length} messages returned</span>
                </div>
                <pre className="overflow-x-auto max-h-60 text-[11px]">
                  {JSON.stringify(
                    {
                      jsonrpc: "2.0",
                      id: "call_gmail_inbox_fetch",
                      result: {
                        messagesCount: inboxEmails.length,
                        messages: inboxEmails,
                        profile,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            {/* Email Message List */}
            <div className="border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-white/[0.01]">
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-400">
                <span>INBOX STREAM ({inboxEmails.length} REAL MESSAGES LOADED VIA GMAIL MCP)</span>
                <span>Click message to inspect thread details</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {apiActivationAlert?.needed ? (
                  <div className="p-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h5 className="text-base font-bold text-slate-900 dark:text-white">
                        Gmail API Not Enabled in Google Cloud
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                        Your account is connected, but Google requires enabling the Gmail API in Google Cloud project <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{apiActivationAlert.projectId || "18240900817"}</span> before emails can be fetched.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <a
                        href={apiActivationAlert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
                      >
                        <span>Enable Gmail API ↗</span>
                      </a>
                      <button
                        onClick={() => handleFetchGmailInbox()}
                        disabled={fetchingEmails}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-white/10 inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${fetchingEmails ? "animate-spin" : ""}`} />
                        <span>Refresh Inbox</span>
                      </button>
                    </div>
                  </div>
                ) : !profile.emailAddress && !platform.settings?.email && !bearerToken && inboxEmails.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-sm">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      No Google Account Connected
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Connect your personal or Workspace Google account via OAuth 2.0 to stream and triage your real inbox messages and drafts.
                    </p>
                    <div className="pt-1">
                      <a
                        href={`/api/auth/google/gmail?userId=${encodeURIComponent(userId)}&redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/integrations")}`}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
                      >
                        <span>Sign in with Google</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : inboxEmails.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-xs font-mono">
                    No real emails found in mailbox matching query &apos;{searchQuery}&apos;.
                  </div>
                ) : (
                  inboxEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        email.unread
                          ? "bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            email.unread ? "bg-indigo-600 dark:bg-indigo-400 animate-pulse" : "bg-transparent"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {email.from.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 truncate hidden sm:inline">
                              &lt;{email.from.email}&gt;
                            </span>
                            {email.starred && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            {email.hasAttachment && (
                              <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>

                          <h5 className="text-xs text-slate-800 dark:text-zinc-200 font-semibold mt-0.5 truncate">
                            {email.subject}
                          </h5>

                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-xl font-normal mt-0.5">
                            {email.snippet}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-1.5">
                        <span className="text-[11px] font-mono text-slate-400">
                          {email.date}
                        </span>
                        <div className="flex items-center gap-1">
                          {email.labels.slice(0, 2).map((lbl) => (
                            <span
                              key={lbl}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-zinc-400 uppercase"
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Email Inspection Detail Modal / View */}
            {selectedEmail && (
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60 dark:border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      Message Viewer (gmail_get_message): {selectedEmail.id}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Close Preview
                  </button>
                </div>

                <div className="text-xs space-y-1">
                  <p>
                    <strong className="text-slate-900 dark:text-white">From:</strong> {selectedEmail.from.name} ({selectedEmail.from.email})
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Subject:</strong> {selectedEmail.subject}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#08090d] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedEmail.body}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Permissions & Bridge Settings */}
        {activeTab === "config" && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Dedicated Google OAuth 2.0 Multi-User & MCP Config for Gmail */}
            {platform.id === "gmail" && (
              <div className="space-y-4">
                {/* 1. Google OAuth 2.0 Multi-User Status Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 dark:from-indigo-950/40 dark:via-zinc-900/60 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.35 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.43l4.03-3.14z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          Google OAuth 2.0 Multi-User Authentication
                          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-500/30">
                            Multi-User Isolated
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Per-user authorization code flow with offline auto-refresh tokens
                        </p>
                      </div>
                    </div>

                    {platform.settings?.authMethod === "oauth" || platform.settings?.email ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Connected with Google
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                        Direct / Sandbox Mode
                      </span>
                    )}
                  </div>

                  {/* Connected Account Details */}
                  {platform.settings?.email ? (
                    <div className="p-4 rounded-xl bg-white/80 dark:bg-black/20 border border-indigo-100 dark:border-white/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                            Google Account
                          </span>
                          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-500" />
                            {platform.settings.email}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                            OmniMind User ID (Multi-User Tenant)
                          </span>
                          <p className="font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {userId}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                            Auto-Refresh Status
                          </span>
                          <p className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {platform.settings.refreshToken ? "Offline refresh_token active" : "Managed token"}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                            Storage Backend
                          </span>
                          <p className="font-mono text-slate-700 dark:text-zinc-300 mt-0.5">
                            InsForge PostgreSQL (public.user_integrations)
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Need to switch accounts or refresh permissions?
                        </span>
                        <a
                          href={`/api/auth/google/gmail?userId=${encodeURIComponent(userId)}&redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/integrations")}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 transition-colors inline-flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-authenticate with Google</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/80 dark:bg-black/20 border border-indigo-100 dark:border-white/10 space-y-3">
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                        Authorize this specific user (<code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{userId}</code>) via Google OAuth 2.0. The server will use your <code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">GOOGLE_CLIENT_ID</code> and <code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">GOOGLE_CLIENT_SECRET</code> from <code className="font-mono text-slate-800 dark:text-zinc-300">.env</code> to obtain and auto-refresh offline tokens.
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`w-2 h-2 rounded-full ${googleOAuthConfig.isConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                            {googleOAuthConfig.isConfigured
                              ? `Configured in .env: ${googleOAuthConfig.clientId?.slice(0, 16)}...`
                              : "Notice: Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"}
                          </span>
                        </div>

                        <a
                          href={`/api/auth/google/gmail?userId=${encodeURIComponent(userId)}&redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/integrations")}`}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2 shrink-0"
                        >
                          <span>Sign in with Google</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Official Google Gmail MCP Server Info */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          Official Google Gmail MCP Server
                          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-300 dark:border-emerald-500/30">
                            Streamable HTTP
                          </span>
                        </h4>
                        <p className="text-xs font-mono text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mt-0.5">
                          <Globe className="w-3.5 h-3.5" />
                          {OFFICIAL_GMAIL_MCP_ENDPOINT}
                        </p>
                      </div>
                    </div>

                    {tokenVerificationResult.tested && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-semibold rounded-full border ${
                          tokenVerificationResult.valid
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            tokenVerificationResult.valid ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          }`}
                        />
                        {tokenVerificationResult.valid ? "Bearer Token Verified" : "Verification Failed"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-500" />
                        Manual Bearer Token Override / Developer Sandbox
                      </label>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                        Header: <code className="text-indigo-600 dark:text-indigo-400">Authorization: Bearer &lt;access_token&gt;</code>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="password"
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        placeholder="Paste optional manual Bearer Access Token (ya29.a0AfH6...)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <button
                        onClick={() => handleSaveAndVerifyToken(bearerToken)}
                        disabled={verifyingToken}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                      >
                        {verifyingToken ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying with Google...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Save & Test Token</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Required Scopes: <code className="text-indigo-600 dark:text-indigo-400 font-mono">https://www.googleapis.com/auth/gmail.readonly</code>,{" "}
                      <code className="text-indigo-600 dark:text-indigo-400 font-mono">https://www.googleapis.com/auth/gmail.compose</code>.
                      When multi-user Google OAuth is connected above, the server automatically passes the user&apos;s active access token without needing manual input.
                    </p>

                    {tokenVerificationResult.message && (
                      <div
                        className={`p-3 rounded-xl text-xs font-mono border ${
                          tokenVerificationResult.valid
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30"
                        }`}
                      >
                        {tokenVerificationResult.message}
                        {tokenVerificationResult.toolsCount !== undefined && (
                          <span className="block mt-1 text-[11px]">
                            Available Tools on Remote Server: {tokenVerificationResult.toolsCount} tools loaded ({tokenVerificationResult.latencyMs}ms)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Active Model Context Protocol (MCP) Permissions
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                The {platform.name} MCP server operates under restricted access scopes. All communication is routed securely without caching raw email bodies or training AI models on private messages.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Read Inbox & Threads
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Allows AI assistant to triage and summarize threads
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Compose Reply Drafts
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Creates drafts in drafts folder without auto-sending
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Manage Labels & Flags
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Stars priority emails and marks reviewed items
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Zero Model Training
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Strict enterprise zero-retention privacy standard
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disconnect Danger Zone */}
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h5 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider font-mono">
                  Disconnect {platform.name}
                </h5>
                <p className="text-xs text-rose-600/90 dark:text-rose-300/80 mt-0.5">
                  Revokes the MCP server bridge and unlinks all autonomous agent triggers for this account.
                </p>
              </div>

              <button
                onClick={() => {
                  onDisconnect(platform.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-600/20 shrink-0"
              >
                Disconnect Platform
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/60 dark:bg-white/[0.02]">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            Model Context Protocol Bridge: Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] text-xs font-semibold text-slate-800 dark:text-white transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
