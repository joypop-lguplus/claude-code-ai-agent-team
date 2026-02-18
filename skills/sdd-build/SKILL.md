# /sdd-build — Implementation with Agent Teams

Execute work packages using Claude Code Agent Teams with a leader-driven quality loop.

## Usage

```
/sdd-build                 # Start/resume build phase
/sdd-build wp-1            # Build specific work package only
/sdd-build wp-1 rework     # Rework specific package with feedback
```

## Prerequisites

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be enabled
- `docs/specs/07-task-plan.md` must exist (from `/sdd-plan`)
- `docs/specs/06-spec-checklist.md` must exist

## Core Mechanism: The Quality Loop

```
Leader (this session, Opus):
  1. Read task plan (07-task-plan.md)
  2. For each work package in current phase:
     a. Create team member with sdd-implementer agent
     b. Pass: work package tasks + spec references + member CLAUDE.md
     c. Wait for completion
  3. Verify checklist:
     - Read 06-spec-checklist.md
     - For each assigned item:
       - Is it marked [x]?
       - Does the code actually exist?
     - If [ ] items remain → rework cycle
     - If all [x] → next work package or done

Rework Cycle:
  Leader identifies incomplete items and sends specific feedback:
  "Items API-003, DM-005 are incomplete.
   API-003: UserController is missing 422 error handler.
   DM-005: email field validation is not implemented.
   Fix these items."

  Max 3 rework cycles per work package.
  After 3 cycles → escalate to user.
```

## Behavior

### Step 1: Read Task Plan

Parse `docs/specs/07-task-plan.md` to identify:
- Work packages and their tasks
- Execution phases (parallel vs sequential)
- Current progress (which WPs are done)

### Step 2: Execute Work Packages

For each work package in the current execution phase:

1. **Launch team member** using Agent Teams:
   - Agent: `sdd-implementer`
   - Context: Work package tasks, relevant spec files, checklist items
   - CLAUDE.md: Content from `docs/specs/wp-N-member.md`

2. **Monitor progress**:
   - Track checklist item completion
   - Log any issues or ambiguities reported by members

### Step 3: Quality Verification Loop

After a team member reports completion:

1. Read `docs/specs/06-spec-checklist.md`
2. Check all assigned checklist items
3. For items still `[ ]`:
   - Identify what's missing
   - Create specific rework instructions
   - Re-assign to the team member

```
Rework Cycle 1/3:
  Incomplete items:
  - API-003: Missing 422 error handler in UserController
  - DM-005: email validation not implemented in User model

  Sending rework instructions to Team Member 1...
```

4. After 3 failed cycles:
```
ESCALATION: Work Package WP-1 has incomplete items after 3 rework cycles.

Still incomplete:
- API-003: 422 error handler
  - Spec: 03-api-spec.md#create-user
  - Expected: Return { error: "Validation failed", fields: [...] } on invalid input

Please review and decide:
1. Fix manually
2. Adjust the spec
3. Skip these items
```

### Step 3.5: Lint & Format Before Completion

Before marking a work package as complete, ensure code quality:

1. **Run project formatter** (if configured): Auto-format modified files
   - Use `/sdd-lint format --fix` or the project's configured formatter
2. **Run project linter** (if configured): Check for lint errors
   - Use `/sdd-lint diagnostics` or the project's configured diagnostic tool
3. **Fix any issues** before marking checklist items `[x]`

```
Pre-completion Checks:
  1. Formatting: prettier --write src/ ✓
  2. Diagnostics: tsc --noEmit ✓ (0 errors)
  3. All checklist items verified [x]
```

This step is recommended but not mandatory. The `/sdd-review` quality gate will catch any remaining issues.

### Step 4: Phase Transition

When all work packages in a phase are complete:
- Move to the next execution phase
- Or, if all phases done, report completion

```
Build Phase Complete!

All work packages: 4/4 done
Checklist progress: 28/28 items complete (100%)

Next step: /sdd-review — Run quality gate verification
```

## Output

- Modified source code files (per spec)
- Updated `docs/specs/06-spec-checklist.md` with `[x]` marks
- Test files

## Dependencies

- `docs/specs/07-task-plan.md` (from `/sdd-plan`)
- `docs/specs/06-spec-checklist.md` (from `/sdd-spec`)
- Agent Teams enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
