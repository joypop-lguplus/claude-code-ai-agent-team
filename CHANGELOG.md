# Changelog

## [0.2.0] - 2026-02-19

### Added

- **`/sdd-lint` skill**: Code analysis with 4 subcommands (diagnostics, search, symbols, format)
- **`sdd-code-analyzer` agent**: Automated code analysis using native diagnostic tools and ast-grep
- **`scripts/sdd-detect-tools.sh`**: Auto-detection of project language and available lint/format tools
- **`templates/project-init/lint-config.yaml.tmpl`**: Lint/format configuration template for sdd-config.yaml
- **ast-grep support**: Optional structural code search and symbol extraction (7 languages)
- **Automated diagnostics in quality gate**: `/sdd-review` Step 2.5 with zero-error enforcement

### Changed

- **`/sdd-review`**: Added Step 2.5 for automated diagnostics via sdd-code-analyzer
- **`/sdd-build`**: Added Step 3.5 for lint/format checks before work package completion
- **`sdd-reviewer` agent**: Added Step 4 (Diagnostics Check) to verification process
- **`sdd-implementer` agent**: Added pre-completion lint/format guidance
- **Quality gate template**: Added Gate 2.5 for automated diagnostics criteria
- **`lib/checker.mjs`**: Added ast-grep (sg) check in new 'tools' category (5 categories)
- **`lib/doctor.mjs`**: Added integrity checks for 3 new files + sdd-detect-tools.sh script
- **`plugin.json`**: Registered sdd-lint skill and sdd-code-analyzer agent
- **`marketplace.json`**: Added new components and ast-grep optional dependency

## [0.1.0] - 2026-02-18

### Added

- **SDD 7단계 라이프사이클**: init, intake, spec, plan, build, review, integrate
- **9개 스킬**: `/sdd`, `/sdd-init`, `/sdd-intake`, `/sdd-spec`, `/sdd-plan`, `/sdd-build`, `/sdd-review`, `/sdd-integrate`, `/sdd-status`
- **4개 에이전트**: requirements-analyst, spec-writer, implementer, reviewer
- **Agent Teams 통합**: 리더-멤버 구조의 병렬 구현 및 품질 루프
- **스펙 준수 체크리스트**: 품질 게이트의 단일 진실 소스
- **다중 소스 요구사항 수집**: Confluence MCP, Jira MCP, Figma 비전, 로컬 파일, 대화형 인터뷰
- **신규/레거시 프로젝트 지원**: greenfield/brownfield 분리 워크플로우
- **10개 템플릿**: CLAUDE.md (리더/멤버), 스펙 문서, 체크리스트, 프로젝트 설정
- **SessionStart 훅**: SDD 프로젝트 자동 감지 및 진행 상태 표시
- **CLI**: `check`, `install`, `doctor` 명령어 (npx 지원)
- **문서**: 아키텍처, 설치 가이드, 사용 가이드, SDD 방법론
