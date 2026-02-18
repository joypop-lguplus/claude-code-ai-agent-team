#!/usr/bin/env bash
# sdd-detect-tools.sh — Detect project language and available lint/format tools
# Usage: ./scripts/sdd-detect-tools.sh [project-root]
# Output: JSON with detected language, diagnostics, formatter, linter, ast_grep

set -euo pipefail

PROJECT_ROOT="${1:-.}"

# Resolve to absolute path
PROJECT_ROOT="$(cd "$PROJECT_ROOT" && pwd)"

# Result holders
LANGUAGE=""
DIAGNOSTICS=""
FORMATTER=""
LINTER=""
AST_GREP=false

# Check if a command exists
cmd_exists() { command -v "$1" &>/dev/null; }

# Check ast-grep availability
if cmd_exists sg; then
  AST_GREP=true
fi

# --- Detection Logic ---

detect_typescript_js() {
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    local pkg
    pkg=$(cat "$PROJECT_ROOT/package.json")

    # Check if TypeScript
    if [[ -f "$PROJECT_ROOT/tsconfig.json" ]] || echo "$pkg" | grep -q '"typescript"'; then
      LANGUAGE="typescript"
      # Diagnostics
      if echo "$pkg" | grep -q '"biome"' || echo "$pkg" | grep -q '"@biomejs/biome"'; then
        DIAGNOSTICS="biome check"
      elif cmd_exists tsc; then
        DIAGNOSTICS="tsc --noEmit"
      fi
      # Formatter
      if echo "$pkg" | grep -q '"biome"' || echo "$pkg" | grep -q '"@biomejs/biome"'; then
        FORMATTER="biome format --write"
      elif echo "$pkg" | grep -q '"prettier"'; then
        FORMATTER="prettier --write"
      fi
      # Linter
      if echo "$pkg" | grep -q '"biome"' || echo "$pkg" | grep -q '"@biomejs/biome"'; then
        LINTER="biome lint"
      elif echo "$pkg" | grep -q '"eslint"'; then
        LINTER="eslint"
      fi
    else
      LANGUAGE="javascript"
      # Diagnostics
      if echo "$pkg" | grep -q '"biome"' || echo "$pkg" | grep -q '"@biomejs/biome"'; then
        DIAGNOSTICS="biome check"
      fi
      # Formatter
      if echo "$pkg" | grep -q '"biome"' || echo "$pkg" | grep -q '"@biomejs/biome"'; then
        FORMATTER="biome format --write"
      elif echo "$pkg" | grep -q '"prettier"'; then
        FORMATTER="prettier --write"
      fi
      # Linter
      if echo "$pkg" | grep -q '"biome"' || echo "$pkg" | grep -q '"@biomejs/biome"'; then
        LINTER="biome lint"
      elif echo "$pkg" | grep -q '"eslint"'; then
        LINTER="eslint"
      fi
    fi
    return 0
  fi
  return 1
}

detect_python() {
  if [[ -f "$PROJECT_ROOT/pyproject.toml" ]] || [[ -f "$PROJECT_ROOT/setup.py" ]] || [[ -f "$PROJECT_ROOT/setup.cfg" ]]; then
    LANGUAGE="python"
    # Diagnostics
    if cmd_exists ruff; then
      DIAGNOSTICS="ruff check"
    elif cmd_exists pyright; then
      DIAGNOSTICS="pyright"
    elif cmd_exists mypy; then
      DIAGNOSTICS="mypy"
    fi
    # Formatter
    if cmd_exists ruff; then
      FORMATTER="ruff format"
    elif cmd_exists black; then
      FORMATTER="black"
    fi
    # Linter
    if cmd_exists ruff; then
      LINTER="ruff check"
    elif cmd_exists flake8; then
      LINTER="flake8"
    fi
    return 0
  fi
  return 1
}

detect_go() {
  if [[ -f "$PROJECT_ROOT/go.mod" ]]; then
    LANGUAGE="go"
    DIAGNOSTICS="go vet ./..."
    if cmd_exists gofmt; then
      FORMATTER="gofmt -w"
    fi
    if cmd_exists golangci-lint; then
      LINTER="golangci-lint run"
    elif cmd_exists staticcheck; then
      LINTER="staticcheck ./..."
    fi
    return 0
  fi
  return 1
}

detect_rust() {
  if [[ -f "$PROJECT_ROOT/Cargo.toml" ]]; then
    LANGUAGE="rust"
    DIAGNOSTICS="cargo check"
    if cmd_exists rustfmt; then
      FORMATTER="rustfmt"
    fi
    if cmd_exists cargo-clippy || cmd_exists clippy-driver; then
      LINTER="cargo clippy"
    fi
    return 0
  fi
  return 1
}

detect_java_kotlin() {
  if [[ -f "$PROJECT_ROOT/build.gradle" ]] || [[ -f "$PROJECT_ROOT/build.gradle.kts" ]]; then
    if [[ -f "$PROJECT_ROOT/build.gradle.kts" ]] || find "$PROJECT_ROOT/src" -name "*.kt" -print -quit 2>/dev/null | grep -q .; then
      LANGUAGE="kotlin"
      DIAGNOSTICS="gradle build --dry-run"
      if cmd_exists ktfmt; then
        FORMATTER="ktfmt"
      fi
    else
      LANGUAGE="java"
      DIAGNOSTICS="gradle build --dry-run"
      if cmd_exists google-java-format; then
        FORMATTER="google-java-format --replace"
      fi
    fi
    return 0
  elif [[ -f "$PROJECT_ROOT/pom.xml" ]]; then
    LANGUAGE="java"
    DIAGNOSTICS="mvn compile -q"
    if cmd_exists google-java-format; then
      FORMATTER="google-java-format --replace"
    fi
    return 0
  fi
  return 1
}

detect_cpp() {
  if [[ -f "$PROJECT_ROOT/CMakeLists.txt" ]] || [[ -f "$PROJECT_ROOT/Makefile" ]]; then
    # Check if there are C/C++ source files
    if find "$PROJECT_ROOT" -maxdepth 3 \( -name "*.cpp" -o -name "*.cc" -o -name "*.c" -o -name "*.h" \) -print -quit 2>/dev/null | grep -q .; then
      LANGUAGE="cpp"
      if cmd_exists clang-tidy; then
        DIAGNOSTICS="clang-tidy"
      fi
      if cmd_exists clang-format; then
        FORMATTER="clang-format -i"
      fi
      return 0
    fi
  fi
  return 1
}

# Run detection in priority order
detect_typescript_js || detect_python || detect_go || detect_rust || detect_java_kotlin || detect_cpp || true

# If no language detected
if [[ -z "$LANGUAGE" ]]; then
  LANGUAGE="unknown"
fi

# --- Output JSON ---
cat <<EOF
{
  "project_root": "$PROJECT_ROOT",
  "language": "$LANGUAGE",
  "diagnostics": "$DIAGNOSTICS",
  "formatter": "$FORMATTER",
  "linter": "$LINTER",
  "ast_grep": $AST_GREP
}
EOF
