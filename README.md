# Attendee MCP Server

A Model Context Protocol (MCP) server for managing Attendee meeting bots. This server allows you to create, manage, and retrieve transcripts from meeting bots through Claude Desktop.

## 🚀 Installation Options

### Option 1: Install from Remote Repository (Recommended)

This is the easiest way to get started:

```bash
# Clone the repository
git clone https://github.com/rexposadas/attendee-mcp.git
cd attendee-mcp

# Install dependencies and build
npm install
npm run build

# Install globally for use with Claude Desktop
npm link
```

### Option 2: Install Directly via npm/git

You can install directly from the GitHub repository:

```bash
# Install globally from GitHub
npm install -g git+https://github.com/rexposadas/attendee-mcp.git

# Or install locally in a project
npm install git+https://github.com/rexposadas/attendee-mcp.git
```

### Option 3: Local Development Setup

If you're developing or modifying the MCP server:

```bash
# Clone your fork or the main repo
git clone https://github.com/rexposadas/attendee-mcp.git
cd attendee-mcp

# Install dependencies
npm install

# Build the TypeScript
npm run build

# Link for global use
npm link
```

## ⚙️ Configuration

### Environment Variables

Set these environment variables for your Attendee server:

```bash
export MEETING_BOT_API_URL="http://localhost:8000"  # Your Attendee server URL
export MEETING_BOT_API_KEY="your-api-key-here"     # Your Attendee API key
```

Add these to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.) to make them permanent.

### Claude Desktop Configuration

Update your Claude Desktop configuration file at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

#### Method 1: Using npm global installation

```json
{
  "mcpServers": {
    "attendee": {
      "command": "npx",
      "args": [
        "attendee-mcp"
      ],
      "env": {
        "MEETING_BOT_API_URL": "http://localhost:8000",
        "MEETING_BOT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Method 2: Using direct path (most reliable for development)

```json
{
  "mcpServers": {
    "attendee": {
      "command": "node",
      "args": [
        "/path/to/attendee-mcp/dist/index.js"
      ],
      "env": {
        "MEETING_BOT_API_URL": "http://localhost:8000",
        "MEETING_BOT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `/path/to/attendee-mcp` with the actual path where you cloned the repository.

## 🏃‍♂️ Quick Start

1. **Start your Attendee server:**
   ```bash
   cd /path/to/your/attendee-project
   python manage.py runserver
   ```

2. **Verify the MCP server works:**
   ```bash
   # Test the installation
   npx attendee-mcp
   # Should show: "Meeting Bot MCP Server running on stdio"
   ```

3. **Restart Claude Desktop** completely (quit and reopen)

4. **Test in Claude Desktop:**
   - Ask Claude: "What MCP tools are available?"
   - Or try: "List all meeting bots"

## 🎯 Usage Examples

Once configured, you can use natural language commands in Claude Desktop:

### Creating Meeting Bots
- "Create a meeting bot for this Zoom: https://zoom.us/j/123456789"
- "Send a bot to this Google Meet: https://meet.google.com/abc-defg-hij"
- "Join this Teams meeting with a bot: https://teams.microsoft.com/..."

### Managing Bots
- "What's the status of bot bot_abc123?"
- "Show me all my active bots"
- "List all meeting bots"
- "Remove bot bot_abc123 from the meeting"

### Getting Transcripts
- "Get the transcript from bot bot_abc123"
- "Show me the transcript from my last meeting"

## 🔧 Available MCP Tools

This server provides the following tools:

- **`create_meeting_bot`** - Create a bot to join and record a meeting
- **`get_bot_status`** - Check the current status of a meeting bot
- **`get_meeting_transcript`** - Retrieve the transcript from a completed meeting
- **`list_meeting_bots`** - List all active meeting bots
- **`remove_meeting_bot`** - Remove a bot from a meeting

## 🐛 Troubleshooting

### Common Issues

1. **"404 Not Found" errors when using npx:**
   - Make sure you ran `npm link` after installation
   - Try using the direct path method in Claude Desktop config
   - Verify the package is globally installed: `npm list -g attendee-mcp`

2. **"Network error" or API connection issues:**
   - Ensure your Attendee server is running on the configured URL
   - Check that your API key is correct
   - Verify the `MEETING_BOT_API_URL` and `MEETING_BOT_API_KEY` environment variables

3. **MCP server not appearing in Claude Desktop:**
   - Restart Claude Desktop completely after config changes
   - Check the Claude Desktop config file syntax is valid JSON
   - Look at Claude Desktop logs for error messages

4. **"Method not allowed" errors:**
   - Some API endpoints might not be fully implemented in your Attendee server
   - Check your Attendee server logs for more details

### Testing the Installation

```bash
# Test the MCP server directly
cd attendee-mcp
node test-mcp-server.js

# Test the npm installation
npx attendee-mcp

# Check global packages
npm list -g --depth=0 | grep attendee
```

### Debug Steps

1. **Verify Attendee server is running:**
   ```bash
   curl http://localhost:8000/api/v1/bots
   ```

2. **Test MCP server manually:**
   ```bash
   echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js
   ```

3. **Check Claude Desktop logs:**
   - Look for MCP-related error messages in Claude Desktop's output

## 🏗️ Development

### Building from Source

```bash
git clone https://github.com/rexposadas/attendee-mcp.git
cd attendee-mcp
npm install
npm run build
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with auto-reload
- `npm run watch` - Watch for changes and rebuild automatically
- `npm run clean` - Remove build artifacts
- `npm start` - Run the compiled server

### Project Structure

```
attendee-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/
│   └── index.js          # Compiled JavaScript (generated)
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 🔗 Related Projects

- [Attendee](https://github.com/rexposadas/attendee) - The main meeting bot service
- [Model Context Protocol](https://github.com/modelcontextprotocol) - The MCP specification and SDK

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Look at the existing GitHub issues
3. Create a new issue with detailed information about your setup and the problem

---

**Note:** This MCP server requires a running Attendee backend service. Make sure you have the Attendee server set up and running before using this MCP server.
