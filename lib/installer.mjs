import { existsSync, mkdirSync, symlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  commandExists, run, confirm,
  colors, sym, status, section,
} from './utils.mjs';
import { checkAll, printResults } from './checker.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, '..');
const home = homedir();

export async function runInstaller() {
  console.log('Interactive setup wizard for claude-sdd plugin.');
  console.log(colors.dim('SDD: Spec-Driven Development lifecycle with Claude Code Agent Teams'));

  // -- Step 1: Prerequisites --
  section(colors.bold('[1/4] Prerequisites'));

  const nodeVer = parseInt(process.version.slice(1), 10);
  if (nodeVer < 18) {
    console.log(colors.red(`  Node.js >= 18 required (current: ${process.version})`));
    console.log('  Install: https://nodejs.org/');
    process.exit(1);
  }
  status('Node.js', true, process.version);

  if (!commandExists('git')) {
    console.log(colors.red('  git is required but not installed.'));
    process.exit(1);
  }
  status('git', true);

  // -- Step 2: Claude Code & Agent Teams --
  section(colors.bold('[2/4] Claude Code & Agent Teams'));

  if (commandExists('claude')) {
    const ver = run('claude --version 2>/dev/null', { ignoreError: true }) || 'installed';
    status('Claude Code', true, ver);
  } else {
    status('Claude Code', false, 'Not installed');
    console.log(`  ${sym.arr} Install: https://docs.anthropic.com/en/docs/claude-code`);
  }

  const agentTeamsEnv = process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;
  const agentTeamsOk = agentTeamsEnv === '1' || agentTeamsEnv === 'true';
  if (agentTeamsOk) {
    status('Agent Teams', true, 'Enabled');
  } else {
    status('Agent Teams', false, 'Not enabled');
    console.log(`  ${sym.arr} Add to ~/.claude/settings.json:`);
    console.log(colors.dim('    { "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }'));
  }

  // -- Step 3: GitHub CLI --
  section(colors.bold('[3/4] GitHub CLI'));

  if (commandExists('gh')) {
    const ver = run('gh --version 2>/dev/null | head -1', { ignoreError: true });
    status('gh CLI', true, ver);

    let ghAuth = false;
    try { run('gh auth status 2>&1'); ghAuth = true; } catch { /* not authed */ }
    if (ghAuth) {
      status('gh auth', true, 'Authenticated');
    } else {
      status('gh auth', false, 'Not authenticated');
      console.log(`  ${sym.arr} Run: ${colors.bold('gh auth login')}`);
    }
  } else {
    status('gh CLI', false, 'Not installed (needed for PR creation)');
    console.log(`  ${sym.arr} Install: https://cli.github.com/`);
  }

  // -- Step 4: Plugin Registration --
  section(colors.bold('[4/4] Plugin Registration'));

  const pluginDir = join(home, '.claude', 'plugins', 'claude-sdd');

  if (existsSync(pluginDir)) {
    status('Plugin directory', true, pluginDir);
  } else {
    if (await confirm(`  ${sym.arr} Register plugin at ${pluginDir}?`)) {
      try {
        mkdirSync(dirname(pluginDir), { recursive: true });
        symlinkSync(PLUGIN_ROOT, pluginDir);
        status('Plugin symlink', true, `${pluginDir} -> ${PLUGIN_ROOT}`);
      } catch (e) {
        status('Plugin symlink', false, e.message);
      }
    } else {
      console.log(colors.dim('  Skipped. You can use: claude --plugin-dir .'));
    }
  }

  // -- Verification --
  section(colors.bold('Verification'));
  console.log();

  const results = checkAll();
  const missing = printResults(results);

  console.log();
  if (missing.length === 0) {
    console.log(colors.green(colors.bold('Setup complete! All components are ready.')));
  } else {
    console.log(colors.yellow(`${missing.length} required component(s) not configured.`));
    console.log(colors.dim('Fix the items above and re-run: claude-sdd check'));
  }

  console.log();
  console.log(colors.bold('Next steps:'));
  console.log(`  1. ${colors.bold('claude --plugin-dir ' + PLUGIN_ROOT)}`);
  console.log(`  2. Type ${colors.bold('/sdd-init new')} to initialize your project for SDD`);
  console.log(`  3. Use ${colors.bold('/sdd')} to start the development lifecycle`);
}
