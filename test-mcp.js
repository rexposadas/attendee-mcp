#!/usr/bin/env node

/**
 * Test Script for Attendee MCP
 * 
 * This script helps test the MCP functionality by providing sample tool calls.
 * Use this to validate that your MCP server is working correctly.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testMCP() {
  console.log('🧪 Testing Attendee MCP Server\n');

  // Test data
  const testBotId = process.env.TEST_BOT_ID || 'bot_test123';
  const testMeetingUrl = process.env.TEST_MEETING_URL || 'https://meet.google.com/test-abc-def';

  const tests = [
    {
      name: 'List Tools',
      tool: null,
      args: {},
      description: 'Check that all expected tools are available'
    },
    {
      name: 'Create Meeting Bot',
      tool: 'create_meeting_bot',
      args: {
        meeting_url: testMeetingUrl,
        bot_name: 'Test Bot'
      },
      description: 'Create a new meeting bot'
    },
    {
      name: 'Get Bot Status',
      tool: 'get_bot_status', 
      args: {
        bot_id: testBotId
      },
      description: 'Check the status of a bot'
    },
    {
      name: 'List Meeting Bots',
      tool: 'list_meeting_bots',
      args: {},
      description: 'List all active meeting bots'
    },
    {
      name: 'Make Bot Speak',
      tool: 'make_bot_speak',
      args: {
        bot_id: testBotId,
        text: 'This is a test message from the bot',
        voice_language_code: 'en-US',
        voice_name: 'en-US-Casual-K'
      },
      description: 'Test text-to-speech functionality'
    },
    {
      name: 'Send Chat Message',
      tool: 'send_chat_message',
      args: {
        bot_id: testBotId,
        message: 'Hello from the test script!'
      },
      description: 'Send a chat message from the bot'
    },
    {
      name: 'Get Meeting Transcript',
      tool: 'get_meeting_transcript',
      args: {
        bot_id: testBotId
      },
      description: 'Retrieve the meeting transcript'
    },
    {
      name: 'Get Chat Messages',
      tool: 'get_chat_messages',
      args: {
        bot_id: testBotId
      },
      description: 'Get chat messages from the meeting'
    },
    {
      name: 'Get Recording',
      tool: 'get_recording',
      args: {
        bot_id: testBotId
      },
      description: 'Get the recording URL'
    },
    {
      name: 'Send Image to Meeting',
      tool: 'send_image_to_meeting',
      args: {
        bot_id: testBotId,
        image_url: 'https://via.placeholder.com/640x480.png?text=Test+Image'
      },
      description: 'Send an image to the meeting (Google Meet only)'
    },
    {
      name: 'Send Video to Meeting',
      tool: 'send_video_to_meeting',
      args: {
        bot_id: testBotId,
        video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4'
      },
      description: 'Send a video to the meeting (Google Meet only)'
    }
  ];

  console.log('Expected Tools:');
  const expectedTools = [
    'create_meeting_bot',
    'get_bot_status', 
    'get_meeting_transcript',
    'list_meeting_bots',
    'remove_meeting_bot',
    'make_bot_speak',
    'send_chat_message',
    'get_chat_messages',
    'get_recording',
    'send_image_to_meeting',
    'send_video_to_meeting',
    'delete_bot_data'
  ];

  expectedTools.forEach((tool, index) => {
    console.log(`  ${index + 1}. ${tool}`);
  });

  console.log('\n📝 Test Cases:');
  tests.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log(`   Description: ${test.description}`);
    if (test.tool) {
      console.log(`   Tool: ${test.tool}`);
      console.log(`   Args: ${JSON.stringify(test.args, null, 6)}`);
    }
  });

  console.log('\n🔧 To run these tests:');
  console.log('1. Ensure your Attendee server is running');
  console.log('2. Set environment variables:');
  console.log('   export MEETING_BOT_API_URL="http://localhost:8000"');
  console.log('   export MEETING_BOT_API_KEY="your-api-key"');
  console.log('   export TEST_BOT_ID="actual-bot-id"');
  console.log('   export TEST_MEETING_URL="actual-meeting-url"');
  console.log('3. Build the MCP: npm run build');
  console.log('4. Test with Claude Desktop or the MCP client');

  console.log('\n💡 Natural Language Examples for Claude:');
  console.log('• "Send a bot to this Zoom: https://zoom.us/j/123456789"');
  console.log('• "What\'s the status of bot bot_abc123?"');
  console.log('• "Make the bot say \'Welcome to our meeting!\'"');
  console.log('• "Show this image in the meeting: https://example.com/chart.png"');
  console.log('• "Get the transcript from the meeting"');
  console.log('• "Send a chat message saying \'Meeting notes are ready\'"');
  console.log('• "List all my active bots"');
  console.log('• "Remove the bot from the meeting"');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testMCP();
}
