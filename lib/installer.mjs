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
  console.log('claude-sdd 플러그인 설치 마법사입니다.');
  console.log(colors.dim('SDD: Claude Code 에이전트 팀을 활용한 스펙 주도 개발 (SDD) 라이프사이클'));

  // -- Step 1: Prerequisites --
  section(colors.bold('[1/4] 사전 요구사항'));

  const nodeVer = parseInt(process.version.slice(1), 10);
  if (nodeVer < 18) {
    console.log(colors.red(`  Node.js >= 18 필요 (현재: ${process.version})`));
    console.log('  설치: https://nodejs.org/');
    process.exit(1);
  }
  status('Node.js', true, process.version);

  if (!commandExists('git')) {
    console.log(colors.red('  git이 필요하지만 설치되어 있지 않습니다.'));
    process.exit(1);
  }
  status('git', true);

  // -- Step 2: Claude Code & Agent Teams --
  section(colors.bold('[2/4] Claude Code 및 에이전트 팀'));

  if (commandExists('claude')) {
    const ver = run('claude --version 2>/dev/null', { ignoreError: true }) || 'installed';
    status('Claude Code', true, ver);
  } else {
    status('Claude Code', false, '설치되지 않음');
    console.log(`  ${sym.arr} 설치: https://docs.anthropic.com/en/docs/claude-code`);
  }

  const agentTeamsEnv = process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;
  const agentTeamsOk = agentTeamsEnv === '1' || agentTeamsEnv === 'true';
  if (agentTeamsOk) {
    status('Agent Teams', true, '활성화됨');
  } else {
    status('Agent Teams', false, '비활성화');
    console.log(`  ${sym.arr} ~/.claude/settings.json에 추가:`);
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
      status('gh auth', true, '인증됨');
    } else {
      status('gh auth', false, '인증되지 않음');
      console.log(`  ${sym.arr} 실행: ${colors.bold('gh auth login')}`);
    }
  } else {
    status('gh CLI', false, '설치되지 않음 (PR 생성에 필요)');
    console.log(`  ${sym.arr} 설치: https://cli.github.com/`);
  }

  // -- Step 4: Plugin Registration --
  section(colors.bold('[4/4] 플러그인 등록'));

  const pluginDir = join(home, '.claude', 'plugins', 'claude-sdd');

  if (existsSync(pluginDir)) {
    status('플러그인 디렉토리', true, pluginDir);
  } else {
    if (await confirm(`  ${sym.arr} ${pluginDir}에 플러그인을 등록하시겠습니까?`)) {
      try {
        mkdirSync(dirname(pluginDir), { recursive: true });
        symlinkSync(PLUGIN_ROOT, pluginDir);
        status('플러그인 심볼릭 링크', true, `${pluginDir} -> ${PLUGIN_ROOT}`);
      } catch (e) {
        status('플러그인 심볼릭 링크', false, e.message);
      }
    } else {
      console.log(colors.dim('  건너뜀. 다음 명령어를 사용할 수 있습니다: claude --plugin-dir .'));
    }
  }

  // -- Verification --
  section(colors.bold('검증'));
  console.log();

  const results = checkAll();
  const missing = printResults(results);

  console.log();
  if (missing.length === 0) {
    console.log(colors.green(colors.bold('설치 완료! 모든 구성 요소가 준비되었습니다.')));
  } else {
    console.log(colors.yellow(`${missing.length}개의 필수 구성 요소가 구성되지 않았습니다.`));
    console.log(colors.dim('위 항목을 수정한 후 다시 실행하세요: claude-sdd check'));
  }

  console.log();
  console.log(colors.bold('다음 단계:'));
  console.log(`  1. ${colors.bold('claude --plugin-dir ' + PLUGIN_ROOT)}`);
  console.log(`  2. ${colors.bold('/sdd-init new')} 을 입력하여 SDD 프로젝트를 초기화하세요`);
  console.log(`  3. ${colors.bold('/sdd')} 를 사용하여 개발 라이프사이클을 시작하세요`);
}
