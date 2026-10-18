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

// Initial realistic executive inbox dataset for live demonstration
export const INITIAL_GMAIL_EMAILS: GmailMessage[] = [
  {
    id: "msg_98412_alpha",
    threadId: "th_84210",
    from: {
      name: "Sarah Lin (Chief Product Officer)",
      email: "sarah.lin@apexventures.io",
    },
    to: "alex.mercer@omnimind.ai",
    subject: "Urgent: Q4 Executive Roadmap & AI Agent Architecture Sign-Off",
    snippet:
      "Hi Alex, attached is the revised Q4 infrastructure roadmap. We need your final approval on the MCP tool orchestrator before tomorrow's 9:00 AM board briefing...",
    body: "Hi Alex,\n\nAttached is the revised Q4 infrastructure roadmap incorporating the autonomous Model Context Protocol (MCP) server endpoints.\n\nKey decisions requiring your sign-off:\n1. Direct Gmail & Slack real-time event streaming pipeline\n2. Sent.dm SMS/WhatsApp OTP fallback mechanism\n3. Enterprise data encryption guarantees (Zero Model Training)\n\nPlease review by 5:00 PM today so we can finalize the deck for tomorrow morning's board meeting.\n\nBest,\nSarah Lin\nChief Product Officer",
    date: "10 mins ago",
    timestamp: Date.now() - 10 * 60 * 1000,
    unread: true,
    starred: true,
    labels: ["INBOX", "IMPORTANT", "UNREAD", "EXECUTIVE"],
    category: "VIP",
    hasAttachment: true,
  },
  {
    id: "msg_98413_stripe",
    threadId: "th_84211",
    from: {
      name: "Stripe Billing",
      email: "invoices@stripe.com",
    },
    to: "alex.mercer@omnimind.ai",
    subject: "Receipt for Invoice #INV-2026-10492 ($4,250.00 USD)",
    snippet:
      "Your payment of $4,250.00 for OmniMind Enterprise Cloud Tier has been processed successfully. View your receipt and download tax invoice...",
    body: "Hello Alex,\n\nYour payment for Invoice #INV-2026-10492 has been confirmed.\n\nAmount: $4,250.00 USD\nPayment Method: Visa ending in 4242\nPeriod: Oct 1, 2026 - Nov 1, 2026\n\nYour accounting ledger has been updated. If you have questions, please reach out to billing support.",
    date: "42 mins ago",
    timestamp: Date.now() - 42 * 60 * 1000,
    unread: true,
    starred: false,
    labels: ["INBOX", "UNREAD", "FINANCE"],
    category: "Billing",
    hasAttachment: true,
  },
  {
    id: "msg_98414_google",
    threadId: "th_84212",
    from: {
      name: "Google Cloud Platform",
      email: "cloud-security@google.com",
    },
    to: "alex.mercer@omnimind.ai",
    subject: "Security Notification: Gmail MCP OAuth 2.0 Client Authorized",
    snippet:
      "A new Model Context Protocol (MCP) client was granted access to Gmail API scopes (read, draft, labels) for alex.mercer@omnimind.ai...",
    body: "Hi Alex Mercer,\n\nThis is a confirmation that 'OmniMind Gmail MCP Server v1.4' has been successfully linked with your Google Workspace Account.\n\nScopes Granted:\n- https://www.googleapis.com/auth/gmail.readonly\n- https://www.googleapis.com/auth/gmail.compose\n- https://www.googleapis.com/auth/gmail.modify\n\nIf you authorized this application, no further action is required.",
    date: "2 hours ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    unread: false,
    starred: false,
    labels: ["INBOX", "SECURITY"],
    category: "System",
    hasAttachment: false,
  },
  {
    id: "msg_98415_insforge",
    threadId: "th_84213",
    from: {
      name: "InsForge Realtime Engine",
      email: "alerts@insforge.app",
    },
    to: "alex.mercer@omnimind.ai",
    subject: "Database Cluster Health: Latency dropped to 14ms across US-East",
    snippet:
      "Cluster t8gt9yje has completed seamless migration to PostgreSQL PostgREST v12 engine. High-throughput indexing active...",
    body: "Hi Alex,\n\nAll health checks passed with 100% uptime. Your PostgreSQL cluster at https://t8gt9yje.us-east.insforge.app is operating at peak performance with sub-15ms p99 response times.",
    date: "4 hours ago",
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    unread: false,
    starred: false,
    labels: ["INBOX", "DEVOPS"],
    category: "Updates",
    hasAttachment: false,
  },
  {
    id: "msg_98416_docusign",
    threadId: "th_84214",
    from: {
      name: "DocuSign System",
      email: "dse@docusign.net",
    },
    to: "alex.mercer@omnimind.ai",
    subject: "Please DocuSign: Master Services Agreement - Sentinel AI Partners",
    snippet:
      "Sentinel AI Partners sent you Master Services Agreement for signature. Please review and sign before Friday 5:00 PM EST...",
    body: "Please review and complete the signing process for the Sentinel AI Partners Master Services Agreement.\n\nDocument ID: 8940-2391-4491-MSA\nExpires: Friday, October 23, 2026\n\nClick the link below to verify identity and affix your electronic signature.",
    date: "Yesterday",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    unread: true,
    starred: true,
    labels: ["INBOX", "UNREAD", "LEGAL"],
    category: "VIP",
    hasAttachment: true,
  },
  {
    id: "msg_98417_github",
    threadId: "th_84215",
    from: {
      name: "GitHub Notifications",
      email: "notifications@github.com",
    },
    to: "alex.mercer@omnimind.ai",
    subject: "[ai-assistant-agent] PR #42: Add Model Context Protocol (MCP) server endpoints",
    snippet:
      "David Chen requested your review on PR #42: feat(mcp): implement standardized MCP JSON-RPC protocol bridge for Gmail and Slack...",
    body: "David Chen submitted PR #42 for review:\n\nSummary:\n- Added JSON-RPC 2.0 MCP tools handler\n- Implemented `gmail_list_messages` and `gmail_get_profile`\n- Unit test coverage at 94%\n\nView PR on GitHub: https://github.com/omnimind/ai-assistant-agent/pull/42",
    date: "Yesterday",
    timestamp: Date.now() - 26 * 60 * 60 * 1000,
    unread: false,
    starred: false,
    labels: ["INBOX", "DEVELOPER"],
    category: "Work",
    hasAttachment: false,
  },
  {
    id: "msg_98418_flight",
    threadId: "th_84216",
    from: {
      name: "Delta Air Lines",
      email: "ticketreceipt@delta.com",
    },
    to: "alex.mercer@omnimind.ai",
    subject: "Flight Confirmation: San Francisco (SFO) to New York (JFK) - Flight DL 492",
    snippet:
      "Your booking is confirmed for Friday, Oct 23. Departure: 8:15 AM SFO. Confirmation code: H9K4XP...",
    body: "Dear Alex Mercer,\n\nYour eTicket receipt has been issued.\n\nFlight: DL 492 (Non-stop)\nDeparts: SFO 8:15 AM\nArrives: JFK 4:45 PM\nSeat: 3A (First Class)\nConfirmation: H9K4XP\n\nOmniMind AI has automatically added this itinerary to your calendar schedule.",
    date: "2 days ago",
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    unread: false,
    starred: true,
    labels: ["INBOX", "TRAVEL"],
    category: "Updates",
    hasAttachment: true,
  }
];

