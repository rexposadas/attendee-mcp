#!/usr/bin/env node

/**
 * Example Usage Script for Attendee MCP
 * 
 * This script demonstrates all the available MCP tools for managing meeting bots.
 * Replace the placeholder values with actual bot IDs and URLs.
 */

import MeetingBotMCP from './dist/index.js';

async function exampleUsage() {
  console.log('🤖 Attendee MCP Example Usage\n');

  // Example bot ID (replace with actual bot ID)
  const botId = 'bot_s7vIvDdUZUQGY0t0';
  const meetingUrl = 'https://meet.google.com/cfq-cwuk-sao';

  console.log('1. Create a meeting bot:');
  console.log(`   create_meeting_bot({ meeting_url: "${meetingUrl}", bot_name: "Claude Bot" })\n`);

  console.log('2. Get bot status:');
  console.log(`   get_bot_status({ bot_id: "${botId}" })\n`);

  console.log('3. List all meeting bots:');
  console.log('   list_meeting_bots()\n');

  console.log('4. Make bot speak:');
  console.log(`   make_bot_speak({ 
     bot_id: "${botId}", 
     text: "Hello everyone! This is your AI assistant.",
     voice_language_code: "en-US",
     voice_name: "en-US-Casual-K"
   })\n`);

  console.log('5. Send chat message:');
  console.log(`   send_chat_message({ 
     bot_id: "${botId}", 
     message: "Hello from Claude's bot! 👋"
   })\n`);

  console.log('6. Send image to meeting (Google Meet only):');
  console.log(`   send_image_to_meeting({ 
     bot_id: "${botId}", 
     image_url: "https://example.com/image.jpg"
   })\n`);

  console.log('7. Send video to meeting (Google Meet only):');
  console.log(`   send_video_to_meeting({ 
     bot_id: "${botId}", 
     video_url: "https://example.com/video.mp4"
   })\n`);

  console.log('8. Get meeting transcript:');
  console.log(`   get_meeting_transcript({ bot_id: "${botId}" })\n`);

  console.log('9. Get chat messages:');
  console.log(`   get_chat_messages({ bot_id: "${botId}" })\n`);

  console.log('10. Get recording:');
  console.log(`   get_recording({ bot_id: "${botId}" })\n`);

  console.log('11. Remove bot from meeting:');
  console.log(`   remove_meeting_bot({ bot_id: "${botId}" })\n`);

  console.log('12. Delete bot data:');
  console.log(`   delete_bot_data({ bot_id: "${botId}" })\n`);

  console.log('📋 All these commands can be used naturally with Claude:');
  console.log('   - "Send a bot to this meeting: https://meet.google.com/abc-def-ghi"');
  console.log('   - "Make the bot say hello to everyone"');
  console.log('   - "Get the transcript from the bot"');
  console.log('   - "Show this image in the meeting: https://example.com/chart.png"');
  console.log('   - "List all my active bots"');
  console.log('   - And many more natural language commands!\n');

  console.log('🔧 Configuration Required:');
  console.log('   - Set MEETING_BOT_API_URL environment variable');
  console.log('   - Set MEETING_BOT_API_KEY environment variable');
  console.log('   - Add this MCP to your Claude Desktop configuration');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage();
}
