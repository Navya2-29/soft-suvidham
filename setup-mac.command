#!/bin/zsh
set -e
cd "$(dirname "$0")"
echo "Project: $PWD"
if [[ ! -f package.json || ! -f angular.json ]]; then
  echo "ERROR: Run this from the extracted Kshethrasuvidham folder."; exit 1
fi
if [[ "$(node -p 'process.arch')" != "arm64" ]]; then
  echo "WARNING: Node is not running as arm64. Current: $(node -p 'process.arch')"
fi
# The distributed ZIP has no node_modules or old lockfile.
# Re-install native optional Rollup binary for this machine.
npm install --legacy-peer-deps --include=optional
npm run start
