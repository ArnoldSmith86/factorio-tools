#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

mkdir -p dist

awk '
  {
    # Match @INCLUDE "path/to/file" anywhere in the line (including inside comments)
    if (match($0, /@INCLUDE[[:space:]]+"([^"]+)"/, m)) {
      file = m[1]
      while ((getline line < file) > 0) {
        print line
      }
      close(file)
    } else {
      print
    }
  }
' index.htm > dist/index.htm
cp data/*.webp dist/