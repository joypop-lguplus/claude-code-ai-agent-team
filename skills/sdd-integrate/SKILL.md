# /sdd-integrate — Integration, PR & Documentation

Finalize the implementation with tests, documentation, and a pull request.

## Usage

```
/sdd-integrate              # Full integration workflow
/sdd-integrate pr           # Create PR only (skip tests/docs)
/sdd-integrate docs         # Update documentation only
```

## Prerequisites

- Quality gate must have passed (`08-review-report.md` shows 100% pass)
- Or user explicitly overrides with `/sdd-integrate` despite failures

## Behavior

### Step 1: Final Test Run

Run the project's full test suite:
```
Running full test suite...
  Unit tests: 45 passed, 0 failed
  Integration tests: 12 passed, 0 failed
  Total: 57 passed

All tests passing.
```

If tests fail, warn and ask whether to proceed.

### Step 2: Documentation Update

1. **CHANGELOG.md**: Add entry for this development cycle.
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD

   ### Added
   - [Feature from spec]

   ### Changed
   - [Change from spec]
   ```

2. **README.md**: Update if user-facing behavior changed.

3. **Spec docs**: Mark `06-spec-checklist.md` as finalized.

### Step 3: Create Branch & PR

1. Create a feature branch:
   ```
   git checkout -b sdd/<feature-name>
   ```

2. Stage and commit changes:
   ```
   git add .
   git commit -m "feat: [description based on requirements]

   SDD Spec Traceability:
   - Requirements: docs/specs/01-requirements.md
   - Architecture: docs/specs/02-*.md
   - Checklist: docs/specs/06-spec-checklist.md (28/28 complete)
   - Review: docs/specs/08-review-report.md"
   ```

3. Push and create PR:
   ```
   git push -u origin sdd/<feature-name>
   gh pr create --title "..." --body "..."
   ```

### PR Body Format

```markdown
## Summary

[Brief description from requirements]

## Spec Traceability

| Document | Status |
|----------|--------|
| Requirements | docs/specs/01-requirements.md |
| Architecture | docs/specs/02-*.md |
| API Spec | docs/specs/03-*.md |
| Data Model | docs/specs/04-*.md |
| Components | docs/specs/05-*.md |
| Checklist | 28/28 complete (100%) |
| Review | All items passed |

## Changes

[List of main changes]

## Test Plan

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual verification of key flows
```

### Step 4: Summary

```
Integration complete!

Branch: sdd/<feature-name>
PR: #123 — <title>
URL: https://github.com/...

Spec Documents:
  - All specs in docs/specs/ are finalized
  - Checklist: 28/28 complete
  - Review: All passed

Documentation:
  - CHANGELOG.md updated
  - README.md updated (if applicable)
```

## Output

- Git branch and commits
- Pull request via `gh pr create`
- Updated CHANGELOG.md
- Updated README.md (if needed)

## Dependencies

- `docs/specs/08-review-report.md` (from `/sdd-review`)
- `gh` CLI (for PR creation)
