import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_INTEGRATIONS } from "@/lib/mcp/platform-tools";
import { getUserGmailAccessToken } from "@/lib/mcp/google-oauth";
import {
  fetchRealGoogleProfile,
  fetchRealGoogleMessages,
  fetchRealGoogleMessageById,
  createRealGoogleDraft,
  fetchRealGoogleDrafts,
  sendRealGoogleMessage,
  modifyRealGoogleMessageLabels,
  fetchRealGoogleLabels,
  trashRealGoogleMessage,
  parseOfficialMcpThreadsToMessages,
  GmailApiError,
} from "@/lib/mcp/gmail-real";

// Official Google Workspace Gmail MCP Server endpoint
const OFFICIAL_GMAIL_MCP_ENDPOINT =
  process.env.GMAIL_MCP_ENDPOINT || "https://gmailmcp.googleapis.com/mcp/v1";

/**
 * Helper to produce clean JSON-RPC 2.0 error responses, especially for API permissions and disabled states
 */
function formatGmailErrorResponse(
  id: any,
  err: any,
  fallbackMessage = "Failed to communicate with Google Gmail"
) {
  const isApiDisabled = Boolean(
    err?.isApiDisabled ||
    err?.message?.includes("Gmail API has not been used") ||
    err?.message?.includes("it is disabled") ||
    err?.message?.includes("PERMISSION_DENIED") ||
    err?.message?.includes("Enable it by visiting")
  );

  let activationUrl = err?.activationUrl;
  let projectId = err?.projectId;

  if (!activationUrl && typeof err?.message === "string") {
    const urlMatch = err.message.match(/https:\/\/console\.developers\.google\.com\/apis\/api\/gmail\.googleapis\.com\/overview\?[^\s"'\)]+/i);
    if (urlMatch) activationUrl = urlMatch[0];
    const projMatch = err.message.match(/project (\d+)/i) || err.message.match(/projects\/(\d+)/i);
    if (projMatch) projectId = projMatch[1];
  }

  if (isApiDisabled && !activationUrl) {
    activationUrl = projectId
      ? `https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=${projectId}`
      : "https://console.developers.google.com/apis/library/gmail.googleapis.com";
  }

  const cleanMessage = isApiDisabled
    ? `The Gmail API is disabled in your Google Cloud Project (${projectId || "18240900817"}). Please enable it in the Google Cloud Console to read and send emails.`
    : (err?.message || fallbackMessage);

  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id,
      error: {
        code: isApiDisabled ? -32003 : (err?.code || -32000),
        message: cleanMessage,
        data: isApiDisabled
          ? {
              type: "GMAIL_API_DISABLED",
              activationUrl: activationUrl || "https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=18240900817",
              projectId: projectId || "18240900817",
            }
          : undefined,
      },
    },
    { status: isApiDisabled ? 403 : 500 }
  );
}

/**
 * Extract OAuth 2.0 Bearer Access Token from request headers, query, or body
 */
function extractBearerToken(req: NextRequest, body?: any): string | null {
  // 1. Check HTTP Authorization header: "Bearer <token>"
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // 2. Check body params for accessToken
  if (body?.accessToken) return body.accessToken;
  if (body?.params?.accessToken) return body.params.accessToken;
  if (body?.params?.token) return body.params.token;

  // 3. Check environment variable fallback (optional server default)
  if (process.env.GMAIL_ACCESS_TOKEN) return process.env.GMAIL_ACCESS_TOKEN;
  if (process.env.GOOGLE_ACCESS_TOKEN) return process.env.GOOGLE_ACCESS_TOKEN;

  return null;
}

/**
 * Forward JSON-RPC request to the official Google Gmail MCP server at https://gmailmcp.googleapis.com/mcp/v1
 */
