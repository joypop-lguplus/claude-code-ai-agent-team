# /sdd-review — Quality Gate Verification

Perform comprehensive quality verification against the spec checklist.

## Usage

```
/sdd-review              # Full review
/sdd-review quick        # Checklist status only (no code verification)
```

## Behavior

### Step 1: Checklist Audit

Read `docs/specs/06-spec-checklist.md` and categorize all items:
- `[x]` items → verify code exists and matches spec
- `[ ]` items → report as incomplete

### Step 2: Code Verification (Full Review)

For each `[x]` item, use the `sdd-reviewer` agent to:

1. **Find the code**: Locate the implementation file(s) referenced by the spec.
2. **Check spec compliance**: Compare implementation against the spec section.
3. **Check tests**: Verify test files exist for public interfaces.

Classify each item:
- **PASS**: Code exists, matches spec, tests present
- **FAIL**: Missing code, spec mismatch, or missing tests
- **PARTIAL**: Partially implemented

### Step 2.5: Automated Diagnostics

Run the `sdd-code-analyzer` agent to perform automated checks:

1. **Run diagnostics**: Execute project-native diagnostic tool (tsc, ruff, cargo check, etc.)
2. **Collect errors/warnings**: Parse output into structured error list
3. **Map to checklist items**: Correlate diagnostic results with spec checklist item IDs where possible
4. **Run format verification**: Check if modified files follow project formatting rules

Include results in the review report under an "Automated Checks" section:

```
Automated Checks:
  Diagnostics: 0 errors, 3 warnings
  Formatting:  2 files need formatting
  Spec Coverage: 25/28 items have matching code (ast-grep)
```

Errors block the quality gate. Warnings and format issues are reported but don't block.

### Step 3: Test Execution

If the project has a test command configured:
1. Run the test suite
2. Report results (pass/fail/skip counts)
3. Associate failures with checklist items if possible

### Step 4: Generate Review Report

Create `docs/specs/08-review-report.md` with:
- Summary statistics
- Detailed per-item results
- Failed items with specific remediation instructions
- Overall recommendation (proceed to integration or rework)

### Step 5: Decision

```
Quality Gate Results:
  Total: 28 items
  PASS:  25
  FAIL:   2
  PARTIAL: 1
  Pass Rate: 89%

Failed Items:
  - API-003: 422 error handler → Missing in UserController
  - TEST-002: Integration tests → No test file found

Recommendation: Return to /sdd-build for rework
```

If all items pass:
```
Quality Gate: PASSED (28/28 items, 100%)
All tests passing.

Next step: /sdd-integrate — Create PR and finalize
```

If items fail:
```
Quality Gate: FAILED (25/28 items, 89%)
3 items need rework.

Run /sdd-build to fix the following items:
  - API-003, TEST-002, SEC-001

Or run /sdd-review quick to check progress after fixes.
```

## Output

- `docs/specs/08-review-report.md`

## Dependencies

- `docs/specs/06-spec-checklist.md` (from `/sdd-spec`)
- Implementation code (from `/sdd-build`)
