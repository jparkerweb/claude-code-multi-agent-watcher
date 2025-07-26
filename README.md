# 🕵️ Claude Code Multi-Agent Watcher

Real-time monitoring and visualization for Claude Code agents through comprehensive hook event tracking.

## 🎯 Overview

This system provides complete observability into Claude Code agent behavior by capturing, storing, and visualizing Claude Code [Hook events](https://docs.anthropic.com/en/docs/claude-code/hooks) in real-time. It enables monitoring of multiple concurrent agents with session tracking, event filtering, live updates, and advanced theming capabilities.

## 🏗️ Architecture

```
Claude Agents → Hook Scripts → HTTP POST → Bun Server → SQLite → WebSocket → Vue Client
```

![Agent Data Flow Animation](images/AgentDataFlowV2.gif)

## 📋 Setup Requirements

Before getting started, ensure you have the following installed:

- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** - Anthropic's official CLI for Claude
- **[Astral uv](https://docs.astral.sh/uv/)** - Fast Python package manager (required for hook scripts)
- **[Bun](https://bun.sh/)** - For running the server
- **npm** - For running the client (or **yarn** as alternative)
- **LLM API Keys** (optional) - For AI-powered event summarization:
  - **Anthropic API Key** - Set as `ANTHROPIC_API_KEY` environment variable
  - **OpenRouter API Key** (optional) - Set as `OPENROUTER_API_KEY` for alternative models
  - **Engineer Name** (optional) - Set as `ENGINEER_NAME` for personalized summaries

### Configure .claude Directory

To setup observability in your repo,we need to copy the .claude directory to your project root.

To integrate the observability hooks into your projects:

1. **Copy the entire `.claude` directory to your project root:**
   ```bash
   cp -R .claude /path/to/your/project/
   ```

2. **Update the `settings.json` configuration:**
   
   Open `.claude/settings.json` in your project and modify the `source-app` parameter to identify your project:
   
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "",
         "hooks": [
           {
             "type": "command",
             "command": "uv run .claude/hooks/pre_tool_use.py"
           },
           {
             "type": "command",
             "command": "uv run .claude/hooks/send_event.py --source-app YOUR_PROJECT_NAME --event-type PreToolUse --summarize"
           }
         ]
       }],
       "PostToolUse": [{
         "matcher": "",
         "hooks": [
           {
             "type": "command",
             "command": "uv run .claude/hooks/post_tool_use.py"
           },
           {
             "type": "command",
             "command": "uv run .claude/hooks/send_event.py --source-app YOUR_PROJECT_NAME --event-type PostToolUse --summarize"
           }
         ]
       }],
       "UserPromptSubmit": [{
         "hooks": [
           {
             "type": "command",
             "command": "uv run .claude/hooks/user_prompt_submit.py --log-only"
           },
           {
             "type": "command",
             "command": "uv run .claude/hooks/send_event.py --source-app YOUR_PROJECT_NAME --event-type UserPromptSubmit --summarize"
           }
         ]
       }]
       // ... (similar patterns for Notification, Stop, SubagentStop, PreCompact)
     }
   }
   ```
   
   Replace `YOUR_PROJECT_NAME` with a unique identifier for your project (e.g., `my-api-server`, `react-app`, etc.).

3. **Install dependencies and start the observability server:**
   ```bash
   # From the observability project directory (this codebase)
   npm run install:all              # Install server (Bun) and client (npm) dependencies
   npm run start                    # Start both server and client
   ```

Now your project will send events to the observability system whenever Claude Code performs actions.

## 🚀 Quick Start

You can quickly view how this works by running this repositories .claude setup.

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both server and client
npm run start

# 3. Open http://localhost:5173 in your browser

# 4. Open Claude Code and run the following command:
Run git ls-files to understand the codebase.

# 5. Watch events stream in the client

# 6. Copy the .claude folder to other projects you want to emit events from.
cp -R .claude <directory of your codebase you want to emit events from>
```

## 📁 Project Structure

