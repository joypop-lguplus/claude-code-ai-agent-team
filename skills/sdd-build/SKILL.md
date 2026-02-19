---
name: sdd-build
description: Agent Teams로 워크 패키지를 구현합니다. 품질 루프(최대 3회 재작업)를 통해 스펙 준수를 보장합니다. 멀티 도메인 프로젝트에서는 도메인별/통합 빌드를 지원합니다.
---

# /claude-sdd:sdd-build — Agent Teams를 통한 구현

리더 주도의 품질 루프를 갖춘 Claude Code Agent Teams를 사용하여 워크 패키지를 실행합니다.

## 사용법

```
/claude-sdd:sdd-build                 # 단일: 빌드 시작/재개 / 멀티: 도메인 선택 요청
/claude-sdd:sdd-build wp-1            # 특정 워크 패키지만 빌드
/claude-sdd:sdd-build wp-1 rework     # 특정 패키지에 피드백 기반 재작업
/claude-sdd:sdd-build --tdd           # TDD 모드로 빌드 (테스트 먼저 → 구현 → 검증)

# 멀티 도메인 옵션
/claude-sdd:sdd-build --domain=<id>              # 특정 도메인 빌드
/claude-sdd:sdd-build --domain=<id> --tdd        # 특정 도메인 TDD 빌드
/claude-sdd:sdd-build --domain=<id> DEV-WP-1     # 특정 도메인의 특정 WP 빌드
/claude-sdd:sdd-build --domain=<id> DEV-WP-1 rework  # 특정 도메인 WP 재작업
/claude-sdd:sdd-build --integration              # 크로스 도메인 통합 빌드
```

## 사전 조건

1. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`이 활성화되어야 함
2. `docs/specs/sdd-config.yaml`을 읽어 프로젝트 설정을 확인합니다.
3. **TDD 모드 감지**: `--tdd` 플래그가 있거나 `sdd-config.yaml`의 `teams.tdd: true`이면 TDD 모드를 활성화합니다.
4. **도메인 모드 감지**: `domains` 키 존재 여부로 단일/멀티 도메인 모드를 결정합니다:
   - `domains` 없음 또는 빈 배열 → **단일 도메인 모드** (기존 동작)
   - `domains` 존재 → **멀티 도메인 모드**
4. 태스크 계획 존재 확인:
   - 단일 도메인: `docs/specs/07-task-plan.md` 및 `docs/specs/06-spec-checklist.md`
   - 멀티 도메인: `docs/specs/domains/<domain-id>/07-task-plan.md` 및 `docs/specs/domains/<domain-id>/06-spec-checklist.md`

---

## 핵심 메커니즘: 품질 루프

```
팀 리더 (현재 세션, opus):
  1. 태스크 계획 읽기 (07-task-plan.md)
  2. 현재 단계의 각 워크 패키지에 대해:
     a. sdd-implementer 에이전트로 팀 멤버 생성
     b. 전달: 워크 패키지 태스크 + 스펙 참조 + 멤버 CLAUDE.md
     c. 완료 대기
  3. 체크리스트 검증:
     - 06-spec-checklist.md 읽기
     - 배정된 각 항목에 대해:
       - [x]로 표시되었는가?
       - 코드가 실제로 존재하는가?
     - [ ] 항목이 남아있으면 → 재작업 사이클
     - 모두 [x]이면 → 다음 워크 패키지 또는 완료

재작업 사이클:
  팀 리더가 미완료 항목을 식별하고 구체적인 피드백을 전달합니다:
  "항목 API-003, DM-005가 미완료입니다.
   API-003: UserController에 422 에러 핸들러가 없습니다.
   DM-005: email 필드 유효성 검사가 구현되지 않았습니다.
   이 항목들을 수정하세요."

  워크 패키지당 최대 3회 재작업 사이클.
  3회 후 → 사용자에게 에스컬레이션.
```

---

## TDD 모드 빌드 루프

`--tdd` 플래그가 있거나 `sdd-config.yaml`의 `teams.tdd: true`인 경우, 각 워크 패키지에 대해 기존 빌드 루프 대신 **Phase A/B/C 빌드 루프**를 실행합니다.

### TDD Phase A (Red): 실패 테스트 작성

1. **`sdd-test-writer` 에이전트로 팀 멤버 생성**:
   - 에이전트: `sdd-test-writer`
   - 컨텍스트: 워크 패키지 태스크, 관련 스펙 파일, 체크리스트 항목
   - 지시: "이 워크 패키지의 스펙에 기반하여 실패하는 테스트를 작성하세요."

2. **테스트 파일 확인**:
   - 테스트 파일이 생성되었는지 확인합니다.
   - `sdd-config.yaml`의 `test.command`로 테스트를 실행하여 모두 실패하는지 확인합니다 (Red 상태).
   - 테스트가 통과하면 이미 구현이 존재하는 것이므로 사용자에게 알립니다.

```
TDD Phase A — 워크 패키지 WP-1:
  테스트 작성: sdd-test-writer 실행 중...
  생성된 테스트: 3개 파일, 8개 테스트
  테스트 실행: 8/8 실패 (Red 상태 확인 ✓)
  Phase B로 진행합니다.
