#!/usr/bin/env bash
#
# PreToolUse hook: git commit 시 변경-문서 매핑 검증
# CLAUDE.md의 매핑 규칙 중 파일 패턴으로 감지 가능한 4개를 체크합니다.
#

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# git commit 명령이 아니면 통과
if ! echo "$command" | grep -qE '^\s*git\s+commit\b'; then
  exit 0
fi

# staged 파일 목록
STAGED=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null)
if [ -z "$STAGED" ]; then
  exit 0
fi

check_docs() {
  local label="$1"
  shift
  local missing=()
  for doc in "$@"; do
    if ! echo "$STAGED" | grep -qx "$doc"; then
      missing+=("$doc")
    fi
  done
  if [ ${#missing[@]} -gt 0 ]; then
    echo "$label → 누락: ${missing[*]}"
    return 1
  fi
  return 0
}

errors=()

# 1. skills/*.md → CLAUDE.md, docs/usage-guide.md, docs/workflow-guide.md
if echo "$STAGED" | grep -q '^skills/.*\.md$'; then
  msg=$(check_docs "skills/*.md" "CLAUDE.md" "docs/usage-guide.md" "docs/workflow-guide.md")
  [ $? -ne 0 ] && errors+=("$msg")
fi

# 2. agents/*.md → CLAUDE.md, docs/architecture.md
if echo "$STAGED" | grep -q '^agents/.*\.md$'; then
  msg=$(check_docs "agents/*.md" "CLAUDE.md" "docs/architecture.md")
  [ $? -ne 0 ] && errors+=("$msg")
fi

# 3. templates/*.tmpl → CLAUDE.md, docs/architecture.md
if echo "$STAGED" | grep -q '^templates/.*\.tmpl$'; then
  msg=$(check_docs "templates/*.tmpl" "CLAUDE.md" "docs/architecture.md")
  [ $? -ne 0 ] && errors+=("$msg")
fi

# 4. lib/*.mjs, bin/*.mjs → CLAUDE.md, README.md, README.en.md
if echo "$STAGED" | grep -qE '^(lib|bin)/.*\.mjs$'; then
  msg=$(check_docs "lib/*.mjs|bin/*.mjs" "CLAUDE.md" "README.md" "README.en.md")
  [ $? -ne 0 ] && errors+=("$msg")
fi

if [ ${#errors[@]} -gt 0 ]; then
  detail=""
  for e in "${errors[@]}"; do
    detail="$detail  $e\n"
  done
  reason="커밋 차단: 문서 현행화 누락.\n${detail}누락된 문서를 변경 내용에 맞게 갱신하고, git add로 staged에 추가한 뒤, 커밋을 재시도하세요."
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "$(echo -e "$reason")"
  }
}
EOF
  exit 0
fi

exit 0
