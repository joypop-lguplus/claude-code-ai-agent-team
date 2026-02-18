# Architecture

## Overview

claude-sdd is a Claude Code plugin that implements the Spec-Driven Development (SDD) lifecycle. It uses Claude Code's Agent Teams feature for parallel implementation, with a leader-driven quality loop to ensure spec compliance.

## Core Design Principles

1. **Checklist = Markdown**: All tracking is done in git-versioned markdown files, readable by both humans and Claude.
2. **No MCP Bundling**: Confluence/Jira MCP servers are not bundled. The plugin guides users to use their existing MCP configurations.
3. **9 Independent Skills**: Each lifecycle phase is a separate skill, allowing re-entry at any point.
4. **Agent Model = Sonnet**: All agents use Sonnet for real analysis and implementation work.
5. **Figma = Vision**: No separate MCP needed; designs are analyzed via screenshots/URLs.

## Plugin Components

```
claude-sdd/
├── Skills (10)        # User-facing slash commands
│   ├── /sdd           # Orchestrator (auto-detects phase)
│   ├── /sdd-init      # Project initialization
│   ├── /sdd-intake    # Requirements gathering
│   ├── /sdd-spec      # Spec generation
│   ├── /sdd-plan      # Task decomposition
│   ├── /sdd-build     # Agent Teams implementation
│   ├── /sdd-review    # Quality gate
│   ├── /sdd-integrate # PR & documentation
│   ├── /sdd-status    # Dashboard
│   └── /sdd-lint      # Code analysis & diagnostics
│
├── Agents (5)         # Subagents for specialized tasks
│   ├── requirements-analyst  # Source parsing
│   ├── spec-writer           # Spec generation
│   ├── implementer           # Code implementation
│   ├── reviewer              # Quality verification
│   └── code-analyzer         # Code analysis (diagnostics, ast-grep)
│
├── Templates (10)     # Document templates
│   ├── claude-md/     # CLAUDE.md templates for leader/member
│   ├── specs/         # Spec document templates
│   ├── checklists/    # Quality checklist templates
│   └── project-init/  # Project config template
│
├── Hooks (1)          # Event hooks
│   └── SessionStart   # SDD project detection
│
└── CLI (4 modules)    # npx CLI for setup
    ├── cli.mjs        # Entry point
    ├── checker.mjs    # Dependency checks
    ├── installer.mjs  # Setup wizard
    └── doctor.mjs     # Diagnostics
```

## Data Flow

```
User Requirements
    |
    v
[/sdd-intake] --> 01-requirements.md
    |
    v
[/sdd-spec]   --> 02-architecture.md (or 02-change-impact.md)
              --> 03-api-spec.md (or 03-api-changes.md)
              --> 04-data-model.md (or 04-data-migration.md)
              --> 05-component-breakdown.md (or 05-component-changes.md)
              --> 06-spec-checklist.md
    |
    v
[/sdd-plan]   --> 07-task-plan.md + wp-*-member.md
    |
    v
[/sdd-build]  --> Source code + tests
              --> Updated 06-spec-checklist.md
    |
    v
[/sdd-review] --> 08-review-report.md
    |           (loop back to build if items fail)
    v
[/sdd-integrate] --> Git branch, PR, CHANGELOG
```

## Agent Teams Architecture

During `/sdd-build`, the plugin uses Claude Code Agent Teams:

```
Leader Session (Opus)
  |
  |-- Launch Team Member 1 (Sonnet) --> WP-1: User Module
  |-- Launch Team Member 2 (Sonnet) --> WP-2: Auth Module
  |-- Launch Team Member 3 (Sonnet) --> WP-3: Payment Module
  |
  |-- [All complete]
  |
  |-- Verify checklist
  |   |-- [ ] items --> Rework instructions (max 3 cycles)
  |   |-- All [x] --> Next phase or done
  |
  |-- Launch sequential phases
  |-- ...
```

## Code Analysis Layer

The code analysis layer provides automated quality checks across the SDD lifecycle:

```
/sdd-lint                         sdd-code-analyzer agent
    |                                     |
    |-- diagnostics [path]  <--- Native tools (tsc, ruff, cargo check, go vet)
    |-- search <pattern>    <--- ast-grep structural search
    |-- symbols [path]      <--- ast-grep symbol extraction
    |-- format [path]       <--- Formatters (prettier, ruff format, gofmt)
    |
    v
scripts/sdd-detect-tools.sh      Auto-detects language & available tools
    |
    v
sdd-config.yaml (lint section)   Per-project tool configuration
```

Integration points:
- `/sdd-spec` (legacy): Symbol extraction for codebase understanding
- `/sdd-build`: Lint/format before marking work packages complete
- `/sdd-review`: Diagnostics check as part of quality gate (Step 2.5)

## Quality Loop

The quality loop is the core enforcement mechanism:

1. Leader assigns work package with explicit spec references
2. Member implements, tests, and marks checklist items
3. Leader verifies each `[x]` mark against actual code
4. Incomplete items get specific, actionable feedback
5. After 3 rework cycles, escalate to user
6. Only proceed when 100% of assigned items are `[x]`

## New vs Legacy Workflows

| Aspect | New (Greenfield) | Legacy (Brownfield) |
|--------|------------------|---------------------|
| Phase 2 Doc | 02-architecture.md | 02-change-impact.md |
| Phase 3 Doc | 03-api-spec.md | 03-api-changes.md |
| Phase 4 Doc | 04-data-model.md | 04-data-migration.md |
| Phase 5 Doc | 05-component-breakdown.md | 05-component-changes.md |
| Risk Level | Lower | Higher (backward compatibility) |
| Checklist | Same format | Same format |
