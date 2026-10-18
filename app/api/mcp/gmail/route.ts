import { NextRequest, NextResponse } from "next/server";
import {
  INITIAL_GMAIL_EMAILS,
  MOCK_GMAIL_PROFILE,
  type GmailMessage,
} from "@/lib/mcp/gmail-service";
import { PLATFORM_INTEGRATIONS } from "@/lib/mcp/platform-tools";

// In-memory store for mutations within session
let memoryEmails: GmailMessage[] = [...INITIAL_GMAIL_EMAILS];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonrpc, id = "1", method, params } = body;

    if (jsonrpc !== "2.0") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32600,
            message: "Invalid Request: 'jsonrpc' must be '2.0'",
          },
        },
        { status: 400 }
      );
    }

    // 1. MCP Protocol Handshake: Initialize
    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "gmail-mcp-server",
            version: "1.4.2",
            description: "Official Model Context Protocol (MCP) server for Google Gmail",
          },
          capabilities: {
            tools: {
              listChanged: true,
            },
            resources: {},
            prompts: {},
          },
        },
      });
    }

    // 2. MCP Tools List
    if (method === "tools/list") {
      const gmailPlatform = PLATFORM_INTEGRATIONS.find((p) => p.id === "gmail");
      const tools = gmailPlatform?.tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: {
          type: "object",
          properties: t.parameters.reduce((acc, param) => {
            acc[param.name] = {
              type: param.type,
              description: param.description,
              ...(param.default !== undefined ? { default: param.default } : {}),
            };
            return acc;
          }, {} as Record<string, any>),
          required: t.parameters.filter((p) => p.required).map((p) => p.name),
        },
      })) || [];

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { tools },
      });
    }

    // 3. MCP Tool Call
    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      switch (toolName) {
        // --- Tool: gmail_list_messages ---
        case "gmail_list_messages": {
          const query = (args.q || "").toLowerCase().trim();
          const maxResults = Math.min(Math.max(Number(args.maxResults) || 10, 1), 50);

          let filtered = [...memoryEmails];

          if (query) {
            if (query.includes("is:unread")) {
              filtered = filtered.filter((m) => m.unread);
            }
            if (query.includes("is:starred")) {
              filtered = filtered.filter((m) => m.starred);
            }
            if (query.includes("has:attachment")) {
              filtered = filtered.filter((m) => m.hasAttachment);
            }

            const cleanTerms = query
              .replace(/is:unread/g, "")
              .replace(/is:starred/g, "")
              .replace(/has:attachment/g, "")
              .replace(/label:[a-zA-Z0-9_-]+/g, "")
              .trim();

            if (cleanTerms) {
              filtered = filtered.filter(
                (m) =>
                  m.subject.toLowerCase().includes(cleanTerms) ||
                  m.snippet.toLowerCase().includes(cleanTerms) ||
                  m.from.name.toLowerCase().includes(cleanTerms) ||
                  m.from.email.toLowerCase().includes(cleanTerms) ||
                  m.labels.some((l) => l.toLowerCase().includes(cleanTerms))
              );
            }
          }

          const sliced = filtered.slice(0, maxResults);

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    messages: sliced,
                    resultSizeEstimate: filtered.length,
                    nextPageToken: filtered.length > maxResults ? "token_page_next_9812" : null,
                    query: args.q || "label:INBOX",
                  },
                },
              ],
            },
          });
        }

        // --- Tool: gmail_get_profile ---
        case "gmail_get_profile": {
          const unreadCount = memoryEmails.filter((m) => m.unread).length;
          const updatedProfile = {
            ...MOCK_GMAIL_PROFILE,
            unreadMessagesTotal: unreadCount,
            messagesTotal: memoryEmails.length + 1420,
          };

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: updatedProfile,
                },
              ],
            },
          });
        }

        // --- Tool: gmail_get_message ---
        case "gmail_get_message": {
          const messageId = args.messageId;
          const found = memoryEmails.find((m) => m.id === messageId);

          if (!found) {
            return NextResponse.json({
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Error: Message with ID '${messageId}' not found.`,
                  },
                ],
                isError: true,
              },
            });
          }

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: found,
                },
              ],
            },
          });
        }

        // --- Tool: gmail_search_threads ---
        case "gmail_search_threads": {
          const query = (args.query || "").toLowerCase();
          const maxResults = Number(args.maxResults) || 5;

          const matched = memoryEmails
            .filter(
              (m) =>
                m.subject.toLowerCase().includes(query) ||
                m.snippet.toLowerCase().includes(query) ||
                m.from.name.toLowerCase().includes(query)
            )
            .slice(0, maxResults)
            .map((m) => ({
              threadId: m.threadId,
              subject: m.subject,
              snippet: m.snippet,
              participant: m.from.name,
              messageCount: 3,
              lastMessageDate: m.date,
            }));

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    threads: matched,
                    totalThreadsFound: matched.length,
                  },
                },
              ],
            },
          });
        }

        // --- Tool: gmail_create_draft ---
        case "gmail_create_draft": {
          const { to, subject, body: draftBody, threadId } = args;

          const draftId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    draftId,
                    status: "CREATED",
                    message: {
                      to,
                      subject,
                      snippet: draftBody.substring(0, 80) + "...",
                      threadId: threadId || `th_new_${draftId}`,
                    },
                    createdAt: new Date().toISOString(),
                  },
                },
              ],
            },
          });
        }

        // --- Tool: gmail_send_message ---
        case "gmail_send_message": {
          const { to, subject, body: emailBody } = args;

          const newMsg: GmailMessage = {
            id: `msg_sent_${Date.now()}`,
            threadId: `th_sent_${Date.now()}`,
            from: {
              name: "Alex Mercer",
              email: "alex.mercer@omnimind.ai",
            },
            to,
            subject,
            snippet: emailBody.substring(0, 100) + "...",
            body: emailBody,
            date: "Just now",
            timestamp: Date.now(),
            unread: false,
            starred: false,
            labels: ["SENT"],
            category: "Work",
          };

          memoryEmails = [newMsg, ...memoryEmails];

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    id: newMsg.id,
                    status: "SENT",
                    threadId: newMsg.threadId,
                    deliveredAt: new Date().toISOString(),
                    recipient: to,
                  },
                },
              ],
            },
          });
        }

        // --- Tool: gmail_batch_modify_labels ---
        case "gmail_batch_modify_labels": {
          const { messageIds = [], addLabelIds = [], removeLabelIds = [] } = args;

          memoryEmails = memoryEmails.map((msg) => {
            if (messageIds.includes(msg.id)) {
              let updatedLabels = msg.labels.filter(
                (lbl) => !removeLabelIds.includes(lbl)
              );
              for (const add of addLabelIds) {
                if (!updatedLabels.includes(add)) {
                  updatedLabels.push(add);
                }
              }

              const unread = removeLabelIds.includes("UNREAD")
                ? false
                : addLabelIds.includes("UNREAD")
                ? true
                : msg.unread;

              const starred = addLabelIds.includes("STARRED")
                ? true
                : removeLabelIds.includes("STARRED")
                ? false
                : msg.starred;

              return {
                ...msg,
                labels: updatedLabels,
                unread,
                starred,
              };
            }
            return msg;
          });

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    modifiedCount: messageIds.length,
                    messageIds,
                    labelsAdded: addLabelIds,
                    labelsRemoved: removeLabelIds,
                  },
                },
              ],
            },
          });
        }

        default:
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32601,
                message: `Method or Tool '${toolName}' not found on Gmail MCP server`,
              },
            },
            { status: 404 }
          );
      }
    }

    // Default: method not found
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `MCP method '${method}' is not supported`,
        },
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: error?.message || "Internal MCP server error",
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint returns server capabilities and status
export async function GET() {
  const unreadCount = memoryEmails.filter((m) => m.unread).length;

  return NextResponse.json({
    status: "ok",
    server: "gmail-mcp-server",
    protocol: "Model Context Protocol (MCP) 2024-11-05",
    version: "1.4.2",
    inbox: {
      account: "alex.mercer@omnimind.ai",
      totalEmails: memoryEmails.length + 1420,
      unreadEmails: unreadCount,
      activeLabels: ["INBOX", "UNREAD", "IMPORTANT", "VIP", "FINANCE", "DEVOPS", "TRAVEL"],
    },
    toolsCount: 7,
  });
}
