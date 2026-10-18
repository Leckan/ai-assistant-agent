/**
 * Real Google Workspace & Gmail API Integration Engine
 * Connects directly to Google's live Gmail APIs and official Gmail MCP Server.
 * Replaces all mock datasets with real user email data, real threads, and mailbox profiles.
 */

import type { GmailMessage, GmailProfile } from "./gmail-service";

/**
 * Decode base64url encoded strings from Google's Gmail API payload
 */
export function decodeBase64Url(data?: string): string {
  if (!data) return "";
  try {
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/**
 * Case-insensitive header lookup helper
 */
export function getHeader(
  headers: Array<{ name: string; value: string }> | undefined,
  name: string
): string {
  if (!headers || !Array.isArray(headers)) return "";
  const found = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return found ? found.value : "";
}

/**
 * Parse RFC 2822 "From: Name <email@example.com>" header
 */
export function parseSender(fromHeader: string): { name: string; email: string } {
  if (!fromHeader) return { name: "Unknown Sender", email: "" };
  const match = fromHeader.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    const rawName = match[1].replace(/["']/g, "").trim();
    return {
      name: rawName || match[2].trim(),
      email: match[2].trim(),
    };
  }
  return {
    name: fromHeader.replace(/["']/g, "").trim(),
    email: fromHeader.includes("@") ? fromHeader.trim() : "",
  };
}

/**
 * Format RFC 2822 date or epoch ms into relative human string
 */
export function formatEmailDate(
  dateHeader?: string,
  internalDate?: string | number
): { dateStr: string; timestamp: number } {
  let ts = 0;
  if (internalDate) {
    ts = Number(internalDate);
  }
  if (!ts && dateHeader) {
    ts = new Date(dateHeader).getTime();
  }
  if (!ts || isNaN(ts)) {
    ts = Date.now();
  }

  const diff = Date.now() - ts;
  let dateStr = "Recently";

  if (diff < 60 * 1000) {
    dateStr = "Just now";
  } else if (diff < 60 * 60 * 1000) {
    dateStr = `${Math.floor(diff / (60 * 1000))}m ago`;
  } else if (diff < 24 * 60 * 60 * 1000) {
    dateStr = `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
  } else if (diff < 48 * 60 * 60 * 1000) {
    dateStr = "Yesterday";
  } else {
    dateStr = new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return { dateStr, timestamp: ts };
}

/**
 * Recursively extract plain text and HTML from Gmail MIME parts
 */
export function extractBodyFromPayload(payload?: any): string {
  if (!payload) return "";

  // 1. Single-part body with data
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // 2. Multi-part body: traverse parts
  if (Array.isArray(payload.parts)) {
    // Priority: text/plain
    const textPart = payload.parts.find((p: any) => p.mimeType === "text/plain");
    if (textPart?.body?.data) {
      return decodeBase64Url(textPart.body.data);
    }

    // Secondary: text/html stripped of tags
    const htmlPart = payload.parts.find((p: any) => p.mimeType === "text/html");
    if (htmlPart?.body?.data) {
      const html = decodeBase64Url(htmlPart.body.data);
      return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Recursive search in nested multipart containers (e.g. multipart/related)
    for (const subPart of payload.parts) {
      const subBody = extractBodyFromPayload(subPart);
      if (subBody) return subBody;
    }
  }

  return "";
}

/**
 * Check if payload contains file attachments
 */
export function hasAttachments(payload?: any): boolean {
  if (!payload) return false;
  if (Array.isArray(payload.parts)) {
    for (const p of payload.parts) {
      if (p.filename && p.filename.length > 0) return true;
      if (p.body?.attachmentId) return true;
      if (hasAttachments(p)) return true;
    }
  }
  return false;
}

/**
 * Derive semantic visual category from Gmail label IDs
 */
export function deriveCategory(
  labelIds?: string[]
): "VIP" | "Work" | "Billing" | "Updates" | "System" {
  if (!labelIds || !Array.isArray(labelIds)) return "Updates";
  if (labelIds.includes("IMPORTANT") || labelIds.includes("STARRED")) return "VIP";
  if (labelIds.includes("CATEGORY_PERSONAL")) return "Work";
  if (labelIds.includes("CATEGORY_PROMOTIONS")) return "Billing";
  if (labelIds.includes("CATEGORY_UPDATES")) return "Updates";
  if (labelIds.includes("CATEGORY_SOCIAL") || labelIds.includes("CATEGORY_FORUMS")) return "System";
  return "Work";
}

/**
 * Parse raw Google Gmail API message into normalized GmailMessage structure
 */
export function parseGmailApiMessage(msg: any): GmailMessage {
  const headers = msg.payload?.headers || [];
  const subject = getHeader(headers, "Subject") || "(No Subject)";
  const fromHeader = getHeader(headers, "From") || "Unknown Sender";
  const toHeader = getHeader(headers, "To") || "";
  const dateHeader = getHeader(headers, "Date") || "";
  const { dateStr, timestamp } = formatEmailDate(dateHeader, msg.internalDate);
  const from = parseSender(fromHeader);
  const snippet = msg.snippet || "";
  const body = extractBodyFromPayload(msg.payload) || snippet;
  const labelIds: string[] = Array.isArray(msg.labelIds) ? msg.labelIds : [];

  return {
    id: msg.id,
    threadId: msg.threadId || msg.id,
    from,
    to: toHeader,
    subject,
    snippet,
    body,
    date: dateStr,
    timestamp,
    unread: labelIds.includes("UNREAD"),
    starred: labelIds.includes("STARRED"),
    labels: labelIds,
    category: deriveCategory(labelIds),
    hasAttachment: hasAttachments(msg.payload),
  };
}

/**
 * Parse official Google MCP search_threads response into normalized GmailMessage list
 */
export function parseOfficialMcpThreadsToMessages(threads: any[]): GmailMessage[] {
  if (!Array.isArray(threads)) return [];
  const messages: GmailMessage[] = [];

  for (const thread of threads) {
    if (Array.isArray(thread.messages) && thread.messages.length > 0) {
      for (const msg of thread.messages) {
        const from = parseSender(msg.sender || "");
        const labelIds = Array.isArray(msg.labelIds) ? msg.labelIds : [];
        const { dateStr, timestamp } = formatEmailDate(msg.date, msg.internalDate);
        messages.push({
          id: msg.id || `msg_${thread.id}`,
          threadId: msg.threadId || thread.id,
          from,
          to: Array.isArray(msg.toRecipients)
            ? msg.toRecipients.join(", ")
            : msg.toRecipients || "",
          subject: msg.subject || "(No Subject)",
          snippet: msg.snippet || "",
          body: msg.plaintextBody || msg.htmlBody || msg.snippet || "",
          date: dateStr,
          timestamp,
          unread: labelIds.includes("UNREAD"),
          starred: labelIds.includes("STARRED"),
          labels: labelIds,
          category: deriveCategory(labelIds),
          hasAttachment: Boolean(
            msg.attachments?.length || msg.attachmentIds?.length
          ),
        });
      }
    } else if (thread.id) {
      // If minimal thread summary was returned
      const from = parseSender(thread.sender || "");
      const { dateStr, timestamp } = formatEmailDate(thread.date);
      messages.push({
        id: thread.id,
        threadId: thread.id,
        from,
        to: Array.isArray(thread.toRecipients)
          ? thread.toRecipients.join(", ")
          : thread.toRecipients || "",
        subject: thread.subject || "(No Subject)",
        snippet: thread.snippet || "",
        body: thread.snippet || "",
        date: dateStr,
        timestamp,
        unread: Array.isArray(thread.labelIds)
          ? thread.labelIds.includes("UNREAD")
          : false,
        starred: Array.isArray(thread.labelIds)
          ? thread.labelIds.includes("STARRED")
          : false,
        labels: Array.isArray(thread.labelIds) ? thread.labelIds : [],
        category: deriveCategory(thread.labelIds),
        hasAttachment: false,
      });
    }
  }

  return messages;
}

/**
 * Structured Gmail API error class
 */
export class GmailApiError extends Error {
  code: number;
  statusCode: number;
  isApiDisabled: boolean;
  activationUrl?: string;
  projectId?: string;

  constructor(
    message: string,
    options?: {
      code?: number;
      statusCode?: number;
      isApiDisabled?: boolean;
      activationUrl?: string;
      projectId?: string;
    }
  ) {
    super(message);
    this.name = "GmailApiError";
    this.code = options?.code || -32003;
    this.statusCode = options?.statusCode || 500;
    this.isApiDisabled = options?.isApiDisabled || false;
    this.activationUrl = options?.activationUrl;
    this.projectId = options?.projectId;
  }
}

/**
 * Parse Google API error body and throw a friendly, structured GmailApiError
 */
export function handleGoogleApiError(status: number, rawText: string): never {
  let message = rawText;
  let isApiDisabled = false;
  let activationUrl: string | undefined;
  let projectId: string | undefined;

  try {
    const json = JSON.parse(rawText);
    const errObj = json.error || {};
    const rawMsg = errObj.message || rawText;

    if (
      rawMsg.includes("Gmail API has not been used") ||
      rawMsg.includes("it is disabled") ||
      errObj.status === "PERMISSION_DENIED" ||
      errObj.status === "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
    ) {
      isApiDisabled = true;
      const projMatch = rawMsg.match(/project (\d+)/i) || rawMsg.match(/projects\/(\d+)/i);
      if (projMatch) {
        projectId = projMatch[1];
      }
      const urlMatch = rawMsg.match(/https:\/\/console\.developers\.google\.com\/apis\/api\/gmail\.googleapis\.com\/overview\?[^\s"'\)]+/i);
      if (urlMatch) {
        activationUrl = urlMatch[0];
      } else if (projectId) {
        activationUrl = `https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=${projectId}`;
      } else {
        activationUrl = "https://console.developers.google.com/apis/library/gmail.googleapis.com";
      }

      message = projectId
        ? `The Gmail API is not enabled in your Google Cloud Project (${projectId}). Please enable it in the Google Cloud Console at ${activationUrl}`
        : `The Gmail API is not enabled in your Google Cloud Project. Please enable it in Google Cloud Console.`;
    } else {
      message = rawMsg;
    }
  } catch {
    message = rawText;
  }

  throw new GmailApiError(message, {
    statusCode: status,
    code: isApiDisabled ? -32003 : -32000,
    isApiDisabled,
    activationUrl,
    projectId,
  });
}

/**
 * Fetch real user profile directly from Google's live Gmail & UserInfo APIs
 */
export async function fetchRealGoogleProfile(accessToken: string): Promise<
  GmailProfile & {
    name?: string;
    picture?: string;
  }
> {
  // Query Google OAuth userinfo first (name, picture)
  let name = "";
  let picture = "";
  let userInfoEmail = "";
  try {
    const userinfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );
    if (userinfoRes.ok) {
      const userInfo = await userinfoRes.json();
      name = userInfo.name || "";
      picture = userInfo.picture || "";
      userInfoEmail = userInfo.email || "";
    }
  } catch {
    // Non-fatal
  }

  const profileRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!profileRes.ok) {
    const errText = await profileRes.text();
    handleGoogleApiError(profileRes.status, errText);
  }

  const profileData = await profileRes.json();

  // Query unread count estimate
  let unreadCount = 0;
  try {
    const unreadRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );
    if (unreadRes.ok) {
      const unreadData = await unreadRes.json();
      unreadCount = Number(unreadData.resultSizeEstimate) || 0;
    }
  } catch {
    // Non-fatal
  }

  return {
    emailAddress: profileData.emailAddress || userInfoEmail || "",
    messagesTotal: Number(profileData.messagesTotal) || 0,
    threadsTotal: Number(profileData.threadsTotal) || 0,
    unreadMessagesTotal: unreadCount,
    historyId: String(profileData.historyId || ""),
    storageUsedMb: 0,
    storageLimitMb: 15360,
    name,
    picture,
  };
}

/**
 * Fetch real emails directly from Google's Gmail API
 */
export async function fetchRealGoogleMessages(
  accessToken: string,
  query = "label:INBOX",
  maxResults = 15
): Promise<{
  messages: GmailMessage[];
  totalEstimate: number;
  query: string;
}> {
  const cleanMax = Math.min(Math.max(Number(maxResults) || 10, 1), 50);
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
    query
  )}&maxResults=${cleanMax}`;

  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!listRes.ok) {
    const errText = await listRes.text();
    handleGoogleApiError(listRes.status, errText);
  }

  const listData = await listRes.json();
  const messageItems: Array<{ id: string; threadId: string }> =
    listData.messages || [];
  const totalEstimate =
    Number(listData.resultSizeEstimate) || messageItems.length;

  if (messageItems.length === 0) {
    return { messages: [], totalEstimate: 0, query };
  }

  // Fetch full details for each message in parallel
  const detailPromises = messageItems.slice(0, cleanMax).map(async (item) => {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );
      if (!msgRes.ok) return null;
      const msgData = await msgRes.json();
      return parseGmailApiMessage(msgData);
    } catch {
      return null;
    }
  });

  const resolved = await Promise.all(detailPromises);
  const messages = resolved.filter((m): m is GmailMessage => m !== null);

  return { messages, totalEstimate, query };
}

/**
 * Fetch a single real email message with full body and headers
 */
export async function fetchRealGoogleMessageById(
  accessToken: string,
  messageId: string
): Promise<GmailMessage | null> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(
      messageId
    )}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return parseGmailApiMessage(data);
}

/**
 * Create a real draft directly in the user's Google Gmail account
 */
export async function createRealGoogleDraft(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
  }
): Promise<{ draftId: string; messageId: string; threadId?: string }> {
  const lines = [
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    `Content-Transfer-Encoding: 7bit`,
    `To: ${params.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(params.subject).toString("base64")}?=`,
    "",
    params.body,
  ];

  const raw = Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          raw,
          ...(params.threadId ? { threadId: params.threadId } : {}),
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    handleGoogleApiError(res.status, err);
  }

  const data = await res.json();
  return {
    draftId: data.id,
    messageId: data.message?.id,
    threadId: data.message?.threadId,
  };
}

