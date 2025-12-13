#scanner.py
import os
import pathspec
from pathlib import Path
from typing import Generator, List

# Global deny list (always ignore these)
ALWAYS_IGNORE = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", 
    ".env", "dist", "build", "coverage"
}

def load_gitignore_patterns(root_path: Path) -> pathspec.PathSpec:
    """
    Reads .gitignore from the root_path and returns a matcher.
    """
    gitignore_path = root_path / ".gitignore"
    patterns = []
    if gitignore_path.exists():
        with open(gitignore_path, "r") as f:
            patterns = f.read().splitlines()

    return pathspec.PathSpec.from_lines("gitwildmatch", patterns)

def scan_directory(root_path: str) -> Generator[Path, None, None]:
    """
    Yields valid file paths from the directory, respecting .gitignore.
    """
    root = Path(root_path).resolve()
    if not root.exists():
        raise FileNotFoundError(f"Path not found: {root}")

    spec = load_gitignore_patterns(root)

    for dirpath, dirnames, filenames in os.walk(root):
        # 1. Filter directories in-place to prevent traversing ignored folders
        # We must modify 'dirnames' list directly for os.walk to skip them
        dirnames[:] = [
            d for d in dirnames 
            if d not in ALWAYS_IGNORE 
            and not spec.match_file(str(Path(dirpath) / d))
        ]

        for filename in filenames:
            file_path = Path(dirpath) / filename
            relative_path = file_path.relative_to(root)

            # 2. Check strict ignore list (extensions)
            if filename.startswith(".") or filename.endswith((".pyc", ".lock", ".png", ".jpg")):
                continue

            # 3. Check .gitignore
            if spec.match_file(str(relative_path)):
                continue

            # 4. Success - Yield the path
            yield file_path