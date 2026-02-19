---
name: sdd-integrate
description: 테스트, 문서화, PR 생성으로 구현을 마무리합니다. 멀티 도메인 프로젝트에서는 단일 PR 또는 도메인별 PR 전략을 지원합니다.
---

# /claude-sdd:sdd-integrate — 통합, PR 및 문서화

테스트, 문서화, 풀 리퀘스트를 포함하여 구현을 마무리합니다.

## 사용법

```
/claude-sdd:sdd-integrate              # 전체 통합 워크플로우
/claude-sdd:sdd-integrate pr           # PR만 생성 (테스트/문서 건너뛰기)
/claude-sdd:sdd-integrate docs         # 문서만 업데이트

# 멀티 도메인 옵션 (per-domain 전략 시)
/claude-sdd:sdd-integrate --domain=<id>          # 특정 도메인만 통합
```

## 사전 조건

1. `docs/specs/sdd-config.yaml`을 읽어 프로젝트 설정을 확인합니다.
2. **도메인 모드 감지**: `domains` 키 존재 여부로 단일/멀티 도메인 모드를 결정합니다:
   - `domains` 없음 또는 빈 배열 → **단일 도메인 모드** (기존 동작)
   - `domains` 존재 → **멀티 도메인 모드**
3. **PR 전략 확인** (멀티 도메인 시): `sdd-config.yaml`의 `integration.pr_strategy` 값을 읽습니다:
   - `"single"` (기본값): 모든 변경사항을 하나의 PR로 생성
   - `"per-domain"`: 도메인별 개별 PR을 생성
4. 품질 게이트 확인:
   - 단일 도메인: `docs/specs/08-review-report.md`에 100% 통과 표시
   - 멀티 도메인 (single 전략): **모든 도메인**의 리뷰 통과 + 통합 리뷰 통과
   - 멀티 도메인 (per-domain 전략, --domain 지정 시): **해당 도메인**의 리뷰 통과
   - 또는 실패에도 불구하고 사용자가 명시적으로 재정의

---

## 동작 (단일 도메인 모드)

### 1단계: 최종 테스트 실행

프로젝트의 전체 테스트 스위트를 실행합니다:
```
전체 테스트 스위트 실행 중...
  단위 테스트: 45개 통과, 0개 실패
  통합 테스트: 12개 통과, 0개 실패
  전체: 57개 통과

모든 테스트 통과.
```

테스트가 실패하면 경고하고 진행 여부를 묻습니다.

### 2단계: 문서 업데이트

1. **CHANGELOG.md**: 이번 개발 사이클에 대한 항목을 추가합니다.
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD

   ### Added
   - [스펙의 기능]

   ### Changed
   - [스펙의 변경 사항]
   ```

2. **README.md**: 사용자 대면 동작이 변경된 경우 업데이트합니다.

3. **스펙 문서**: `06-spec-checklist.md`를 최종 확정으로 표시합니다.

### 3단계: 브랜치 생성 및 PR

1. 기능 브랜치를 생성합니다:
   ```
   git checkout -b sdd/<feature-name>
   ```

2. 변경 사항을 스테이징하고 커밋합니다:
   ```
   git add .
   git commit -m "feat: [requirements 기반 설명]

   SDD Spec Traceability:
   - Requirements: docs/specs/01-requirements.md
   - Architecture: docs/specs/02-*.md
   - Checklist: docs/specs/06-spec-checklist.md (28/28 complete)
   - Review: docs/specs/08-review-report.md"
   ```

3. 푸시하고 PR을 생성합니다:
   ```
   git push -u origin sdd/<feature-name>
   gh pr create --title "..." --body "..."
   ```

### PR 본문 형식

```markdown
## Summary

[요구사항의 간략한 설명]

## Spec Traceability

| Document | Status |
|----------|--------|
| Requirements | docs/specs/01-requirements.md |
| Architecture | docs/specs/02-*.md |
| API Spec | docs/specs/03-*.md |
| Data Model | docs/specs/04-*.md |
| Components | docs/specs/05-*.md |
| Checklist | 28/28 complete (100%) |
| Review | All items passed |

## Changes

[주요 변경 사항 목록]

## Test Plan

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual verification of key flows
```

### 4단계: 요약

```
통합 완료!

브랜치: sdd/<feature-name>
PR: #123 — <title>
URL: https://github.com/...

