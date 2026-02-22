#!/usr/bin/env bash
#
# PreToolUse hook: git commit 시 변경-문서 매핑 검증 (하이브리드)
# - 파일 패턴 규칙 4개: hard deny (결정적 검증)
# - 의미론적 규칙 3개: additionalContext로 리마인더 주입 (Claude 자체 판단)
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

# 의미론적 규칙 리마인더 (패턴 deny 통과 후)
staged_list=$(echo "$STAGED" | tr '\n' ', ' | sed 's/,$//')
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "커밋 전 문서 현행화 자체 점검: staged 파일=[${staged_list}]. 다음 3가지 의미론적 규칙을 확인하세요: (1) 워크플로우/라이프사이클 변경이 있다면 docs/workflow-guide.md, docs/sdd-methodology.md 갱신 필요 (2) 아키텍처/구조 변경이 있다면 docs/architecture.md 갱신 필요 (3) 신규 기능/모드/용어 추가가 있다면 README.md, README.en.md, CHANGELOG.md, docs/glossary-ko.md 갱신 필요. 해당 없으면 커밋을 진행하세요."
  }
}
EOF
exit 0