/**
 * List real labels in user's Gmail account
 */
export async function fetchRealGoogleLabels(accessToken: string): Promise<any[]> {
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.labels || [];
}

/**
 * Trash a real message in user's Gmail
 */
export async function trashRealGoogleMessage(
  accessToken: string,
  messageId: string
): Promise<boolean> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(
      messageId
    )}/trash`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return res.ok;
}

/**
 * Dispatch an authorized email directly from the connected Gmail account
 */
export async function sendRealGoogleMessage(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
  }
): Promise<{ messageId: string; threadId?: string; to: string; subject: string }> {
  const lines = [
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    `Content-Transfer-Encoding: 7bit`,
    `To: ${params.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(params.subject).toString("base64")}?=`,
    "",
    params.body,
  ];

  const raw = Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw,
        ...(params.threadId ? { threadId: params.threadId } : {}),
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    handleGoogleApiError(res.status, err);
  }

  const data = await res.json();
  return {
    messageId: data.id,
    threadId: data.threadId,
    to: params.to,
    subject: params.subject,
  };
}

/**
 * Batch modify labels on messages (e.g. mark read, star, archive)
 */
export async function modifyRealGoogleMessageLabels(
  accessToken: string,
  params: {
    messageIds: string[];
    addLabelIds?: string[];
    removeLabelIds?: string[];
  }
): Promise<{ modifiedCount: number; messageIds: string[]; addLabelIds?: string[]; removeLabelIds?: string[] }> {
  const ids = Array.isArray(params.messageIds) ? params.messageIds : [params.messageIds].filter(Boolean);
  if (ids.length === 0) {
    throw new Error("No message IDs specified for label modification");
  }

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids,
        addLabelIds: params.addLabelIds || [],
        removeLabelIds: params.removeLabelIds || [],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    handleGoogleApiError(res.status, err);
  }

  return {
    modifiedCount: ids.length,
    messageIds: ids,
    addLabelIds: params.addLabelIds,
    removeLabelIds: params.removeLabelIds,
  };
}

/**
 * List real drafts in the user's Gmail account
 */
export async function fetchRealGoogleDrafts(
  accessToken: string,
  maxResults = 10
): Promise<any[]> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/drafts?maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.drafts || [];
}
