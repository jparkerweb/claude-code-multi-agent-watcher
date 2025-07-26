#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "requests",
#     "python-dotenv",
# ]
# ///

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv


def prompt_llm(prompt_text):
    """
    Prompt OpenRouter API for fast summarization.

    Args:
        prompt_text (str): The prompt to send to the model

    Returns:
        str: The model's response text, or None if error
    """
    # Load .env file from project root 
    try:
        script_path = Path(__file__)
        project_root = script_path.parent.parent.parent.parent.parent  # Go up 5 levels
        env_path = project_root / ".env"
        load_dotenv(env_path, override=True)
    except:
        try:
            load_dotenv(override=True)
        except:
            pass

    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct")
    
    if not api_key:
        return None

    try:
        import requests

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/your-repo",  # Required by OpenRouter
            "X-Title": "Claude Code Multi Agent Watcher"  # Optional but recommended
        }

        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt_text}],
            "max_tokens": 100,
            "temperature": 0.7
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
        else:
            if __name__ == "__main__":
                print(f"OpenRouter API Error: {response.status_code} - {response.text}", file=sys.stderr)
            return None

    except Exception as e:
        if __name__ == "__main__":
            print(f"OpenRouter API Error: {e}", file=sys.stderr)
        return None


def generate_completion_message():
    """
    Generate a completion message using OpenRouter LLM.

    Returns:
        str: A natural language completion message, or None if error
    """
    engineer_name = os.getenv("ENGINEER_NAME", "").strip()

    if engineer_name:
        name_instruction = f"Sometimes (about 30% of the time) include the engineer's name '{engineer_name}' in a natural way."
        examples = f"""Examples of the style: 
- Standard: "Work complete!", "All done!", "Task finished!", "Ready for your next move!"
- Personalized: "{engineer_name}, all set!", "Ready for you, {engineer_name}!", "Complete, {engineer_name}!", "{engineer_name}, we're done!" """
    else:
        name_instruction = ""
        examples = """Examples of the style: "Work complete!", "All done!", "Task finished!", "Ready for your next move!" """

    prompt = f"""Generate a short, concise, friendly completion message for when an AI coding assistant finishes a task. 

Requirements:
- Keep it under 10 words
- Make it positive and future focused
- Use natural, conversational language
- Focus on completion/readiness
- Do NOT include quotes, formatting, or explanations
- Return ONLY the completion message text
{name_instruction}

{examples}

Generate ONE completion message:"""

    response = prompt_llm(prompt)

    # Clean up response - remove quotes and extra formatting
    if response:
        response = response.strip().strip('"').strip("'").strip()
        # Take first line if multiple lines
        response = response.split("\n")[0].strip()

    return response


def main():
    """Command line interface for testing."""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--completion":
            message = generate_completion_message()
            if message:
                print(message)
            else:
                print("Error generating completion message")
        else:
            prompt_text = " ".join(sys.argv[1:])
            response = prompt_llm(prompt_text)
            if response:
                print(response)
            else:
                print("Error calling OpenRouter API")
    else:
        print("Usage: ./openrouter.py 'your prompt here' or ./openrouter.py --completion")


if __name__ == "__main__":
    main()