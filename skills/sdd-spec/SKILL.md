# /sdd-spec — Generate Technical Specifications

Transform requirements into detailed technical specifications and a compliance checklist.

## Usage

```
/sdd-spec              # Generate all specs from requirements
/sdd-spec refresh      # Regenerate specs (keeps existing edits as comments)
```

## Behavior

### Prerequisites

1. Read `docs/specs/sdd-config.yaml` to determine project type (new/legacy).
2. Read `docs/specs/01-requirements.md` to get all requirements.
3. If requirements don't exist, prompt: `Run /sdd-intake first to gather requirements.`

### For New Projects (`type: new`)

Use the `sdd-spec-writer` agent to generate:

1. **`02-architecture.md`** — System architecture
   - Tech stack with rationale
   - Module structure and responsibilities
   - Module dependency diagram
   - Cross-cutting concerns (error handling, logging, config)

2. **`03-api-spec.md`** — API specification
   - All endpoints with HTTP methods
   - Request/response schemas (JSON)
   - Field-level validation rules
   - All error codes and responses
   - Pagination and rate limiting

3. **`04-data-model.md`** — Data model
   - Entity definitions with all fields
   - Field types, constraints, defaults
   - Relations and foreign keys
   - Indexes with purpose
   - Enum definitions

4. **`05-component-breakdown.md`** — Component breakdown
   - Module responsibilities
   - Public interfaces (typed)
   - Dependencies (internal/external)
   - Error handling per component

5. **`06-spec-checklist.md`** — Compliance checklist
   - Every verifiable item from the specs above
   - Categorized: ARCH, API, DM, COMP, TEST, SEC, PERF, UI
   - Each item references its spec section
   - Progress tracker at the bottom

### For Legacy Projects (`type: legacy`)

Use the `sdd-spec-writer` agent to generate:

1. **`02-change-impact.md`** — Change impact analysis
   - Affected modules and files
   - Upstream/downstream dependency impact
   - Risk assessment
   - Backward compatibility plan
   - Migration and rollback strategy

2. **`03-api-changes.md`** — API changes
   - New endpoints
   - Modified endpoints (with diff from current)
   - Deprecated/deleted endpoints
   - Backward compatibility strategy

3. **`04-data-migration.md`** — Data migration
   - Schema changes
   - Migration scripts needed
   - Data transformation rules
   - Rollback plan

4. **`05-component-changes.md`** — Component changes
   - New modules
   - Modified modules (with change description)
   - Removed modules
   - Dependency graph changes

5. **`06-spec-checklist.md`** — Same as new projects

### Spec Review

After generation, display a summary:
```
Technical specifications generated:
  - 02-architecture.md (or 02-change-impact.md)
  - 03-api-spec.md (or 03-api-changes.md)
  - 04-data-model.md (or 04-data-migration.md)
  - 05-component-breakdown.md (or 05-component-changes.md)
  - 06-spec-checklist.md (N items across M categories)

Review the specs and make any edits before proceeding.
Next step: /sdd-plan — Decompose into tasks and assign to team members
```

## Output

- `docs/specs/02-*.md` through `docs/specs/06-*.md`

## Dependencies

- `docs/specs/01-requirements.md` (from `/sdd-intake`)
- `docs/specs/sdd-config.yaml` (from `/sdd-init`)
