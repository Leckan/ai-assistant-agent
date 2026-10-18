export interface GmailMessage {
  id: string;
  threadId: string;
  from: {
    name: string;
    email: string;
  };
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  timestamp: number;
  unread: boolean;
  starred: boolean;
  labels: string[];
  category: "VIP" | "Work" | "Billing" | "Updates" | "System";
  hasAttachment?: boolean;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  unreadMessagesTotal: number;
  historyId: string;
  storageUsedMb: number;
  storageLimitMb: number;
}

// Default empty profile for unauthenticated / initial states
export const EMPTY_GMAIL_PROFILE: GmailProfile = {
  emailAddress: "",
  messagesTotal: 0,
  threadsTotal: 0,
  unreadMessagesTotal: 0,
  historyId: "",
  storageUsedMb: 0,
  storageLimitMb: 15360,
};

// Backwards-compatible alias for empty profile
export const MOCK_GMAIL_PROFILE = EMPTY_GMAIL_PROFILE;

// Real emails are fetched live via official Gmail MCP and Google Gmail APIs
export const INITIAL_GMAIL_EMAILS: GmailMessage[] = [];

export const OFFICIAL_GMAIL_MCP_ENDPOINT = "https://gmailmcp.googleapis.com/mcp/v1";

/**
 * Model Context Protocol (MCP) Client Execution Helper
 * Invokes standard JSON-RPC 2.0 tool calls against the official Gmail MCP Server gateway
 */
export async function executeGmailMcpTool(
  toolName: string,
  parameters: Record<string, any> = {},
  accessToken?: string | null,
  userId?: string
): Promise<{
  success: boolean;
  latencyMs: number;
  result: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  mcpResponse: {
    jsonrpc: string;
    id: string;
    result: {
      content: Array<{ type: "text" | "json"; text?: string; json?: any }>;
      isError?: boolean;
    };
    error?: {
      code: number;
      message: string;
      data?: any;
    };
    _mcpGateway?: {
      endpoint: string;
      mode: string;
      authenticated: boolean;
    };
  };
}> {
  const startTime = performance.now();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken.trim()}`;
  }

  if (userId) {
    headers["x-user-id"] = userId;
  }

  try {
    const res = await fetch("/api/mcp/gmail", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        method: "tools/call",
        userId,
        params: {
          name: toolName,
          arguments: parameters,
        },
      }),
    });

    const data = await res.json();
    const duration = Math.round(performance.now() - startTime);

    if (data.error) {
      return {
        success: false,
        latencyMs: duration,
        result: data.error,
        error: data.error,
        mcpResponse: {
          jsonrpc: "2.0",
          id: data.id || "err",
          result: {
            content: [{ type: "text", text: data.error.message || "MCP Execution Error" }],
            isError: true,
          },
          error: data.error,
        },
      };
    }

    const toolContent = data.result?.content?.[0];
    let parsedResult = toolContent?.json || null;
    if (!parsedResult && typeof toolContent?.text === "string") {
      try {
        parsedResult = JSON.parse(toolContent.text);
      } catch {
        parsedResult = { text: toolContent.text };
      }
    }
    if (!parsedResult) {
      parsedResult = data.result;
    }

    return {
      success: true,
      latencyMs: duration,
      result: parsedResult,
      mcpResponse: data,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs: duration,
      result: { message: err?.message || "Failed to communicate with Gmail MCP Server" },
      mcpResponse: {
        jsonrpc: "2.0",
        id: "err_network",
        result: {
          content: [{ type: "text", text: String(err?.message || "Network Error") }],
          isError: true,
        },
      },
    };
  }
}

/**
 * Verify a Google OAuth 2.0 Bearer access token directly against the official Gmail MCP server
 */
export async function verifyGoogleMcpToken(accessToken: string): Promise<{
  valid: boolean;
  message: string;
  tools?: any[];
  latencyMs: number;
}> {
  const startTime = performance.now();
  try {
    const res = await fetch("/api/mcp/gmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "verify_token",
        method: "tools/list",
      }),
    });

    const data = await res.json();
    const duration = Math.round(performance.now() - startTime);

    if (data.error) {
      return {
        valid: false,
        message: data.error.message || "Failed to authenticate with Google Gmail MCP server",
        latencyMs: duration,
      };
    }

    return {
      valid: true,
      message: `Successfully authenticated with ${OFFICIAL_GMAIL_MCP_ENDPOINT}`,
      tools: data.result?.tools || [],
      latencyMs: duration,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      valid: false,
      message: err.message || "Network error verifying token",
      latencyMs: duration,
    };
  }
}

/**
 * Check if Google OAuth 2.0 Client credentials are configured in backend .env
 */
export async function checkGoogleOAuthConfigured(): Promise<{
  isConfigured: boolean;
  message?: string;
  clientId?: string | null;
  redirectUri?: string;
}> {
  try {
    const res = await fetch("/api/auth/google/gmail?mode=json");
    const data = await res.json();
    return {
      isConfigured: !!data.isConfigured,
      message: data.message,
      clientId: data.clientId,
      redirectUri: data.redirectUri,
    };
  } catch {
    return { isConfigured: false, message: "Could not query Google OAuth configuration status" };
  }
}

