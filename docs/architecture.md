# 아키텍처

## 개요

claude-sdd는 스펙 주도 개발 (SDD) 라이프사이클을 구현하는 Claude Code 플러그인입니다. Claude Code의 Agent Teams 기능을 활용한 병렬 구현과, 리더 주도의 품질 루프를 통해 스펙 준수를 보장합니다.

## 핵심 설계 원칙

1. **체크리스트 = 마크다운**: 모든 추적은 git으로 버전 관리되는 마크다운 파일에서 이루어지며, 사람과 Claude 모두 읽을 수 있습니다.
2. **MCP 미번들**: Confluence/Jira MCP 서버를 번들하지 않습니다. 플러그인은 사용자의 기존 MCP 설정을 활용하도록 안내합니다.
3. **13개의 독립 스킬**: 각 라이프사이클 단계가 별도의 스킬이므로, 어느 지점에서든 재진입이 가능합니다.
4. **에이전트 모델 = Sonnet**: 모든 에이전트는 실제 분석 및 구현 작업에 Sonnet을 사용합니다.
5. **Figma = 비전**: 별도의 MCP 없이 스크린샷/URL을 통해 디자인을 분석합니다.

## 플러그인 구성 요소

```
claude-sdd/
├── Skills (12)        # 사용자용 슬래시 명령어
│   ├── /claude-sdd:sdd-auto      # 오케스트레이터 (단계 자동 감지)
│   ├── /claude-sdd:sdd-kickstart # 심층 인터뷰 + 풀 오토 실행
│   ├── /claude-sdd:sdd-init      # 프로젝트 초기화
│   ├── /claude-sdd:sdd-intake    # 요구사항 수집
│   ├── /claude-sdd:sdd-spec      # 스펙 생성
│   ├── /claude-sdd:sdd-plan      # 태스크 분해
│   ├── /claude-sdd:sdd-build     # Agent Teams 구현 (TDD 모드 지원)
│   ├── /claude-sdd:sdd-review    # 품질 게이트
│   ├── /claude-sdd:sdd-integrate # PR 및 문서화
│   ├── /claude-sdd:sdd-change    # 변경 관리 (영향 분석 + 델타 빌드)
│   ├── /claude-sdd:sdd-status    # 대시보드
│   └── /claude-sdd:sdd-lint      # 코드 분석 및 진단
│
├── Agents (7)         # 전문 작업용 서브에이전트
│   ├── requirements-analyst  # 소스 파싱
│   ├── spec-writer           # 스펙 생성
│   ├── implementer           # 코드 구현 (TDD 모드 지원)
│   ├── reviewer              # 품질 검증 (TDD 준수 확인)
│   ├── code-analyzer         # 코드 분석 (진단, ast-grep)
│   ├── test-writer           # TDD 테스트 작성 (스펙→실패 테스트)
│   └── change-analyst        # 변경 영향 분석 (최소 영향 원칙)
│
├── Templates (10)     # 문서 템플릿
│   ├── claude-md/     # 리더/멤버용 CLAUDE.md 템플릿
│   ├── specs/         # 스펙 문서 템플릿
│   ├── checklists/    # 품질 체크리스트 템플릿
│   └── project-init/  # 프로젝트 설정 템플릿
│
├── Hooks (1)          # 이벤트 훅
│   └── SessionStart   # SDD 프로젝트 감지
│
└── CLI (4 modules)    # npx CLI (설치용)
    ├── cli.mjs        # 진입점
    ├── checker.mjs    # 의존성 검사
    ├── installer.mjs  # 설치 마법사
    └── doctor.mjs     # 진단
```

## 데이터 흐름

```
사용자 요구사항
    |
    v
[/claude-sdd:sdd-intake] --> 01-requirements.md
    |
    v
[/claude-sdd:sdd-spec]   --> 02-architecture.md (또는 02-change-impact.md)
                     --> 03-api-spec.md (또는 03-api-changes.md)
                     --> 04-data-model.md (또는 04-data-migration.md)
                     --> 05-component-breakdown.md (또는 05-component-changes.md)
                     --> 06-spec-checklist.md
    |
    v
[/claude-sdd:sdd-plan]   --> 07-task-plan.md + wp-*-member.md
    |
    v
[/claude-sdd:sdd-build]  --> 소스 코드 + 테스트
                     --> 업데이트된 06-spec-checklist.md
    |
    v
[/claude-sdd:sdd-review] --> 08-review-report.md
    |                  (항목 실패 시 빌드 단계로 루프백)
    v
[/claude-sdd:sdd-integrate] --> Git 브랜치, PR, CHANGELOG
    |                  (변경 요청 발생 시)
    v
[/claude-sdd:sdd-change]   --> 09-change-request.md
                       --> 03-api-changes.md, 04-data-migration.md, 05-component-changes.md (델타)
                       --> 06-spec-checklist.md 부분 갱신
                       --> TDD 델타 빌드 → 리뷰 → PR
```

## Agent Teams 아키텍처

