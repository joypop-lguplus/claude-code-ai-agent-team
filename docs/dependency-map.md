# 의존성 맵

> 파일 간 구체적 의존 관계를 구조화한 맵입니다. 수정 시 영향 범위를 빠르게 파악하는 데 사용합니다.

## 스킬별 의존 관계

### sdd-init
- 사용 에이전트: (없음)
- 사용 템플릿: `templates/project-init/sdd-config.yaml.tmpl`
- 소비 산출물: (없음)
- 생산 산출물: `sdd-config.yaml`
- 참조 스크립트: (없음)

### sdd-godmode
- 사용 에이전트: (파이프라인 내에서 각 스킬의 에이전트 사용)
- 사용 템플릿: `templates/specs/project-context.md.tmpl`, `templates/rules/*.md.tmpl`, `templates/rules/presets/*.md.tmpl`
- 소비 산출물: (없음 — 처음부터 시작)
- 생산 산출물: `00-project-context.md`, `00-project-rules.md` + `rules/*.md`, `sdd-config.yaml` (업데이트)
- 참조 스크립트: `scripts/sdd-detect-tools.sh` (레거시)

### sdd-intake
- 사용 에이전트: `sdd-requirements-analyst`
- 사용 템플릿: (없음)
- 소비 산출물: `sdd-config.yaml`, `00-project-context.md` (선택)
- 생산 산출물: `01-requirements.md`, `00-project-rules.md` + `rules/*.md` (초회, 미존재 시)
- 참조 스크립트: `scripts/sdd-detect-tools.sh` (레거시)

### sdd-spec
- 사용 에이전트: `sdd-spec-writer`
- 사용 템플릿: `architecture.md.tmpl`, `api-spec.md.tmpl`, `data-model.md.tmpl`, `component-breakdown.md.tmpl`, `domain-architecture.md.tmpl`, `project-architecture-multi.md.tmpl`
- 소비 산출물: `01-requirements.md`, `sdd-config.yaml`, `00-project-rules.md` (선택)
- 생산 산출물: `02-architecture.md`, `03-api-spec.md`, `04-data-model.md`, `05-component-breakdown.md`, `06-spec-checklist.md`, `diagrams/*.png`
- 참조 스크립트: (없음)

### sdd-plan
- 사용 에이전트: (없음)
- 사용 템플릿: (없음)
- 소비 산출물: `02-architecture.md`, `03-api-spec.md`, `04-data-model.md`, `05-component-breakdown.md`, `06-spec-checklist.md`, `sdd-config.yaml`
- 생산 산출물: `07-task-plan.md`
- 참조 스크립트: (없음)

### sdd-assign
- 사용 에이전트: (없음)
- 사용 템플릿: `templates/claude-md/sdd-leader.md.tmpl`, `templates/claude-md/sdd-member.md.tmpl`
- 소비 산출물: `07-task-plan.md`, `sdd-config.yaml`
- 생산 산출물: `wp-*-member.md`, 대상 프로젝트 `CLAUDE.md` (업데이트)
- 참조 스크립트: (없음)

### sdd-build
- 사용 에이전트: `sdd-implementer`, `sdd-test-writer` (TDD), `sdd-code-analyzer`
- 사용 템플릿: (없음)
- 소비 산출물: `07-task-plan.md`, `02~05` 스펙, `06-spec-checklist.md`, `sdd-config.yaml`, `00-project-rules.md` (선택)
- 생산 산출물: 소스 코드 + 테스트, `06-spec-checklist.md` (업데이트), `10-analysis-report.md` (레거시)
- 참조 스크립트: (없음)

### sdd-review
- 사용 에이전트: `sdd-reviewer`, `sdd-code-analyzer`
- 사용 템플릿: (없음)
- 소비 산출물: `06-spec-checklist.md`, `02~05` 스펙, 소스 코드, `00-project-rules.md` (선택), `10-analysis-report.md` (레거시)
- 생산 산출물: `08-review-report.md`
- 참조 스크립트: (없음)

