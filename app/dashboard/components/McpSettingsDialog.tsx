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
  AlertCircle
} from "lucide-react";
import type { PlatformIntegration, McpToolDefinition } from "@/lib/mcp/platform-tools";
import {
  executeGmailMcpTool,
  type GmailMessage,
  type GmailProfile,
  MOCK_GMAIL_PROFILE
} from "@/lib/mcp/gmail-service";

interface McpSettingsDialogProps {
  platform: PlatformIntegration;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: (id: string) => void;
}

export default function McpSettingsDialog({
  platform,
  isOpen,
  onClose,
  onDisconnect,
}: McpSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<"tools" | "inbox-runner" | "config">("tools");
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition>(platform.tools[0]);
  
  // Gmail Live state
  const [inboxEmails, setInboxEmails] = useState<GmailMessage[]>([]);
  const [profile, setProfile] = useState<GmailProfile>(MOCK_GMAIL_PROFILE);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("label:INBOX");
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);

  // General Tool Execution State
  const [executingTool, setExecutingTool] = useState(false);
  const [toolParams, setToolParams] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionLatency, setExecutionLatency] = useState<number | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

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
  const handleFetchGmailInbox = async (query = "label:INBOX") => {
    setFetchingEmails(true);
    try {
      const [messagesRes, profileRes] = await Promise.all([
        executeGmailMcpTool("gmail_list_messages", { q: query, maxResults: 15 }),
        executeGmailMcpTool("gmail_get_profile", {}),
      ]);

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
        const res = await executeGmailMcpTool(selectedTool.name, toolParams);
        setExecutionResult(res.result);
        setExecutionLatency(res.latencyMs);

        // If listing messages was run, also update the live inbox state
        if (selectedTool.name === "gmail_list_messages" && res.result?.messages) {
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
            {/* Top Mailbox Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Connected Account
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                  {profile.emailAddress}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Unread Messages
                </span>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {inboxEmails.filter((m) => m.unread).length} Unread
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Total Synced Threads
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {profile.threadsTotal}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  MCP Protocol Latency
                </span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {executionLatency ? `${executionLatency}ms` : "82ms"}
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
                <span>INBOX STREAM ({inboxEmails.length} MESSAGES LOADED VIA GMAIL MCP)</span>
                <span>Click message to inspect thread details</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {inboxEmails.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-xs font-mono">
                    No emails found matching query &apos;{searchQuery}&apos;.
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
