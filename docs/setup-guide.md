# Setup Guide

## Prerequisites

| Component | Version | Required |
|-----------|---------|----------|
| Claude Code | Latest | Yes |
| Node.js | 18+ | Yes |
| Agent Teams | Enabled | Yes |
| `gh` CLI | Latest | Recommended |
| Confluence MCP | - | Optional |
| Jira MCP | - | Optional |

## Step 1: Install the Plugin

### Option A: npx (Recommended)

```bash
npx github:joypop-lguplus/claude-sdd install
```

This runs an interactive setup wizard that checks all dependencies and registers the plugin.

### Option B: Git Clone

```bash
git clone https://github.com/joypop-lguplus/claude-sdd.git
cd claude-sdd
node bin/cli.mjs install
```

### Option C: Manual

```bash
git clone https://github.com/joypop-lguplus/claude-sdd.git
claude --plugin-dir ./claude-sdd
```

## Step 2: Enable Agent Teams

Add to your Claude Code settings:

```json
// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

This is required for the `/sdd-build` phase, which uses parallel Agent Teams for implementation.

## Step 3: Configure MCP (Optional)

### Confluence

If you need to pull requirements from Confluence:

```bash
claude mcp add mcp-atlassian -s user -- \
  uvx mcp-atlassian \
  --confluence-url https://your-company.atlassian.net \
  --confluence-username your@email.com \
  --confluence-token YOUR_TOKEN
```

### Jira

If you need to pull requirements from Jira:

```bash
claude mcp add mcp-atlassian -s user -- \
  uvx mcp-atlassian \
  --jira-url https://your-company.atlassian.net \
  --jira-username your@email.com \
  --jira-token YOUR_TOKEN
```

Note: The `mcp-atlassian` package supports both Confluence and Jira in a single MCP server.

## Step 4: Verify Installation

```bash
# Check dependency status
npx github:joypop-lguplus/claude-sdd check

# Deep diagnostics
npx github:joypop-lguplus/claude-sdd doctor
```

## Step 5: Start Using SDD

```bash
# Start Claude Code with the plugin
claude

# Initialize your project
/sdd-init new      # For new projects
/sdd-init legacy   # For existing codebases

# Check status
/sdd-status

# Start the lifecycle
/sdd
```

## Troubleshooting

### "Agent Teams not enabled"

Make sure `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is in your settings:

```bash
cat ~/.claude/settings.json
```

### "Confluence/Jira MCP not configured"

You can still use SDD without MCP. Use these alternatives for requirements intake:
- `/sdd-intake file:path/to/doc.md` -- Read local documents
- `/sdd-intake interview` -- Interactive requirements gathering
- `/sdd-intake figma:URL` -- Analyze Figma designs

### Plugin not found

If Claude Code doesn't recognize the skills, try:

```bash
# Register plugin explicitly
mkdir -p ~/.claude/plugins
ln -s $(pwd) ~/.claude/plugins/claude-sdd

# Or use plugin-dir flag
claude --plugin-dir /path/to/claude-sdd
```
