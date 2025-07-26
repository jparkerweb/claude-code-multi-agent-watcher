#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "requests",
#     "python-dotenv",
# ]
# ///

"""
Test script for OpenRouter integration
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add current directory to path to import local modules
sys.path.insert(0, str(Path(__file__).parent))

def test_openrouter():
    """Test OpenRouter integration"""
    print("Testing OpenRouter integration...")
    
    # Load environment
    try:
        script_path = Path(__file__)
        project_root = script_path.parent.parent  # Go up 2 levels to project root
        env_path = project_root / ".env"
        load_dotenv(env_path, override=True)
        print(f"✓ Loaded environment from {env_path}")
    except Exception as e:
        print(f"⚠ Warning loading .env: {e}")
    
    # Check required environment variables
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct")
    provider = os.getenv("ACTIVE_SUMMARIZATION_PROVIDER", "anthropic")
    
    print(f"✓ OpenRouter API Key: {'Found' if api_key else 'Missing'}")
    print(f"✓ OpenRouter Model: {model}")
    print(f"✓ Active Provider: {provider}")
    
    if not api_key:
        print("❌ OPENROUTER_API_KEY not found in environment")
        return False
    
    # Test OpenRouter module
    try:
        from utils.llm.openrouter import prompt_llm
        print("✓ Successfully imported OpenRouter module")
        
        # Test basic functionality
        test_prompt = "Say hello in exactly 3 words"
        response = prompt_llm(test_prompt)
        
        if response:
            print(f"✓ OpenRouter response: {response}")
            return True
        else:
            print("❌ OpenRouter returned empty response")
            return False
            
    except Exception as e:
        print(f"❌ Error testing OpenRouter: {e}")
        return False

def test_summarizer():
    """Test summarizer with provider selection"""
    print("\nTesting summarizer with provider selection...")
    
    try:
        from utils.summarizer import generate_event_summary
        print("✓ Successfully imported summarizer")
        
        # Test with mock event data
        test_event = {
            "hook_event_type": "PreToolUse",
            "payload": {
                "tool_name": "Read",
                "parameters": {"file_path": "/test/file.py"}
            }
        }
        
        summary = generate_event_summary(test_event)
        
        if summary:
            print(f"✓ Generated summary: {summary}")
            return True
        else:
            print("❌ Summarizer returned empty result")
            return False
            
    except Exception as e:
        print(f"❌ Error testing summarizer: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing OpenRouter Integration\n" + "="*40)
    
    results = []
    results.append(test_openrouter())
    results.append(test_summarizer())
    
    print("\n" + "="*40)
    if all(results):
        print("✅ All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())