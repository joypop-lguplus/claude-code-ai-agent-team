import { commandExists, run, status, section, colors } from './utils.mjs';

/**
 * Run all SDD dependency checks and return a results array.
 * Each item: { name, ok, detail, category }
 */
export function checkAll() {
  const results = [];

  // -- Core Tools --
  const nodeOk = commandExists('node');
  const nodeVer = nodeOk ? run('node --version', { ignoreError: true }) : '';
  results.push({ name: 'Node.js', ok: nodeOk, detail: nodeVer || 'Not installed', category: 'core' });

  // -- Claude Code --
  const claudeOk = commandExists('claude');
  const claudeVer = claudeOk ? run('claude --version 2>/dev/null', { ignoreError: true }) || 'installed' : '';
  results.push({ name: 'Claude Code', ok: claudeOk, detail: claudeVer || 'Not installed', category: 'claude' });

  // -- Agent Teams --
  const agentTeamsEnv = process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;
  const agentTeamsOk = agentTeamsEnv === '1' || agentTeamsEnv === 'true';
  results.push({
    name: 'Agent Teams',
    ok: agentTeamsOk,
    detail: agentTeamsOk ? 'Enabled' : 'Not enabled (set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)',
    category: 'claude',
  });

  // -- GitHub CLI --
  const ghOk = commandExists('gh');
  const ghVer = ghOk ? run('gh --version 2>/dev/null | head -1', { ignoreError: true }) : '';
  results.push({ name: 'gh CLI', ok: ghOk, detail: ghVer || 'Not installed', category: 'github' });

  if (ghOk) {
    let ghAuth = false;
    try { run('gh auth status 2>&1'); ghAuth = true; } catch { /* not authed */ }
    results.push({ name: 'gh auth', ok: ghAuth, detail: ghAuth ? 'Authenticated' : 'Not authenticated', category: 'github' });
  }

  // -- ast-grep (optional) --
  const sgOk = commandExists('sg');
  const sgVer = sgOk ? run('sg --version 2>/dev/null', { ignoreError: true }) : '';
  results.push({
    name: 'ast-grep (sg)',
    ok: sgOk,
    detail: sgVer || 'Not installed (optional — enhances /sdd-lint search & symbols)',
    category: 'tools',
  });

  // -- Confluence MCP (optional) --
  let confluenceOk = false;
  if (claudeOk) {
    const mcpList = run('claude mcp list 2>/dev/null', { ignoreError: true });
    confluenceOk = mcpList.includes('confluence') || mcpList.includes('atlassian');
  }
  results.push({
    name: 'Confluence MCP',
    ok: confluenceOk,
    detail: confluenceOk ? 'Configured' : 'Not configured (optional)',
    category: 'mcp',
  });

  // -- Jira MCP (optional) --
  let jiraOk = false;
  if (claudeOk) {
    const mcpList = run('claude mcp list 2>/dev/null', { ignoreError: true });
    jiraOk = mcpList.includes('jira') || mcpList.includes('atlassian');
  }
  results.push({
    name: 'Jira MCP',
    ok: jiraOk,
    detail: jiraOk ? 'Configured' : 'Not configured (optional)',
    category: 'mcp',
  });

  return results;
}

/**
 * Print check results to console in a formatted table.
 */
export function printResults(results) {
  const categories = [
    { key: 'core',    title: '[1/5] Core Tools' },
    { key: 'claude',  title: '[2/5] Claude Code & Agent Teams' },
    { key: 'github',  title: '[3/5] GitHub CLI' },
    { key: 'tools',   title: '[4/5] Code Analysis Tools (Optional)' },
    { key: 'mcp',     title: '[5/5] MCP Servers (Optional)' },
  ];

  for (const cat of categories) {
    const items = results.filter(r => r.category === cat.key);
    if (items.length === 0) continue;
    section(cat.title);
    for (const item of items) {
      status(item.name, item.ok, item.detail);
    }
  }

  const required = results.filter(r => r.category !== 'mcp' && r.category !== 'tools');
  const missing = required.filter(r => !r.ok);
  const optional = results.filter(r => (r.category === 'mcp' || r.category === 'tools') && !r.ok);

  console.log();
  console.log(colors.bold('\u2501'.repeat(50)));

  if (missing.length === 0) {
    console.log();
    console.log(colors.green(colors.bold('All required dependencies are ready!')));
  } else {
    console.log();
    console.log(colors.yellow(colors.bold(`Missing required components (${missing.length}):`)));
    for (const m of missing) {
      console.log(`  ${colors.yellow('\u2022')} ${m.name} \u2014 ${m.detail}`);
    }
  }

  if (optional.length > 0) {
    console.log();
    console.log(colors.dim(`Optional: ${optional.map(o => o.name).join(', ')} not configured`));
  }

  return missing;
}