### sdd-integrate
- 사용 에이전트: (없음)
- 사용 템플릿: (없음)
- 소비 산출물: `08-review-report.md`, `06-spec-checklist.md`, `sdd-config.yaml`
- 생산 산출물: Git 브랜치, PR, CHANGELOG
- 참조 스크립트: (없음)

### sdd-change
- 사용 에이전트: `sdd-change-analyst`, `sdd-implementer`, `sdd-test-writer`, `sdd-reviewer`
- 사용 템플릿: `templates/specs/change-request.md.tmpl`, `templates/specs/change-cycle-section.md.tmpl`
- 소비 산출물: `02~06` 기존 스펙 전체, `09-change-request.md`, `10-analysis-report.md` (레거시)
- 생산 산출물: `09-change-request.md`, `02~05` 문서 업데이트 (변경 사이클 섹션), `06-spec-checklist.md` (부분 갱신), `08-review-report.md` (업데이트)
- 참조 스크립트: (없음)

### sdd-publish
- 사용 에이전트: (없음)
- 사용 템플릿: `templates/confluence/*.xml.tmpl` (6개)
- 소비 산출물: `02~06` 스펙, `diagrams/*.png`, `sdd-config.yaml`
- 생산 산출물: Confluence 페이지, `sdd-config.yaml` (업데이트)
- 참조 스크립트: `scripts/sdd-confluence-upload.py`

### sdd-status
- 사용 에이전트: (없음)
- 사용 템플릿: (없음)
- 소비 산출물: `06-spec-checklist.md`, `sdd-config.yaml`, `07-task-plan.md`
- 생산 산출물: (없음 — 표시만)
- 참조 스크립트: (없음)

### sdd-lint
- 사용 에이전트: `sdd-code-analyzer`
- 사용 템플릿: (없음)
- 소비 산출물: 소스 코드, `sdd-config.yaml`
- 생산 산출물: (없음 — 보고만)
- 참조 스크립트: `scripts/sdd-detect-tools.sh`

### sdd-next
- 사용 에이전트: (없음 — 다른 스킬로 위임)
- 사용 템플릿: (없음)
- 소비 산출물: `docs/specs/` 전체 (상태 감지용)
- 생산 산출물: (없음 — 다른 스킬 호출)
- 참조 스크립트: (없음)

---

## 산출물별 역참조

### sdd-config.yaml
- 생성: `sdd-init`
- 갱신: `sdd-godmode` (Phase 2.5 규칙), `sdd-change` (Phase 7 change_cycles), `sdd-publish` (timestamps)
- 소비: 모든 스킬

### 00-project-context.md
- 생성: `sdd-godmode` (Phase 2)
- 갱신: (없음)
- 소비: `sdd-intake`, `sdd-spec` (spec_depth 판단)

### 00-project-rules.md + rules/*.md
- 생성: `sdd-godmode` (Phase 2.5), `sdd-intake` (초회, 미존재 시)
- 갱신: (사용자 직접 편집)
- 소비: `sdd-spec` (정합성 검증), `sdd-build` (품질 루프), `sdd-review` (최종 검증), `sdd-change` (영향 분석)

### 01-requirements.md
- 생성: `sdd-intake`
- 갱신: `sdd-intake` (다중 소스 누적)
- 소비: `sdd-spec`

### 02-architecture.md
- 생성: `sdd-spec` (`sdd-spec-writer`)
- 갱신: `sdd-change` (변경 사이클 섹션 추가)
- 소비: `sdd-plan`, `sdd-build`, `sdd-review`, `sdd-publish`, `sdd-change`
- 다이어그램: `02-module-dependency.png` (단일), `02-domain-boundary.png` (멀티)
- 템플릿: `architecture.md.tmpl`

### 03-api-spec.md
- 생성: `sdd-spec` (`sdd-spec-writer`)
- 갱신: `sdd-change` (변경 사이클 섹션 추가)
- 소비: `sdd-plan`, `sdd-build`, `sdd-review`, `sdd-publish`, `sdd-change`
- 템플릿: `api-spec.md.tmpl`

