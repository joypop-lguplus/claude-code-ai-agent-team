# LSP 테스트 환경

8개 언어별 최소 테스트 파일입니다. Claude Code LSP 플러그인의 정상 동작을 확인할 때 사용합니다.

## 테스트 방법

Claude Code 세션에서 각 파일을 열고 LSP 도구를 실행합니다:

```
# 1. hover — 함수/클래스 위에서 타입 정보 확인
LSP hover <파일> <줄> <열>

# 2. goToDefinition — 심볼 정의 위치로 이동
LSP goToDefinition <파일> <줄> <열>

# 3. documentSymbol — 파일 내 모든 심볼 목록
LSP documentSymbol <파일> 1 1
```

## 언어별 파일

| 디렉토리 | LSP 서버 | 플러그인 | 테스트 대상 |
|-----------|----------|----------|-------------|
| `typescript/` | vtsls | vtsls@claude-code-lsps | interface, function, type |
| `python/` | pyright | pyright@claude-code-lsps | dataclass, function, type hint |
| `go/` | gopls | gopls@claude-code-lsps | struct, function, go.mod |
| `java/` | jdtls | jdtls@claude-code-lsps | class, static method |
| `kotlin/` | kotlin-lsp | kotlin-lsp@claude-code-lsps | data class, fun |
| `lua/` | lua-language-server | lua-language-server@claude-code-lsps | local function, table |
| `terraform/` | terraform-ls | terraform-ls@claude-code-lsps | variable, resource |
| `yaml/` | yaml-language-server | yaml-language-server@claude-code-lsps | k8s 스타일 YAML |

## 알려진 이슈

- **gopls**: `~/go/bin`이 Claude Code 런타임 PATH에 없으면 "server is error". `sdd-lsp-patch.sh` 세션 훅이 .lsp.json에 풀 패스를 자동 패치.
- **kotlin-lsp**: JVM+Kotlin 컴파일러 초기화 ~4초로 Claude Code 내부 타임아웃 초과. `sdd-lsp-patch.sh` 세션 훅이 JVM 프리웜(OS 페이지 캐시 적재)으로 해결.
- **startupTimeout 미지원**: claude-code-lsps README에 문서화되어 있으나 현재 Claude Code 버전에서 `startupTimeout` 필드 사용 시 플러그인 로딩이 깨짐 (사용 금지).
- **env 래퍼 미지원**: `"command": "env"` + `"args": ["JAVA_TOOL_OPTIONS=...", "kotlin-lsp"]` 패턴은 Claude Code에서 동작하지 않음.
