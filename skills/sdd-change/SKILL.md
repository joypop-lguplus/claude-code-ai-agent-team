---
name: sdd-change
description: 통합 완료 후 변경 요청을 체계적으로 처리합니다. 영향 분석, 체크리스트 부분 갱신, TDD 델타 빌드, 회귀 검증을 포함하는 7 Phase 변경 관리 워크플로우입니다.
---

# /claude-sdd:sdd-change — 변경 관리

통합이 완료된 프로젝트에서 변경 요청(CR)을 체계적으로 처리합니다. 영향 분석 → 스펙 델타 → 체크리스트 부분 갱신 → TDD 델타 빌드 → 회귀 검증 → PR 생성의 7단계 프로세스를 실행합니다.

## 사용법

```
/claude-sdd:sdd-change                    # 새 변경 요청 시작
/claude-sdd:sdd-change status             # 변경 사이클 상태 확인
/claude-sdd:sdd-change resume             # 진행 중인 변경 사이클 재개

# 멀티 도메인 옵션
/claude-sdd:sdd-change --domain=<id>      # 특정 도메인 변경 관리
/claude-sdd:sdd-change --domain=<id> status   # 특정 도메인 변경 상태
/claude-sdd:sdd-change --domain=<id> resume   # 특정 도메인 변경 재개
```

## 사전 조건

1. `docs/specs/sdd-config.yaml`을 읽어 프로젝트 설정을 확인합니다.
2. **통합 완료 확인**: 프로젝트가 통합(integrate) 단계를 완료한 상태여야 합니다.
   - `08-review-report.md`가 존재하고 리뷰가 통과된 상태
   - 통합이 완료되지 않은 경우 안내:
     ```
     이 프로젝트는 아직 통합이 완료되지 않았습니다.
     먼저 /claude-sdd:sdd-integrate를 실행하세요.

     현재 상태: [현재 단계]
     체크리스트: X/Y 완료 (Z%)
     ```
3. **도메인 모드 감지**: `domains` 키 존재 여부로 단일/멀티 도메인 모드를 결정합니다.

---

## Phase 1: 변경 요청 수집

사용자와 대화하여 변경 요청 정보를 수집합니다.

### 인터뷰 질문

1. **변경 요약**: 어떤 변경이 필요한가요?
2. **변경 사유**: 왜 이 변경이 필요한가요? (비즈니스 요구, 버그, 성능 등)
3. **변경 범위**: 어떤 기능/API/데이터 모델이 영향받나요?
4. **우선순위**: 긴급/높음/보통/낮음?
5. **제약 조건**: 하위 호환성, 다운타임, 마이그레이션 관련 제약이 있나요?

### CR ID 자동 생성

기존 변경 이력을 확인하여 다음 CR ID를 자동 생성합니다:
- `sdd-config.yaml`의 `change_cycles` 배열에서 마지막 CR 번호를 확인
- 없으면 `CR-001`부터 시작

### 출력

`docs/specs/09-change-request.md`를 `templates/specs/change-request.md.tmpl` 기반으로 생성합니다.

```
Phase 1 완료: 변경 요청 수집

CR ID: CR-002
제목: 사용자 프로필 API에 프로필 이미지 필드 추가
우선순위: 보통
상태: 신규

생성된 파일: docs/specs/09-change-request.md

Phase 2로 진행합니다 — 영향 분석...
```

---

## Phase 2: 영향 분석

`sdd-change-analyst` 에이전트를 사용하여 변경 요청의 영향을 분석합니다.

### 에이전트 실행

1. **`sdd-change-analyst` 에이전트로 팀 멤버 생성**:
   - 에이전트: `sdd-change-analyst`
   - 컨텍스트: `09-change-request.md`, 기존 스펙 문서 전체 (02~05, 06-checklist)
   - 지시: "변경 요청을 분석하고 영향 범위를 식별하세요."

2. **분석 결과 수집**:
   - 직접 영향 / 간접 영향 / 회귀 위험 항목
   - 체크리스트 재설정 대상 및 신규 CHG- 항목

### 스펙 델타 문서 생성

영향 분석 결과에 따라 해당되는 델타 스펙 문서를 생성합니다:

| 영향 대상 | 생성 문서 | 템플릿 |
|-----------|----------|--------|
| API 변경 | `03-api-changes.md` | `templates/specs/api-changes.md.tmpl` |
| 데이터 모델 변경 | `04-data-migration.md` | `templates/specs/data-migration.md.tmpl` |
| 컴포넌트 변경 | `05-component-changes.md` | `templates/specs/component-changes.md.tmpl` |

### 09-change-request.md 업데이트

