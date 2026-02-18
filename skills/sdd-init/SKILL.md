# /sdd-init — Initialize SDD Project

Initialize the current project for Spec-Driven Development.

## Usage

```
/sdd-init new          # New (greenfield) project
/sdd-init legacy       # Existing (brownfield) project
```

## Arguments

- `new` — Set up SDD for a brand new project
- `legacy` — Set up SDD for an existing codebase with changes

## Behavior

### Step 1: Create Spec Directory

Create `docs/specs/` if it doesn't exist.

### Step 2: Generate SDD Config

Create `docs/specs/sdd-config.yaml` from the template at `templates/project-init/sdd-config.yaml.tmpl`.

Ask the user:
1. **Project name**: What is this project called?
2. **Description**: Brief description of the project.
3. **Project type**: Confirm `new` or `legacy` based on the argument.

Fill in the template and write to `docs/specs/sdd-config.yaml`.

### Step 3: Inject CLAUDE.md Rules

Check if `CLAUDE.md` exists in the project root. If not, create it.

Append the SDD Leader rules from `templates/claude-md/sdd-leader.md.tmpl` to the project's `CLAUDE.md`:
- Replace `{{PROJECT_NAME}}` with the actual project name
- Replace `{{PROJECT_TYPE}}` with `new` or `legacy`

### Step 4: Confirm Setup

Print a summary:
```
SDD initialized for [project-name] (type: new/legacy)

Created:
  - docs/specs/sdd-config.yaml
  - CLAUDE.md updated with SDD rules

Next steps:
  1. /sdd-intake — Gather requirements
  2. /sdd-status — View project dashboard
```

## Dependencies

- None (this is the first step)

## Output

- `docs/specs/sdd-config.yaml`
- `CLAUDE.md` (created or updated)
