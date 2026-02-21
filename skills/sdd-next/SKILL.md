---
name: sdd-next
description: SDD 라이프사이클을 계속 진행합니다. 현재 단계를 자동 감지하여 적절한 다음 단계로 라우팅합니다. 멀티 도메인에서는 도메인별 자동 진행을 지원합니다.
---

# /claude-sdd:sdd-next — SDD 라이프사이클 오케스트레이터

스펙 주도 개발 (SDD) 라이프사이클의 메인 진입점입니다. 현재 프로젝트 상태에 따라 적절한 단계로 라우팅합니다.

## 사용법

```
/claude-sdd:sdd-next                   # 단일: 단계 자동 감지 후 진행 / 멀티: 최적 도메인/작업 자동 선택
/claude-sdd:sdd-next help              # 모든 SDD 명령어 표시
/claude-sdd:sdd-next reset             # SDD 상태 초기화 (확인 필요)

# 멀티 도메인 옵션
/claude-sdd:sdd-next --domain=<id>     # 특정 도메인의 다음 단계 자동 실행
```

## 사전 조건

1. `docs/specs/sdd-config.yaml`을 읽어 프로젝트 설정을 확인합니다.
2. **도메인 모드 감지**: `domains` 키 존재 여부로 단일/멀티 도메인 모드를 결정합니다.

---

## 동작 (단일 도메인 모드)

### 자동 감지 모드 (`/claude-sdd:sdd-next`)

프로젝트 상태를 읽고 다음 작업으로 라우팅합니다:

1. **`sdd-config.yaml`이 없음** → `/claude-sdd:sdd-init` 실행
2. **`01-requirements.md`가 없음** → `/claude-sdd:sdd-intake` 실행
3. **`02-*.md`부터 `06-*.md`가 없음** → `/claude-sdd:sdd-spec` 실행
4. **`07-task-plan.md`가 없음** → `/claude-sdd:sdd-plan` 실행
5. **`07-task-plan.md` 존재, 체크리스트 미완료**:
   - **레거시 프로젝트 + `10-analysis-report.md` 없음** → `/claude-sdd:sdd-build` 실행 (분석 전용)
   - **레거시 프로젝트 + `10-analysis-report.md` 존재, 갭 항목 있음** → `/claude-sdd:sdd-change --from-analysis` 실행 (갭 해소)
   - **레거시 프로젝트 + `09-change-request.md` 존재 (진행 중)** → `/claude-sdd:sdd-change resume` 실행
   - **신규 프로젝트** → `/claude-sdd:sdd-build` 실행 (기존 동작)
6. **체크리스트 완료, `08-review-report.md` 없음** → `/claude-sdd:sdd-review` 실행
7. **리뷰 통과** → `/claude-sdd:sdd-integrate` 실행
8. **통합 완료, `09-change-request.md` 존재 (진행 중)** → `/claude-sdd:sdd-change resume` 실행
9. **모두 완료** → 완료 요약 표시

라우팅 전 표시 내용:
```
SDD 라이프사이클 — 현재 상태

프로젝트: [name] (유형: new/legacy)
단계: [현재 단계]
체크리스트: X/Y 완료 (Z%)

진행 대상: /claude-sdd:[phase]
```

---

## 동작 (멀티 도메인 모드)

### 인자 없음: 스마트 라우팅

모든 도메인의 상태를 분석하고, 가장 효과적인 다음 작업을 자동으로 선택합니다.

#### 1단계: 전체 도메인 상태 확인

각 도메인에 대해 `docs/specs/domains/<id>/` 디렉토리의 파일 존재를 확인합니다:

| 도메인 | 현재 단계 | 체크리스트 | 의존성 |
|--------|----------|-----------|--------|
| device-mgmt | Build | 14/19 (74%) | 없음 |
| subscription | Spec | — | device-mgmt |
| rate-plan | Complete | 15/15 (100%) | 없음 |
| rate-benefit | Plan | 0/18 (0%) | rate-plan, subscription |

#### 2단계: 병목/최적 도메인 식별

다음 우선순위로 최적 작업을 결정합니다:

