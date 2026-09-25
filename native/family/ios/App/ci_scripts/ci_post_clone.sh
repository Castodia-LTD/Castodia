#!/bin/sh

set -eu

SCRIPT_DIRECTORY="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_FILE="$SCRIPT_DIRECTORY/../App.xcodeproj/project.pbxproj"

if [ -n "${CI_BUILD_NUMBER:-}" ]; then
  /usr/bin/sed -E -i '' "s/CURRENT_PROJECT_VERSION = [^;]+;/CURRENT_PROJECT_VERSION = ${CI_BUILD_NUMBER};/g" "$PROJECT_FILE"
  echo "Set CastodiaFamily build number to ${CI_BUILD_NUMBER}."
else
  echo "CI_BUILD_NUMBER is unavailable; leaving the checked-in build number unchanged."
fi
