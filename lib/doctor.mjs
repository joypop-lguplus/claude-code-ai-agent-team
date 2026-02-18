import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  colors, sym, status, section,
} from './utils.mjs';
import { checkAll, printResults } from './checker.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, '..');

export async function runDoctor() {
  console.log('Deep diagnostics for claude-sdd plugin.');
  console.log();

  // -- 1. Basic checks --
  section(colors.bold('[1/3] Dependency Status'));
  const results = checkAll();
  printResults(results);

  // -- 2. File integrity --
  section(colors.bold('[2/3] Plugin File Integrity'));
  console.log();

  const requiredFiles = [
    '.claude-plugin/plugin.json',
    'agents/sdd-requirements-analyst.md',
    'agents/sdd-spec-writer.md',
    'agents/sdd-implementer.md',
    'agents/sdd-reviewer.md',
    'skills/sdd/SKILL.md',
    'skills/sdd-init/SKILL.md',
    'skills/sdd-intake/SKILL.md',
    'skills/sdd-spec/SKILL.md',
    'skills/sdd-plan/SKILL.md',
    'skills/sdd-build/SKILL.md',
    'skills/sdd-review/SKILL.md',
    'skills/sdd-integrate/SKILL.md',
    'skills/sdd-status/SKILL.md',
    'hooks/hooks.json',
    'scripts/sdd-session-init.sh',
    'templates/claude-md/sdd-leader.md.tmpl',
    'templates/claude-md/sdd-member.md.tmpl',
    'templates/specs/architecture-new.md.tmpl',
    'templates/specs/api-spec.md.tmpl',
    'templates/specs/data-model.md.tmpl',
    'templates/specs/component-breakdown.md.tmpl',
    'templates/specs/change-impact.md.tmpl',
    'templates/checklists/spec-checklist.md.tmpl',
    'templates/checklists/quality-gate.md.tmpl',
    'templates/project-init/sdd-config.yaml.tmpl',
    '.mcp.json',
  ];

  let integrityOk = true;
  for (const file of requiredFiles) {
    const fullPath = join(PLUGIN_ROOT, file);
    const exists = existsSync(fullPath);
    if (!exists) integrityOk = false;
    status(file, exists, exists ? '' : 'MISSING');
  }

  // Check executable permissions on scripts
  const scripts = ['scripts/sdd-session-init.sh'];
  for (const script of scripts) {
    const fullPath = join(PLUGIN_ROOT, script);
    if (existsSync(fullPath)) {
      try {
        const st = statSync(fullPath);
        const isExec = (st.mode & 0o111) !== 0;
        status(`${script} (exec)`, isExec, isExec ? 'OK' : 'Not executable');
        if (!isExec) integrityOk = false;
      } catch {
        status(`${script} (exec)`, false, 'Cannot stat');
      }
    }
  }

  // -- 3. JSON validation --
  section(colors.bold('[3/3] JSON Validation'));
  console.log();

  const jsonFiles = [
    '.claude-plugin/plugin.json',
    'hooks/hooks.json',
    '.mcp.json',
    'package.json',
  ];

  if (existsSync(join(PLUGIN_ROOT, 'marketplace.json'))) {
    jsonFiles.push('marketplace.json');
  }

  for (const file of jsonFiles) {
    const fullPath = join(PLUGIN_ROOT, file);
    if (!existsSync(fullPath)) {
      status(file, false, 'MISSING');
      continue;
    }
    try {
      JSON.parse(readFileSync(fullPath, 'utf8'));
      status(file, true, 'Valid JSON');
    } catch (e) {
      status(file, false, `Invalid: ${e.message}`);
      integrityOk = false;
    }
  }

  // -- Summary --
  console.log();
  console.log(colors.bold('\u2501'.repeat(50)));
  console.log();

  const missing = results.filter(r => r.ok === false && r.category !== 'mcp');
  if (missing.length === 0 && integrityOk) {
    console.log(colors.green(colors.bold('All diagnostics passed!')));
  } else {
    if (!integrityOk) {
      console.log(colors.yellow('Some plugin files have issues. Run from the plugin root directory.'));
    }
    if (missing.length > 0) {
      console.log(colors.yellow(`${missing.length} component(s) missing. Run: claude-sdd install`));
    }
  }
  console.log();
}
