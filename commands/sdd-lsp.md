---
description: LSP 기반 의미 분석 — 진단, 정의 이동, 참조 찾기, 호버, 심볼, 구현, 호출 계층
argument-hint: [status|diagnostics|definition|references|hover|symbols|implementations|incoming-calls|outgoing-calls] <args>
---

# /sdd-lsp — LSP 기반 의미 분석

Language Server Protocol을 활용한 의미 수준 코드 분석을 수행합니다.

## 인자

이 명령어가 다음 인자와 함께 호출되었습니다: $ARGUMENTS

서브커맨드가 지정되지 않으면 `status`를 실행합니다.
`<line>`과 `<col>`은 1-based입니다.

## 사전 조건

- 대상 언어의 Language Server가 설치되어 있어야 합니다
- 서버가 없으면 `/sdd-lint`로 자동 폴백합니다

### 지원 언어 서버

| 언어 | 서버 명령어 | 설치 방법 |
|------|-------------|-----------|
| TypeScript/JS | `typescript-language-server` | `npm i -g typescript-language-server typescript` |
| Python | `pyright-langserver` | `npm i -g pyright` 또는 `pip install pyright` |
| Go | `gopls` | `go install golang.org/x/tools/gopls@latest` |
| Rust | `rust-analyzer` | `rustup component add rust-analyzer` |
| C/C++ | `clangd` | OS 패키지 매니저 또는 LLVM 설치 |

## 동작

### 0단계: 서버 확인

CLI 브릿지를 실행하여 서버 상태를 확인합니다:

```bash
node <plugin-root>/scripts/sdd-lsp.mjs status
```

### 서브커맨드

- `status` — 모든 지원 언어 서버의 설치 상태를 JSON으로 출력
- `diagnostics <file>` — LSP를 통해 파일의 의미적 진단 수집
- `definition <file> <line> <col>` — 심볼의 정의 위치 반환
- `references <file> <line> <col>` — 심볼의 모든 참조 위치 반환
- `hover <file> <line> <col>` — 심볼의 타입 정보와 문서 반환
- `symbols <file>` — 파일의 모든 심볼 추출
- `workspace-symbols <query>` — 워크스페이스 전체에서 심볼 검색
- `implementations <file> <line> <col>` — 인터페이스/추상 클래스 구현체 찾기
- `incoming-calls <file> <line> <col>` — 수신 호출 계층
- `outgoing-calls <file> <line> <col>` — 발신 호출 계층

모든 서브커맨드는 JSON 형식으로 결과를 출력합니다.

## 대체 전략

LSP 서버가 설치되지 않은 경우, 다음 순서로 대체합니다:

1. **`/sdd-lint diagnostics`** — 네이티브 진단 도구 (tsc, ruff 등)
2. **`/sdd-lint symbols`** — ast-grep 기반 심볼 추출
3. **`/sdd-lint search`** — ast-grep 구조 검색
4. **Grep/Glob** — 기본 텍스트 검색

## 의존성

- 대상 언어의 Language Server (선택 사항 — 없으면 `/sdd-lint`로 폴백)
- `scripts/sdd-lsp.mjs` — CLI 브릿지
- `lib/lsp/` — LSP 핵심 라이브러리 (client, servers, bridge)