export const MOCK_GMAIL_PROFILE: GmailProfile = {
  emailAddress: "alex.mercer@omnimind.ai",
  messagesTotal: 1428,
  threadsTotal: 842,
  unreadMessagesTotal: 4,
  historyId: "10984920",
  storageUsedMb: 2450,
  storageLimitMb: 15360,
};

/**
 * Model Context Protocol (MCP) Client Execution Helper
 * Invokes standard JSON-RPC 2.0 tool calls against the Gmail MCP Server
 */
export async function executeGmailMcpTool(
  toolName: string,
  parameters: Record<string, any> = {}
): Promise<{
  success: boolean;
  latencyMs: number;
  result: any;
  mcpResponse: {
    jsonrpc: string;
    id: string;
    result: {
      content: Array<{ type: "text" | "json"; text?: string; json?: any }>;
      isError?: boolean;
    };
  };
}> {
  const startTime = performance.now();

  try {
    const res = await fetch("/api/mcp/gmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        method: "tools/call",
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
        mcpResponse: {
          jsonrpc: "2.0",
          id: data.id || "err",
          result: {
            content: [{ type: "text", text: data.error.message || "MCP Execution Error" }],
            isError: true,
          },
        },
      };
    }

    const toolContent = data.result?.content?.[0];
    const parsedResult = toolContent?.json || (toolContent?.text ? JSON.parse(toolContent.text) : data.result);

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
