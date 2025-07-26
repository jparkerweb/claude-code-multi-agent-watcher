# Claude Code Multi-Agent Watcher - Server

Real-time monitoring and visualization server for Claude Code agents through comprehensive hook event tracking.

## Setup

To install dependencies:

```bash
bun install
```

## Running the Server

### Development Mode

```bash
bun run dev
```

### Production Mode

```bash
bun run start
```

## Environment Variables

Create a `.env` file in this directory with the following variables:

```bash
# Required for AI-powered event summarization
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional, for alternative LLM models
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Set to 'anthropic' or 'openrouter' (default: 'anthropic')
ACTIVE_SUMMARIZATION_PROVIDER=anthropic

# Optional, for personalized summaries (used 30% of the time when set)
ENGINEER_NAME=YourName
```

## Features

- Real-time WebSocket streaming of Claude Code hook events
- SQLite database storage with WAL mode for concurrent access
- AI-powered event summarization using multiple LLM providers
- REST API for event ingestion and querying
- CORS support for cross-origin requests

This project was created using `bun init` in bun v1.2.17. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