스펙 문서:
  - docs/specs/의 모든 스펙이 최종 확정됨
  - 체크리스트: 28/28 완료
  - 리뷰: 모두 통과

문서:
  - CHANGELOG.md 업데이트됨
  - README.md 업데이트됨 (해당하는 경우)
```

---

## 동작 (멀티 도메인 모드)

### PR 전략: single (기본값)

모든 도메인의 변경사항을 하나의 PR로 생성합니다.

#### 사전 조건 확인

1. 모든 도메인의 리뷰가 통과되었는지 확인합니다:
   ```
   도메인별 리뷰 상태:
     device-mgmt: 통과 (19/19, 100%) ✓
     subscription: 통과 (24/24, 100%) ✓
     rate-plan: 통과 (15/15, 100%) ✓
     rate-benefit: 통과 (18/18, 100%) ✓
     크로스 도메인: 통과 (8/8, 100%) ✓

   모든 품질 게이트 통과. 통합을 진행합니다.
   ```

2. 리뷰가 통과되지 않은 도메인이 있으면:
   ```
   다음 도메인의 리뷰가 통과되지 않았습니다:
     - rate-benefit: 94% (1개 FAIL)

   먼저 재작업 후 리뷰를 통과시키세요:
     /claude-sdd:sdd-build --domain=rate-benefit BENEFIT-WP-2 rework
     /claude-sdd:sdd-review --domain=rate-benefit

   또는 현재 상태로 강제 통합하시겠습니까? (y/N)
   ```

#### 1단계: 최종 테스트 실행

단일 도메인과 동일합니다.

#### 2단계: 문서 업데이트

CHANGELOG.md에 도메인별 섹션을 포함합니다:
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
#### 단말관리 (device-mgmt)
- 단말 등록/조회/상태관리 API
- 단말 데이터 모델

#### 구독 서비스 (subscription)
- 구독 생성/변경/해지 API
- 구독 데이터 모델

#### 요금제 (rate-plan)
- 요금제 CRUD API

#### 요금제혜택 (rate-benefit)
- 혜택 적용/조회 API
```

#### 3단계: 브랜치 생성 및 PR

```
git checkout -b sdd/<feature-name>
git add .
git commit -m "feat: [요구사항 기반 설명] (멀티 도메인)

SDD Spec Traceability:
- Domains: device-mgmt, subscription, rate-plan, rate-benefit
- Project Checklist: docs/specs/06-spec-checklist.md (92/92 complete)
- Review: docs/specs/08-review-report.md"
git push -u origin sdd/<feature-name>
gh pr create --title "..." --body "..."
```

#### PR 본문 형식 (single 전략)

```markdown
## Summary

[프로젝트 요구사항의 간략한 설명]

## Domain Status

| 도메인 | 체크리스트 | 통과율 | 리뷰 |
|--------|-----------|--------|------|
| device-mgmt | 19/19 | 100% | PASS |
| subscription | 24/24 | 100% | PASS |
| rate-plan | 15/15 | 100% | PASS |
| rate-benefit | 18/18 | 100% | PASS |
| 크로스 도메인 | 8/8 | 100% | PASS |
| **합계** | **84/84** | **100%** | **ALL PASS** |

## Spec Traceability

| Document | Path |
|----------|------|
| Requirements Index | docs/specs/01-requirements.md |
| Architecture | docs/specs/02-architecture.md |
| Project Checklist | docs/specs/06-spec-checklist.md |
| Review Report | docs/specs/08-review-report.md |
| Domain Specs | docs/specs/domains/*/02~06-*.md |
| Cross-Domain | docs/specs/cross-domain/*.md |

## Changes by Domain

### device-mgmt
[주요 변경 사항]

### subscription
[주요 변경 사항]

### rate-plan
[주요 변경 사항]

### rate-benefit
[주요 변경 사항]

## Test Plan

- [ ] Unit tests passing (all domains)
- [ ] Integration tests passing (all domains)
- [ ] Cross-domain integration tests passing
- [ ] Manual verification of key flows
```

### PR 전략: per-domain (도메인별 개별 PR)

각 도메인을 별도의 PR로 생성합니다.

#### --domain=<id> (특정 도메인 통합)

1. **사전 조건**: 해당 도메인의 리뷰가 통과되어야 합니다.
   - `docs/specs/domains/<id>/08-review-report.md` 확인

2. **도메인별 브랜치 생성**:
   ```
   git checkout -b sdd/<domain-id>/<feature-name>
   ```

