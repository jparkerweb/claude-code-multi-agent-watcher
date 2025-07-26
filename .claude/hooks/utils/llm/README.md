# LLM Integrations

This directory contains LLM provider integrations for AI-powered event summarization.

## Available Providers

### 1. Anthropic Claude (`anth.py`)
- **Model**: Claude 3.5 Haiku (fast and efficient)
- **API**: Anthropic Messages API
- **Configuration**: `ANTHROPIC_API_KEY` environment variable
- **Features**:
  - Fast response times
  - High-quality summarization
  - Built-in safety features
  - Completion message generation

### 2. OpenRouter (`openrouter.py`)
- **Models**: Access to various models via OpenRouter
- **Default Model**: `meta-llama/llama-3.2-3b-instruct`
- **Configuration**: 
  - `OPENROUTER_API_KEY` - API key
  - `OPENROUTER_MODEL` - Model selection
- **Features**:
  - Cost-effective options
  - Wide model selection
  - Alternative to Anthropic
  - Same interface as `anth.py`

## Usage

Both modules provide the same interface:

```python
from utils.llm.anth import prompt_llm, generate_completion_message
# or
from utils.llm.openrouter import prompt_llm, generate_completion_message

# Generate event summary
summary = prompt_llm("Summarize this event...")

# Generate completion message
completion = generate_completion_message()
```

## Provider Selection

The `utils/summarizer.py` module automatically selects the appropriate provider based on:

1. `ACTIVE_SUMMARIZATION_PROVIDER` environment variable
2. Available API keys
3. Fallback logic for reliability

## Testing

Both modules support command-line testing:

```bash
# Test Anthropic integration
uv run utils/llm/anth.py "Test prompt"
uv run utils/llm/anth.py --completion

# Test OpenRouter integration  
uv run utils/llm/openrouter.py "Test prompt"
uv run utils/llm/openrouter.py --completion
```

## Error Handling

- Returns `None` on API failures
- Graceful degradation - events are captured even if summarization fails
- Automatic fallback between providers when both are configured
- Detailed error logging in debug mode