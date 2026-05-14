"""
Speaker output. Uses espeak-ng if available, otherwise prints to stdout.
"""

from __future__ import annotations

import shutil
import subprocess

_HAS_ESPEAK = shutil.which("espeak-ng") is not None


def speaker_say(text: str, lang: str = "en") -> None:
    if not text:
        return
    if _HAS_ESPEAK:
        try:
            subprocess.Popen(
                ["espeak-ng", "-v", lang, text],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return
        except Exception as e:
            print(f"[SPEAKER] espeak-ng failed: {e}")
    print(f"[SPEAKER] {text}")