```
claude-code-hooks-multi-agent-observability/
│
├── apps/                    # Application components
│   ├── server/             # Bun TypeScript server
│   │   ├── src/
│   │   │   ├── index.ts    # Main server with HTTP/WebSocket endpoints
│   │   │   ├── db.ts       # SQLite database management & migrations
│   │   │   └── types.ts    # TypeScript interfaces
│   │   ├── package.json
│   │   └── events.db       # SQLite database (gitignored)
│   │
│   └── client/             # Vue 3 TypeScript client
│       ├── src/
│       │   ├── App.vue     # Main app with theme & WebSocket management
│       │   ├── components/
│       │   │   ├── EventTimeline.vue      # Event list with auto-scroll
│       │   │   ├── EventRow.vue           # Individual event display
│       │   │   ├── FilterPanel.vue        # Multi-select filters
│       │   │   ├── ChatTranscriptModal.vue # Chat history viewer
│       │   │   ├── StickScrollButton.vue  # Scroll control
│       │   │   └── LivePulseChart.vue     # Real-time activity chart
│       │   ├── composables/
│       │   │   ├── useWebSocket.ts        # WebSocket connection logic
│       │   │   ├── useEventColors.ts      # Color assignment system
│       │   │   ├── useChartData.ts        # Chart data aggregation
│       │   │   └── useEventEmojis.ts      # Event type emoji mapping
│       │   ├── utils/
│       │   │   └── chartRenderer.ts       # Canvas chart rendering
│       │   └── types.ts    # TypeScript interfaces
│       ├── .env.sample     # Environment configuration template
│       └── package.json
│
├── .claude/                # Claude Code integration
│   ├── hooks/             # Hook scripts (Python with uv)
│   │   ├── send_event.py  # Universal event sender
│   │   ├── pre_tool_use.py    # Tool validation & blocking
│   │   ├── post_tool_use.py   # Result logging
│   │   ├── notification.py    # User interaction events & audio alerts
│   │   ├── user_prompt_submit.py # User prompt logging & validation
│   │   ├── stop.py           # Session completion with chat history
│   │   ├── subagent_stop.py  # Subagent completion
│   │   ├── play_audio.py     # Audio notification system
│   │   ├── utils/           # Utility modules
│   │   │   ├── llm/        # LLM integrations (Anthropic, OpenAI)
│   │   │   └── summarizer.py # AI summarization
│   │   ├── pyproject.toml  # Python dependencies (uv managed)
│   │   └── README.md       # Hook system documentation
│   │
│   └── settings.json      # Hook configuration
│
├── sounds/                # Audio notification files
│   ├── notification.wav   # User interaction sounds
│   ├── notification2.wav  # Alternative notification sounds
│   ├── notification3.wav
│   ├── stop.wav          # Session completion sounds
│   ├── stop2.wav
│   └── stop3.wav
│
├── package.json          # Root package management with concurrency
│
└── logs/                 # Application logs (gitignored)
```

## 🔧 Component Details

### 1. Hook System (`.claude/hooks/`)

