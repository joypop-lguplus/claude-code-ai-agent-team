#!/usr/bin/env bash
# LSP .lsp.json 자동 패치 + kotlin-lsp 프리웜 — 세션 시작 시 실행
# gopls: ~/go/bin/gopls 풀 패스 패치
# kotlin-lsp: 풀 패스 패치 + 백그라운드 프리웜 (JVM 클래스 OS 캐시 적재)

set -euo pipefail

PLUGINS_DIR="$HOME/.claude/plugins"
PATCHED=0

# ─────────────────────────────────────────────
# gopls — "command": "gopls" → 풀 패스
# ─────────────────────────────────────────────
patch_gopls() {
  local gopls_path="$HOME/go/bin/gopls"
  [ ! -x "$gopls_path" ] && return

  # gopls가 이미 표준 PATH에 있으면 패치 불필요
  local resolved
  resolved=$(command -v gopls 2>/dev/null || true)
  if [ -n "$resolved" ] && [ "$resolved" != "$gopls_path" ]; then
    return
  fi

  local lsp_dirs=(
    "$PLUGINS_DIR/cache/claude-code-lsps/gopls"
    "$PLUGINS_DIR/marketplaces/claude-code-lsps/gopls"
  )

  for dir in "${lsp_dirs[@]}"; do
    if [ -d "$dir" ]; then
      while IFS= read -r -d '' lsp_json; do
        if grep -q '"command"[[:space:]]*:[[:space:]]*"gopls"' "$lsp_json" 2>/dev/null; then
          if command -v jq >/dev/null 2>&1; then
            local tmp
            tmp=$(mktemp)
            jq --arg path "$gopls_path" '.go.command = $path' "$lsp_json" > "$tmp" && mv "$tmp" "$lsp_json"
          else
            sed -i.bak "s|\"command\"[[:space:]]*:[[:space:]]*\"gopls\"|\"command\": \"$gopls_path\"|g" "$lsp_json"
            rm -f "${lsp_json}.bak"
          fi
          PATCHED=$((PATCHED + 1))
        fi
      done < <(find "$dir" -name '.lsp.json' -print0 2>/dev/null)
    fi
  done
}

# ─────────────────────────────────────────────
# kotlin-lsp — 풀 패스 패치
# ─────────────────────────────────────────────
patch_kotlin_lsp() {
  local kotlin_lsp_path
  kotlin_lsp_path=$(command -v kotlin-lsp 2>/dev/null || true)
  [ -z "$kotlin_lsp_path" ] && return

  local lsp_dirs=(
    "$PLUGINS_DIR/cache/claude-code-lsps/kotlin-lsp"
    "$PLUGINS_DIR/marketplaces/claude-code-lsps/kotlin-lsp"
  )

  for dir in "${lsp_dirs[@]}"; do
    if [ -d "$dir" ]; then
      while IFS= read -r -d '' lsp_json; do
        # 이미 풀 패스가 설정되어 있으면 건너뜀
        if grep -q "$kotlin_lsp_path" "$lsp_json" 2>/dev/null; then
          continue
        fi
        if grep -q '"kotlin"' "$lsp_json" 2>/dev/null || grep -q 'kotlin-lsp' "$lsp_json" 2>/dev/null; then
          if command -v jq >/dev/null 2>&1; then
            local tmp
            tmp=$(mktemp)
            jq --arg cmd "$kotlin_lsp_path" '.kotlin.command = $cmd' "$lsp_json" > "$tmp" && mv "$tmp" "$lsp_json"
          else
            printf '{"kotlin":{"command":"%s","extensionToLanguage":{".kt":"kotlin",".kts":"kotlin"}}}\n' "$kotlin_lsp_path" > "$lsp_json"
          fi
          PATCHED=$((PATCHED + 1))
        fi
      done < <(find "$dir" -name '.lsp.json' -print0 2>/dev/null)
    fi
  done
}

# ─────────────────────────────────────────────
# kotlin-lsp 프리웜 — JVM 클래스를 OS 캐시에 적재
# Claude Code가 서버를 시작할 때 디스크 I/O 없이 즉시 로딩되도록
# ─────────────────────────────────────────────
prewarm_kotlin_lsp() {
  local kotlin_lsp_path
  kotlin_lsp_path=$(command -v kotlin-lsp 2>/dev/null || true)
  [ -z "$kotlin_lsp_path" ] && return

  # 이미 실행 중이면 스킵
  if pgrep -f 'kotlin-lsp' >/dev/null 2>&1; then
    return
  fi

  # 백그라운드에서 kotlin-lsp 시작 → initialize 핸드셰이크 → 종료
  # 이렇게 하면 JVM 클래스 파일이 OS 페이지 캐시에 올라감
  (
    printf 'Content-Length: 95\r\n\r\n{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"rootUri":"file:///tmp"}}' \
      | "$kotlin_lsp_path" --stdio >/dev/null 2>&1 &
    local pid=$!
    # 최대 8초 대기 후 강제 종료
    sleep 8
    kill "$pid" 2>/dev/null
    wait "$pid" 2>/dev/null
  ) &
  disown
}

# ─────────────────────────────────────────────
# 실행
# ─────────────────────────────────────────────
[ -d "$PLUGINS_DIR" ] || exit 0

patch_gopls
patch_kotlin_lsp
prewarm_kotlin_lsp

if [ "$PATCHED" -gt 0 ]; then
  echo "[LSP] ${PATCHED}개 .lsp.json 자동 패치 완료 (gopls PATH / kotlin-lsp 풀 패스)"
fi