async function forwardToOfficialGoogleMcp(
  payload: any,
  token: string
): Promise<{ ok: boolean; status: number; data?: any; errorText?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(OFFICIAL_GMAIL_MCP_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const rawText = await res.text();
    let jsonResult: any;

    try {
      jsonResult = JSON.parse(rawText);
    } catch {
      jsonResult = {
        jsonrpc: "2.0",
        id: payload.id || "1",
        result: {
          content: [{ type: "text", text: rawText }],
        },
      };
    }

    return {
      ok: res.ok,
      status: res.status,
      data: jsonResult,
      errorText: !res.ok ? rawText : undefined,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      status: 502,
      errorText:
        err?.message ||
        "Connection to official Google Gmail MCP server timed out or failed",
    };
  }
}

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

    // 1. Extract Bearer Access Token directly if provided in request
    let bearerToken = extractBearerToken(req, body);

    // 2. Multi-user OAuth resolution: If no direct token, resolve from InsForge DB for this specific user
    const userId =
      req.headers.get("x-user-id") ||
      body?.userId ||
      body?.params?.userId ||
      null;

    let resolvedFromUserDb = false;
    let userAccountEmail: string | null = null;

    if (!bearerToken && userId) {
      try {
        const userAuth = await getUserGmailAccessToken(
          userId,
          req.nextUrl.origin
        );
        if (userAuth.accessToken) {
          bearerToken = userAuth.accessToken;
          resolvedFromUserDb = true;
          userAccountEmail = userAuth.accountEmail;
        }
      } catch (authErr) {
        console.warn("Could not retrieve user Gmail OAuth tokens from DB:", authErr);
      }
    }

    // =========================================================================
    // MCP Protocol Methods: initialize & tools/list
    // =========================================================================

    // 1. MCP Protocol Handshake: Initialize
    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "official-gmail-mcp-gateway",
            officialEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
            version: "1.4.2",
            description:
              "Official Google Workspace Gmail MCP Server Gateway (Streamable HTTP)",
            authMethod: "OAuth 2.0 (Bearer Access Token)",
            authenticated: Boolean(bearerToken),
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
      const tools =
        gmailPlatform?.tools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: {
            type: "object",
            properties: t.parameters.reduce((acc, param) => {
              acc[param.name] = {
                type: param.type,
                description: param.description,
                ...(param.default !== undefined
                  ? { default: param.default }
                  : {}),
              };
              return acc;
            }, {} as Record<string, any>),
            required: t.parameters.filter((p) => p.required).map((p) => p.name),
          },
        })) || [];

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools,
          _mcpGateway: {
            officialEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
            auth: bearerToken ? "Bearer Token Active" : "Unauthenticated",
          },
        },
      });
    }

    // =========================================================================
    // MCP Tool Calls (tools/call)
    // =========================================================================
    if (method === "tools/call") {
      const rawToolName = params?.name || "";
      const args = params?.arguments || {};
      const toolName = String(rawToolName).trim();
      const normalizedName = toolName.toLowerCase().replace(/^gmail_/, "");

      // If user is NOT authenticated, return clear unauthenticated response (NO mock data!)
      if (!bearerToken) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32001,
              message:
                "Gmail account not connected. Please authorize via Google OAuth 2.0 to access your real inbox emails and mailbox data.",
              data: {
                authenticated: false,
                authUrl: `/api/auth/google/gmail?userId=${encodeURIComponent(
                  userId || "user_default_exec"
                )}`,
                action: "CONNECT_GOOGLE_OAUTH",
              },
            },
          },
          { status: 401 }
        );
      }

      // --- 1. Real Mailbox Profile: gmail_get_profile / get_profile ---
      if (
        toolName === "gmail_get_profile" ||
        normalizedName === "get_profile" ||
        normalizedName === "profile"
      ) {
        try {
          const profile = await fetchRealGoogleProfile(bearerToken);
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    ...profile,
                    officialServerEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                    authenticated: true,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          // If token expired, attempt refresh once
          if (userId && resolvedFromUserDb) {
            try {
              const freshAuth = await getUserGmailAccessToken(
                userId,
                req.nextUrl.origin
              );
              if (freshAuth.accessToken && freshAuth.accessToken !== bearerToken) {
                const refreshedProfile = await fetchRealGoogleProfile(
                  freshAuth.accessToken
                );
                return NextResponse.json({
                  jsonrpc: "2.0",
                  id,
                  result: {
                    content: [
                      {
                        type: "json",
                        json: {
                          ...refreshedProfile,
                          officialServerEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                          authenticated: true,
                        },
                      },
                    ],
                  },
                });
              }
            } catch (retryErr: any) {
              console.warn("Retry profile fetch failed:", retryErr);
              return formatGmailErrorResponse(id, retryErr, "Failed to fetch real Gmail profile from Google");
            }
          }

          return formatGmailErrorResponse(id, err, "Failed to fetch real Gmail profile from Google");
        }
      }

      // --- 2. Real Messages & Inbox: gmail_list_messages / gmail_search_threads / search_threads / list_messages ---
      if (
        toolName === "gmail_list_messages" ||
        toolName === "gmail_search_threads" ||
        normalizedName === "list_messages" ||
        normalizedName === "search_threads"
      ) {
        const query = (args.q || args.query || "label:INBOX").trim();
        const maxResults = Math.min(
          Math.max(Number(args.maxResults || args.pageSize) || 15, 1),
          50
        );

        try {
          // 2a. Call official Google Gmail MCP server (search_threads)
          const remotePayload = {
            jsonrpc: "2.0",
            id,
            method: "tools/call",
            params: {
              name: "search_threads",
              arguments: {
                query,
                pageSize: maxResults,
                view: "THREAD_VIEW_MINIMAL",
              },
            },
          };

          const remoteMcpRes = await forwardToOfficialGoogleMcp(
            remotePayload,
            bearerToken
          );

          console.log("[MCP Gmail] remoteMcpRes status:", remoteMcpRes.status, "ok:", remoteMcpRes.ok, "data:", JSON.stringify(remoteMcpRes.data));

          let realMessages: any[] = [];
          let realThreads: any[] = [];
          let totalEstimate = 0;

          // If official Google MCP server returned threads, parse them
          if (
            remoteMcpRes.ok &&
            !remoteMcpRes.data?.result?.isError &&
            remoteMcpRes.data?.result?.content?.[0]
          ) {
            const contentItem = remoteMcpRes.data.result.content[0];
            let parsedData: any = contentItem.json || null;
            if (!parsedData && typeof contentItem.text === "string") {
              try {
                parsedData = JSON.parse(contentItem.text);
              } catch (parseErr) {
                console.warn("[MCP Gmail] contentItem.text is not JSON:", contentItem.text);
                parsedData = null;
              }
            }

            if (parsedData?.threads && Array.isArray(parsedData.threads)) {
              realThreads = parsedData.threads;
              realMessages = parseOfficialMcpThreadsToMessages(parsedData.threads);
              totalEstimate = Number(parsedData.resultCountEstimate) || realMessages.length;
            }
          }

          // 2b. If official MCP server call did not return message details, fetch real messages via Google Gmail REST API
          if (realMessages.length === 0) {
            const apiResult = await fetchRealGoogleMessages(
              bearerToken,
              query,
              maxResults
            );
            realMessages = apiResult.messages;
            totalEstimate = apiResult.totalEstimate;
          }

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    messages: realMessages,
                    threads: realThreads,
                    resultSizeEstimate: totalEstimate,
                    query,
                    serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                    authenticated: true,
                    isRealData: true,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          // If token expired, attempt refresh once
          if (userId && resolvedFromUserDb) {
            try {
              const freshAuth = await getUserGmailAccessToken(
                userId,
                req.nextUrl.origin
              );
              if (freshAuth.accessToken && freshAuth.accessToken !== bearerToken) {
                const refreshedResult = await fetchRealGoogleMessages(
                  freshAuth.accessToken,
                  query,
                  maxResults
                );
                return NextResponse.json({
                  jsonrpc: "2.0",
                  id,
                  result: {
                    content: [
                      {
                        type: "json",
                        json: {
                          messages: refreshedResult.messages,
                          resultSizeEstimate: refreshedResult.totalEstimate,
                          query,
                          serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                          authenticated: true,
                          isRealData: true,
                        },
                      },
                    ],
                  },
                });
              }
            } catch (retryErr: any) {
              console.warn("Retry fetch real messages failed:", retryErr);
              return formatGmailErrorResponse(id, retryErr, "Failed to fetch real Gmail messages from Google");
            }
          }

          return formatGmailErrorResponse(id, err, "Failed to fetch real Gmail messages from Google");
        }
      }

      // --- 3. Real Specific Message: gmail_get_message / get_message / get_thread ---
      if (
        toolName === "gmail_get_message" ||
        normalizedName === "get_message" ||
        normalizedName === "get_thread"
      ) {
        const messageId = (args.messageId || args.id || args.threadId || "").trim();
        if (!messageId) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Missing required parameter: 'messageId'",
              },
            },
            { status: 400 }
          );
        }

        try {
          const message = await fetchRealGoogleMessageById(
            bearerToken,
            messageId
          );

          if (!message) {
            return NextResponse.json({
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Error: Message with ID '${messageId}' not found in user's Gmail mailbox.`,
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
                  json: message,
                },
              ],
            },
          });
        } catch (err: any) {
          return formatGmailErrorResponse(id, err, "Failed to retrieve message from Google");
        }
      }

      // --- 4. Real Create Draft: gmail_create_draft / create_draft ---
      if (
        toolName === "gmail_create_draft" ||
        normalizedName === "create_draft"
      ) {
        const to = args.to || args.recipient || "";
        const subject = args.subject || "Draft Message";
        const draftBody = args.body || args.content || "";
        const threadId = args.threadId;

        if (!to) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Missing required recipient parameter: 'to'",
              },
            },
            { status: 400 }
          );
        }

        try {
          const draftResult = await createRealGoogleDraft(bearerToken, {
            to,
            subject,
            body: draftBody,
            threadId,
          });

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    status: "CREATED_IN_GMAIL",
                    draftId: draftResult.draftId,
                    messageId: draftResult.messageId,
                    threadId: draftResult.threadId,
                    to,
                    subject,
                    createdInGoogle: true,
                    serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          return formatGmailErrorResponse(id, err, "Failed to create real draft in Google Gmail");
        }
      }

      // --- 5. Real Send Message: gmail_send_message / send_message ---
      if (
        toolName === "gmail_send_message" ||
        normalizedName === "send_message"
      ) {
        const to = args.to || args.recipient || "";
        const subject = args.subject || "(No Subject)";
        const body = args.body || args.content || "";
        const threadId = args.threadId;

        if (!to) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Missing required recipient parameter: 'to'",
              },
            },
            { status: 400 }
          );
        }

        try {
          const sendResult = await sendRealGoogleMessage(bearerToken, {
            to,
            subject,
            body,
            threadId,
          });

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    status: "SENT",
                    messageId: sendResult.messageId,
                    threadId: sendResult.threadId,
                    to,
                    subject,
                    sentAt: new Date().toISOString(),
                    serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          return formatGmailErrorResponse(id, err, "Failed to send email message via Google Gmail");
        }
      }

      // --- 6. Real Modify Labels: gmail_batch_modify_labels / update_message_labels ---
      if (
        toolName === "gmail_batch_modify_labels" ||
        normalizedName === "batch_modify_labels" ||
        normalizedName === "modify_labels" ||
        normalizedName === "update_message_labels" ||
        normalizedName === "label_message" ||
        normalizedName === "unlabel_message"
      ) {
        let messageIds = args.messageIds || args.ids || args.messageId || args.id || [];
        if (!Array.isArray(messageIds)) {
          messageIds = [messageIds].filter(Boolean);
        }

        if (messageIds.length === 0) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Missing required parameter 'messageIds'",
              },
            },
            { status: 400 }
          );
        }

        try {
          const result = await modifyRealGoogleMessageLabels(bearerToken, {
            messageIds,
            addLabelIds: args.addLabelIds || (args.addLabel ? [args.addLabel] : []),
            removeLabelIds: args.removeLabelIds || (args.removeLabel ? [args.removeLabel] : []),
          });

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    status: "LABELS_MODIFIED",
                    ...result,
                    serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          return formatGmailErrorResponse(id, err, "Failed to modify labels in Google Gmail");
        }
      }

      // --- 7. Real Drafts List: gmail_list_drafts / list_drafts ---
      if (
        toolName === "gmail_list_drafts" ||
        normalizedName === "list_drafts"
      ) {
        try {
          const drafts = await fetchRealGoogleDrafts(bearerToken, args.maxResults || 15);
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    drafts,
                    resultCount: drafts.length,
                    serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          return formatGmailErrorResponse(id, err, "Failed to fetch drafts from Google Gmail");
        }
      }

      // --- 8. Real Labels List: gmail_list_labels / list_labels ---
      if (
        toolName === "gmail_list_labels" ||
        normalizedName === "list_labels"
      ) {
        try {
          const labels = await fetchRealGoogleLabels(bearerToken);
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    labels,
                    serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          return formatGmailErrorResponse(id, err, "Failed to fetch real labels from Google");
        }
      }

      // --- 9. Real Trash Message: gmail_trash_message / trash_message / trash_thread ---
      if (
        toolName === "gmail_trash_message" ||
        normalizedName === "trash_message" ||
        normalizedName === "trash_thread"
      ) {
        const messageId = (args.messageId || args.id || args.threadId || "").trim();
        if (!messageId) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Missing required parameter 'messageId'",
              },
            },
            { status: 400 }
          );
        }

        try {
          const success = await trashRealGoogleMessage(bearerToken, messageId);
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "json",
                  json: {
                    status: success ? "TRASHED" : "FAILED",
                    messageId,
                    movedToTrash: success,
                    serverEndpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
                  },
                },
              ],
            },
          });
        } catch (err: any) {
          return formatGmailErrorResponse(id, err, "Failed to trash message in Google Gmail");
        }
      }

      // --- 10. Fallback: Forward to official Google Gmail MCP server with normalized name ---
      const remotePayload = {
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: {
          name: normalizedName, // Strip "gmail_" prefix so official server recognizes it
          arguments: args,
        },
      };

      const remoteResponse = await forwardToOfficialGoogleMcp(
        remotePayload,
        bearerToken
      );

      if (
        remoteResponse.ok &&
        remoteResponse.data &&
        !remoteResponse.data?.result?.isError &&
        !remoteResponse.data?.error
      ) {
        return NextResponse.json({
          ...remoteResponse.data,
          _mcpGateway: {
            endpoint: OFFICIAL_GMAIL_MCP_ENDPOINT,
            mode: "official-google-server",
            authenticated: true,
          },
        });
      }

      // If official server returned tool not found or error, return helpful explanation
      const rawErrMsg =
        remoteResponse.data?.error?.message ||
        remoteResponse.data?.result?.content?.[0]?.text ||
        remoteResponse.errorText ||
        "";

      let finalMsg = rawErrMsg;
      if (rawErrMsg.includes("not found in the list of tools") || rawErrMsg.includes("Tools Call name")) {
        finalMsg = `Tool '${rawToolName}' is not recognized. Supported Gmail MCP tools: gmail_list_messages, gmail_search_threads, gmail_get_message, gmail_get_profile, gmail_create_draft, gmail_send_message, gmail_batch_modify_labels, list_labels, trash_message.`;
      }

      return formatGmailErrorResponse(id, new Error(finalMsg), finalMsg);
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

