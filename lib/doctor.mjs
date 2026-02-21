import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  colors, sym, status, section,
} from './utils.mjs';
import { checkAll, printResults } from './checker.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, '..');

export async function runDoctor() {
  console.log('claude-sdd 플러그인 정밀 진단을 실행합니다.');
  console.log();

  // -- 1. Basic checks --
  section(colors.bold('[1/4] 의존성 상태'));
  const results = checkAll();
  printResults(results);

  // -- 2. File integrity --
  section(colors.bold('[2/4] 플러그인 파일 무결성'));
  console.log();

  const requiredFiles = [
    '.claude-plugin/plugin.json',
    'agents/sdd-requirements-analyst.md',
    'agents/sdd-spec-writer.md',
    'agents/sdd-implementer.md',
    'agents/sdd-reviewer.md',
    'agents/sdd-code-analyzer.md',
    'skills/sdd-next/SKILL.md',
    'skills/sdd-godmode/SKILL.md',
    'skills/sdd-init/SKILL.md',
    'skills/sdd-intake/SKILL.md',
    'skills/sdd-spec/SKILL.md',
    'skills/sdd-plan/SKILL.md',
    'skills/sdd-assign/SKILL.md',
    'skills/sdd-build/SKILL.md',
    'skills/sdd-review/SKILL.md',
    'skills/sdd-integrate/SKILL.md',
    'skills/sdd-status/SKILL.md',
    'skills/sdd-lint/SKILL.md',
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
    'scripts/sdd-lsp-patch.sh',
    '.mcp.json',
  ];

  let integrityOk = true;
  for (const file of requiredFiles) {
    const fullPath = join(PLUGIN_ROOT, file);
    const exists = existsSync(fullPath);
    if (!exists) integrityOk = false;
    status(file, exists, exists ? '' : '누락');
  }

  // Check executable permissions on scripts
  const scripts = ['scripts/sdd-session-init.sh', 'scripts/sdd-detect-tools.sh', 'scripts/sdd-lsp-patch.sh'];
  for (const script of scripts) {
    const fullPath = join(PLUGIN_ROOT, script);
    if (existsSync(fullPath)) {
      try {
        const st = statSync(fullPath);
        const isExec = (st.mode & 0o111) !== 0;
        status(`${script} (exec)`, isExec, isExec ? 'OK' : '실행 권한 없음');
        if (!isExec) integrityOk = false;
      } catch {
        status(`${script} (exec)`, false, '상태 확인 불가');
      }
    }
  }

  // -- 3. JSON validation --
  section(colors.bold('[3/4] JSON 유효성 검사'));
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
      status(file, false, '누락');
      continue;
    }
    try {
      JSON.parse(readFileSync(fullPath, 'utf8'));
      status(file, true, '유효한 JSON');
    } catch (e) {
      status(file, false, `유효하지 않음: ${e.message}`);
      integrityOk = false;
    }
  }

  // -- 4. LSP .lsp.json validation --
  section(colors.bold('[4/4] LSP 설정 검증'));
  console.log();

  const home = homedir();
  const pluginsBase = join(home, '.claude', 'plugins');

  // gopls 패치 상태 확인
  const goplsPath = join(home, 'go', 'bin', 'gopls');
  const goplsDirs = [
    join(pluginsBase, 'cache', 'claude-code-lsps', 'gopls'),
    join(pluginsBase, 'marketplaces', 'claude-code-lsps', 'gopls'),
  ];

  let goplsChecked = false;
  for (const dir of goplsDirs) {
    if (!existsSync(dir)) continue;
    const lspJsons = dir.includes('cache')
      ? (() => {
          try {
            return readdirSync(dir)
              .map(v => join(dir, v, '.lsp.json'))
              .filter(p => existsSync(p));
          } catch { return []; }
        })()
      : existsSync(join(dir, '.lsp.json')) ? [join(dir, '.lsp.json')] : [];

    for (const lspPath of lspJsons) {
      goplsChecked = true;
      try {
        const content = JSON.parse(readFileSync(lspPath, 'utf8'));
        const cmd = content?.go?.command;
        if (cmd && cmd !== 'gopls') {
          status('gopls .lsp.json', true, `풀 패스: ${cmd}`);
        } else if (cmd === 'gopls') {
          // gopls가 표준 PATH에 있는지 확인
          if (existsSync(goplsPath)) {
            status('gopls .lsp.json', false, `"gopls"로 설정됨 — ${goplsPath}로 패치 필요`);
          } else {
            status('gopls .lsp.json', true, '기본값 (gopls가 PATH에 있음)');
          }
        }
      } catch { /* ignore */ }
    }
  }
  if (!goplsChecked) {
    status('gopls .lsp.json', true, '미설치 (건너뜀)');
  }

  // kotlin-lsp JVM 튜닝 상태 확인
  const kotlinDirs = [
    join(pluginsBase, 'cache', 'claude-code-lsps', 'kotlin-lsp'),
    join(pluginsBase, 'marketplaces', 'claude-code-lsps', 'kotlin-lsp'),
  ];

  let kotlinChecked = false;
  for (const dir of kotlinDirs) {
    if (!existsSync(dir)) continue;
    const lspJsons = dir.includes('cache')
      ? (() => {
          try {
            return readdirSync(dir)
              .map(v => join(dir, v, '.lsp.json'))
              .filter(p => existsSync(p));
          } catch { return []; }
        })()
      : existsSync(join(dir, '.lsp.json')) ? [join(dir, '.lsp.json')] : [];

    for (const lspPath of lspJsons) {
      kotlinChecked = true;
      try {
        const content = JSON.parse(readFileSync(lspPath, 'utf8'));
        const cmd = content?.kotlin?.command;
        if (cmd && cmd !== 'kotlin-lsp') {
          status('kotlin-lsp .lsp.json', true, `풀 패스: ${cmd}`);
        } else {
          status('kotlin-lsp .lsp.json', false, '"kotlin-lsp"로 설정됨 — 풀 패스 패치 필요');
        }
      } catch { /* ignore */ }
    }
  }
  if (!kotlinChecked) {
    status('kotlin-lsp .lsp.json', true, '미설치 (건너뜀)');
  }

  // -- Summary --
  console.log();
  console.log(colors.bold('\u2501'.repeat(50)));
  console.log();

  const missing = results.filter(r => r.ok === false && r.category !== 'mcp' && r.category !== 'tools');
  if (missing.length === 0 && integrityOk) {
    console.log(colors.green(colors.bold('모든 진단을 통과했습니다!')));
  } else {
    if (!integrityOk) {
      console.log(colors.yellow('일부 플러그인 파일에 문제가 있습니다. 플러그인 루트 디렉토리에서 실행하세요.'));
    }
    if (missing.length > 0) {
      const cli = process.env.SDD_CLI_NAME || 'claude-sdd';
      console.log(colors.yellow(`${missing.length}개의 구성 요소가 누락되었습니다. 실행: ${cli} install`));
    }
  }
  console.log();
}
