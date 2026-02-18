# Changelog

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
