#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// Types
interface BotResponse {
  bot_id: string;
  meeting_url: string;
  state: string;
  transcription_state: string;
  name?: string;
}

interface BotStatus {
  bot_id: string;
  state: string;
  transcription_state: string;
  meeting_url: string;
  active: boolean;
  transcript_ready: boolean;
}

interface TranscriptResponse {
  transcript?: string;
  transcription_state: string;
  ready: boolean;
  error?: string;
}

interface CreateBotRequest {
  meeting_url: string;
  bot_name?: string;
}

// Configuration
const API_BASE_URL = process.env.MEETING_BOT_API_URL || "http://localhost:8000";
const API_KEY = process.env.MEETING_BOT_API_KEY;

class MeetingBotMCP {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "meeting-bot-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private async makeApiRequest(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (API_KEY) {
      headers["Authorization"] = `Token ${API_KEY}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }

  private formatBotStatus(data: any): string {
    const stateIcon = (data.state === 'joining' || data.state === 'joined') ? "✅" : "❌";
    const transcriptIcon = data.transcription_state === 'complete' ? "✅" : "⏳";

    return [
      `🤖 Bot Status for ${data.id}:`,
      "",
      `📊 State: ${data.state} ${stateIcon}`,
      `📝 Transcription State: ${data.transcription_state} ${transcriptIcon}`,
      `🔗 Meeting URL: ${data.meeting_url}`,
      "",
      `${stateIcon} Bot is ${(data.state === 'joining' || data.state === 'joined') ? "active and recording" : "not active"}`,
      `${transcriptIcon} Transcript is ${data.transcription_state === 'complete' ? "ready" : "not ready yet"}`,
    ].join("\n");
  }

  private formatBotCreated(data: any): string {
    return [
      "✅ Successfully created meeting bot!",
      "",
      `🤖 Bot ID: ${data.id}`,
      `🔗 Meeting URL: ${data.meeting_url}`,
      `📊 State: ${data.state}`,
      `📝 Transcription State: ${data.transcription_state}`,
      "",
      `💡 You can check the bot status using bot ID: ${data.id}`,
    ].join("\n");
  }

  private formatTranscriptResponse(data: any, botId: string): string {
    // If data is an array, it means we got the transcript entries directly
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return `❌ No transcript available for bot ${botId}`;
      }
      
      let transcript = `📝 Meeting Transcript for bot ${botId}:\n\n`;
      transcript += "─".repeat(50) + "\n";
      
      data.forEach((entry: any) => {
        const timestamp = entry.timestamp_ms / 1000;
        const minutes = Math.floor(timestamp / 60);
        const seconds = Math.floor(timestamp % 60);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        transcript += `[${timeStr}] ${entry.speaker_name}:\n${entry.transcription}\n\n`;
      });
      
      transcript += "─".repeat(50) + `\n📊 Total entries: ${data.length}`;
      return transcript;
    }
    
    // Handle object response (legacy format)
    if (data.ready && data.transcript) {
      return [
        `📝 Meeting Transcript for bot ${botId}:`,
        "",
        "─".repeat(50),
        data.transcript,
        "─".repeat(50),
      ].join("\n");
    } else {
      const stateIcon = data.transcription_state === "in_progress" ? "🔄" : "⏳";
      return [
        `${stateIcon} Transcript not ready for bot ${botId}`,
        `Current transcription state: ${data.transcription_state}`,
        "",
        "💡 The transcript will be available after the meeting ends and processing completes.",
      ].join("\n");
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "create_meeting_bot",
          description: "Create a bot to join a meeting and record/transcribe it",
          inputSchema: {
            type: "object",
            properties: {
              meeting_url: {
                type: "string",
                description: "URL of the meeting (Zoom, Google Meet, or Teams)",
              },
              bot_name: {
                type: "string",
                description: "Name for the bot (optional, defaults to 'Go Bot')",
                default: "Go Bot",
              },
            },
            required: ["meeting_url"],
          },
        },
        {
          name: "get_bot_status",
          description: "Get the current status of a meeting bot",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot to check",
              },
            },
            required: ["bot_id"],
          },
        },
        {
          name: "get_meeting_transcript",
          description: "Get the transcript from a meeting bot",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot whose transcript to retrieve",
              },
            },
            required: ["bot_id"],
          },
        },
        {
          name: "list_meeting_bots",
          description: "List all active meeting bots",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "remove_meeting_bot",
          description: "Remove a bot from a meeting",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot to remove",
              },
            },
            required: ["bot_id"],
          },
        },
      ] satisfies Tool[],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const args = request.params.arguments || {};
        
        switch (request.params.name) {
          case "create_meeting_bot":
            return await this.createMeetingBot(args);

          case "get_bot_status":
            return await this.getBotStatus(args);

          case "get_meeting_transcript":
            return await this.getMeetingTranscript(args);

          case "list_meeting_bots":
            return await this.listMeetingBots();

          case "remove_meeting_bot":
            return await this.removeMeetingBot(args);

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async createMeetingBot(args: Record<string, unknown>) {
    const meeting_url = args.meeting_url as string;
    const bot_name = (args.bot_name as string) || "Claude Bot";
    
    if (!meeting_url || typeof meeting_url !== 'string') {
      throw new Error("Missing or invalid required parameter: meeting_url");
    }

    const data = await this.makeApiRequest("/api/v1/bots", "POST", {
      meeting_url,
      bot_name,
    });

    return {
      content: [
        {
          type: "text",
          text: this.formatBotCreated(data),
        },
      ],
    };
  }

  private async getBotStatus(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    const data = await this.makeApiRequest(`/api/v1/bots/${bot_id}`);

    return {
      content: [
        {
          type: "text",
          text: this.formatBotStatus(data),
        },
      ],
    };
  }

  private async getMeetingTranscript(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    const data = await this.makeApiRequest(`/api/v1/bots/${bot_id}/transcript`);

    return {
      content: [
        {
          type: "text",
          text: this.formatTranscriptResponse(data, bot_id),
        },
      ],
    };
  }

  private async listMeetingBots() {
    const data = await this.makeApiRequest("/api/v1/bots");

    // Handle both array response and object with bots property
    const bots = Array.isArray(data) ? data : (data.bots || []);

    if (bots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "📋 No active meeting bots found.",
          },
        ],
      };
    }

    const botList = bots
      .map((bot: any, index: number) => {
        const stateIcon = (bot.state === 'joining' || bot.state === 'joined') ? "✅" : "❌";
        const transcriptIcon = bot.transcription_state === 'complete' ? "✅" : "⏳";
        return `${index + 1}. Bot ID: ${bot.id}\n   📊 State: ${bot.state} ${stateIcon}\n   📝 Transcription: ${bot.transcription_state} ${transcriptIcon}\n   🔗 Meeting: ${bot.meeting_url.substring(0, 50)}...`;
      })
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `📋 Active Meeting Bots (${bots.length}):\n\n${botList}`,
        },
      ],
    };
  }

  private async removeMeetingBot(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    await this.makeApiRequest(`/api/v1/bots/${bot_id}`, "DELETE");

    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully removed bot ${bot_id} from the meeting.`,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Meeting Bot MCP Server running on stdio");
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MeetingBotMCP();
  server.run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

export default MeetingBotMCP;