1. **진행 중인 빌드 우선**: 가장 높은 진행률의 빌드를 먼저 완료
2. **의존성 해소**: 다른 도메인이 의존하는 도메인을 우선 처리
3. **병렬 가능 작업**: 독립적인 도메인은 병렬 권장
4. **크로스 도메인 통합**: 모든 도메인 빌드 완료 시 통합 빌드 권장

#### 3단계: 상태 개요 및 권장 표시

```
SDD 라이프사이클 — 멀티 도메인 상태

프로젝트: [name] (유형: new, 멀티 도메인)

도메인별 상태:
  device-mgmt:   Build    14/19 (74%)  ← 진행 중
  subscription:  Spec     —            (의존: device-mgmt)
  rate-plan:     Complete 15/15 (100%) ✓
  rate-benefit:  Plan     0/18  (0%)   (의존: rate-plan ✓, subscription ✗)

크로스 도메인: 대기 (모든 도메인 완료 후)
프로젝트 전체: 29/84 (35%)

권장 다음 작업:
  /claude-sdd:sdd-build --domain=device-mgmt
  (이유: 가장 높은 진행률, subscription이 이 도메인에 의존)

진행하시겠습니까? (Y/n)
```

사용자가 확인하면 권장 명령을 실행합니다.

### --domain=<id> (특정 도메인 자동 감지)

지정된 도메인의 파일 상태만 확인하고, 단일 도메인과 동일한 로직으로 다음 단계를 결정합니다:

1. **`domains/<id>/01-requirements.md`가 없음** → `/claude-sdd:sdd-intake --domain=<id>` 실행
2. **`domains/<id>/02-*.md`부터 `06-*.md`가 없음** → `/claude-sdd:sdd-spec --domain=<id>` 실행
3. **`domains/<id>/07-task-plan.md`가 없음** → `/claude-sdd:sdd-plan --domain=<id>` 실행
4. **`domains/<id>/07-task-plan.md` 존재, 체크리스트 미완료**:
   - **레거시 + `domains/<id>/10-analysis-report.md` 없음** → `/claude-sdd:sdd-build --domain=<id>` 실행 (분석 전용)
   - **레거시 + `domains/<id>/10-analysis-report.md` 존재, 갭 있음** → `/claude-sdd:sdd-change --domain=<id> --from-analysis` 실행
   - **레거시 + `domains/<id>/09-change-request.md` 존재 (진행 중)** → `/claude-sdd:sdd-change --domain=<id> resume` 실행
   - **신규** → `/claude-sdd:sdd-build --domain=<id>` 실행
5. **체크리스트 완료, `domains/<id>/08-review-report.md` 없음** → `/claude-sdd:sdd-review --domain=<id>` 실행
6. **리뷰 통과** → 도메인 완료 표시, 다음 도메인 권장
7. **통합 완료, `domains/<id>/09-change-request.md` 존재 (진행 중)** → `/claude-sdd:sdd-change --domain=<id> resume` 실행

```
SDD 라이프사이클 — device-mgmt 상태

도메인: device-mgmt (단말관리)
단계: Build
체크리스트: 14/19 완료 (74%)

진행 대상: /claude-sdd:sdd-build --domain=device-mgmt
```

---

## 도움말 모드 (`/claude-sdd:sdd-next help`)

사용 가능한 모든 SDD 명령어를 표시합니다:

```
SDD — 스펙 주도 개발 (SDD) 라이프사이클

기본 명령어:
  /claude-sdd:sdd-next              단계 자동 감지 후 진행
  /claude-sdd:sdd-init              SDD 프로젝트 초기화
  /claude-sdd:sdd-intake            요구사항 수집
  /claude-sdd:sdd-spec              기술 명세서 생성
  /claude-sdd:sdd-plan              태스크 분해 및 팀 배정
  /claude-sdd:sdd-build             Agent Teams를 통한 구현
  /claude-sdd:sdd-build --tdd       TDD 모드 빌드 (테스트 먼저 → 구현 → 검증)
  /claude-sdd:sdd-review            품질 게이트 검증
  /claude-sdd:sdd-integrate         통합, PR 및 문서화
  /claude-sdd:sdd-change            변경 관리 (통합 완료 후 변경 요청 처리)
  /claude-sdd:sdd-status            상태 대시보드

도메인 명령어 (멀티 도메인 프로젝트):
  /claude-sdd:sdd-next --domain=<id>        특정 도메인 자동 진행
  /claude-sdd:sdd-intake --domain=<id>      특정 도메인 요구사항 수집
  /claude-sdd:sdd-intake --all              모든 도메인 일괄 수집
  /claude-sdd:sdd-spec --shared             프로젝트 수준 아키텍처 생성
  /claude-sdd:sdd-spec --domain=<id>        특정 도메인 스펙 생성
  /claude-sdd:sdd-spec --all                모든 도메인 스펙 일괄 생성
  /claude-sdd:sdd-plan --domain=<id>        특정 도메인 태스크 분해
  /claude-sdd:sdd-plan --all                모든 도메인 일괄 분해
  /claude-sdd:sdd-build --domain=<id>       특정 도메인 빌드
  /claude-sdd:sdd-build --integration       크로스 도메인 통합 빌드
  /claude-sdd:sdd-review --domain=<id>      특정 도메인 리뷰
  /claude-sdd:sdd-review --integration      크로스 도메인 통합 리뷰
  /claude-sdd:sdd-review --all              전체 프로젝트 리뷰
  /claude-sdd:sdd-integrate --domain=<id>   특정 도메인 통합 (per-domain 전략)
  /claude-sdd:sdd-status --domain=<id>      특정 도메인 상세 상태

변경 관리:
  /claude-sdd:sdd-change            변경 요청 수집 + 영향 분석 + 델타 빌드
  /claude-sdd:sdd-change --from-analysis   분석 보고서 갭에서 CR 자동 생성 (레거시)
  /claude-sdd:sdd-change --lightweight --from-analysis  소규모 갭 빠른 처리 (레거시)
  /claude-sdd:sdd-change status     변경 사이클 상태 확인
  /claude-sdd:sdd-change resume     진행 중인 변경 사이클 재개
  /claude-sdd:sdd-change --domain=<id>  특정 도메인 변경 관리

라이프사이클:
  신규: init → intake → spec → plan → build → review → integrate [→ change]
  레거시: init → intake → spec → plan → build(분석) → change(갭 해소) → review → integrate

멀티 도메인 라이프사이클:
  init --domains
    → intake --domain=<id> (각 도메인)
    → spec --shared + spec --domain=<id> (각 도메인)
    → plan --domain=<id> (각 도메인)
    → build --domain=<id> (의존성 순서)
    → build --integration (크로스 도메인)
    → review --all
    → integrate
    [→ change --domain=<id> (변경 발생 시)]

각 단계는 반복을 위해 독립적으로 재진입할 수 있습니다.
```

---

## 초기화 모드 (`/claude-sdd:sdd-next reset`)

### 단일 도메인 모드

확인을 요청한 후:
1. `docs/specs/` 내 모든 파일 삭제
2. `CLAUDE.md`에서 SDD 규칙 제거
3. 출력: `SDD 상태가 초기화되었습니다. /claude-sdd:sdd-init을 실행하여 다시 시작하세요.`

### 멀티 도메인 모드

초기화 범위를 질문합니다:

```
초기화 범위를 선택하세요:
  1. 전체 초기화 — 모든 도메인 + 프로젝트 수준 파일 삭제
  2. 특정 도메인만 초기화 — 도메인 선택
  3. 취소
```

**전체 초기화** 선택 시: 단일 도메인 모드와 동일하게 `docs/specs/` 전체 삭제

**특정 도메인만 초기화** 선택 시:
1. 도메인 선택 목록을 표시합니다.
2. 선택된 도메인의 `docs/specs/domains/<id>/` 내 모든 파일을 삭제합니다.
3. 프로젝트 통합 체크리스트(`docs/specs/06-spec-checklist.md`)에서 해당 도메인 섹션을 제거합니다.
4. 출력:
   ```
   도메인 [domain-name]의 SDD 상태가 초기화되었습니다.
   /claude-sdd:sdd-intake --domain=<id>를 실행하여 다시 시작하세요.
   ```

---

## 의존성

- 상태에 따라 다른 SDD 스킬로 라우팅
- `docs/specs/sdd-config.yaml` (`/claude-sdd:sdd-init`에서 생성)
- 멀티 도메인: `docs/specs/domains/*/` 디렉토리 및 파일
