#!/usr/bin/env python3
"""
Audio playback script for Claude Code hooks.
Plays the completion sound when tasks are finished.
"""

import sys
import os
import argparse
import random
import time
from pathlib import Path

def play_audio(file_path: str) -> bool:
    """Play audio file using Windows winsound module."""
    
    # Windows-specific using winsound (built into Python)
    try:
        import winsound
        winsound.PlaySound(file_path, winsound.SND_FILENAME)
        return True
    except ImportError:
        print("winsound module not available (Windows only)", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Winsound failed: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description='Play audio files for Claude Code hooks')
    parser.add_argument('--file', nargs='+', default=['stop.wav'], 
                       help='Audio file(s) to play. If multiple files provided, one will be chosen randomly (default: stop.wav)')
    args = parser.parse_args()
    
    # Get the project root directory (2 levels up from this script)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    
    # Simple file-based locking to prevent multiple audio files playing simultaneously
    lock_file = project_root / ".audio_lock"
    
    # Check if another audio is already playing
    if lock_file.exists():
        # Check if lock is stale (older than 10 seconds)
        try:
            lock_age = time.time() - lock_file.stat().st_mtime
            if lock_age < 10:
                print("Audio already playing, skipping...", file=sys.stderr)
                sys.exit(0)
            else:
                # Remove stale lock
                lock_file.unlink()
        except:
            pass
    
    # Create lock file
    try:
        lock_file.touch()
    except:
        pass
    
    try:
        # Randomly choose a file if multiple are provided
        chosen_file = random.choice(args.file)
        audio_file = project_root / "sounds" / chosen_file
        
        if not audio_file.exists():
            print(f"Audio file not found: {audio_file}", file=sys.stderr)
            sys.exit(1)
        
        success = play_audio(str(audio_file))
        
        if not success:
            print("Failed to play audio", file=sys.stderr)
            sys.exit(1)
        
        print(f"Audio played successfully: {chosen_file}")
    
    finally:
        # Remove lock file
        try:
            if lock_file.exists():
                lock_file.unlink()
        except:
            pass

if __name__ == "__main__":
    main()