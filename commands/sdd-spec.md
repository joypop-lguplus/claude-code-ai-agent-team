---
description: 기술 명세서 생성 — 요구사항을 아키텍처, API, 데이터 모델, 컴포넌트 스펙 및 체크리스트로 변환
argument-hint: [refresh]
---

# /sdd-spec — 기술 명세서 생성

요구사항을 상세한 기술 명세서와 스펙 준수 체크리스트로 변환합니다.

## 인자

이 명령어가 다음 인자와 함께 호출되었습니다: $ARGUMENTS

- `refresh` — 스펙 재생성 (기존 편집 내용은 주석으로 유지)
- (없음) — 요구사항으로부터 모든 스펙 생성

## 동작

### 사전 조건

1. `docs/specs/sdd-config.yaml`을 읽어 프로젝트 유형(new/legacy)을 확인합니다.
2. `docs/specs/01-requirements.md`를 읽어 모든 요구사항을 가져옵니다.
3. 요구사항이 존재하지 않으면 안내합니다: `먼저 /sdd-intake를 실행하여 요구사항을 수집하세요.`

### 신규 프로젝트의 경우 (`type: new`)

`sdd-spec-writer` 에이전트를 사용하여 다음을 생성합니다:

1. **`02-architecture.md`** — 시스템 아키텍처
   - 기술 스택과 선정 근거
   - 모듈 구조 및 책임
   - 모듈 의존성 다이어그램
   - 공통 관심사 (에러 처리, 로깅, 설정)

2. **`03-api-spec.md`** — API 명세서
   - HTTP 메서드가 포함된 모든 엔드포인트
   - 요청/응답 스키마 (JSON)
   - 필드별 유효성 검사 규칙
   - 모든 에러 코드 및 응답
   - 페이지네이션 및 속도 제한

3. **`04-data-model.md`** — 데이터 모델
   - 모든 필드가 포함된 엔티티 정의
   - 필드 타입, 제약 조건, 기본값
   - 관계 및 외래 키
   - 목적이 명시된 인덱스
   - Enum 정의

4. **`05-component-breakdown.md`** — 컴포넌트 분해
   - 모듈 책임
   - 공개 인터페이스 (타입 포함)
   - 의존성 (내부/외부)
   - 컴포넌트별 에러 처리

5. **`06-spec-checklist.md`** — 스펙 준수 체크리스트
   - 위 스펙에서 검증 가능한 모든 항목
   - 카테고리 분류: ARCH, API, DM, COMP, TEST, SEC, PERF, UI
   - 각 항목은 해당 스펙 섹션을 참조
   - 하단에 진행률 추적기

### 레거시 프로젝트의 경우 (`type: legacy`)

`sdd-spec-writer` 에이전트를 사용하여 다음을 생성합니다:

1. **`02-change-impact.md`** — 변경 영향 분석
2. **`03-api-changes.md`** — API 변경 사항
3. **`04-data-migration.md`** — 데이터 마이그레이션
4. **`05-component-changes.md`** — 컴포넌트 변경 사항
5. **`06-spec-checklist.md`** — 신규 프로젝트와 동일

### 스펙 검토

생성 후 요약을 표시합니다:
```
기술 명세서가 생성되었습니다:
  - 02-architecture.md (또는 02-change-impact.md)
  - 03-api-spec.md (또는 03-api-changes.md)
  - 04-data-model.md (또는 04-data-migration.md)
  - 05-component-breakdown.md (또는 05-component-changes.md)
  - 06-spec-checklist.md (M개 카테고리에 N개 항목)

진행하기 전에 스펙을 검토하고 필요한 편집을 수행하세요.
다음 단계: /sdd-plan — 태스크 분해 및 팀 멤버 배정
```

## 출력

- `docs/specs/02-*.md`부터 `docs/specs/06-*.md`

## 의존성

- `docs/specs/01-requirements.md` (`/sdd-intake`에서 생성)
- `docs/specs/sdd-config.yaml` (`/sdd-init`에서 생성)
