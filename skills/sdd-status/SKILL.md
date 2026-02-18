# /sdd-status — SDD Status Dashboard

Display the current status of the SDD lifecycle for this project.

## Usage

```
/sdd-status
```

## Behavior

### Step 1: Check SDD Initialization

Read `docs/specs/sdd-config.yaml`. If it doesn't exist:
```
This project is not initialized for SDD.
Run /sdd-init to get started.
```

### Step 2: Detect Current Phase

Check which spec files exist to determine the current phase:

| Files Present | Phase | Status |
|--------------|-------|--------|
| No spec files | 1. Intake | Not started |
| `01-requirements.md` | 2. Spec | Requirements gathered |
| `02-*.md` through `05-*.md` | 3. Plan | Specs generated |
| `06-spec-checklist.md` | 3. Plan | Checklist ready |
| `07-task-plan.md` | 4. Build | Tasks decomposed |
| `08-review-report.md` | 5. Review | Review complete |

### Step 3: Show Checklist Progress

If `06-spec-checklist.md` exists, parse it and show:
- Total items
- Completed items (`[x]`)
- Incomplete items (`[ ]`)
- Completion percentage
- Breakdown by category (ARCH, API, DM, COMP, TEST, SEC, PERF, UI)

### Step 4: Display Dashboard

```
╔══════════════════════════════════════════════════╗
║  SDD Status Dashboard                            ║
╚══════════════════════════════════════════════════╝

Project: [name] (type: new/legacy)

Phase Progress:
  [x] 1. Intake      — Requirements gathered
  [x] 2. Spec        — 5 spec documents generated
  [x] 3. Plan        — 12 tasks in 4 work packages
  [ ] 4. Build       — 8/12 checklist items complete (67%)
  [ ] 5. Review      — Not started
  [ ] 6. Integrate   — Not started
  [ ] 7. Document    — Not started

Checklist: 8/12 complete (67%)
  ARCH:  2/2  ██████████ 100%
  API:   3/4  ███████░░░  75%
  DM:    2/2  ██████████ 100%
  TEST:  1/4  ██░░░░░░░░  25%

Next Action: /sdd-build (continue implementation)
```

## Dependencies

- `docs/specs/sdd-config.yaml` (optional — shows "not initialized" message if missing)