// GET endpoint returns official Google MCP server capabilities and live status
export async function GET(req: NextRequest) {
  const bearerToken = extractBearerToken(req);

  if (bearerToken) {
    try {
      const realProfile = await fetchRealGoogleProfile(bearerToken);
      return NextResponse.json({
        status: "ok",
        officialServer: OFFICIAL_GMAIL_MCP_ENDPOINT,
        authMethod: "OAuth 2.0 (Bearer Access Token)",
        authenticated: true,
        protocol: "Model Context Protocol (MCP) 2024-11-05",
        version: "1.4.2",
        inbox: {
          account: realProfile.emailAddress,
          name: realProfile.name,
          totalEmails: realProfile.messagesTotal,
          totalThreads: realProfile.threadsTotal,
          unreadEmails: realProfile.unreadMessagesTotal,
        },
      });
    } catch {
      // Non-fatal fallthrough
    }
  }

  return NextResponse.json({
    status: "ok",
    officialServer: OFFICIAL_GMAIL_MCP_ENDPOINT,
    authMethod: "OAuth 2.0 (Bearer Access Token)",
    authenticated: false,
    protocol: "Model Context Protocol (MCP) 2024-11-05",
    version: "1.4.2",
    inbox: null,
    message:
      "No active Gmail account connected. Authenticate via Google OAuth 2.0 to access your real inbox.",
  });
}
