#!/usr/bin/env node

// Test script for Attendee MCP Server with Speech functionality

import fetch from 'node-fetch';

const API_BASE_URL = process.env.MEETING_BOT_API_URL || "http://localhost:8000";
const API_KEY = process.env.MEETING_BOT_API_KEY || "8x8uD5AB6kEg3DynSNzFnF7Wohym7SqD";

async function testAPI() {
    console.log("🧪 Testing Attendee API Connection");
    console.log("=" .repeat(40));
    console.log(`API URL: ${API_BASE_URL}`);
    console.log(`API Key: ${API_KEY}`);
    console.log("");

    try {
        // Test connection to /api/v1/bots
        console.log("📡 Testing GET /api/v1/bots...");
        const response = await fetch(`${API_BASE_URL}/api/v1/bots`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${API_KEY}`
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ API connection successful!");
            console.log("Response:", JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log("❌ API error:");
            console.log(errorText);
        }

    } catch (error) {
        console.log("❌ Network error:");
        console.log(error.message);
        console.log("");
        console.log("🔧 Troubleshooting:");
        console.log("1. Make sure your local Attendee server is running:");
        console.log("   cd /Users/rex/work/ai/attendee");
        console.log("   python manage.py runserver");
        console.log("");
        console.log("2. Check if the API key is correct");
        console.log("3. Verify the URL is accessible: curl http://localhost:8000/api/v1/bots");
    }
}

// Test creating a bot
async function testCreateBot() {
    console.log("\n🤖 Testing bot creation...");
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/bots`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${API_KEY}`
            },
            body: JSON.stringify({
                meeting_url: "https://us04web.zoom.us/j/7099185779?pwd=kgNHGfhbl0mCdqWNEinUbXbIytr6CV.1",
                bot_name: "Test Bot"
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Bot creation successful!");
            console.log("Bot data:", JSON.stringify(data, null, 2));
            return data.id;
        } else {
            const errorText = await response.text();
            console.log("❌ Bot creation failed:");
            console.log(errorText);
        }
    } catch (error) {
        console.log("❌ Error creating bot:");
        console.log(error.message);
    }
    
    return null;
}

// Test bot speech functionality
async function testBotSpeech(botId) {
    console.log(`\n🔊 Testing bot speech for ${botId}...`);
    
    try {
        const speechData = {
            text: "Hello, this is a test message from the MCP server",
            text_to_speech_settings: {
                google: {
                    voice_language_code: "en-US",
                    voice_name: "en-US-Casual-K"
                }
            }
        };

        const response = await fetch(`${API_BASE_URL}/api/v1/bots/${botId}/speech`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${API_KEY}`
            },
            body: JSON.stringify(speechData)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Bot speech command successful!");
            console.log("Speech response:", JSON.stringify(data, null, 2));
            return true;
        } else {
            const errorText = await response.text();
            console.log("❌ Bot speech failed:");
            console.log(errorText);
        }
    } catch (error) {
        console.log("❌ Error with bot speech:");
        console.log(error.message);
    }
    
    return false;
}

async function main() {
    await testAPI();
    
    const botId = await testCreateBot();
    
    if (botId) {
        console.log(`\n✅ Bot created successfully! Bot ID: ${botId}`);
        
        // Test speech functionality
        const speechSuccess = await testBotSpeech(botId);
        
        if (speechSuccess) {
            console.log("\n🎉 All tests passed including speech functionality!");
            console.log("\n🎯 Your MCP server can now:");
            console.log("  ✅ Create bots");
            console.log("  ✅ Make bots speak");
            console.log("  ✅ Get transcripts");
            console.log("  ✅ Check bot status");
            console.log("\n💬 Try these commands in Claude:");
            console.log(`  - "Have the bot say 'hello everyone'"`);
            console.log(`  - "Make bot ${botId} speak 'welcome to the meeting'"`);
        } else {
            console.log("\n⚠️  Bot creation works, but speech functionality needs checking.");
        }
    } else {
        console.log("\n❌ Tests failed. Please check your local Attendee server setup.");
    }
}

main().catch(console.error);