3. **해당 도메인 관련 파일만 커밋**:
   - 도메인 코드 파일
   - 도메인 스펙 파일 (`docs/specs/domains/<id>/`)
   - 공유 코드 변경 (있는 경우, 주의 필요)

4. **PR 생성**:
   ```
   git push -u origin sdd/<domain-id>/<feature-name>
   gh pr create --title "[<domain-name>] ..." --body "..."
   ```

#### PR 본문 형식 (per-domain 전략)

```markdown
## Summary

[도메인 요구사항의 간략한 설명]

## Domain: <domain-name> (<domain-id>)

| 항목 | 상태 |
|------|------|
| 체크리스트 | 19/19 complete (100%) |
| 리뷰 | All items passed |
| 의존 도메인 | device-mgmt (빌드 완료) |

## Spec Traceability

| Document | Path |
|----------|------|
| Requirements | docs/specs/domains/<id>/01-requirements.md |
| Architecture | docs/specs/domains/<id>/02-architecture.md |
| API Spec | docs/specs/domains/<id>/03-api-spec.md |
| Data Model | docs/specs/domains/<id>/04-data-model.md |
| Components | docs/specs/domains/<id>/05-component-breakdown.md |
| Checklist | docs/specs/domains/<id>/06-spec-checklist.md |
| Review | docs/specs/domains/<id>/08-review-report.md |

## Changes

[주요 변경 사항]

## Test Plan

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Cross-domain compatibility verified
```

#### 인자 없이 호출 시 (per-domain 전략)

리뷰가 통과된 도메인 목록을 표시하고 선택하도록 합니다:
```
도메인별 PR 통합 — 도메인을 선택하세요:
  1. device-mgmt (단말관리) [리뷰: 통과, PR: 미생성]
  2. subscription (구독 서비스) [리뷰: 통과, PR: 미생성]
  3. rate-plan (요금제) [리뷰: 통과, PR: #124 생성됨]
  4. rate-benefit (요금제혜택) [리뷰: 미통과]
```

#### 인자 없이 호출 시 (single 전략)

단일 도메인 모드와 동일하게 전체 통합을 실행합니다 (모든 도메인 리뷰 통과 필요).

---

## 4단계: 요약

**단일 도메인**:
```
통합 완료!

브랜치: sdd/<feature-name>
PR: #123 — <title>
URL: https://github.com/...

스펙 문서:
  - docs/specs/의 모든 스펙이 최종 확정됨
  - 체크리스트: 28/28 완료
  - 리뷰: 모두 통과

문서:
  - CHANGELOG.md 업데이트됨
  - README.md 업데이트됨 (해당하는 경우)
```

**멀티 도메인 (single 전략)**:
```
통합 완료!

브랜치: sdd/<feature-name>
PR: #130 — <title>
URL: https://github.com/...

도메인별 상태:
  device-mgmt: 19/19 (100%) ✓
  subscription: 24/24 (100%) ✓
  rate-plan: 15/15 (100%) ✓
  rate-benefit: 18/18 (100%) ✓
  크로스 도메인: 8/8 (100%) ✓
  합계: 84/84 (100%)

문서:
  - CHANGELOG.md 업데이트됨 (도메인별 섹션 포함)
  - README.md 업데이트됨 (해당하는 경우)
```

**멀티 도메인 (per-domain 전략, 특정 도메인)**:
```
도메인 통합 완료: device-mgmt

브랜치: sdd/device-mgmt/<feature-name>
PR: #125 — [단말관리] <title>
URL: https://github.com/...

도메인 체크리스트: 19/19 (100%)
도메인 리뷰: 모두 통과

다음 단계:
  - /claude-sdd:sdd-integrate --domain=subscription — 다음 도메인 통합
  - /claude-sdd:sdd-status — 전체 진행 상황 확인
```

---

## 출력

- Git 브랜치 및 커밋
- `gh pr create`를 통한 풀 리퀘스트
- 업데이트된 CHANGELOG.md
- 업데이트된 README.md (필요한 경우)

## 의존성

- `docs/specs/08-review-report.md` 또는 `docs/specs/domains/<id>/08-review-report.md` (`/claude-sdd:sdd-review`에서 생성)
- `docs/specs/sdd-config.yaml` (`/claude-sdd:sdd-init`에서 생성)
- `gh` CLI (PR 생성용)