영향 분석 결과를 `09-change-request.md`의 "영향 분석 요약" 섹션에 반영합니다.

```
Phase 2 완료: 영향 분석

직접 영향: 3개 항목 (API 2개, DM 1개)
간접 영향: 2개 항목
회귀 위험: 1개 항목

생성된 델타 스펙:
  - docs/specs/03-api-changes.md (2개 엔드포인트 변경)
  - docs/specs/04-data-migration.md (1개 엔티티 변경)

Phase 3으로 진행합니다 — 체크리스트 부분 갱신...
```

---

## Phase 3: 체크리스트 부분 갱신

영향 분석 결과에 따라 `06-spec-checklist.md`를 부분적으로 갱신합니다.

### 갱신 전략

**핵심 원칙: 영향받지 않는 항목은 절대 변경하지 않습니다.**

1. **영향받는 `[x]` 항목 → `[ ]`로 재설정**:
   - 재설정 사유를 코멘트로 추가: `(CR-NNN 재작업 필요)`
   ```markdown
   - [ ] API-001: GET /users 페이지네이션 (CR-002 재작업 필요)
   ```

2. **영향받지 않는 `[x]` 항목 → 절대 변경 안함**:
   ```markdown
   - [x] API-002: POST /users 필드 유효성 검사  ← 그대로 유지
   ```

3. **신규 `CHG-` 항목 추가**:
   - `## 변경 사이클 CR-NNN` 섹션을 체크리스트 끝에 추가
   ```markdown
   ## 변경 사이클 CR-002

   ### 변경 항목
   - [ ] CHG-001: GET /users 응답에 profileImage 필드 추가
   - [ ] CHG-002: User 엔티티에 profileImage 컬럼 추가
   - [ ] CHG-003: 프로필 이미지 업로드 API 추가

   ### 회귀 테스트
   - [ ] CHG-REG-001: 기존 GET /users 응답 형식 보존
   - [ ] CHG-REG-002: 기존 User 엔티티 CRUD 동작 보존
   ```

### 갱신 전 백업

체크리스트 갱신 전에 원본을 보존합니다:
- `06-spec-checklist.md` → `06-spec-checklist.md.pre-CR-NNN.bak`

### 갱신 확인

```
Phase 3 완료: 체크리스트 부분 갱신

재설정: 2개 항목 ([x] → [ ])
  - API-001: GET /users 페이지네이션
  - DM-003: User 엔티티 필드 정의

보존: 10개 항목 (변경 없음)

추가: 5개 항목
  - CHG-001 ~ CHG-003: 변경 항목 3개
  - CHG-REG-001 ~ CHG-REG-002: 회귀 테스트 2개

체크리스트: 10/17 완료 (59%) — 재설정 2개 + 신규 5개

Phase 4로 진행합니다 — 델타 태스크 계획...
```

---

## Phase 4: 델타 태스크 계획

변경 항목(CHG-) 및 재설정 항목을 워크 패키지로 분해합니다.

### 변경 워크 패키지 (CWP)

기존 태스크 계획(`07-task-plan.md`)에 변경 워크 패키지를 추가합니다:

```markdown
## 변경 사이클 CR-002 — 워크 패키지

### CWP-1: API 변경 구현
- CHG-001: GET /users 응답에 profileImage 필드 추가
- API-001: GET /users 페이지네이션 재검증 (재설정)
- CHG-REG-001: 기존 GET /users 응답 형식 보존

### CWP-2: 데이터 모델 변경 구현
- CHG-002: User 엔티티에 profileImage 컬럼 추가
- DM-003: User 엔티티 필드 정의 재검증 (재설정)
- CHG-REG-002: 기존 User 엔티티 CRUD 동작 보존

### CWP-3: 프로필 이미지 API 구현
- CHG-003: 프로필 이미지 업로드 API 추가
```

```
Phase 4 완료: 델타 태스크 계획

변경 워크 패키지: 3개
  CWP-1: API 변경 구현 (3개 항목)
  CWP-2: 데이터 모델 변경 구현 (3개 항목)
  CWP-3: 프로필 이미지 API 구현 (1개 항목)

Phase 5로 진행합니다 — TDD 델타 빌드...
```

---

## Phase 5: TDD 델타 빌드

변경 워크 패키지를 **TDD 모드**로 빌드합니다. 이 단계는 `/claude-sdd:sdd-build --tdd`의 Phase A/B/C 루프를 사용합니다.

### 빌드 흐름

각 CWP에 대해:

1. **Phase A (Red)**: `sdd-test-writer`가 변경 스펙 기반으로 테스트를 작성합니다.
   - CHG- 항목: 변경된 동작을 검증하는 테스트
   - CHG-REG- 항목: 기존 기능 보존을 검증하는 회귀 테스트
   - 참조 스펙: `03-api-changes.md`, `04-data-migration.md`, `05-component-changes.md`

