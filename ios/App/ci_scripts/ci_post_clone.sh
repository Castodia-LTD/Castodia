#!/bin/sh

set -eu

SCRIPT_DIRECTORY="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPOSITORY_PATH="${CI_PRIMARY_REPOSITORY_PATH:-$(CDPATH= cd -- "$SCRIPT_DIRECTORY/../../.." && pwd)}"

cd "$REPOSITORY_PATH"

node_major=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
fi

if [ "$node_major" -lt 22 ]; then
  if ! command -v brew >/dev/null 2>&1; then
    echo "error: Node.js 22 or newer is required and Homebrew is unavailable." >&2
    exit 1
  fi

  export HOMEBREW_NO_AUTO_UPDATE=1
  brew install node@22
  export PATH="$(brew --prefix node@22)/bin:$PATH"
fi

echo "Using Node.js $(node --version) and npm $(npm --version)"
npm ci --include=dev --no-audit --no-fund
./node_modules/.bin/cap sync ios

test -f ios/App/App/capacitor.config.json
test -d ios/App/App/public

if [ -n "${CI_BUILD_NUMBER:-}" ]; then
  project_file="ios/App/App.xcodeproj/project.pbxproj"
  /usr/bin/sed -E -i '' "s/CURRENT_PROJECT_VERSION = [^;]+;/CURRENT_PROJECT_VERSION = ${CI_BUILD_NUMBER};/g" "$project_file"
  echo "Set CastodiaCare build number to ${CI_BUILD_NUMBER}."
fi

echo "Capacitor iOS project is ready for Xcode Cloud."
