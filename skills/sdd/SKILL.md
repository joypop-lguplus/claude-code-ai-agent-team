# /sdd — SDD Lifecycle Orchestrator

Main entry point for the Spec-Driven Development lifecycle. Routes to the appropriate phase based on current project state.

## Usage

```
/sdd                   # Auto-detect phase and continue
/sdd help              # Show all SDD commands
/sdd reset             # Reset SDD state (with confirmation)
```

## Behavior

### Auto-detect Mode (`/sdd`)

Read the project state and route to the next action:

1. **No `sdd-config.yaml`** → Run `/sdd-init`
2. **No `01-requirements.md`** → Run `/sdd-intake`
3. **No `02-*.md` through `06-*.md`** → Run `/sdd-spec`
4. **No `07-task-plan.md`** → Run `/sdd-plan`
5. **`07-task-plan.md` exists, checklist incomplete** → Run `/sdd-build`
6. **Checklist complete, no `08-review-report.md`** → Run `/sdd-review`
7. **Review passed** → Run `/sdd-integrate`
8. **All done** → Show completion summary

Display before routing:
```
SDD Lifecycle — Current State

Project: [name] (type: new/legacy)
Phase: [current phase]
Checklist: X/Y complete (Z%)

Proceeding to: /sdd-[phase]
```

### Help Mode (`/sdd help`)

Display all available SDD commands:
```
SDD — Spec-Driven Development Lifecycle

Commands:
  /sdd              Auto-detect phase and continue
  /sdd-init         Initialize SDD project
  /sdd-intake       Gather requirements
  /sdd-spec         Generate technical specifications
  /sdd-plan         Decompose tasks and assign teams
  /sdd-build        Implementation with Agent Teams
  /sdd-review       Quality gate verification
  /sdd-integrate    Integration, PR, and documentation
  /sdd-status       Status dashboard

Lifecycle:
  init → intake → spec → plan → build → review → integrate

Each phase can be re-entered independently for iteration.
```

### Reset Mode (`/sdd reset`)

Ask for confirmation, then:
1. Delete all files in `docs/specs/`
2. Remove SDD rules from `CLAUDE.md`
3. Print: `SDD state reset. Run /sdd-init to start over.`

## Dependencies

- Routes to other SDD skills based on state
