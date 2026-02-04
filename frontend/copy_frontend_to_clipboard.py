#!/usr/bin/env python3
from __future__ import annotations

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

ROOT = Path(".").resolve()

# Directories we never want to traverse/copy from
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    ".venv",
    "venv",
    "__pycache__",
}

# What to include
INCLUDE = [
    ROOT / "index.html",
    ROOT / "src",
    ROOT / "public",
]


def is_excluded(path: Path) -> bool:
    # Exclude if any path component matches an excluded dir name
    return any(part in EXCLUDE_DIRS for part in path.parts)


def is_binary(path: Path) -> bool:
    """
    Cheap binary detection: check for NUL byte in first chunk.
    (Enough to avoid dumping images/audio into clipboard.)
    """
    try:
        with path.open("rb") as f:
            chunk = f.read(8192)
        return b"\x00" in chunk
    except OSError:
        # If unreadable, treat as binary-ish and skip content
        return True


def collect_files() -> list[Path]:
    files: list[Path] = []

    for item in INCLUDE:
        if item.is_file():
            files.append(item)
            continue

        if item.is_dir():
            for p in item.rglob("*"):
                if p.is_file() and not is_excluded(p):
                    files.append(p)

    # De-dup + stable sort by relative path
    uniq = sorted({p.resolve() for p in files}, key=lambda p: str(p.relative_to(ROOT)))
    return uniq


def build_payload(files: list[Path]) -> str:
    lines: list[str] = []
    lines.append("### PROJECT SNAPSHOT")
    lines.append(f"# root: {ROOT}")
    lines.append(f"# copied: {datetime.now().isoformat(timespec='seconds')}")
    lines.append("")

    for p in files:
        rel = p.relative_to(ROOT)
        lines.append(f"===== FILE: {rel} =====")
        lines.append("")

        if is_binary(p):
            lines.append("[skipped: binary file]")
        else:
            # Keep it robust: if something isn't valid UTF-8, replace bad chars
            try:
                lines.append(p.read_text(encoding="utf-8", errors="replace"))
            except OSError:
                lines.append("[skipped: unreadable file]")

        lines.append("")
        lines.append("")

    return "\n".join(lines)


def xclip_exists() -> bool:
    from shutil import which
    return which("xclip") is not None


def copy_to_clipboard_xclip(payload: str) -> None:
    """
    Exactly your style: pipe into xclip -selection clipboard
    """
    if not xclip_exists():
        raise RuntimeError("xclip not found. Install it: sudo apt install xclip")

    # Note: xclip needs DISPLAY set (X11 session)
    if not os.environ.get("DISPLAY"):
        raise RuntimeError(
            "DISPLAY is not set. xclip needs an X11 session.\n"
            "If you are on Wayland, use wl-copy instead."
        )

    subprocess.run(
        ["xclip", "-selection", "clipboard"],
        input=payload.encode("utf-8"),
        check=True,
    )


def main() -> None:
    files = collect_files()
    if not files:
        print("Nothing found to copy (index.html/src/public missing?)", file=sys.stderr)
        sys.exit(1)

    payload = build_payload(files)
    copy_to_clipboard_xclip(payload)

    # Simple stats (handy if your clipboard gets huge)
    print(f"Copied {len(files)} files to clipboard via xclip.")
    print(f"Payload size: {len(payload)} chars, {payload.count(chr(10)) + 1} lines.")


if __name__ == "__main__":
    main()
