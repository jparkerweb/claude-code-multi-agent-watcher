# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Multi-Agent Observability System for monitoring Claude Code agents through comprehensive hook event tracking. It provides real-time visualization and analytics of agent behavior.

## Architecture

- **Monorepo Structure**: Apps directory containing server and client applications
- **Server**: Bun runtime, TypeScript, SQLite database, WebSocket support  
- **Client**: Vue 3, TypeScript, Vite, Tailwind CSS
- **Hooks**: Python scripts using Astral uv package manager
- **Data Flow**: Claude Agents → Hook Scripts → HTTP POST → Bun Server → SQLite → WebSocket → Vue Client

## Essential Commands

### Quick Start (Recommended)
```bash
# Install all dependencies first
npm run install:all              # Install server deps (Bun) and client deps (npm)

# Start the complete system
./scripts/start-system.sh        # Starts both server (port 4000) and client (port 5173)
./scripts/reset-system.sh        # Stop all processes and cleanup
./scripts/test-system.sh         # Run system validation tests

# Alternative - Root level commands 
npm run start                    # Same as start-system.sh using concurrently
npm run kill                     # Kill processes on ports 4000 and 5173
```

### Individual Development
```bash
# Server only (from apps/server/)
bun run dev        # Development with watch mode
bun run start      # Production mode  
bun run typecheck  # Type checking

# Client only (from apps/client/)
npm run dev        # Vite dev server
npm run build      # Production build with type checking
npm run preview    # Preview production build
```

### Hook Development & Testing
```bash
# Hook system uses uv (not pip) for Python package management
cd .claude/hooks
uv run <script_name>.py          # Run individual hooks with uv

# Test hook functionality
python hooks/test_hook_general.py  # Run hook tests
```

## Key Architectural Decisions

1. **Bun Runtime**: The server uses Bun (not Node.js). All server-side JavaScript/TypeScript runs on Bun.
2. **Python Package Management**: Hook scripts use `uv` (not pip) for dependency management with pyproject.toml.
3. **Real-time Updates**: WebSocket endpoint at `ws://localhost:4000/stream` for live event streaming.
4. **Database**: SQLite with WAL mode for concurrent access, located at `apps/server/events.db`.
5. **Component Structure**: Vue 3 components use Composition API with TypeScript and `<script setup>` syntax.
6. **Styling**: Tailwind CSS with comprehensive theming system (20+ themes with custom theme creation).

## Data Flow Architecture

```
User Action → Claude Code → Hook Event → Python Script → HTTP POST → Bun Server → SQLite → WebSocket → Vue Client
```

The system captures all Claude Code events in real-time and provides multi-agent session tracking with visual analytics.

## Hook System Integration

Hook configurations are defined in `.claude/settings.json`. Each hook type serves specific monitoring purposes:

- **PreToolUse/PostToolUse** - Tool execution monitoring with validation and result capture
- **UserPromptSubmit** - User input tracking for conversation flow analysis  
- **Notification** - User interaction events with optional audio alerts
- **Stop/SubagentStop** - Session completion tracking with chat history
- **PreCompact** - Context compaction monitoring

Key integration points:
- Hook scripts use `send_event.py` as universal event sender with `--source-app` parameter
- All hooks support `--summarize` flag for AI-powered event summarization
- Audio notifications are handled via `play_audio.py` with randomized sound files

## Critical File Structure

```
apps/server/src/index.ts       # Main Bun server with WebSocket + HTTP endpoints
apps/server/src/db.ts          # SQLite database layer with migrations
apps/client/src/App.vue        # Main Vue app with WebSocket management
.claude/hooks/send_event.py    # Universal event sender for all hook types
.claude/hooks/utils/           # LLM integrations, TTS, and summarization utilities
.claude/settings.json          # Hook configurations for this project
scripts/                      # System management scripts (start/stop/test)
```