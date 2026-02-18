# SDD Methodology -- Spec-Driven Development

## What is SDD?

Spec-Driven Development (SDD) is a software development methodology where **specifications are the single source of truth** throughout the entire development lifecycle. Every line of code must trace back to a spec item, and quality is measured by a compliance checklist rather than subjective review.

## Core Principles

### 1. Specification Before Implementation

No code is written until a spec is approved. This prevents:
- Feature creep
- Misaligned implementations
- Wasted rework

### 2. Checklist as Quality Gate

A spec compliance checklist is the sole quality criterion. Each item is:
- **Verifiable**: Can be checked by reading code
- **Atomic**: One item = one verifiable thing
- **Traceable**: References a specific spec section

### 3. Parallel Execution with Accountability

Work is decomposed into independent packages that can run in parallel. Each package has:
- Explicit spec references
- Assigned checklist items
- Clear completion criteria

### 4. Leader-Driven Quality Loop

A team leader verifies checklist completion with specific, actionable feedback. The loop:
1. Assign work with spec references
2. Verify completion against checklist
3. Provide specific feedback for incomplete items
4. Escalate after repeated failures

## The 7 Phases

### Phase 1: Intake

**Goal**: Gather and structure all requirements.

**Sources**: Confluence pages, Jira epics, Figma designs, local documents, interactive interviews.

**Output**: `01-requirements.md` with numbered functional requirements (FR-001), non-functional requirements (NFR-001), constraints, and assumptions.

### Phase 2: Spec

**Goal**: Transform requirements into precise technical specifications.

**For new projects**:
- System architecture (tech stack, modules, dependencies)
- API specification (endpoints, schemas, error codes)
- Data model (entities, fields, relations, indexes)
- Component breakdown (responsibilities, interfaces)
- Spec compliance checklist

**For legacy projects**:
- Change impact analysis (affected modules, risks)
- API changes (new, modified, deleted endpoints)
- Data migration (schema changes, migration strategy)
- Component changes (modified modules, dependencies)
- Spec compliance checklist

### Phase 3: Plan

**Goal**: Decompose specs into parallelizable work packages.

Each work package contains:
- Tasks with spec references
- Assigned checklist items
- Dependencies on other packages
- Team member configuration

### Phase 4: Build

**Goal**: Implement all work packages with quality enforcement.

The quality loop:
```
Assign --> Implement --> Verify --> [Rework | Accept]
```

Maximum 3 rework cycles before escalation to human.

### Phase 5: Review

**Goal**: Comprehensive quality gate verification.

For each checklist item:
1. Does the code exist?
2. Does it match the spec?
3. Are there tests?

Result: PASS, FAIL, or PARTIAL for each item.

### Phase 6: Integrate

**Goal**: Create a traceable pull request.

Includes:
- Full test execution
- Documentation updates
- PR with spec traceability table

### Phase 7: Document

**Goal**: Ensure all documentation reflects the implementation.

Updates CHANGELOG, README, and spec documents to their final state.

## New vs Legacy Workflows

| Aspect | New (Greenfield) | Legacy (Brownfield) |
|--------|------------------|---------------------|
| Architecture | Design from scratch | Change impact analysis |
| API | Full specification | Changes only (new/modify/delete) |
| Data | Complete model | Migration plan |
| Components | Full breakdown | Change analysis |
| Risk | Lower (no existing code) | Higher (backward compatibility) |

## Checklist Categories

| Category | Description | Example |
|----------|-------------|---------|
| ARCH | Architecture | Module structure matches spec |
| API | API | Endpoint returns correct schema |
| DM | Data Model | Entity has all specified fields |
| COMP | Component | Module implements specified interface |
| TEST | Test | Unit test exists for public function |
| SEC | Security | Input validation implemented |
| PERF | Performance | Query uses specified index |
| UI | UI | Component renders specified elements |

## Benefits

1. **Traceability**: Every code change maps to a spec item.
2. **Predictability**: Progress is measured objectively (0% to 100%).
3. **Parallelism**: Independent work packages execute simultaneously.
4. **Quality**: Automated verification against the spec, not opinions.
5. **Accountability**: Clear ownership of work packages and checklist items.