### 04-data-model.md
- 생성: `sdd-spec` (`sdd-spec-writer`)
- 갱신: `sdd-change` (변경 사이클 섹션 추가)
- 소비: `sdd-plan`, `sdd-build`, `sdd-review`, `sdd-publish`, `sdd-change`
- 다이어그램: `04-er-diagram.png`
- 템플릿: `data-model.md.tmpl`

### 05-component-breakdown.md
- 생성: `sdd-spec` (`sdd-spec-writer`)
- 갱신: `sdd-change` (변경 사이클 섹션 추가)
- 소비: `sdd-plan`, `sdd-build`, `sdd-review`, `sdd-publish`, `sdd-change`
- 다이어그램: `05-component-interaction.png`
- 템플릿: `component-breakdown.md.tmpl`

### 06-spec-checklist.md
- 생성: `sdd-spec`
- 갱신: `sdd-build` (품질 루프), `sdd-change` (Phase 3 부분 갱신)
- 소비: `sdd-plan`, `sdd-build`, `sdd-review`, `sdd-change`, `sdd-status`

### 07-task-plan.md
- 생성: `sdd-plan`
- 갱신: `sdd-change` (Phase 4 CWP 추가)
- 소비: `sdd-assign`, `sdd-build`, `sdd-status`

### 08-review-report.md
- 생성: `sdd-review`
- 갱신: `sdd-change` (Phase 6 변경 사이클 리뷰 추가)
- 소비: `sdd-integrate`, `sdd-change` (전제조건)

### 09-change-request.md
- 생성: `sdd-change` (Phase 1)
- 갱신: `sdd-change` (Phase 2 영향 분석 반영)
- 소비: `sdd-change` (Phase 2~7)
- 템플릿: `change-request.md.tmpl`

### 10-analysis-report.md
- 생성: `sdd-build` (레거시 분석 전용)
- 갱신: (없음)
- 소비: `sdd-change` (--from-analysis), `sdd-review` (레거시 추가 검증)

### diagrams/*.png
- 생성: `sdd-spec` (mmdc 렌더링)
- 갱신: `sdd-publish` (소스보다 오래되면 재생성)
- 소비: `sdd-publish` (Confluence 첨부)

---

## 에이전트별 의존 관계

### sdd-requirements-analyst
- 호출자: `sdd-intake`
- 소비: 외부 소스 (Confluence/Jira/Figma/File)
- 생산: `01-requirements.md` 초안

### sdd-spec-writer
- 호출자: `sdd-spec`
- 소비: `01-requirements.md`, `00-project-rules.md` (선택), `sdd-config.yaml`
- 생산: `02~05` 스펙 + `06-spec-checklist.md` + Mermaid 코드 블록
- 템플릿: `architecture.md.tmpl`, `api-spec.md.tmpl`, `data-model.md.tmpl`, `component-breakdown.md.tmpl`

### sdd-implementer
- 호출자: `sdd-build`, `sdd-change` (Phase 5)
- 소비: `07-task-plan.md`, `02~05` 스펙, `06-spec-checklist.md`, `00-project-rules.md` (선택), `10-analysis-report.md` (레거시)
- 생산: 소스 코드, 테스트, `06-spec-checklist.md` (업데이트), `10-analysis-report.md` (레거시 분석)

### sdd-test-writer
- 호출자: `sdd-build` (TDD), `sdd-change` (Phase 5 TDD)
- 소비: `02~05` 스펙, `06-spec-checklist.md`
- 생산: 테스트 코드

### sdd-reviewer
- 호출자: `sdd-review`, `sdd-change` (Phase 6)
- 소비: `06-spec-checklist.md`, `02~05` 스펙, 소스 코드, `00-project-rules.md` (선택), `10-analysis-report.md` (레거시)
- 생산: `08-review-report.md`

### sdd-change-analyst
- 호출자: `sdd-change` (Phase 2)
- 소비: `09-change-request.md`, `02~06` 기존 스펙, `10-analysis-report.md` (레거시), `00-project-rules.md` (선택)
- 생산: 영향 분석 보고서, 체크리스트 영향 항목