```

### TDD Phase B (Green): 테스트 통과 구현

1. **`sdd-implementer` 에이전트로 팀 멤버 생성**:
   - 에이전트: `sdd-implementer`
   - 컨텍스트: 워크 패키지 태스크, 관련 스펙 파일, **테스트 파일 목록**, 체크리스트 항목
   - CLAUDE.md: TDD 모드 블록이 포함된 멤버 CLAUDE.md
   - **추가 지시**: "테스트 파일을 먼저 읽고, 모든 테스트가 통과하도록 구현 코드를 작성하세요. 테스트 파일은 절대 수정하지 마세요."

2. **테스트 파일 무결성 확인**:
   - Phase B 완료 후 테스트 파일이 수정되지 않았는지 확인합니다.
   - 수정된 경우 재작업을 지시합니다: "테스트 파일이 수정되었습니다. 테스트 파일을 원래대로 복원하고 구현 코드만 수정하세요."

### TDD Phase C (Verify): 테스트 실행 검증

1. **전체 테스트 실행**: `sdd-config.yaml`의 `test.command`로 테스트를 실행합니다.
2. **결과 판정**:
   - 모든 테스트 통과 → 워크 패키지 완료, 체크리스트 검증으로 진행
   - 실패 테스트 존재 → Phase B 재작업 (실패 목록과 함께)

```
TDD Phase C — 워크 패키지 WP-1:
  테스트 실행: npm test
  결과: 8/8 통과 (Green 상태 ✓)
  체크리스트 검증으로 진행합니다.
```

### TDD 재작업 사이클

Phase C에서 실패 시 Phase B+C를 반복합니다 (최대 3회):

```
TDD 재작업 사이클 1/3:
  실패 테스트:
  - [FAIL] API-001: GET /users 페이지네이션 — Expected 20 items, got 0
  - [FAIL] DM-001: User 엔티티 email 필드 — Field not found

  sdd-implementer에게 재작업 지시를 전달 중...
  "다음 테스트가 실패합니다. 테스트를 수정하지 말고 구현 코드만 수정하세요:
   1. API-001: 페이지네이션 로직 구현 필요
   2. DM-001: User 모델에 email 필드 추가 필요"
```

3회 재작업 후에도 실패 → 기존 에스컬레이션 프로세스와 동일하게 사용자에게 보고합니다.

---

## 동작 (단일 도메인 모드)

### 1단계: 태스크 계획 읽기

`docs/specs/07-task-plan.md`를 파싱하여 다음을 식별합니다:
- 워크 패키지와 해당 태스크
- 실행 단계 (병렬 vs 순차)
- 현재 진행 상황 (완료된 WP 확인)

### 2단계: 워크 패키지 실행

현재 실행 단계의 각 워크 패키지에 대해:

1. **팀 멤버 실행** (Agent Teams 사용):
   - 에이전트: `sdd-implementer`
   - 컨텍스트: 워크 패키지 태스크, 관련 스펙 파일, 체크리스트 항목
   - CLAUDE.md: `docs/specs/wp-N-member.md`의 내용

2. **진행 상황 모니터링**:
   - 체크리스트 항목 완료 추적
   - 멤버가 보고한 문제 또는 모호한 사항 기록

### 3단계: 품질 검증 루프

팀 멤버가 완료를 보고한 후:

1. `docs/specs/06-spec-checklist.md` 읽기
2. 배정된 모든 체크리스트 항목 확인
3. 여전히 `[ ]`인 항목에 대해:
   - 누락된 사항 식별
   - 구체적인 재작업 지시 생성
   - 팀 멤버에게 재배정

```
재작업 사이클 1/3:
  미완료 항목:
  - API-003: UserController에 422 에러 핸들러 누락
  - DM-005: User 모델에 email 유효성 검사 미구현

  팀 멤버 1에게 재작업 지시를 전달 중...
```

4. 3회 실패 후:
```
에스컬레이션: 워크 패키지 WP-1이 3회 재작업 사이클 후에도 미완료 항목이 있습니다.

