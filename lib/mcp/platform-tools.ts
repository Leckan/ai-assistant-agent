export interface McpToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  default?: any;
}

export interface McpToolDefinition {
  name: string;
  displayName: string;
  description: string;
  actionSummary: string;
  category: "read" | "write" | "admin" | "search";
  parameters: McpToolParameter[];
}

export interface PlatformIntegration {
  id: string;
  name: string;
  logo: string;
  description: string;
  twoLineDesc: [string, string];
  category: "Email" | "Chat" | "Workspace" | "Social" | "Developer";
  mcpServerName: string;
  mcpVersion: string;
  protocolVersion: string;
  status: "connected" | "disconnected" | "connecting";
  connectedAccount?: string;
  lastSynced?: string;
  latencyMs?: number;
  settings?: Record<string, any>;
  tools: McpToolDefinition[];
}

export const PLATFORM_INTEGRATIONS: PlatformIntegration[] = [
  {
    id: "gmail",
    name: "Gmail",
    logo: "/gmail.svg",
    description: "Connect personal and Google Workspace inbox via official Gmail MCP server. Autonomous email triage, thread summaries, and drafts.",
    twoLineDesc: [
      "Connect personal & Workspace inbox via official Gmail MCP.",
      "Automated inbox zero triage, thread digests, and AI drafts."
    ],
    category: "Email",
    mcpServerName: "https://gmailmcp.googleapis.com/mcp/v1",
    mcpVersion: "v1 (Google Official)",
    protocolVersion: "2024-11-05 (OAuth 2.0)",
    status: "disconnected",
    tools: [
      {
        name: "gmail_list_messages",
        displayName: "Fetch Inbox Emails",
        description: "List and retrieve messages from the user's Gmail inbox with query filters, label criteria, and pagination.",
        actionSummary: "Fetches recent inbox threads, unread emails, and metadata",
        category: "read",
        parameters: [
          { name: "q", type: "string", description: "Search query (e.g. 'label:INBOX is:unread')", required: false, default: "label:INBOX" },
          { name: "maxResults", type: "number", description: "Maximum messages to fetch (1-50)", required: false, default: 10 },
          { name: "includeSpamTrash", type: "boolean", description: "Include spam and trash items", required: false, default: false }
        ]
      },
      {
        name: "gmail_get_message",
        displayName: "Get Email Message",
        description: "Retrieve full contents, headers, sender details, subject, body text, and thread history of a specific email by ID.",
        actionSummary: "Reads full message payload and thread context",
        category: "read",
        parameters: [
          { name: "messageId", type: "string", description: "Unique Gmail message ID", required: true },
          { name: "format", type: "string", description: "Payload format ('full', 'metadata', 'raw')", required: false, default: "full" }
        ]
      },
      {
        name: "gmail_get_profile",
        displayName: "Get Mailbox Profile",
        description: "Fetch authenticated user email address, total messages, unread message count, and mailbox history ID.",
        actionSummary: "Retrieves mailbox statistics and quota details",
        category: "read",
        parameters: []
      },
      {
        name: "gmail_search_threads",
        displayName: "Search Conversation Threads",
        description: "Search email conversation threads using Gmail search operator syntax (e.g. 'from:ceo has:attachment').",
        actionSummary: "Searches conversation threads with multi-turn context",
        category: "search",
        parameters: [
          { name: "query", type: "string", description: "Gmail query syntax expression", required: true },
          { name: "maxResults", type: "number", description: "Max conversation threads to return", required: false, default: 5 }
        ]
      },
      {
        name: "gmail_create_draft",
        displayName: "Create Email Draft",
        description: "Prepare a ghostwritten reply or new email draft in the user's drafts folder without sending.",
        actionSummary: "Composes new draft reply ready for user review",
        category: "write",
        parameters: [
          { name: "to", type: "string", description: "Recipient email address", required: true },
          { name: "subject", type: "string", description: "Subject line", required: true },
          { name: "body", type: "string", description: "Draft body content (supports plain text / HTML)", required: true },
          { name: "threadId", type: "string", description: "Existing thread ID to reply to", required: false }
        ]
      },
      {
        name: "gmail_send_message",
        displayName: "Send Email Message",
        description: "Dispatch an authorized email directly from the connected Gmail account.",
        actionSummary: "Sends email outbox message directly",
        category: "write",
        parameters: [
          { name: "to", type: "string", description: "Recipient email address", required: true },
          { name: "subject", type: "string", description: "Subject line", required: true },
          { name: "body", type: "string", description: "Email message body", required: true }
        ]
      },
      {
        name: "gmail_batch_modify_labels",
        displayName: "Modify Message Labels",
        description: "Add or remove labels on messages, such as marking as read, starring, archiving, or categorizing.",
        actionSummary: "Updates labels, stars, and read status",
        category: "write",
        parameters: [
          { name: "messageIds", type: "array", description: "List of Gmail message IDs to modify", required: true },
          { name: "addLabelIds", type: "array", description: "Labels to apply (e.g. ['STARRED', 'IMPORTANT'])", required: false },
          { name: "removeLabelIds", type: "array", description: "Labels to remove (e.g. ['UNREAD'])", required: false }
        ]
      }
    ]
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    logo: "/whatsapp.svg",
    description: "Sent.dm WhatsApp Gateway & Cloud API integration. Voice note transcription, 2-way AI assistant, and chat reminders.",
    twoLineDesc: [
      "Sent.dm WhatsApp Gateway & official Cloud API bridge.",
      "Voice note transcription, 2-way AI chat, and reminders."
    ],
    category: "Chat",
    mcpServerName: "whatsapp-mcp-server",
    mcpVersion: "1.2.0",
    protocolVersion: "2024-11-05",
    status: "connected",
    connectedAccount: "+1 (555) 234-5678",
    lastSynced: "1 min ago",
    latencyMs: 95,
    tools: [
      {
        name: "whatsapp_send_message",
        displayName: "Send WhatsApp Message",
        description: "Send direct WhatsApp messages or notifications to verified phone numbers.",
        actionSummary: "Dispatches conversational messages or alert updates",
        category: "write",
        parameters: [
          { name: "recipientPhone", type: "string", description: "E.164 formatted telephone number", required: true },
          { name: "messageText", type: "string", description: "Message body or markdown content", required: true }
        ]
      },
      {
        name: "whatsapp_transcribe_voice_note",
        displayName: "Transcribe Voice Audio",
        description: "Convert incoming WhatsApp voice notes into high-accuracy text and extract action items.",
        actionSummary: "Transcribes audio notes into searchable tasks",
        category: "read",
        parameters: [
          { name: "mediaId", type: "string", description: "Encrypted audio media ID", required: true },
          { name: "language", type: "string", description: "Source audio language hint", required: false, default: "auto" }
        ]
      },
      {
        name: "whatsapp_list_chats",
        displayName: "List Active WhatsApp Chats",
        description: "Retrieve recent conversational threads, unread counters, and participant contacts.",
        actionSummary: "Lists conversation streams and unread status",
        category: "read",
        parameters: [
          { name: "limit", type: "number", description: "Max conversations to retrieve", required: false, default: 20 }
        ]
      },
      {
        name: "whatsapp_schedule_reminder",
        displayName: "Schedule WhatsApp Reminder",
        description: "Schedule automated conversational reminders dispatched directly to the user's WhatsApp.",
        actionSummary: "Queues future notification triggers",
        category: "write",
        parameters: [
          { name: "reminderText", type: "string", description: "Reminder description", required: true },
          { name: "dispatchTimeIso", type: "string", description: "ISO 8601 target delivery time", required: true }
        ]
      }
    ]
  },
  {
    id: "slack",
    name: "Slack",
    logo: "/slack.svg",
    description: "Enterprise Slack workspace bot integration. Channel digests, direct messages, slash commands, and thread triage.",
    twoLineDesc: [
      "Enterprise Slack workspace bot & webhook connector.",
      "Channel digests, thread summaries, and smart alerts."
    ],
    category: "Workspace",
    mcpServerName: "slack-mcp-server",
    mcpVersion: "2.1.0",
    protocolVersion: "2024-11-05",
    status: "disconnected",
    tools: [
      {
        name: "slack_post_message",
        displayName: "Post Channel Message",
        description: "Publish formatted executive digests, alerts, or thread replies into Slack channels.",
        actionSummary: "Posts markdown blocks into team channels",
        category: "write",
        parameters: [
          { name: "channelId", type: "string", description: "Slack channel ID or #channel-name", required: true },
          { name: "text", type: "string", description: "Message payload or Block Kit structure", required: true }
        ]
      },
      {
        name: "slack_read_channel_history",
        displayName: "Read Channel History",
        description: "Fetch recent channel discussions, shared files, and pinned announcements.",
        actionSummary: "Extracts conversations for digest generation",
        category: "read",
        parameters: [
          { name: "channelId", type: "string", description: "Slack channel ID", required: true },
          { name: "limit", type: "number", description: "Number of messages to retrieve", required: false, default: 30 }
        ]
      },
      {
        name: "slack_list_channels",
        displayName: "List Public & Private Channels",
        description: "Enumerate all accessible public and private Slack channels in the workspace.",
        actionSummary: "Lists directory of workspace channels",
        category: "read",
        parameters: [
          { name: "types", type: "string", description: "Comma-separated channel types ('public_channel,private_channel')", required: false, default: "public_channel" }
        ]
      },
      {
        name: "slack_search_messages",
        displayName: "Search Slack Messages",
        description: "Search messages across the entire workspace using Slack query modifiers.",
        actionSummary: "Performs workspace-wide message searches",
        category: "search",
        parameters: [
          { name: "query", type: "string", description: "Search query keyword or filter", required: true }
        ]
      }
    ]
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    logo: "/outlook.svg",
    description: "Office 365 Exchange and Microsoft Graph calendar & mail integration with multi-account conflict resolution.",
    twoLineDesc: [
      "Office 365 Exchange & Microsoft Graph mail bridge.",
      "Cross-calendar sync, meeting conflict resolver & digests."
    ],
    category: "Email",
    mcpServerName: "outlook-mcp-server",
    mcpVersion: "1.1.8",
    protocolVersion: "2024-11-05",
    status: "disconnected",
    tools: [
      {
        name: "outlook_list_messages",
        displayName: "List Outlook Messages",
        description: "Query emails from Office 365 Exchange inbox and user folders via Microsoft Graph.",
        actionSummary: "Fetches corporate emails and flag status",
        category: "read",
        parameters: [
          { name: "folder", type: "string", description: "Mailbox folder ('Inbox', 'SentItems', etc.)", required: false, default: "Inbox" },
          { name: "top", type: "number", description: "Max messages to return", required: false, default: 10 }
        ]
      },
      {
        name: "outlook_get_calendar_events",
        displayName: "Get Calendar Schedule",
        description: "Retrieve upcoming meetings, attendees, and scheduling conflicts.",
        actionSummary: "Reads Microsoft 365 calendar agenda",
        category: "read",
        parameters: [
          { name: "daysAhead", type: "number", description: "How many days ahead to inspect", required: false, default: 7 }
        ]
      },
      {
        name: "outlook_send_mail",
        displayName: "Send Outlook Mail",
        description: "Send emails via Office 365 Exchange with rich formatting and attachments.",
        actionSummary: "Dispatches enterprise corporate emails",
        category: "write",
        parameters: [
          { name: "toRecipients", type: "array", description: "Array of recipient email addresses", required: true },
          { name: "subject", type: "string", description: "Email subject line", required: true },
          { name: "bodyContent", type: "string", description: "HTML or text email content", required: true }
        ]
      },
      {
        name: "outlook_find_meeting_times",
        displayName: "Find Meeting Times",
        description: "Analyze attendee free/busy availability and suggest optimal meeting slots.",
        actionSummary: "Resolves calendar conflicts automatically",
        category: "search",
        parameters: [
          { name: "attendees", type: "array", description: "List of attendee emails", required: true },
          { name: "durationMinutes", type: "number", description: "Meeting length in minutes", required: false, default: 30 }
        ]
      }
    ]
  },
  {
    id: "discord",
    name: "Discord",
    logo: "/discord.svg",
    description: "Discord Bot & Webhook gateway. Community server monitoring, DM triage, thread management, and notifications.",
    twoLineDesc: [
      "Discord bot gateway for community servers and DMs.",
      "Channel monitoring, thread triage, and smart notifications."
    ],
    category: "Chat",
    mcpServerName: "discord-mcp-server",
    mcpVersion: "1.0.4",
    protocolVersion: "2024-11-05",
    status: "disconnected",
    tools: [
      {
        name: "discord_send_channel_message",
        displayName: "Send Channel Message",
        description: "Post rich embed messages and notifications to specified Discord text channels.",
        actionSummary: "Sends embeds and alerts to Discord channels",
        category: "write",
        parameters: [
          { name: "channelId", type: "string", description: "Discord text channel snowflake ID", required: true },
          { name: "content", type: "string", description: "Message content or markdown embed", required: true }
        ]
      },
      {
        name: "discord_read_messages",
        displayName: "Read Channel Messages",
        description: "Retrieve recent chat messages and discussions from a guild channel.",
        actionSummary: "Fetches community channel history",
        category: "read",
        parameters: [
          { name: "channelId", type: "string", description: "Discord channel ID", required: true },
          { name: "limit", type: "number", description: "Message count (1-100)", required: false, default: 25 }
        ]
      },
      {
        name: "discord_list_guilds",
        displayName: "List Joined Servers",
        description: "List all Discord servers and guilds accessible by the assistant bot.",
        actionSummary: "Lists bot member servers and permissions",
        category: "read",
        parameters: []
      }
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    logo: "/linkedin.svg",
    description: "LinkedIn Professional Network connector. InMail message triage, connection request monitoring, and profile insights.",
    twoLineDesc: [
      "LinkedIn professional network & InMail connector.",
      "Triage recruiter DMs, connection invites & post updates."
    ],
    category: "Social",
    mcpServerName: "linkedin-mcp-server",
    mcpVersion: "1.0.1",
    protocolVersion: "2024-11-05",
    status: "disconnected",
    tools: [
      {
        name: "linkedin_get_profile",
        displayName: "Get Profile Data",
        description: "Fetch professional profile summary, headline, network statistics, and company data.",
        actionSummary: "Retrieves LinkedIn profile insights",
        category: "read",
        parameters: []
      },
      {
        name: "linkedin_list_messages",
        displayName: "List InMail Messages",
        description: "Retrieve unread LinkedIn InMail messages, recruiter inquiries, and conversations.",
        actionSummary: "Monitors professional inbound inquiries",
        category: "read",
        parameters: [
          { name: "unreadOnly", type: "boolean", description: "Filter only unread InMail threads", required: false, default: true }
        ]
      },
      {
        name: "linkedin_post_update",
        displayName: "Publish Network Post",
        description: "Draft and publish professional updates or article summaries to your LinkedIn network.",
        actionSummary: "Publishes updates to LinkedIn feed",
        category: "write",
        parameters: [
          { name: "text", type: "string", description: "Post text content", required: true },
          { name: "visibility", type: "string", description: "Post visibility ('PUBLIC', 'CONNECTIONS')", required: false, default: "PUBLIC" }
        ]
      }
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    logo: "/telegram.svg",
    description: "Official Telegram Bot API bridge with instant command execution, channel summaries, and push briefings.",
    twoLineDesc: [
      "Telegram bot bridge with instant command dispatch.",
      "Channel monitoring, group digests, and fast push alerts."
    ],
    category: "Chat",
    mcpServerName: "telegram-mcp-server",
    mcpVersion: "1.3.0",
    protocolVersion: "2024-11-05",
    status: "connected",
    connectedAccount: "@OmniMindAI_Bot",
    lastSynced: "3 mins ago",
    latencyMs: 64,
    tools: [
      {
        name: "telegram_send_message",
        displayName: "Send Telegram Message",
        description: "Send formatted HTML or markdown messages to Telegram users, groups, or channels.",
        actionSummary: "Sends instant briefings to Telegram chats",
        category: "write",
        parameters: [
          { name: "chatId", type: "string", description: "Telegram chat or channel ID", required: true },
          { name: "text", type: "string", description: "Message body text", required: true }
        ]
      },
      {
        name: "telegram_get_updates",
        displayName: "Get Recent Updates",
        description: "Poll incoming bot messages, interactive callback queries, and command triggers.",
        actionSummary: "Fetches user commands and queries",
        category: "read",
        parameters: [
          { name: "limit", type: "number", description: "Max updates to poll", required: false, default: 20 }
        ]
      },
      {
        name: "telegram_pin_message",
        displayName: "Pin Important Message",
        description: "Pin an executive summary or important reminder to the top of a Telegram chat.",
        actionSummary: "Pins daily briefing to top of chat",
        category: "write",
        parameters: [
          { name: "chatId", type: "string", description: "Telegram chat ID", required: true },
          { name: "messageId", type: "number", description: "ID of message to pin", required: true }
        ]
      }
    ]
  },
  {
    id: "notion",
    name: "Notion",
    logo: "/notion.svg",
    description: "Notion Workspace database & page bridge. Automatically log briefing takeaways and action items into databases.",
    twoLineDesc: [
      "Notion workspace database & document bridge.",
      "Auto-sync briefing takeaways, meeting tasks & wikis."
    ],
    category: "Workspace",
    mcpServerName: "notion-mcp-server",
    mcpVersion: "1.5.0",
    protocolVersion: "2024-11-05",
    status: "disconnected",
    tools: [
      {
        name: "notion_query_database",
        displayName: "Query Task Database",
        description: "Query Notion database records with multi-property filters, sorts, and relations.",
        actionSummary: "Queries Notion database records and views",
        category: "read",
        parameters: [
          { name: "databaseId", type: "string", description: "Notion database UUID", required: true },
          { name: "filter", type: "object", description: "Notion filter query object", required: false }
        ]
      },
      {
        name: "notion_create_page",
        displayName: "Create Notion Page",
        description: "Insert a new document or database item containing executive briefing notes.",
        actionSummary: "Creates formatted doc with action items",
        category: "write",
        parameters: [
          { name: "parentDatabaseId", type: "string", description: "Target database UUID", required: true },
          { name: "title", type: "string", description: "Page title", required: true },
          { name: "contentMarkdown", type: "string", description: "Page content markdown", required: false }
        ]
      },
      {
        name: "notion_search_pages",
        displayName: "Search Notion Pages",
        description: "Search documents, wikis, and notes across the connected Notion workspace.",
        actionSummary: "Workspace-wide semantic search",
        category: "search",
        parameters: [
          { name: "query", type: "string", description: "Search keyword", required: true }
        ]
      }
    ]
  },
  {
    id: "github",
    name: "GitHub",
    logo: "/github.svg",
    description: "GitHub developer repository and workflow integration. Pull request summaries, issue creation, and notification digests.",
    twoLineDesc: [
      "GitHub repository & developer workflow connector.",
      "PR summaries, issue tracking, and release digests."
    ],
    category: "Developer",
    mcpServerName: "github-mcp-server",
    mcpVersion: "1.2.4",
    protocolVersion: "2024-11-05",
    status: "disconnected",
    tools: [
      {
        name: "github_list_pull_requests",
        displayName: "List Pull Requests",
        description: "Fetch open PRs, reviews required, CI checks status, and merge blockers.",
        actionSummary: "Monitors active pull requests and reviews",
        category: "read",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner/org", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "state", type: "string", description: "PR state ('open', 'closed')", required: false, default: "open" }
        ]
      },
      {
        name: "github_create_issue",
        displayName: "Create Issue",
        description: "Automatically log bug reports or actionable tasks from incoming emails/chats as GitHub issues.",
        actionSummary: "Creates trackable developer issues",
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "title", type: "string", description: "Issue title", required: true },
          { name: "body", type: "string", description: "Detailed issue markdown", required: false }
        ]
      },
      {
        name: "github_get_notifications",
        displayName: "Fetch Notifications",
        description: "Get prioritized unread notifications from watched repositories.",
        actionSummary: "Fetches mentions and review requests",
        category: "read",
        parameters: [
          { name: "all", type: "boolean", description: "Show read notifications as well", required: false, default: false }
        ]
      }
    ]
  }
];