`/claude-sdd:sdd-build` 단계에서 플러그인은 Claude Code Agent Teams를 사용합니다:

```
리더 세션 (Opus)
  |
  |-- 팀 멤버 1 실행 (Sonnet) --> WP-1: User 모듈
  |-- 팀 멤버 2 실행 (Sonnet) --> WP-2: Auth 모듈
  |-- 팀 멤버 3 실행 (Sonnet) --> WP-3: Payment 모듈
  |
  |-- [전원 완료]
  |
  |-- 체크리스트 검증
  |   |-- [ ] 항목 --> 재작업 지시 (최대 3회 사이클)
  |   |-- 전부 [x] --> 다음 단계 또는 완료
  |
  |-- 순차 단계 실행
  |-- ...
```

## 코드 분석 레이어

코드 분석 레이어는 SDD 라이프사이클 전반에 걸쳐 자동화된 품질 검사를 제공합니다:

```
/claude-sdd:sdd-lint                  sdd-code-analyzer 에이전트
    |                                     |
    |-- diagnostics [path]  <--- 네이티브 도구 (tsc, ruff, cargo check, go vet, gradle, mvn, clang-tidy)
    |-- search <pattern>    <--- ast-grep 구조 검색
    |-- symbols [path]      <--- ast-grep 심볼 추출
    |-- format [path]       <--- 포매터 (prettier, ruff format, gofmt)
    |
    v
scripts/sdd-detect-tools.sh      언어 및 사용 가능한 도구 자동 감지
    |
    v
sdd-config.yaml (lint 섹션)      프로젝트별 도구 설정
```

`boostvolt/claude-code-lsps` 플러그인 설치 시 Claude Code 내장 LSP가 자동으로 활성화되어 파일 편집 후 진단, 정의 이동, 참조 찾기 등이 제공됩니다.

통합 지점:
- `/claude-sdd:sdd-build`: 워크 패키지 완료 전 린트/포맷 실행
- `/claude-sdd:sdd-review`: 품질 게이트 (2.5단계)에 네이티브 진단 포함

## TDD 모드

`--tdd` 플래그 또는 `sdd-config.yaml`의 `teams.tdd: true`로 활성화됩니다:

```
Phase A (Red):   sdd-test-writer가 스펙 기반 실패 테스트 작성
    |
Phase B (Green): sdd-implementer가 테스트 통과 코드 작성
    |            (테스트 파일 수정 금지)
    |
Phase C (Verify): 전체 테스트 실행
    |-- 실패 → Phase B 재작업 (최대 3회)
    |-- 통과 → 체크리스트 검증 → 다음 WP
```

TDD 모드에서 `sdd-test-writer`와 `sdd-implementer`는 완전히 분리됩니다. 테스트 작성자는 구현 코드를 생성하지 않고, 구현자는 테스트 파일을 수정하지 않습니다.

## 변경 관리 아키텍처

`/claude-sdd:sdd-change`는 통합 완료 후 변경 요청을 처리합니다:

```
Phase 1: 변경 요청 수집 → 09-change-request.md
Phase 2: sdd-change-analyst → 영향 분석 → 스펙 델타 (03/04/05-*-changes.md)
Phase 3: 체크리스트 부분 갱신 (최소 영향 원칙)
    |-- 영향받는 [x] → [ ] (재설정)
    |-- 영향받지 않는 [x] → 변경 안함
    |-- 신규 CHG- / CHG-REG- 항목 추가
Phase 4: 델타 태스크 계획 (CWP-1, CWP-2...)
Phase 5: TDD 델타 빌드 (변경 + 회귀 테스트)
Phase 6: 리뷰 + 회귀 검증
Phase 7: PR 생성 (변경 추적성 포함)
```

## 품질 루프

품질 루프는 핵심 품질 관리 메커니즘입니다:

1. 리더가 명시적인 스펙 참조와 함께 워크 패키지를 할당
2. 멤버가 구현, 테스트하고 체크리스트 항목을 표시
3. 리더가 각 `[x]` 표시를 실제 코드와 대조하여 검증
4. 미완료 항목에 구체적이고 실행 가능한 피드백 제공
5. 3회 재작업 사이클 후 사용자에게 에스컬레이션
6. 할당된 항목이 100% `[x]`일 때만 다음 단계로 진행

## 신규 프로젝트 vs 레거시 프로젝트 워크플로우

| 관점 | 신규 프로젝트 (Greenfield) | 레거시 프로젝트 (Brownfield) |
|------|---------------------------|------------------------------|
| 2단계 문서 | 02-architecture.md | 02-change-impact.md |
| 3단계 문서 | 03-api-spec.md | 03-api-changes.md |
| 4단계 문서 | 04-data-model.md | 04-data-migration.md |
| 5단계 문서 | 05-component-breakdown.md | 05-component-changes.md |
| 리스크 수준 | 낮음 | 높음 (하위 호환성 필요) |
| 체크리스트 | 동일 형식 | 동일 형식 |