여전히 미완료:
- API-003: 422 에러 핸들러
  - 스펙: 03-api-spec.md#create-user
  - 예상: 잘못된 입력 시 { error: "Validation failed", fields: [...] }를 반환

검토 후 결정해 주세요:
1. 수동으로 수정
2. 스펙 조정
3. 이 항목들 건너뛰기
```

### 3.5단계: 완료 전 린트 및 포맷

워크 패키지를 완료로 표시하기 전에 코드 품질을 확인합니다:

1. **프로젝트 포매터 실행** (설정된 경우): 수정된 파일 자동 포맷
   - `/claude-sdd:sdd-lint format --fix` 또는 프로젝트에 설정된 포매터 사용
2. **프로젝트 린터 실행** (설정된 경우): 린트 에러 확인
   - `/claude-sdd:sdd-lint diagnostics` 또는 프로젝트에 설정된 진단 도구 사용
3. 체크리스트 항목을 `[x]`로 표시하기 전에 **모든 문제 수정**

```
완료 전 검사:
  1. 포맷팅: prettier --write src/ ✓
  2. 진단: tsc --noEmit ✓ (0 errors)
  3. 모든 체크리스트 항목 검증 완료 [x]
```

이 단계는 권장 사항이지만 필수는 아닙니다. `/claude-sdd:sdd-review` 품질 게이트에서 나머지 문제를 잡아냅니다.

### 4단계: 단계 전환

한 단계의 모든 워크 패키지가 완료되면:
- 다음 실행 단계로 이동
- 또는 모든 단계가 완료된 경우 완료 보고

```
빌드 단계 완료!

모든 워크 패키지: 4/4 완료
체크리스트 진행률: 28/28 항목 완료 (100%)

다음 단계: /claude-sdd:sdd-review — 품질 게이트 검증 실행
```

---

## 동작 (멀티 도메인 모드)

### 도메인 미지정 시

사용자에게 도메인 선택 목록을 표시합니다:
```
도메인을 선택하세요:
  1. device-mgmt (단말관리) [상태: 태스크 분해 완료, 0% 빌드]
  2. subscription (구독 서비스) [상태: 태스크 분해 완료, 0% 빌드]
  3. rate-plan (요금제) [상태: 빌드 중, 45% 완료]
  4. rate-benefit (요금제혜택) [상태: 태스크 분해 완료, 0% 빌드]
  5. (integration) 크로스 도메인 통합 빌드
```

### --domain=<id> (특정 도메인 빌드)

#### 의존성 검증

빌드를 시작하기 전에 도메인 의존성을 검증합니다:

1. `sdd-config.yaml`에서 이 도메인의 `dependencies`를 확인합니다.
2. 의존 도메인의 빌드 상태(체크리스트 완료율)를 확인합니다.
3. 의존 도메인이 아직 빌드되지 않은 경우 경고합니다:
   ```
   경고: subscription 도메인은 device-mgmt에 의존합니다.
   device-mgmt 빌드 상태: 30% 완료 (6/19 항목)

   의존 도메인이 완료되지 않아 통합 관련 기능이 빌드 중 실패할 수 있습니다.
   계속 진행하시겠습니까? (Y/n)
   ```

#### 도메인 빌드 실행

1. `docs/specs/domains/<id>/07-task-plan.md`를 읽어 워크 패키지를 파싱합니다.
2. `docs/specs/domains/<id>/06-spec-checklist.md`를 읽어 체크리스트를 확인합니다.

3. 각 워크 패키지에 대해 **팀 멤버를 실행**합니다:
   - 에이전트: `sdd-implementer`
   - 컨텍스트: 도메인 워크 패키지 태스크, 도메인 스펙 파일, 도메인 체크리스트 항목
   - CLAUDE.md: `docs/specs/domains/<id>/wp-<PREFIX>-WP-N-member.md`의 내용
   - **도메인 경계 규칙 추가 전달**:
     ```
     도메인 경계 규칙:
     - 이 도메인(device-mgmt)에 속하는 코드만 생성/수정하세요.
     - 다른 도메인(subscription, rate-plan 등)의 코드를 직접 수정하지 마세요.
     - 다른 도메인의 기능이 필요한 경우, 해당 도메인의 공개 인터페이스(API)를 통해 호출하세요.
     - 공유 코드(shared/, common/ 등)를 수정해야 하는 경우 리더에게 보고하세요.
     ```

4. **품질 검증 루프**: 단일 도메인과 동일 (최대 3회 재작업)
   - 도메인 체크리스트 (`domains/<id>/06-spec-checklist.md`) 기준으로 검증

5. **프로젝트 통합 체크리스트 자동 업데이트**:
   - 도메인 빌드가 완료되면, 프로젝트 수준 `docs/specs/06-spec-checklist.md`에서 해당 도메인 섹션의 항목을 자동으로 `[x]`로 업데이트합니다.

#### 도메인 빌드 완료 출력

```
도메인 빌드 완료: device-mgmt

