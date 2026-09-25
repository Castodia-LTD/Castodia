#!/bin/sh

set -eu

SCRIPT_DIRECTORY="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPOSITORY_PATH="${CI_PRIMARY_REPOSITORY_PATH:-$(CDPATH= cd -- "$SCRIPT_DIRECTORY/../../../../.." && pwd)}"
PROJECT_FILE="$SCRIPT_DIRECTORY/../App.xcodeproj/project.pbxproj"

cd "$REPOSITORY_PATH"
castodia_version="$(node -p 'require("./package.json").version')"

/usr/bin/sed -E -i '' "s/MARKETING_VERSION = [^;]+;/MARKETING_VERSION = ${castodia_version};/g" "$PROJECT_FILE"
echo "Set CastodiaFamily Castodia OS version to ${castodia_version}."

if [ -n "${CI_BUILD_NUMBER:-}" ]; then
  /usr/bin/sed -E -i '' "s/CURRENT_PROJECT_VERSION = [^;]+;/CURRENT_PROJECT_VERSION = ${CI_BUILD_NUMBER};/g" "$PROJECT_FILE"
  echo "Set CastodiaFamily Apple build number to ${CI_BUILD_NUMBER}."
else
  echo "CI_BUILD_NUMBER is unavailable; leaving the checked-in Apple build number unchanged."
fi
