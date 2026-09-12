#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENGINE="$ROOT/WebDOOM"
FREEDOOM_VERSION="0.13.0"
FREEDOOM_URL="https://github.com/freedoom/freedoom/releases/download/v${FREEDOOM_VERSION}/freedoom-${FREEDOOM_VERSION}.zip"

# WebDOOM is open-source engine code. The original DOOM II WAD is not
# redistributed here. For a self-contained public build we use Freedoom
# Phase 2, which is free to redistribute and targets Doom II compatibility.
if [ ! -d "$ENGINE/.git" ]; then
  git clone --depth=1 https://github.com/UstymUkhman/WebDOOM.git "$ENGINE"
fi

if ! command -v emcc >/dev/null 2>&1; then
  if [ -f "$HOME/emsdk/emsdk_env.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/emsdk/emsdk_env.sh"
  fi
fi

if ! command -v emcc >/dev/null 2>&1; then
  echo "Emscripten is missing. Install/activate emsdk first."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1 || ! command -v unzip >/dev/null 2>&1; then
  echo "This build needs curl and unzip."
  exit 1
fi

# Supply a legal, redistributable Doom-II-compatible IWAD to WebDOOM.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "$FREEDOOM_URL" -o "$TMP/freedoom.zip"
unzip -q "$TMP/freedoom.zip" -d "$TMP/freedoom"

FREEDOOM_WAD="$TMP/freedoom/freedoom-${FREEDOOM_VERSION}/freedoom2.wad"
if [ ! -s "$FREEDOOM_WAD" ]; then
  echo "Freedoom Phase 2 WAD was not found in the downloaded release."
  exit 1
fi

mkdir -p "$ENGINE/build/doom2/music" "$ENGINE/build/sfx"
cp "$FREEDOOM_WAD" "$ENGINE/build/doom2.wad"

cd "$ENGINE"
chmod +x build.sh
./build.sh doom2

OUT="$ENGINE/build/web"
for file in doom2.js doom2.wasm doom2.data; do
  if [ ! -s "$OUT/$file" ]; then
    echo "Missing WebAssembly output: $OUT/$file"
    exit 1
  fi
  cp "$OUT/$file" "$ROOT/$file"
done

echo "WebAssembly build staged in $ROOT"
ls -lh "$ROOT/doom2.js" "$ROOT/doom2.wasm" "$ROOT/doom2.data"
