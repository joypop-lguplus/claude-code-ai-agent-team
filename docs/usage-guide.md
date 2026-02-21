# 사용 가이드

## 빠른 시작

```bash
# 1. 새 프로젝트에 SDD 초기화
/claude-sdd:sdd-init new

# 2. 요구사항 수집 (대화형 인터뷰)
/claude-sdd:sdd-intake interview

# 3. 기술 스펙 생성
/claude-sdd:sdd-spec

# 4. 태스크 분해
/claude-sdd:sdd-plan

# 5. Agent Teams로 구현
/claude-sdd:sdd-build

# 6. 품질 검증
/claude-sdd:sdd-review

# 7. PR 생성
/claude-sdd:sdd-integrate
```

또는 `/claude-sdd:sdd-auto`를 사용하여 현재 단계를 자동 감지하고 계속 진행할 수 있습니다.

## 단계별 상세 설명

### 1. 초기화 (`/claude-sdd:sdd-init`)

```bash
/claude-sdd:sdd-init new       # 신규 프로젝트
/claude-sdd:sdd-init legacy    # 레거시/기존 코드베이스
```

생성되는 파일:
- `docs/specs/sdd-config.yaml` -- 프로젝트 설정
- `CLAUDE.md`에 SDD 리더 규칙 추가

### 2. 요구사항 수집 (`/claude-sdd:sdd-intake`)

다양한 소스를 지원합니다:

```bash
# Confluence에서 가져오기 (MCP 필요)
/claude-sdd:sdd-intake confluence:PAGE-123

# Jira에서 가져오기 (MCP 필요)
/claude-sdd:sdd-intake jira:PROJ-100

# Figma에서 가져오기 (비전 분석)
/claude-sdd:sdd-intake figma:https://figma.com/file/...

# 로컬 문서에서 가져오기
/claude-sdd:sdd-intake file:docs/prd.md

# 대화형 인터뷰
/claude-sdd:sdd-intake interview
```

`/claude-sdd:sdd-intake`를 여러 번 실행하여 다양한 소스의 요구사항을 결합할 수 있습니다.

### 3. 스펙 생성 (`/claude-sdd:sdd-spec`)

프로젝트 유형에 따라 기술 스펙을 자동 생성합니다:

**신규 프로젝트** 산출물:
- 아키텍처 문서
- API 스펙
- 데이터 모델
- 컴포넌트 분해
- 스펙 준수 체크리스트

**레거시 프로젝트** 산출물:
- 변경 영향 분석
- API 변경 사항
- 데이터 마이그레이션 계획
- 컴포넌트 변경 사항
- 스펙 준수 체크리스트

### 4. 태스크 계획 (`/claude-sdd:sdd-plan`)

스펙을 병렬 실행 가능한 워크 패키지로 분해합니다:

```
WP-1: User 모듈     (병렬)
WP-2: Auth 모듈     (병렬)
WP-3: Integration   (순차, WP-1 & WP-2 이후)
```

각 워크 패키지에 포함되는 내용:
- 스펙 참조가 있는 태스크 목록
- 할당된 체크리스트 항목
- 팀 멤버 CLAUDE.md 설정

### 5. 구현 (`/claude-sdd:sdd-build`)

SDD의 핵심 단계입니다. 품질 루프가 적용된 Agent Teams를 사용합니다:

```
리더가 워크 패키지 할당
  |
팀 멤버가 병렬로 구현
  |
리더가 체크리스트 항목 검증
  |-- 미완료? --> 구체적 피드백 + 재작업
  |-- 완료? --> 다음 단계
  |-- 3회 실패? --> 사용자에게 에스컬레이션
```

특정 워크 패키지를 지정할 수 있습니다:

```bash
/claude-sdd:sdd-build            # 대기 중인 모든 워크 패키지
/claude-sdd:sdd-build wp-1       # 특정 워크 패키지
/claude-sdd:sdd-build wp-1 rework   # 피드백 기반 재작업
/claude-sdd:sdd-build --tdd      # TDD 모드 (테스트 먼저 → 구현 → 검증)
```

