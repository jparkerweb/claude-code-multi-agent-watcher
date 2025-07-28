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
npm run start                    # Starts both server (port 4000) and client (port 5173)
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
- **Notification** - User interaction events
- **Stop/SubagentStop** - Session completion tracking with chat history
- **PreCompact** - Context compaction monitoring

Key integration points:
- Hook scripts use `send_event.py` as universal event sender with `--source-app` parameter
- All hooks support `--summarize` flag for AI-powered event summarization using multiple LLM providers
- Audio notifications are handled client-side in the web application

### AI Summarization Configuration

The system supports multiple LLM providers for event summarization. Configure via environment variables:

**Primary Providers:**
- **Anthropic Claude**: Set `ANTHROPIC_KEY` (default provider)
- **OpenRouter**: Set `OPENROUTER_KEY` and `OPENROUTER_MODEL`

**Provider Selection:**
- Set `ACTIVE_SUMMARIZATION_PROVIDER=anthropic` or `openrouter`
- System falls back gracefully if primary provider fails
- Summarization is optional - events are captured regardless

**LLM Modules:**
- `utils/llm/anth.py` - Anthropic Claude integration (Haiku 3.5)
- `utils/llm/openrouter.py` - OpenRouter integration (various models)
- `utils/summarizer.py` - Provider selection and fallback logic

### Environment Variables

The system loads environment variables from the server directory (`apps/server/.env`). The following variables are supported:

- `ANTHROPIC_KEY` - Required for AI-powered event summarization
- `OPENROUTER_KEY` - Optional, for alternative LLM models
- `ACTIVE_SUMMARIZATION_PROVIDER` - Set to 'anthropic' or 'openrouter' (default: 'anthropic')

## Critical File Structure

```
apps/server/src/index.ts       # Main Bun server with WebSocket + HTTP endpoints
apps/server/src/db.ts          # SQLite database layer with migrations
apps/client/src/App.vue        # Main Vue app with WebSocket management
apps/client/src/composables/useSound.ts  # Sound management composable
.claude/hooks/send_event.py    # Universal event sender for all hook types
.claude/hooks/utils/           # LLM integrations and summarization utilities
.claude/hooks/utils/llm/anth.py       # Anthropic Claude API integration
.claude/hooks/utils/llm/openrouter.py # OpenRouter API integration  
.claude/hooks/utils/summarizer.py     # Multi-provider LLM selection logic
.claude/settings.json          # Hook configurations for this project