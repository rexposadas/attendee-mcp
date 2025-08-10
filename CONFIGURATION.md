# Attendee MCP Configuration Guide

This guide helps you set up the Attendee MCP server with Claude Desktop.

## Prerequisites

1. **Attendee Server**: You need a running Attendee server instance
2. **API Key**: Generate an API key from your Attendee server
3. **Claude Desktop**: Latest version installed

## Environment Variables

Set these environment variables in your system:

```bash
# Your Attendee server URL
export MEETING_BOT_API_URL="http://localhost:8000"  # or your server URL

# Your Attendee API key
export MEETING_BOT_API_KEY="your-api-key-here"

# Optional: Test bot ID for testing
export TEST_BOT_ID="bot_test123"
export TEST_MEETING_URL="https://meet.google.com/test-abc-def"
```

## Claude Desktop Configuration

Update your Claude Desktop configuration file:

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "attendee": {
      "command": "node",
      "args": [
        "/absolute/path/to/attendee-mcp/dist/index.js"
      ],
      "env": {
        "MEETING_BOT_API_URL": "http://localhost:8000",
        "MEETING_BOT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Use the absolute path to your `attendee-mcp/dist/index.js` file
- Replace `your-api-key-here` with your actual API key
- Replace the URL with your actual Attendee server URL
- Restart Claude Desktop after making changes

## Testing the Setup

1. **Build the MCP:**
   ```bash
   cd /path/to/attendee-mcp
   npm run build
   ```

2. **Test with Claude:**
   - Open Claude Desktop
   - Ask: "What MCP tools are available?"
   - You should see all Attendee tools listed

3. **Create a test bot:**
   - Ask Claude: "Send a bot to this meeting: https://meet.google.com/test-abc-def"
   - Check that the bot is created successfully

## Troubleshooting

### Common Issues

1. **"MCP server not found"**
   - Check the file path in Claude config is correct
   - Ensure you've run `npm run build`
   - Restart Claude Desktop

2. **"Network error"**
   - Verify your Attendee server is running
   - Check the API URL is correct
   - Verify your API key is valid

3. **"Permission denied"**
   - Check file permissions on the dist/index.js file
   - Ensure Node.js is installed and accessible

### Verification Commands

Ask Claude these questions to verify everything works:

```
✅ "What MCP tools are available?"
✅ "Send a bot to this meeting: https://meet.google.com/test-abc-def"
✅ "Get the status of bot [bot-id]"
✅ "Make the bot say 'Hello everyone!'"
```

## Advanced Configuration

### Custom Voice Settings

When using text-to-speech, you can specify:

```
"Make the bot speak in Spanish: 'Hola a todos' using voice es-ES-Standard-A"
```

Available voice options:
- Language codes: `en-US`, `es-ES`, `fr-FR`, `de-DE`, etc.
- Voice names: `en-US-Casual-K`, `en-US-Standard-A`, etc.

### Meeting Platform Support

| Platform | Create Bot | Speech | Chat | Images | Videos |
|----------|:----------:|:------:|:----:|:------:|:------:|
| Google Meet | ✅ | ✅ | ✅ | ✅ | ✅ |
| Zoom | ✅ | ✅ | ✅ | ❌ | ❌ |
| Teams | ✅ | ✅ | ✅ | ❌ | ❌ |

## Support

If you encounter issues:

1. Check the Claude Desktop logs
2. Verify your Attendee server logs
3. Test the API endpoints manually
4. Review the configuration files

For more help, refer to the main README.md file.
