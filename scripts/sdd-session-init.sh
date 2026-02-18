#!/usr/bin/env bash
# SDD Session Init — Detects SDD project and shows progress on session start

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

SDD_CONFIG="docs/specs/sdd-config.yaml"
SPEC_DIR="docs/specs"

# Check if this is an SDD project
if [ ! -f "$SDD_CONFIG" ]; then
  exit 0
fi

echo ""
echo -e "${BOLD}${BLUE}[SDD]${RESET} Spec-Driven Development project detected"

# Count checklist progress if spec-checklist exists
CHECKLIST="$SPEC_DIR/06-spec-checklist.md"
if [ -f "$CHECKLIST" ]; then
  TOTAL=$(grep -c '^\- \[' "$CHECKLIST" 2>/dev/null || echo "0")
  DONE=$(grep -c '^\- \[x\]' "$CHECKLIST" 2>/dev/null || echo "0")
  if [ "$TOTAL" -gt 0 ]; then
    PCT=$(( DONE * 100 / TOTAL ))
    echo -e "${BOLD}${BLUE}[SDD]${RESET} Spec Checklist: ${GREEN}${DONE}${RESET}/${TOTAL} complete (${PCT}%)"
  fi
fi

# Show current phase based on existing files
if [ -f "$SPEC_DIR/08-review-report.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} Phase: ${GREEN}Review / Integration${RESET}"
elif [ -f "$SPEC_DIR/07-task-plan.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} Phase: ${YELLOW}Build (Implementation)${RESET}"
elif [ -f "$SPEC_DIR/06-spec-checklist.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} Phase: ${YELLOW}Planning${RESET}"
elif [ -f "$SPEC_DIR/01-requirements.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} Phase: ${YELLOW}Spec Generation${RESET}"
else
  echo -e "${BOLD}${BLUE}[SDD]${RESET} Phase: ${DIM}Intake (Requirements Gathering)${RESET}"
fi

echo -e "${DIM}  Use /sdd-status for full dashboard${RESET}"
echo ""
