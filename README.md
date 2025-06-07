# Attendee MCP Server (TypeScript)

An MCP server for managing Attendee meeting bots.

## 🚀 **Quick Setup**

### **1. Build the Package**
```bash
cd /Users/rex/work/ai/attendee-mcp
npm install
npm run build
```

### **2. Test with npx**
```bash
chmod +x test-npx.sh
./test-npx.sh
```

### **3. Configure Claude Desktop**

Update `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "attendee": {
      "command": "node",
      "args": [
        "/Users/rex/work/ai/attendee-mcp/dist/index.js"
      ],
      "env": {
        "MEETING_BOT_API_URL": "<Attendee Server>",
        "MEETING_BOT_API_KEY": "<Attendee API Key>"
      }
    }
  }
}
```

### **4. Start Your Local Attendee Server**
```bash
cd /Users/rex/work/ai/attendee
python manage.py runserver
```

### **5. Restart Claude Desktop**

## 🎯 **Usage in Claude**

Once configured, you can use natural language commands:

- "Create a meeting bot for this Zoom: https://zoom.us/j/123456789"
- "What's the status of bot bot_abc123?"
- "Get the transcript from my last meeting"
- "Show me all my active bots"

## 🔍 **Troubleshooting**