2. **Phase B (Green)**: `sdd-implementer`가 모든 테스트(신규 + 회귀) 통과 코드를 작성합니다.
   - 기존 테스트도 모두 통과해야 합니다.
   - 테스트 파일 수정 금지 규칙 적용.

3. **Phase C (Verify)**: 전체 테스트 스위트를 실행합니다.
   - 변경 테스트 + 기존 테스트 모두 통과해야 합니다.
   - 기존 테스트 실패 = 회귀 발생, 재작업 필요.

```
Phase 5 — TDD 델타 빌드

CWP-1: API 변경 구현
  Phase A: 3개 테스트 작성 (CHG-001: 1, CHG-REG-001: 1, API-001: 1)
  Phase B: sdd-implementer 실행 중...
  Phase C: 전체 테스트 실행
    변경 테스트: 3/3 통과 ✓
    기존 테스트: 24/24 통과 ✓ (회귀 없음)
  CWP-1 완료 ✓

CWP-2: 데이터 모델 변경 구현
  Phase A: 3개 테스트 작성
  Phase B: sdd-implementer 실행 중...
  Phase C: 전체 테스트 실행
    변경 테스트: 3/3 통과 ✓
    기존 테스트: 27/27 통과 ✓ (회귀 없음)
  CWP-2 완료 ✓

CWP-3: 프로필 이미지 API 구현
  Phase A: 2개 테스트 작성
  Phase B: sdd-implementer 실행 중...
  Phase C: 전체 테스트 실행
    변경 테스트: 2/2 통과 ✓
    기존 테스트: 30/30 통과 ✓ (회귀 없음)
  CWP-3 완료 ✓

Phase 5 완료: 3/3 CWP 완료

Phase 6으로 진행합니다 — 리뷰 + 회귀 검증...
```

---

## Phase 6: 리뷰 + 회귀 검증

`sdd-reviewer` 에이전트를 사용하여 변경 항목과 회귀 방지를 검증합니다.

### 검증 범위

1. **CHG- 항목 검증**: 변경된 기능이 스펙과 일치하는지 확인
2. **CHG-REG- 항목 검증**: 기존 기능이 보존되는지 확인
3. **재설정 항목 재검증**: `[ ]`로 재설정된 항목이 다시 `[x]`로 완료되었는지 확인
4. **전체 테스트 최종 실행**: 전체 테스트 스위트 실행

### 리뷰 리포트 업데이트

`08-review-report.md`에 변경 사이클 리뷰 섹션을 추가합니다:

```markdown
## 변경 사이클 CR-002 리뷰

### 요약
- 변경 항목: 3/3 PASS
- 회귀 테스트: 2/2 PASS
- 재설정 항목: 2/2 PASS
- 전체 테스트: 32/32 PASS

### 변경 항목 상세
- [x] CHG-001: GET /users 응답에 profileImage 필드 추가 — PASS
- [x] CHG-002: User 엔티티에 profileImage 컬럼 추가 — PASS
- [x] CHG-003: 프로필 이미지 업로드 API 추가 — PASS

### 회귀 테스트 상세
- [x] CHG-REG-001: 기존 GET /users 응답 형식 보존 — PASS
- [x] CHG-REG-002: 기존 User 엔티티 CRUD 동작 보존 — PASS
```

```
Phase 6 완료: 리뷰 + 회귀 검증

변경 항목: 3/3 PASS ✓
회귀 테스트: 2/2 PASS ✓
재설정 항목: 2/2 PASS ✓
전체 테스트: 32/32 PASS ✓

Phase 7로 진행합니다 — PR 생성...
```

---

## Phase 7: PR 생성

변경 내용을 포함한 PR을 생성합니다.

### PR 제목 형식

```
[CR-NNN] 변경 제목
```

### PR 본문

```markdown
## 변경 요청

- **CR ID**: CR-002
- **제목**: 사용자 프로필 API에 프로필 이미지 필드 추가
- **영향 범위**: API 2개, 데이터 모델 1개

## 변경 내역

### API 변경
- GET /users: 응답에 `profileImage` 필드 추가
- POST /users/profile-image: 신규 프로필 이미지 업로드 API

### 데이터 모델 변경
- User 엔티티: `profileImage` 컬럼 추가 (VARCHAR, nullable)

## 체크리스트
- [x] 영향 분석 완료
- [x] 스펙 델타 문서 생성
- [x] 체크리스트 부분 갱신
- [x] TDD 델타 빌드 완료
- [x] 리뷰 + 회귀 검증 통과
- [x] 전체 테스트 통과 (회귀 없음)

## 추적성

| 변경 항목 | 원본 요구사항 | 스펙 참조 |
|-----------|-------------|-----------|
| CHG-001 | CR-002-FC-001 | 03-api-changes.md |
| CHG-002 | CR-002-FC-001 | 04-data-migration.md |
| CHG-003 | CR-002-FC-002 | 03-api-changes.md |
```

