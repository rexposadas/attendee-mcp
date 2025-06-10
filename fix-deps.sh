#!/bin/bash

# Fix MCP Server Dependencies

echo "🔧 Fixing Attendee MCP Server dependencies..."

cd /Users/rex/work/ai/attendee-mcp

# Clear existing node_modules and package-lock
echo "🧹 Cleaning existing dependencies..."
rm -rf node_modules package-lock.json

# Update package.json with correct MCP SDK version
echo "📦 Updating package.json..."
npm init -y > /dev/null

# Install the correct MCP SDK version
echo "📥 Installing MCP SDK..."
npm install @modelcontextprotocol/sdk@latest

# Install other dependencies
echo "📥 Installing other dependencies..."
npm install node-fetch@^3.3.2

# Install dev dependencies
echo "📥 Installing dev dependencies..."
npm install --save-dev @types/node@^20.10.0 @types/node-fetch@^2.6.9 tsx@^4.6.0 typescript@^5.3.0

echo "✅ Dependencies installed!"

# Check what version of MCP SDK we got
echo ""
echo "📋 Installed MCP SDK version:"
npm list @modelcontextprotocol/sdk

# Try to build
echo ""
echo "🔨 Attempting build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - checking available MCP exports..."
    node -e "
    try {
        const sdk = require('@modelcontextprotocol/sdk');
        console.log('Available exports:', Object.keys(sdk));
    } catch (e) {
        console.log('Error loading SDK:', e.message);
    }
    "
fi
