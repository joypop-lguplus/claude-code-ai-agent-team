# /sdd-intake — Requirements Gathering

Collect and structure requirements from various sources into a standardized requirements document.

## Usage

```
/sdd-intake confluence:<page-id>     # Fetch from Confluence page
/sdd-intake jira:<epic-key>          # Fetch from Jira epic + stories
/sdd-intake figma:<url>              # Analyze Figma design via vision
/sdd-intake file:<path>              # Read local document
/sdd-intake interview                # Interactive requirements interview
/sdd-intake                          # Ask user to choose source
```

## Arguments

- `confluence:<page-id>` — Confluence page ID to fetch via MCP
- `jira:<epic-key>` — Jira epic key (e.g., `PROJ-100`) to fetch via MCP
- `figma:<url>` — Figma file URL for visual analysis
- `file:<path>` — Path to a local requirements document
- `interview` — Start an interactive interview session
- (none) — Prompt the user to select a source type

## Behavior

### Source: Confluence

1. Use the `confluence_get_page` MCP tool with the given page ID.
2. If MCP is not available, inform the user:
   ```
   Confluence MCP is not configured in your environment.
   To set it up, add mcp-atlassian to your Claude Code MCP settings.
   Alternatively, export the page and use: /sdd-intake file:<exported-file>
   ```
3. Parse the page content and extract requirements.
4. Check for child pages with `confluence_get_page_children` and offer to include them.

### Source: Jira

1. Use the `jira_get_issue` MCP tool to fetch the epic.
2. Use `jira_search` with JQL `"Epic Link" = <epic-key>` to find child stories.
3. If MCP is not available, provide the same guidance as Confluence.
4. Extract acceptance criteria and user stories.

### Source: Figma

1. Ask the user to paste a screenshot of the design, or provide the Figma URL.
2. Use Claude's vision capabilities to analyze the design.
3. Extract UI components, flows, and interaction patterns.
4. Transform visual elements into functional requirements.

### Source: Local File

1. Read the specified file.
2. Parse based on format (markdown, text, HTML).
3. Extract and structure requirements.

### Source: Interview

Ask the user these questions in sequence:
1. What is the main goal of this project?
2. Who are the target users?
3. What are the 3-5 core features?
4. What is the tech stack (or preferred stack)?
5. What are the constraints (timeline, team size, budget)?
6. Are there performance requirements?
7. Are there security requirements?
8. What is explicitly out of scope?

### Multiple Sources

Multiple `/sdd-intake` calls can be combined. Each call appends to or updates the existing `01-requirements.md`.

## Output

Generate or update `docs/specs/01-requirements.md` using the `sdd-requirements-analyst` agent.

The document follows this structure:
- Project Overview
- Functional Requirements (FR-001, FR-002, ...)
- Non-Functional Requirements (NFR-001, NFR-002, ...)
- Constraints
- Assumptions
- Out of Scope

After generation, print:
```
Requirements document generated: docs/specs/01-requirements.md
  - X functional requirements
  - Y non-functional requirements

Next step: /sdd-spec — Generate technical specifications
```

## Dependencies

- `docs/specs/sdd-config.yaml` must exist (run `/sdd-init` first)
- Confluence/Jira MCP tools (optional, for remote sources)