> If you want to master claude code hooks watch [this video](https://github.com/disler/claude-code-hooks-mastery)

The hook system intercepts Claude Code lifecycle events:

- **`send_event.py`**: Core script that sends event data to the observability server
  - Supports `--add-chat` flag for including conversation history
  - Supports `--summarize` flag for AI-powered event summarization
  - Validates server connectivity before sending
  - Handles all event types with proper error handling

- **Event-specific hooks**: Each implements validation and data extraction
  - `pre_tool_use.py`: Blocks dangerous commands, validates tool usage
  - `post_tool_use.py`: Captures execution results and outputs
  - `notification.py`: Tracks user interaction points with audio alerts
  - `user_prompt_submit.py`: Logs user prompts, supports validation (v1.0.54+)
  - `stop.py`: Records session completion with optional chat history
  - `subagent_stop.py`: Monitors subagent task completion
  - `play_audio.py`: Plays randomized audio notifications from sound files

- **Utility modules**: Enhanced functionality for hooks
  - `utils/llm/`: Multi-provider LLM integrations (Anthropic Claude, OpenRouter)
  - `utils/summarizer.py`: AI-powered event summarization with provider selection

### 2. Server (`apps/server/`)

Bun-powered TypeScript server with real-time capabilities:

- **Database**: SQLite with WAL mode for concurrent access
- **Endpoints**:
  - `POST /events` - Receive events from agents
  - `GET /events/recent` - Paginated event retrieval with filtering
  - `GET /events/filter-options` - Available filter values
  - `WS /stream` - Real-time event broadcasting
- **Features**:
  - Automatic schema migrations
  - Event validation
  - WebSocket broadcast to all clients
  - Chat transcript storage

### 3. Client (`apps/client/`)

Vue 3 application with real-time visualization:

- **Visual Design**:
  - Dual-color system: App colors (left border) + Session colors (second border)
  - Gradient indicators for visual distinction
  - Dark/light theme support
  - Responsive layout with smooth animations

- **Features**:
  - Real-time WebSocket updates
  - Multi-criteria filtering (app, session, event type)
  - Live pulse chart with session-colored bars and event type indicators
  - Time range selection (1m, 3m, 5m) with appropriate data aggregation
  - Chat transcript viewer with syntax highlighting
  - Auto-scroll with manual override
  - Event limiting (configurable via `VITE_MAX_EVENTS_TO_DISPLAY`)
  - **Advanced theming system** with 20+ predefined themes and custom theme creation
  - Theme management with import/export capabilities
  - Real-time theme preview and switching

- **Live Pulse Chart**:
  - Canvas-based real-time visualization
  - Session-specific colors for each bar
  - Event type emojis displayed on bars
  - Smooth animations and glow effects
  - Responsive to filter changes
  - Theme-aware color adaptation

- **Theming System**:
  - **20+ predefined themes**: Light, Dark, Modern, Earth, Glass, High Contrast, Dark Blue, Colorblind Friendly, Ocean, Sunset, Forest, Neon, Vintage, Arctic, Lavender, Copper, Midnight, Coral, Slate
  - **Custom theme creation**: Full color palette customization with validation
  - **Theme manager**: Visual theme browser with live preview
  - **Import/Export**: Share themes via JSON export/import
  - **Accessibility**: High contrast and colorblind-friendly options
  - **Theme persistence**: Automatic localStorage saving

## 🔄 Data Flow

1. **Event Generation**: Claude Code executes an action (tool use, notification, etc.)
2. **Hook Activation**: Corresponding hook script runs based on `settings.json` configuration
3. **Data Collection**: Hook script gathers context (tool name, inputs, outputs, session ID)
4. **Enhanced Processing**: 
   - AI summarization (optional with `--summarize` flag)
   - Audio notifications (for user interactions and session completion)
   - Chat history inclusion (for Stop events)
5. **Transmission**: `send_event.py` sends JSON payload to server via HTTP POST
6. **Server Processing**:
   - Validates event structure
   - Stores in SQLite with timestamp
   - Broadcasts to WebSocket clients
7. **Client Update**: Vue app receives event and updates timeline in real-time with theme-aware styling

## 🎨 Event Types & Visualization

| Event Type   | Emoji | Purpose               | Color Coding  | Special Display |
| ------------ | ----- | --------------------- | ------------- | --------------- |
| PreToolUse   | 🔧     | Before tool execution | Session-based | Tool name & details |
| PostToolUse  | ✅     | After tool completion | Session-based | Tool name & results |
| Notification | 🔔     | User interactions     | Session-based | Notification message |
| Stop         | 🛑     | Response completion   | Session-based | Summary & chat transcript |
| SubagentStop | 👥     | Subagent finished     | Session-based | Subagent details |
| PreCompact   | 📦     | Context compaction    | Session-based | Compaction details |
| UserPromptSubmit | 💬 | User prompt submission | Session-based | Prompt: _"user message"_ (italic) |

### UserPromptSubmit Event (v1.0.54+)

The `UserPromptSubmit` hook captures every user prompt before Claude processes it. In the UI:
- Displays as `Prompt: "user's message"` in italic text
- Shows the actual prompt content inline (truncated to 100 chars)
- Summary appears on the right side when AI summarization is enabled
- Useful for tracking user intentions and conversation flow

## 🤖 AI Summarization

The system supports optional AI-powered event summarization using multiple LLM providers. When enabled with the `--summarize` flag, hooks will generate concise, technical summaries of events.

### Supported Providers

#### 1. Anthropic Claude (Default)
- **Model**: Claude 3.5 Haiku (fast and efficient)
- **Configuration**: Set `ANTHROPIC_API_KEY` in your `.env` file
- **Best for**: High-quality, reliable summarization

#### 2. OpenRouter
- **Models**: Access to various models (default: Llama 3.2 3B Instruct)
- **Configuration**: 
  ```bash
  OPENROUTER_API_KEY=your_key_here
  OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct  # or any OpenRouter model
  ACTIVE_SUMMARIZATION_PROVIDER=openrouter
  ```
- **Best for**: Cost-effective options, alternative models, experimentation

### Provider Selection

The system automatically selects the LLM provider based on your configuration:

1. **Primary**: Uses the provider specified in `ACTIVE_SUMMARIZATION_PROVIDER`
2. **Fallback**: If the primary provider fails, falls back to the alternative (if configured)
3. **Graceful degradation**: Events are still captured even if summarization fails

### Example Summaries

Without summarization:
```
PreToolUse: {"tool_name": "Read", "parameters": {"file_path": "/src/config.js"}}
```

With AI summarization:
```
PreToolUse: Reads configuration file from project root
```

### Usage

Add the `--summarize` flag to any hook in your `.claude/settings.json`:

```json
{
  "type": "command",
  "command": "uv run .claude/hooks/send_event.py --source-app YOUR_APP --event-type PreToolUse --summarize"
}
```

## 🔌 Integration

### For New Projects

1. Copy the event sender:
   ```bash
   cp .claude/hooks/send_event.py YOUR_PROJECT/.claude/hooks/
   ```

2. Add to your `.claude/settings.json`:
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": ".*",
         "hooks": [{
           "type": "command",
           "command": "uv run .claude/hooks/send_event.py --source-app YOUR_APP --event-type PreToolUse"
         }]
       }]
     }
   }
   ```

### For This Project

Already integrated! Hooks run both validation and observability:
```json
{
  "type": "command",
  "command": "uv run .claude/hooks/pre_tool_use.py"
},
{
  "type": "command", 
  "command": "uv run .claude/hooks/send_event.py --source-app cc-hooks-observability --event-type PreToolUse"
}
```

## 🧪 Testing

```bash
# Manual event test
curl -X POST http://localhost:4000/events \
  -H "Content-Type: application/json" \
  -d '{
    "source_app": "test",
    "session_id": "test-123",
    "hook_event_type": "PreToolUse",
    "payload": {"tool_name": "Bash", "tool_input": {"command": "ls"}}
  }'
