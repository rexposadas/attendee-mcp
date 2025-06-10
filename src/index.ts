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

interface ChatMessage {
  id: string;
  message: string;
  sender_name: string;
  created_at: string;
}

interface Recording {
  url: string;
  file_size?: number;
  duration_ms?: number;
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
        version: "1.1.0",
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
    const stateIcon = (data.state === 'joining' || data.state === 'joined' || data.state === 'joined_recording') ? "✅" : "❌";
    const transcriptIcon = data.transcription_state === 'complete' ? "✅" : "⏳";

    return [
      `🤖 Bot Status for ${data.id}:`,
      "",
      `📊 State: ${data.state} ${stateIcon}`,
      `📝 Transcription State: ${data.transcription_state} ${transcriptIcon}`,
      `🔗 Meeting URL: ${data.meeting_url}`,
      "",
      `${stateIcon} Bot is ${(data.state === 'joining' || data.state === 'joined' || data.state === 'joined_recording') ? "active and recording" : "not active"}`,
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

  private formatChatMessages(data: any, botId: string): string {
    if (!Array.isArray(data) || data.length === 0) {
      return `💬 No chat messages found for bot ${botId}`;
    }

    let chatOutput = `💬 Chat Messages for bot ${botId}:\n\n`;
    chatOutput += "─".repeat(50) + "\n";
    
    data.forEach((message: any) => {
      const timestamp = new Date(message.created_at).toLocaleTimeString();
      chatOutput += `[${timestamp}] ${message.sender_name}:\n${message.message}\n\n`;
    });
    
    chatOutput += "─".repeat(50) + `\n📊 Total messages: ${data.length}`;
    return chatOutput;
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
        {
          name: "make_bot_speak",
          description: "Make a bot speak text during a meeting using text-to-speech",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot that should speak",
              },
              text: {
                type: "string",
                description: "Text for the bot to speak",
              },
              voice_language_code: {
                type: "string",
                description: "Voice language code (optional, defaults to 'en-US')",
                default: "en-US",
              },
              voice_name: {
                type: "string",
                description: "Voice name (optional, defaults to 'en-US-Casual-K')",
                default: "en-US-Casual-K",
              },
            },
            required: ["bot_id", "text"],
          },
        },
        {
          name: "send_chat_message",
          description: "Send a chat message from the bot to the meeting",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot that should send the message",
              },
              message: {
                type: "string",
                description: "Message text to send",
              },
            },
            required: ["bot_id", "message"],
          },
        },
        {
          name: "get_chat_messages",
          description: "Get chat messages from the meeting",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot to get chat messages for",
              },
            },
            required: ["bot_id"],
          },
        },
        {
          name: "get_recording",
          description: "Get the recording URL for a bot",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot to get recording for",
              },
            },
            required: ["bot_id"],
          },
        },
        {
          name: "send_image_to_meeting",
          description: "Send an image to the meeting through the bot (Google Meet only)",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot that should display the image",
              },
              image_url: {
                type: "string",
                description: "HTTPS URL of the image to display",
              },
            },
            required: ["bot_id", "image_url"],
          },
        },
        {
          name: "send_video_to_meeting",
          description: "Send a video to the meeting through the bot (Google Meet only)",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot that should play the video",
              },
              video_url: {
                type: "string",
                description: "HTTPS URL of the MP4 video to play",
              },
            },
            required: ["bot_id", "video_url"],
          },
        },
        {
          name: "delete_bot_data",
          description: "Delete all data associated with a bot (recordings, transcripts, etc.)",
          inputSchema: {
            type: "object",
            properties: {
              bot_id: {
                type: "string",
                description: "ID of the bot to delete data for",
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

          case "make_bot_speak":
            return await this.makeBotSpeak(args);

          case "send_chat_message":
            return await this.sendChatMessage(args);

          case "get_chat_messages":
            return await this.getChatMessages(args);

          case "get_recording":
            return await this.getRecording(args);

          case "send_image_to_meeting":
            return await this.sendImageToMeeting(args);

          case "send_video_to_meeting":
            return await this.sendVideoToMeeting(args);

          case "delete_bot_data":
            return await this.deleteBotData(args);

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
        const stateIcon = (bot.state === 'joining' || bot.state === 'joined' || bot.state === 'joined_recording') ? "✅" : "❌";
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
    
    const data = await this.makeApiRequest(`/api/v1/bots/${bot_id}/leave`, "POST", {});

    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully requested bot ${bot_id} to leave the meeting.\n\n📊 Updated Status:\n${this.formatBotStatus(data)}`,
        },
      ],
    };
  }

  private async makeBotSpeak(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    const text = args.text as string;
    const voice_language_code = (args.voice_language_code as string) || "en-US";
    const voice_name = (args.voice_name as string) || "en-US-Casual-K";
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    if (!text || typeof text !== 'string') {
      throw new Error("Missing or invalid required parameter: text");
    }
    
    const speechData = {
      text,
      text_to_speech_settings: {
        google: {
          voice_language_code,
          voice_name
        }
      }
    };

    await this.makeApiRequest(`/api/v1/bots/${bot_id}/speech`, "POST", speechData);

    return {
      content: [
        {
          type: "text",
          text: `✅ Bot ${bot_id} will speak: "${text}"\n\n🔊 Voice: ${voice_name} (${voice_language_code})\n💡 The bot should now be speaking in the meeting!`,
        },
      ],
    };
  }

  private async sendChatMessage(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    const message = args.message as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    if (!message || typeof message !== 'string') {
      throw new Error("Missing or invalid required parameter: message");
    }
    
    await this.makeApiRequest(`/api/v1/bots/${bot_id}/send_chat_message`, "POST", {
      message
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Chat message sent from bot ${bot_id}: "${message}"`,
        },
      ],
    };
  }

  private async getChatMessages(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    const data = await this.makeApiRequest(`/api/v1/bots/${bot_id}/chat_messages`);

    return {
      content: [
        {
          type: "text",
          text: this.formatChatMessages(data, bot_id),
        },
      ],
    };
  }

  private async getRecording(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    const data = await this.makeApiRequest(`/api/v1/bots/${bot_id}/recording`);

    const formatFileSize = (bytes?: number) => {
      if (!bytes) return "Unknown size";
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDuration = (ms?: number) => {
      if (!ms) return "Unknown duration";
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    };

    return {
      content: [
        {
          type: "text",
          text: [
            `🎥 Recording for bot ${bot_id}:`,
            "",
            `📁 URL: ${data.url}`,
            `📊 Size: ${formatFileSize(data.file_size)}`,
            `⏱️ Duration: ${formatDuration(data.duration_ms)}`,
            "",
            "💡 This is a short-lived URL that expires after a certain time.",
          ].join("\n"),
        },
      ],
    };
  }

  private async sendImageToMeeting(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    const image_url = args.image_url as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    if (!image_url || typeof image_url !== 'string') {
      throw new Error("Missing or invalid required parameter: image_url");
    }

    if (!image_url.startsWith('https://')) {
      throw new Error("Image URL must start with https://");
    }
    
    await this.makeApiRequest(`/api/v1/bots/${bot_id}/output_image`, "POST", {
      url: image_url
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Image sent to meeting from bot ${bot_id}\n📷 Image URL: ${image_url}\n\n💡 The image should now be displayed in the meeting (Google Meet only)!`,
        },
      ],
    };
  }

  private async sendVideoToMeeting(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    const video_url = args.video_url as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    if (!video_url || typeof video_url !== 'string') {
      throw new Error("Missing or invalid required parameter: video_url");
    }

    if (!video_url.startsWith('https://')) {
      throw new Error("Video URL must start with https://");
    }

    if (!video_url.endsWith('.mp4')) {
      throw new Error("Video URL must end with .mp4");
    }
    
    await this.makeApiRequest(`/api/v1/bots/${bot_id}/output_video`, "POST", {
      url: video_url
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Video sent to meeting from bot ${bot_id}\n🎬 Video URL: ${video_url}\n\n💡 The video should now be playing in the meeting (Google Meet only)!`,
        },
      ],
    };
  }

  private async deleteBotData(args: Record<string, unknown>) {
    const bot_id = args.bot_id as string;
    
    if (!bot_id || typeof bot_id !== 'string') {
      throw new Error("Missing or invalid required parameter: bot_id");
    }
    
    const data = await this.makeApiRequest(`/api/v1/bots/${bot_id}/delete_data`, "POST");

    return {
      content: [
        {
          type: "text",
          text: [
            `✅ Successfully deleted all data for bot ${bot_id}`,
            "",
            "🗑️ The following data has been permanently deleted:",
            "• Recording files",
            "• Transcript data", 
            "• Chat messages",
            "• Participant information",
            "",
            "⚠️ This action cannot be undone.",
            "💡 Bot metadata is preserved for audit purposes.",
          ].join("\n"),
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