워크 패키지: 3/3 완료
  DEV-WP-1: 단말 등록 모듈 ✓ (7/7 항목)
  DEV-WP-2: 단말 조회 모듈 ✓ (6/6 항목)
  DEV-WP-3: 단말 상태관리 ✓ (6/6 항목)

도메인 체크리스트: 19/19 항목 완료 (100%)
프로젝트 통합 체크리스트 업데이트 완료: 19/92 항목 (21%)

다음 단계:
  - /claude-sdd:sdd-build --domain=subscription — 다음 도메인 빌드
  - /claude-sdd:sdd-review --domain=device-mgmt — 이 도메인 리뷰
  - /claude-sdd:sdd-status — 전체 진행 상황 확인
```

### --domain=<id> <WP-ID> (특정 WP 빌드)

지정된 도메인의 특정 워크 패키지만 빌드합니다. 동작은 단일 도메인의 특정 WP 빌드와 동일하되, 도메인 스코프를 적용합니다.

### --domain=<id> <WP-ID> rework (재작업)

지정된 도메인의 특정 워크 패키지에 대해 재작업을 수행합니다. 이전 빌드/리뷰에서 발견된 문제에 대한 피드백을 팀 멤버에게 전달합니다.

### --integration (크로스 도메인 통합 빌드)

사전 조건:
- 모든 도메인의 빌드가 완료되어야 합니다 (또는 사용자가 명시적으로 재정의)
- `docs/specs/cross-domain/integration-points.md`가 존재해야 합니다
- `docs/specs/cross-domain/integration-checklist.md`가 존재해야 합니다

1. 도메인 빌드 상태를 확인합니다:
   ```
   도메인 빌드 상태 확인:
     device-mgmt: 19/19 (100%) ✓
     subscription: 24/24 (100%) ✓
     rate-plan: 15/15 (100%) ✓
     rate-benefit: 18/18 (100%) ✓

   모든 도메인 빌드 완료. 통합 빌드를 시작합니다.
   ```

2. `cross-domain/integration-points.md`를 읽어 통합 포인트를 파싱합니다.
3. `cross-domain/integration-checklist.md`를 읽어 통합 체크리스트를 확인합니다.

4. 통합 워크 패키지를 생성하고 팀 멤버에게 배정합니다:
   - 도메인 간 API 연동 검증
   - 공유 엔티티 정합성 확인
   - 이벤트 기반 통합 검증 (해당하는 경우)
   - 통합 테스트 작성

5. 품질 검증 루프 (최대 3회 재작업)

6. 프로젝트 통합 체크리스트의 크로스 도메인 섹션 업데이트

```
크로스 도메인 통합 빌드 완료!

통합 체크리스트: 8/8 항목 완료 (100%)
프로젝트 통합 체크리스트: 92/92 항목 완료 (100%)

다음 단계: /claude-sdd:sdd-review --all — 전체 프로젝트 리뷰
```

---

## 출력

| 모드 | 출력 |
|------|------|
| 단일 도메인 | 소스 코드, `docs/specs/06-spec-checklist.md` 업데이트 |
| 멀티 도메인 (특정 도메인) | 소스 코드, `docs/specs/domains/<id>/06-spec-checklist.md` 업데이트, `docs/specs/06-spec-checklist.md` 자동 업데이트 |
| 멀티 도메인 (통합) | 통합 코드/테스트, `docs/specs/cross-domain/integration-checklist.md` 업데이트, `docs/specs/06-spec-checklist.md` 자동 업데이트 |

## 의존성

- `docs/specs/07-task-plan.md` 또는 `docs/specs/domains/<id>/07-task-plan.md` (`/claude-sdd:sdd-plan`에서 생성)
- `docs/specs/06-spec-checklist.md` 또는 `docs/specs/domains/<id>/06-spec-checklist.md` (`/claude-sdd:sdd-spec`에서 생성)
- `docs/specs/sdd-config.yaml` (`/claude-sdd:sdd-init`에서 생성)
- Agent Teams 활성화 (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- 통합 빌드: `docs/specs/cross-domain/integration-points.md`, `docs/specs/cross-domain/integration-checklist.md`
