#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "anthropic",
#     "python-dotenv",
#     "requests",
# ]
# ///

import json
import os
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv


def _get_llm_provider():
    """
    Get the appropriate LLM provider based on environment configuration.
    
    Returns:
        function: The prompt_llm function from the selected provider
    """
    # Load .env file from project root 
    try:
        script_path = Path(__file__)
        project_root = script_path.parent.parent.parent.parent  # Go up 4 levels
        env_path = project_root / ".env"
        load_dotenv(env_path, override=True)
    except:
        try:
            load_dotenv(override=True)
        except:
            pass
    
    provider = os.getenv("ACTIVE_SUMMARIZATION_PROVIDER", "anthropic").lower()
    
    if provider == "openrouter":
        try:
            from .llm.openrouter import prompt_llm
            return prompt_llm
        except ImportError:
            # Fall back to anthropic if openrouter import fails
            try:
                from .llm.anth import prompt_llm
                return prompt_llm
            except ImportError:
                return None
    else:
        # Default to anthropic
        try:
            from .llm.anth import prompt_llm
            return prompt_llm
        except ImportError:
            # Try openrouter as fallback
            try:
                from .llm.openrouter import prompt_llm
                return prompt_llm
            except ImportError:
                return None


def generate_event_summary(event_data: Dict[str, Any]) -> Optional[str]:
    """
    Generate a concise one-sentence summary of a hook event for engineers.

    Args:
        event_data: The hook event data containing event_type, payload, etc.

    Returns:
        str: A one-sentence summary, or None if generation fails
    """
    event_type = event_data.get("hook_event_type", "Unknown")
    payload = event_data.get("payload", {})

    # Convert payload to string representation
    payload_str = json.dumps(payload, indent=2)
    if len(payload_str) > 1000:
        payload_str = payload_str[:1000] + "..."

    prompt = f"""Generate a one-sentence summary of this Claude Code hook event payload for an engineer monitoring the system.

Event Type: {event_type}
Payload:
{payload_str}

Requirements:
- ONE sentence only (no period at the end)
- Focus on the key action or information in the payload
- Be specific and technical
- Keep under 15 words
- Use present tense
- No quotes or formatting
- Return ONLY the summary text

Examples:
- Reads configuration file from project root
- Executes npm install to update dependencies
- Searches web for React documentation
- Edits database schema to add user table
- Agent responds with implementation plan

Generate the summary based on the payload:"""

    prompt_llm = _get_llm_provider()
    if not prompt_llm:
        return None
        
    summary = prompt_llm(prompt)

    # Clean up the response
    if summary:
        summary = summary.strip().strip('"').strip("'").strip(".")
        # Take only the first line if multiple
        summary = summary.split("\n")[0].strip()
        # Ensure it's not too long
        if len(summary) > 100:
            summary = summary[:97] + "..."

    return summary