#### TDD 모드

`--tdd` 플래그를 추가하면 테스트 주도 개발 모드로 전환됩니다:

```
Phase A (Red):   sdd-test-writer가 스펙 기반 실패 테스트 작성
Phase B (Green): sdd-implementer가 테스트 통과 코드 작성 (테스트 수정 금지)
Phase C (Verify): 전체 테스트 실행, 통과 확인
```

`sdd-config.yaml`에서 `teams.tdd: true`로 설정하면 매번 `--tdd`를 지정하지 않아도 됩니다.

#### 레거시 빌드 모드

`sdd-config.yaml`의 `project.type: legacy`인 경우, 빌드 단계가 감사-보완 모드로 실행됩니다:

```
Phase 1 (Audit):    기존 코드가 스펙을 이미 충족하는지 감사
Phase 2 (Gap-fill): 미충족 항목만 최소 수정
Phase 3 (Verify):   기존 테스트 + 새 테스트 모두 통과 확인
```

하위 호환성 유지가 필수이며, 기존 테스트 수정/삭제가 금지됩니다.

### 6. 리뷰 (`/claude-sdd:sdd-review`)

품질 게이트 검증:

```bash
/claude-sdd:sdd-review           # 전체 리뷰 (코드 + 스펙 검증)
/claude-sdd:sdd-review quick     # 체크리스트 상태만 확인
```

검사 항목:
- 모든 체크리스트 항목을 코드와 대조 검증
- 스펙 준수 확인 (코드가 스펙과 일치하는지)
- 공개 인터페이스에 대한 테스트 존재 여부
- 상세 리뷰 리포트 생성

### 7. 통합 (`/claude-sdd:sdd-integrate`)

개발 사이클을 마무리합니다:

```bash
/claude-sdd:sdd-integrate        # 전체 워크플로우 (테스트 + 문서 + PR)
/claude-sdd:sdd-integrate pr     # PR 생성만
/claude-sdd:sdd-integrate docs   # 문서 업데이트만
```

생성되는 산출물:
- 기능 브랜치 (`sdd/<feature-name>`)
- 스펙 추적성이 포함된 PR
- 업데이트된 CHANGELOG 및 문서

## 상태 대시보드 (`/claude-sdd:sdd-status`)

언제든지 진행 상황을 확인할 수 있습니다:

```
SDD 상태 대시보드

프로젝트: my-project (유형: new)

단계별 진행 상황:
  [x] 1. Intake      -- 요구사항 수집 완료
  [x] 2. Spec        -- 스펙 문서 5개 생성
  [x] 3. Plan        -- 4개 워크 패키지에 12개 태스크
  [ ] 4. Build       -- 체크리스트 8/12 항목 (67%)
  [ ] 5. Review      -- 시작 전
  [ ] 6. Integrate   -- 시작 전

체크리스트: 8/12 완료 (67%)
  ARCH:  2/2  100%
  API:   3/4   75%
  DM:    2/2  100%
  TEST:  1/4   25%
```

## 체크리스트 카테고리

| 접두사 | 카테고리 | 설명 |
|--------|----------|------|
| ARCH | 아키텍처 | 모듈 구조, 의존성 |
| API | API | 엔드포인트, 검증, 에러 처리 |
| DM | 데이터 모델 | 엔티티, 필드, 관계 |
| COMP | 컴포넌트 | 모듈 구현 |
| TEST | 테스트 | 단위 테스트 및 통합 테스트 |
| SEC | 보안 | 인증, 검증, 데이터 보호 |
| PERF | 성능 | 응답 시간, 최적화 |
| UI | UI | 사용자 인터페이스 컴포넌트 |

## 코드 분석 (`/claude-sdd:sdd-lint`)

4개 서브커맨드를 통한 자동화된 코드 분석:

