---
description: 코드 분석 및 진단 — 진단, 구조 검색, 심볼 추출, 포맷팅
argument-hint: [diagnostics|search|symbols|format] [path]
---

# /sdd-lint — 코드 분석 및 진단

자동화된 코드 분석을 실행합니다: 진단, 구조 검색, 심볼 추출, 포맷팅.

## 인자

이 명령어가 다음 인자와 함께 호출되었습니다: $ARGUMENTS

서브커맨드가 지정되지 않으면 기본적으로 `diagnostics`를 실행합니다.

## 사전 조건

- 프로젝트에 고유 진단 도구가 설치되어 있어야 함 (tsc, ruff, cargo 등)
- ast-grep (`sg`)은 선택 사항이지만 `search` 및 `symbols`에 권장
- Language Server는 선택 사항이지만 `diagnostics` 및 `symbols`를 LSP 기반으로 향상

## 동작

### 0단계: 도구 감지

프로젝트 루트에서 `scripts/sdd-detect-tools.sh`를 실행하여 사용 가능한 도구를 확인합니다:

```bash
bash <plugin-root>/scripts/sdd-detect-tools.sh <project-root>
```

`sdd-config.yaml`에 `lint` 섹션이 있으면 해당 설정된 도구를 대신 사용합니다.

### 서브커맨드: `diagnostics [path]`

프로젝트의 고유 진단 도구를 실행하여 에러와 경고를 수집합니다.

**언어-도구 매핑:**

| 언어 | 주요 도구 | 대체 도구 |
|----------|-------------|----------|
| TypeScript/JS | `tsc --noEmit` | `biome check` |
| Python | `ruff check` | `pyright` / `mypy` |
| Go | `go vet ./...` | — |
| Rust | `cargo check` | — |
| Java | `gradle build --dry-run` | `mvn compile -q` |
| Kotlin | `gradle build --dry-run` | — |
| C/C++ | `clang-tidy` | — |

`[path]`가 제공되면 해당 경로로만 진단을 제한합니다.

**LSP 향상:** Language Server가 설치되어 있으면 `/sdd-lsp diagnostics`를 병행 실행하여 의미 수준 진단을 추가로 수집합니다.

### 서브커맨드: `search <pattern> [path]`

AST 기반 구조 코드 검색을 위해 ast-grep (`sg`)을 사용합니다.

**예시:**
```bash
/sdd-lint search "export async function $NAME($$$) { $$$ }"
/sdd-lint search "function $COMP($$$): JSX.Element { $$$ }"
/sdd-lint search "fetch($URL, $$$)"
```

`$NAME`, `$$$` 등은 ast-grep 메타변수입니다.
`sg`가 설치되지 않은 경우, 기본 텍스트 기반 검색을 위해 Grep으로 대체합니다.

### 서브커맨드: `symbols [path]`

코드베이스의 구조적 개요를 추출합니다: 함수, 클래스, exports, 타입.
ast-grep (`sg`) 권장. 사용할 수 없으면 grep 기반 추출로 대체합니다.

**LSP 향상:** Language Server가 설치되어 있으면 `/sdd-lsp symbols`를 병행 실행하여 더 정확한 심볼 테이블을 제공합니다.

### 서브커맨드: `format [path]`

프로젝트의 포매터를 사용하여 코드 포맷팅을 확인하고 선택적으로 수정합니다.

**기본 동작:** 확인 모드 (dry-run) — 파일을 수정하지 않고 포맷팅이 필요한 파일을 보고합니다.
사용자가 명시적으로 `--fix`를 전달하면, 쓰기 모드로 포매터를 실행하여 파일을 자동 포맷합니다.

## 에이전트

이 스킬은 복잡한 분석 작업을 `sdd-code-analyzer` 에이전트에 위임합니다.

## 의존성

- 프로젝트 언어에 맞는 고유 진단/포매터 도구
- ast-grep (`sg`) — 선택 사항, `search` 및 `symbols` 서브커맨드 향상
- Language Server — 선택 사항, `diagnostics` 및 `symbols`에 LSP 기반 의미 분석 추가
- `scripts/sdd-detect-tools.sh` — 도구 자동 감지
