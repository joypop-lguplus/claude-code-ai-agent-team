# Usage Guide

## Quick Start

```bash
# 1. Initialize SDD for a new project
/sdd-init new

# 2. Gather requirements (interactive interview)
/sdd-intake interview

# 3. Generate technical specs
/sdd-spec

# 4. Decompose into tasks
/sdd-plan

# 5. Build with Agent Teams
/sdd-build

# 6. Quality verification
/sdd-review

# 7. Create PR
/sdd-integrate
```

Or simply use `/sdd` to auto-detect the current phase and continue.

## Phase Details

### 1. Initialize (`/sdd-init`)

```bash
/sdd-init new       # Greenfield project
/sdd-init legacy    # Brownfield/existing codebase
```

Creates:
- `docs/specs/sdd-config.yaml` -- Project configuration
- Updates `CLAUDE.md` with SDD leader rules

### 2. Requirements Intake (`/sdd-intake`)

Multiple sources supported:

```bash
# From Confluence (requires MCP)
/sdd-intake confluence:PAGE-123

# From Jira (requires MCP)
/sdd-intake jira:PROJ-100

# From Figma (vision analysis)
/sdd-intake figma:https://figma.com/file/...

# From local document
/sdd-intake file:docs/prd.md

# Interactive interview
/sdd-intake interview
```

You can run `/sdd-intake` multiple times to combine requirements from multiple sources.

### 3. Spec Generation (`/sdd-spec`)

Automatically generates technical specifications based on project type:

**New projects** get:
- Architecture document
- API specification
- Data model
- Component breakdown
- Spec compliance checklist

**Legacy projects** get:
- Change impact analysis
- API changes
- Data migration plan
- Component changes
- Spec compliance checklist

### 4. Task Planning (`/sdd-plan`)

Decomposes the spec into parallelizable work packages:

```
WP-1: User Module    (parallel)
WP-2: Auth Module    (parallel)
WP-3: Integration    (sequential, after WP-1 & WP-2)
```

Each work package includes:
- Task list with spec references
- Assigned checklist items
- Team member CLAUDE.md configuration

### 5. Build (`/sdd-build`)

The core of SDD. Uses Agent Teams with a quality loop:

```
Leader assigns work packages
  |
Team members implement in parallel
  |
Leader verifies checklist items
  |-- Incomplete? --> Specific feedback + rework
  |-- Complete? --> Next phase
  |-- 3 failures? --> Escalate to user
```

You can target specific work packages:

```bash
/sdd-build            # All pending work packages
/sdd-build wp-1       # Specific work package
/sdd-build wp-1 rework   # Rework with feedback
```

### 6. Review (`/sdd-review`)

Quality gate verification:

```bash
/sdd-review           # Full review (code + spec verification)
/sdd-review quick     # Checklist status only
```

Checks:
- All checklist items verified against code
- Spec compliance (code matches spec)
- Test existence for public interfaces
- Generates detailed review report

### 7. Integrate (`/sdd-integrate`)

Finalizes the development cycle:

```bash
/sdd-integrate        # Full workflow (tests + docs + PR)
/sdd-integrate pr     # PR creation only
/sdd-integrate docs   # Documentation update only
```

Creates:
- Feature branch (`sdd/<feature-name>`)
- PR with spec traceability
- Updated CHANGELOG and documentation

## Status Dashboard (`/sdd-status`)

View progress at any time:

```
SDD Status Dashboard

Project: my-project (type: new)

Phase Progress:
  [x] 1. Intake      -- Requirements gathered
  [x] 2. Spec        -- 5 spec documents generated
  [x] 3. Plan        -- 12 tasks in 4 work packages
  [ ] 4. Build       -- 8/12 checklist items (67%)
  [ ] 5. Review      -- Not started
  [ ] 6. Integrate   -- Not started

Checklist: 8/12 complete (67%)
  ARCH:  2/2  100%
  API:   3/4   75%
  DM:    2/2  100%
  TEST:  1/4   25%
```

## Checklist Categories

| Prefix | Category | Description |
|--------|----------|-------------|
| ARCH | Architecture | Module structure, dependencies |
| API | API | Endpoints, validation, error handling |
| DM | Data Model | Entities, fields, relations |
| COMP | Components | Module implementation |
| TEST | Tests | Unit and integration tests |
| SEC | Security | Auth, validation, data protection |
| PERF | Performance | Response times, optimization |
| UI | UI | User interface components |

## Code Analysis (`/sdd-lint`)

Automated code analysis with 4 subcommands:

```bash
# Run project diagnostics (errors/warnings)
/sdd-lint diagnostics

# Structural code search via ast-grep
/sdd-lint search "export async function $NAME($$$) { $$$ }"

# Extract function/class/export symbols
/sdd-lint symbols src/

# Check code formatting (dry-run)
/sdd-lint format

# Auto-format files
/sdd-lint format --fix
```

### Language Support

| Language | Diagnostics | Formatter | ast-grep |
|----------|------------|-----------|----------|
| TypeScript/JS | `tsc --noEmit` / `biome check` | `prettier` / `biome format` | Supported |
| Python | `ruff check` / `pyright` | `ruff format` / `black` | Supported |
| Go | `go vet ./...` | `gofmt` | Supported |
| Rust | `cargo check` | `rustfmt` | Supported |
| Java | `gradle build --dry-run` | `google-java-format` | Supported |
| Kotlin | `gradle build --dry-run` | `ktfmt` | Supported |
| C/C++ | `clang-tidy` | `clang-format` | Supported |

Tools are auto-detected from project files (package.json, pyproject.toml, Cargo.toml, etc.). Override in `sdd-config.yaml` under the `lint` section.

### Integration with SDD Lifecycle

- During `/sdd-build`: Run diagnostics + format before marking work packages complete
- During `/sdd-review`: Diagnostics results included in quality gate (zero errors required)
- During `/sdd-spec` (legacy): Use symbols to understand existing codebase structure

## Tips

- **Re-enter any phase**: Run any `/sdd-*` command at any time to redo or refine a phase.
- **Edit specs manually**: Spec files are plain markdown. Edit them before proceeding.
- **Multiple intake sources**: Combine requirements from Confluence + Jira + interviews.
- **Check progress often**: Use `/sdd-status` to see the overall dashboard.
