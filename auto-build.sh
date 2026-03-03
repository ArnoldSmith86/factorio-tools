#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v inotifywait >/dev/null 2>&1; then
  echo "auto-build.sh requires inotifywait (from inotify-tools)." >&2
  echo "Install it (e.g. sudo apt install inotify-tools) and retry." >&2
  exit 1
fi

echo "Starting auto-build. Watching for changes..."
echo "Press Ctrl+C to stop."

while true; do
  # Block until any relevant file changes
  inotifywait -r -e modify,create,delete,move \
    --exclude '(^|/)(\.git|dist)/' \
    .

  echo "Change detected, running build.sh..."
  if ./build.sh; then
    echo "Build completed at $(date)."
  else
    echo "Build failed at $(date)." >&2
  fi
  echo
done

