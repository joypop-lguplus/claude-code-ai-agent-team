# /sdd-lint — Code Analysis & Diagnostics

Run automated code analysis: diagnostics, structural search, symbol extraction, and formatting.

## Usage

```
/sdd-lint diagnostics [path]       # Run project diagnostics (errors/warnings)
/sdd-lint search <pattern> [path]  # Structural code search via ast-grep
/sdd-lint symbols [path]           # Extract function/class/export symbols
/sdd-lint format [path]            # Check/fix code formatting
```

If no subcommand is given, run `diagnostics` by default.

## Prerequisites

- Project must have native diagnostic tools installed (tsc, ruff, cargo, etc.)
- ast-grep (`sg`) is optional but recommended for `search` and `symbols`

## Behavior

### Step 0: Detect Tools

Run `scripts/sdd-detect-tools.sh` against the project root to determine available tools:

```bash
bash <plugin-root>/scripts/sdd-detect-tools.sh <project-root>
```

If `sdd-config.yaml` exists with a `lint` section, use those configured tools instead.

### Subcommand: `diagnostics [path]`

Run the project's native diagnostic tool to collect errors and warnings.

**Language-tool mapping:**

| Language | Primary Tool | Fallback |
|----------|-------------|----------|
| TypeScript/JS | `tsc --noEmit` | `biome check` |
| Python | `ruff check` | `pyright` / `mypy` |
| Go | `go vet ./...` | — |
| Rust | `cargo check` | — |
| Java | `gradle build --dry-run` | `mvn compile -q` |
| Kotlin | `gradle build --dry-run` | — |
| C/C++ | `clang-tidy` | — |

**Output:**

```
Diagnostics Report — TypeScript project
Tool: tsc --noEmit

Errors (2):
  src/user/controller.ts:45:12 — TS2339: Property 'email' does not exist on type 'Request'
  src/user/model.ts:12:5 — TS2304: Cannot find name 'Schema'

Warnings (1):
  src/utils/logger.ts:8:1 — TS6133: 'debug' is declared but its value is never read

Summary: 2 errors, 1 warning
```

If `[path]` is provided, limit diagnostics to that path only.

### Subcommand: `search <pattern> [path]`

Use ast-grep (`sg`) for structural AST-based code search.

**Requires:** ast-grep (`sg`) must be installed.

**Examples:**

```bash
# Find all exported async functions
/sdd-lint search "export async function $NAME($$$) { $$$ }"

# Find React components
/sdd-lint search "function $COMP($$$): JSX.Element { $$$ }"

# Find specific function calls
/sdd-lint search "fetch($URL, $$$)"

# Find class methods
/sdd-lint search "class $NAME { $$$ async $METHOD($$$) { $$$ } $$$ }"
```

The `$NAME`, `$$$`, etc. are ast-grep metavariables:
- `$NAME` — matches a single AST node
- `$$$` — matches zero or more nodes
- `$$$$` — matches a sequence

**Output:**

```
Structural Search Results — pattern: "export async function $NAME($$$) { $$$ }"

Matches (4):
  src/user/controller.ts:28 — export async function createUser(req, res) { ... }
  src/user/controller.ts:45 — export async function getUsers(req, res) { ... }
  src/auth/middleware.ts:12 — export async function authenticate(req, res, next) { ... }
  src/health/check.ts:5 — export async function healthCheck(req, res) { ... }
```

If `sg` is not installed, fall back to Grep for basic text-based search.

### Subcommand: `symbols [path]`

Extract a structural overview of the codebase: functions, classes, exports, types.

**Requires:** ast-grep (`sg`) recommended. Falls back to grep-based extraction if unavailable.

**Output:**

```
Symbol Table — src/

| Symbol | Type | File | Line | Exported |
|--------|------|------|------|----------|
| UserController | class | src/user/controller.ts | 15 | yes |
| createUser | function | src/user/controller.ts | 28 | yes |
| getUsers | function | src/user/controller.ts | 45 | yes |
| UserSchema | const | src/user/model.ts | 5 | yes |
| validateEmail | function | src/utils/validation.ts | 12 | yes |
| hashPassword | function | src/utils/crypto.ts | 8 | no |

Total: 6 symbols (5 exported, 1 internal)
```

Use this to:
- Understand legacy codebase structure during `/sdd-spec`
- Verify expected exports exist during `/sdd-review`
- Map spec items to actual code locations

### Subcommand: `format [path]`

Check and optionally fix code formatting using the project's formatter.

**Default behavior:** Check mode (dry-run) — report files that need formatting without modifying them.

**Language-tool mapping:**

| Language | Primary Formatter | Fallback |
|----------|------------------|----------|
| TypeScript/JS | `prettier` | `biome format` |
| Python | `ruff format` | `black` |
| Go | `gofmt` | — |
| Rust | `rustfmt` | — |
| Java | `google-java-format` | — |
| Kotlin | `ktfmt` | — |
| C/C++ | `clang-format` | — |

**Check mode output:**

```
Format Check — prettier

Files needing formatting (3):
  src/user/controller.ts
  src/user/model.ts
  src/utils/helpers.ts

Run "/sdd-lint format --fix" to auto-format these files.
```

When the user explicitly passes `--fix`, run the formatter in write mode to auto-format files.

## Integration with SDD Lifecycle

### With `/sdd-build`

Before marking work package as complete, team members should:
1. Run `/sdd-lint diagnostics` — fix all errors
2. Run `/sdd-lint format --fix` — auto-format code

### With `/sdd-review`

The review process automatically includes:
1. Diagnostics check (zero errors required for PASS)
2. Format verification (warnings if files need formatting)
3. Results included in review report under "Automated Checks"

### With `/sdd-spec` (Legacy Projects)

When analyzing existing code for spec generation:
1. Run `/sdd-lint symbols` to understand code structure
2. Run `/sdd-lint diagnostics` to identify existing technical debt

## Agent

This skill delegates analysis to the `sdd-code-analyzer` agent for complex analysis tasks.

## Dependencies

- Native diagnostic/formatter tools for the project's language
- ast-grep (`sg`) — optional, enhances `search` and `symbols` subcommands
- `scripts/sdd-detect-tools.sh` — tool auto-detection
