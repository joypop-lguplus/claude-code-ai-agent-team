# /sdd-plan — Task Decomposition & Team Assignment

Decompose specs into parallelizable work packages and assign to Agent Teams members.

## Usage

```
/sdd-plan              # Generate task plan from specs
/sdd-plan rebalance    # Redistribute tasks based on current progress
```

## Behavior

### Prerequisites

1. Read `docs/specs/06-spec-checklist.md` for the full list of items.
2. Read `docs/specs/02-*.md` through `05-*.md` for spec details.
3. If specs don't exist, prompt: `Run /sdd-spec first to generate specifications.`

### Task Decomposition

Analyze the checklist and specs to create work packages:

1. **Group by module/feature**: Related checklist items should be in the same work package.
2. **Identify dependencies**: Determine which packages can run in parallel.
3. **Balance workload**: Each package should be roughly similar in size.
4. **Maximize parallelism**: Independent packages should run simultaneously.

### Work Package Format

```markdown
## Work Package WP-1: [Module Name] (Team Member 1)

**Spec Sections**: 03-api-spec.md#user-endpoints, 04-data-model.md#user
**Checklist Items**: API-001, API-002, DM-001, TEST-001

### Tasks
- [ ] TASK-001: Create User entity (spec: 04-data-model.md#user)
- [ ] TASK-002: User CRUD API (spec: 03-api-spec.md#user-endpoints)
- [ ] TASK-003: User API tests (spec: 06-spec-checklist.md#TEST-001)

### Dependencies
- None (can start immediately)
```

### Parallel Execution Plan

```markdown
## Execution Plan

### Phase 1 (Parallel)
- WP-1: User Module (Team Member 1)
- WP-2: Auth Module (Team Member 2)

### Phase 2 (Sequential, depends on Phase 1)
- WP-3: Integration Module (Team Member 1)
```

### Team Member CLAUDE.md Generation

For each work package, prepare a team member CLAUDE.md from `templates/claude-md/sdd-member.md.tmpl`:
- Replace `{{WORK_PACKAGE_ID}}` with the WP ID
- Replace `{{SPEC_SECTIONS}}` with the relevant spec file references
- Replace `{{CHECKLIST_ITEMS}}` with the assigned checklist item IDs

Store these as `docs/specs/wp-N-member.md` for use during `/sdd-build`.

### Output Summary

```
Task plan generated: docs/specs/07-task-plan.md

Work Packages: 4
  WP-1: User Module (5 tasks, 8 checklist items)
  WP-2: Auth Module (4 tasks, 6 checklist items)
  WP-3: Payment Module (6 tasks, 10 checklist items)
  WP-4: Integration (3 tasks, 4 checklist items)

Execution Plan:
  Phase 1: WP-1, WP-2, WP-3 (parallel)
  Phase 2: WP-4 (sequential)

Team member configs: docs/specs/wp-*-member.md

Next step: /sdd-build — Start implementation with Agent Teams
```

## Output

- `docs/specs/07-task-plan.md`
- `docs/specs/wp-*-member.md` (one per work package)

## Dependencies

- `docs/specs/02-*.md` through `06-*.md` (from `/sdd-spec`)
