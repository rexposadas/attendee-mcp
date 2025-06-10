#!/bin/bash

# Build and test script for Attendee MCP Server with Speech

echo "🔨 Building Attendee MCP Server with Speech Functionality..."

cd /Users/rex/work/ai/attendee-mcp

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building TypeScript..."
npm run build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed! Please check for TypeScript errors."
    echo "Try running: npm run build"
    exit 1
fi

echo "✅ Build successful!"

# Test the API with speech functionality
echo ""
echo "🧪 Testing API with speech functionality..."
node test-speech-api.js

echo ""
echo "✅ Setup complete with speech functionality!"
echo ""
echo "📝 Updated Claude Desktop config should be:"
echo "{"
echo "  \"mcpServers\": {"
echo "    \"attendee\": {"
echo "      \"command\": \"npx\","
echo "      \"args\": [\"attendee-mcp\"],"
echo "      \"env\": {"
echo "        \"MEETING_BOT_API_URL\": \"http://localhost:8000\","
echo "        \"MEETING_BOT_API_KEY\": \"8x8uD5AB6kEg3DynSNzFnF7Wohym7SqD\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "🎯 NEW Speech Commands:"
echo "  - 'Have the bot say hello everyone'"
echo "  - 'Make bot [bot_id] speak welcome to the meeting'"
echo "  - 'Tell the bot to announce the meeting is starting'"
echo ""
echo "🔊 Voice Options:"
echo "  - en-US-Casual-K (default)"
echo "  - en-US-Neural2-A"
echo "  - en-US-Neural2-C"
echo "  - And many more Google voices!"