### sdd-code-analyzer
- 호출자: `sdd-lint`, `sdd-build` (진단), `sdd-review` (4단계 진단)
- 소비: 소스 코드, `sdd-config.yaml`
- 생산: 진단 결과 (보고만)

---

## 템플릿별 사용처

### specs/
| 템플릿 | 사용 스킬 | 에이전트 | 생산 산출물 |
|--------|----------|---------|------------|
| `architecture.md.tmpl` | `sdd-spec` | `sdd-spec-writer` | `02-architecture.md` |
| `api-spec.md.tmpl` | `sdd-spec` | `sdd-spec-writer` | `03-api-spec.md` |
| `data-model.md.tmpl` | `sdd-spec` | `sdd-spec-writer` | `04-data-model.md` |
| `component-breakdown.md.tmpl` | `sdd-spec` | `sdd-spec-writer` | `05-component-breakdown.md` |
| `domain-architecture.md.tmpl` | `sdd-spec` | `sdd-spec-writer` | 도메인 `02-architecture.md` |
| `project-architecture-multi.md.tmpl` | `sdd-spec` | `sdd-spec-writer` | 프로젝트 수준 `02-architecture.md` |
| `project-context.md.tmpl` | `sdd-godmode` | — | `00-project-context.md` |
| `change-request.md.tmpl` | `sdd-change` | — | `09-change-request.md` |
| `analysis-report.md.tmpl` | `sdd-build` | `sdd-implementer` | `10-analysis-report.md` |
| `change-cycle-section.md.tmpl` | `sdd-change` | `sdd-change-analyst` | `02~05` 변경 사이클 섹션 |

### checklists/
| 템플릿 | 사용 스킬 | 생산 산출물 |
|--------|----------|------------|
| `spec-checklist.md.tmpl` | `sdd-spec` | `06-spec-checklist.md` |
| `domain-checklist.md.tmpl` | `sdd-spec` | 도메인 `06-spec-checklist.md` |
| `project-checklist-multi.md.tmpl` | `sdd-spec` | 프로젝트 통합 `06-spec-checklist.md` |
| `quality-gate.md.tmpl` | `sdd-review` | `08-review-report.md` |

### claude-md/
| 템플릿 | 사용 스킬 | 생산 산출물 |
|--------|----------|------------|
| `sdd-leader.md.tmpl` | `sdd-assign` | 대상 프로젝트 `CLAUDE.md` |
| `sdd-member.md.tmpl` | `sdd-assign` | `wp-*-member.md` |

### rules/
| 템플릿 | 사용 스킬 | 생산 산출물 |
|--------|----------|------------|
| `rules-index.md.tmpl` | `sdd-godmode`, `sdd-intake` | `00-project-rules.md` |
| `architecture.md.tmpl` ~ `performance.md.tmpl` (8개) | `sdd-godmode`, `sdd-intake` | `rules/*.md` |
| `domain-override.md.tmpl` | `sdd-godmode` | 도메인 `00-rules-override.md` |
| `presets/*.md.tmpl` (5개) | `sdd-godmode`, `sdd-intake` | (변수 제공용) |

### confluence/
| 템플릿 | 사용 스킬 | 용도 |
|--------|----------|------|
| `page-wrapper.xml.tmpl` | `sdd-publish` | 페이지 래핑 |
| `info-panel.xml.tmpl` | `sdd-publish` | 정보 패널 |
| `status-macro.xml.tmpl` | `sdd-publish` | 상태 배지 |
| `expand-macro.xml.tmpl` | `sdd-publish` | 접기 영역 |
| `checklist-summary.xml.tmpl` | `sdd-publish` | 진행률 요약 |
| `code-block.xml.tmpl` | `sdd-publish` | 코드 블록 |

### cross-domain/
| 템플릿 | 사용 스킬 | 생산 산출물 |
|--------|----------|------------|
| `dependency-map.md.tmpl` | `sdd-spec` | `cross-domain/dependency-map.md` |
| `integration-points.md.tmpl` | `sdd-spec` | `cross-domain/integration-points.md` |
| `integration-checklist.md.tmpl` | `sdd-spec` | `cross-domain/integration-checklist.md` |