```

## ⚙️ Configuration

### Environment Variables

Copy `.env.sample` to `.env` in the project root and fill in your API keys:

**Application Root** (`.env` file):
- `ENGINEER_NAME` – Your name (for logging/identification)

**LLM Provider Configuration (optional - for AI summarization):**
- `ANTHROPIC_API_KEY` – Anthropic Claude API key 
- `OPENROUTER_API_KEY` – OpenRouter API key for alternative models
- `OPENROUTER_MODEL` – Model to use with OpenRouter (default: `meta-llama/llama-3.2-3b-instruct`)
- `ACTIVE_SUMMARIZATION_PROVIDER` – Choose provider: `anthropic` or `openrouter` (default: `anthropic`)

**Client** (`.env` file in `apps/client/.env`):
- `VITE_MAX_EVENTS_TO_DISPLAY=100` – Maximum events to show (removes oldest when exceeded)

### Server Ports

- Server: `4000` (HTTP/WebSocket)
- Client: `5173` (Vite dev server)

## 🛡️ Security Features

- Blocks dangerous commands (`rm -rf`, etc.)
- Prevents access to sensitive files (`.env`, private keys)
- Validates all inputs before execution
- No external dependencies for core functionality

## 📊 Technical Stack

- **Server**: Bun, TypeScript, SQLite
- **Client**: Vue 3, TypeScript, Vite, Tailwind CSS
- **Hooks**: Python 3.13+, Astral uv, LLMs (Claude/OpenAI)
- **Communication**: HTTP REST, WebSocket
- **Audio**: WAV files with randomized playback
- **Theming**: CSS custom properties with 20+ themes

## 🔧 Troubleshooting

### Hook Scripts Not Working

If your hook scripts aren't executing properly, it might be due to relative paths in your `.claude/settings.json`. Claude Code documentation recommends using absolute paths for command scripts.

**Solution**: Use the custom Claude Code slash command to automatically convert all relative paths to absolute paths:

```bash
# In Claude Code, simply run:
/convert_paths_absolute
```

This command will:
- Find all relative paths in your hook command scripts
- Convert them to absolute paths based on your current working directory
- Create a backup of your original settings.json
- Show you exactly what changes were made

This ensures your hooks work correctly regardless of where Claude Code is executed from.

### Audio Not Playing

If audio notifications aren't working:

1. **Check sound files**: Ensure WAV files exist in the `sounds/` directory
2. **Volume settings**: Check system volume and audio output device
3. **File permissions**: Ensure the hook scripts can access sound files
4. **Python audio libraries**: Install required audio dependencies via `uv`

### Theme Issues

If custom themes aren't loading or saving:

1. **Browser storage**: Clear localStorage if themes appear corrupted
2. **Theme validation**: Check console for theme validation errors
3. **CSS variables**: Ensure custom themes generate valid CSS values
4. **Import/Export**: Verify JSON structure when importing themes
