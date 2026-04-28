#!/bin/bash
echo ""
echo "🛡️  CrisisNexus — Rapid Crisis Response Platform"
echo "=================================================="
echo ""

cd "$(dirname "$0")/backend"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --silent

echo "🚀 Starting CrisisNexus server..."
echo ""
echo "   Dashboard → http://localhost:5000"
echo "   Health    → http://localhost:5000/api/health"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

node server.js