```bash
# 프로젝트 진단 실행 (에러/경고)
/claude-sdd:sdd-lint diagnostics

# ast-grep을 통한 구조 검색
/claude-sdd:sdd-lint search "export async function $NAME($$$) { $$$ }"

# 함수/클래스/export 심볼 추출
/claude-sdd:sdd-lint symbols src/

# 코드 포매팅 검사 (dry-run)
/claude-sdd:sdd-lint format

# 자동 포매팅 적용
/claude-sdd:sdd-lint format --fix
```

### 언어 지원

| 언어 | 진단 | 포매터 | ast-grep |
|------|------|--------|----------|
| TypeScript/JS | `tsc --noEmit` / `biome check` | `prettier` / `biome format` | 지원 |
| Python | `ruff check` / `pyright` | `ruff format` / `black` | 지원 |
| Go | `go vet ./...` | `gofmt` | 지원 |
| Rust | `cargo check` | `rustfmt` | 지원 |
| Java | `gradle build --dry-run` | `google-java-format` | 지원 |
| Kotlin | `gradle build --dry-run` | `ktfmt` | 지원 |
| C/C++ | `clang-tidy` | `clang-format` | 지원 |

프로젝트 파일(package.json, pyproject.toml, Cargo.toml 등)에서 도구를 자동 감지합니다. `sdd-config.yaml`의 `lint` 섹션에서 재정의할 수 있습니다.

### SDD 라이프사이클과의 통합

- `/claude-sdd:sdd-build` 단계: 워크 패키지 완료 전 진단 + 포맷 실행
- `/claude-sdd:sdd-review` 단계: 품질 게이트에 진단 결과 포함 (에러 0건 필수)
- `/claude-sdd:sdd-spec` 단계 (레거시): 심볼 추출을 통한 기존 코드베이스 구조 파악

## 변경 관리 (`/claude-sdd:sdd-change`)

통합이 완료된 프로젝트에서 변경 요청이 발생하면 사용합니다:

```bash
/claude-sdd:sdd-change            # 새 변경 요청 시작
/claude-sdd:sdd-change status     # 변경 사이클 상태 확인
/claude-sdd:sdd-change resume     # 진행 중인 변경 사이클 재개
```

7 Phase 워크플로우:
1. **변경 요청 수집**: 인터뷰를 통해 변경 내용 파악
2. **영향 분석**: `sdd-change-analyst`가 기존 스펙 대비 파급 효과 분석
3. **체크리스트 부분 갱신**: 영향받는 항목만 재설정, 나머지 보존
4. **델타 태스크 계획**: 변경 워크 패키지(CWP) 생성
5. **TDD 델타 빌드**: 변경 + 회귀 테스트 기반 구현
6. **리뷰 + 회귀 검증**: 변경 항목과 기존 기능 모두 검증
7. **PR 생성**: 변경 추적성이 포함된 PR

### 체크리스트 부분 갱신 전략

- 영향받는 `[x]` 항목 → `[ ]`로 재설정 + `(CR-NNN 재작업 필요)` 코멘트
- 영향받지 않는 `[x]` 항목 → **절대 변경 안함**
- 신규 `CHG-NNN` 항목: 변경으로 추가된 기능
- 신규 `CHG-REG-NNN` 항목: 기존 기능 보존 검증 (회귀 테스트)

## 팁

- **단계 재진입**: 언제든지 `/claude-sdd:*` 명령어를 실행하여 특정 단계를 다시 수행하거나 개선할 수 있습니다.
- **스펙 수동 편집**: 스펙 파일은 일반 마크다운입니다. 다음 단계로 진행하기 전에 편집할 수 있습니다.
- **다중 소스 요구사항 수집**: Confluence + Jira + 인터뷰의 요구사항을 결합할 수 있습니다.
- **진행 상황 자주 확인**: `/claude-sdd:sdd-status`로 전체 대시보드를 확인하세요.