### sdd-config.yaml 업데이트

변경 사이클 이력을 `sdd-config.yaml`의 `change_cycles`에 추가합니다:

```yaml
change_cycles:
  - id: "CR-002"
    title: "사용자 프로필 API에 프로필 이미지 필드 추가"
    status: "completed"
    date: "2025-03-15"
    affected_items: 2
    new_items: 5
```

```
Phase 7 완료: PR 생성

PR: [CR-002] 사용자 프로필 API에 프로필 이미지 필드 추가
브랜치: sdd/change-CR-002
상태: 생성 완료

변경 사이클 CR-002 완료!

체크리스트: 17/17 완료 (100%)
  기존 항목: 12/12 완료
  변경 항목: 3/3 완료
  회귀 테스트: 2/2 완료
```

---

## 서브커맨드

### `status` — 변경 사이클 상태

현재 진행 중인 변경 사이클의 상태를 표시합니다.

```
변경 사이클 상태 — CR-002

제목: 사용자 프로필 API에 프로필 이미지 필드 추가
상태: Phase 5 (TDD 델타 빌드)

Phase별 진행:
  [x] Phase 1: 변경 요청 수집
  [x] Phase 2: 영향 분석
  [x] Phase 3: 체크리스트 부분 갱신
  [x] Phase 4: 델타 태스크 계획
  [ ] Phase 5: TDD 델타 빌드 (CWP-2/3 진행 중)
  [ ] Phase 6: 리뷰 + 회귀 검증
  [ ] Phase 7: PR 생성

체크리스트: 13/17 완료 (76%)
  기존 항목: 12/12
  변경 항목: 1/3
  회귀 테스트: 0/2
```

### `resume` — 변경 사이클 재개

중단된 변경 사이클을 현재 Phase부터 재개합니다.

1. `09-change-request.md`의 상태를 확인합니다.
2. `sdd-config.yaml`의 `change_cycles`에서 진행 중인 CR을 찾습니다.
3. 마지막으로 완료된 Phase 다음부터 실행합니다.

---

## 동작 (멀티 도메인 모드)

### --domain=<id> (특정 도메인 변경 관리)

1. 도메인 스코프에서 변경 요청을 수집합니다.
2. 도메인별 스펙(`docs/specs/domains/<id>/`)을 기준으로 영향 분석합니다.
3. 도메인별 체크리스트를 부분 갱신합니다.
4. 도메인별 CWP를 생성하고 TDD 빌드합니다.
5. 프로젝트 통합 체크리스트도 자동 갱신합니다.

### 크로스 도메인 변경

변경이 여러 도메인에 영향을 미치는 경우:
1. Phase 2에서 영향받는 모든 도메인을 식별합니다.
2. 각 도메인별로 개별 델타 스펙과 체크리스트를 갱신합니다.
3. 크로스 도메인 통합 체크리스트도 갱신합니다.
4. Phase 5에서 도메인별로 순차 빌드합니다 (의존성 순서).

---

## 출력

| Phase | 생성/수정 파일 |
|-------|---------------|
| Phase 1 | `09-change-request.md` (신규) |
| Phase 2 | `03-api-changes.md`, `04-data-migration.md`, `05-component-changes.md` (해당 시), `09-change-request.md` (업데이트) |
| Phase 3 | `06-spec-checklist.md` (부분 갱신), `06-spec-checklist.md.pre-CR-NNN.bak` (백업) |
| Phase 4 | `07-task-plan.md` (CWP 추가) |
| Phase 5 | 소스 코드 + 테스트 코드, `06-spec-checklist.md` (업데이트) |
| Phase 6 | `08-review-report.md` (업데이트) |
| Phase 7 | PR 생성, `sdd-config.yaml` (change_cycles 업데이트) |

## 의존성

- `docs/specs/sdd-config.yaml` (`/claude-sdd:sdd-init`에서 생성)
- 기존 스펙 문서 (02~05, 06-checklist, 07-task-plan, 08-review-report)
- Agent Teams 활성화 (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- `sdd-change-analyst` 에이전트 (Phase 2)
- `sdd-test-writer` 에이전트 (Phase 5)
- `sdd-implementer` 에이전트 (Phase 5)
- `sdd-reviewer` 에이전트 (Phase 6)
