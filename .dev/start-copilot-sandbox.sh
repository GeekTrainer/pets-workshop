#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/sandbox.json"
DOCKERFILE="$SCRIPT_DIR/Dockerfile.sandbox"

cd "$REPO_ROOT"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: sandbox.json not found in $SCRIPT_DIR" >&2
  exit 1
fi

# Read config from sandbox.json
IMAGE_NAME=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['image_name'])")
mapfile -t WATCH_FILES < <(python3 -c "
import json
for f in json.load(open('$CONFIG_FILE')).get('watch_files', []):
    print(f)
")
WATCH_FILES+=("$DOCKERFILE")

needs_build() {
  # Build if image doesn't exist
  if ! docker image inspect "$IMAGE_NAME" &>/dev/null; then
    echo "Image '$IMAGE_NAME' not found."
    return 0
  fi

  # Get image creation timestamp
  image_time=$(docker image inspect "$IMAGE_NAME" --format '{{.Created}}')
  image_epoch=$(date -d "$image_time" +%s 2>/dev/null || date -jf "%Y-%m-%dT%H:%M:%S" "${image_time%%.*}" +%s 2>/dev/null)

  # Check if any watched files are newer than the image
  for f in "${WATCH_FILES[@]}"; do
    if [ -f "$f" ]; then
      file_epoch=$(stat -c %Y "$f" 2>/dev/null || stat -f %m "$f" 2>/dev/null)
      if [ "$file_epoch" -gt "$image_epoch" ]; then
        echo "Rebuild needed: '$f' is newer than image."
        return 0
      fi
    fi
  done

  echo "Image '$IMAGE_NAME' is up to date."
  return 1
}

REBUILT=false
if needs_build; then
  echo "Building sandbox image..."
  docker build -t "$IMAGE_NAME" -f "$DOCKERFILE" .
  echo "Build complete."
  REBUILT=true
fi

echo "Starting Copilot sandbox..."

# If sandbox already exists and image was rebuilt, remove the old sandbox
if [ "$REBUILT" = true ] && docker sandbox ls 2>/dev/null | grep -q "copilot"; then
  echo "Removing old sandbox to apply new image..."
  docker sandbox rm copilot 2>/dev/null || true
fi

# Use --template only when sandbox doesn't exist yet
if docker sandbox ls 2>/dev/null | grep -q "copilot"; then
  exec docker sandbox run copilot
else
  exec docker sandbox run --template "$IMAGE_NAME" copilot "$REPO_ROOT"
fi
