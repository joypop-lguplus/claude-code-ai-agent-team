#!/usr/bin/env node

import { header, colors } from '../lib/utils.mjs';

const VERSION = '0.1.0';
const [,, command, ...args] = process.argv;

async function main() {
  switch (command) {
    case 'check':
    case 'status': {
      header('claude-sdd \u2014 Status Check');
      const { checkAll, printResults } = await import('../lib/checker.mjs');
      const results = checkAll();
      printResults(results);
      break;
    }

    case 'install': {
      header('claude-sdd \u2014 Installer');
      const { runInstaller } = await import('../lib/installer.mjs');
      await runInstaller();
      break;
    }

    case 'doctor': {
      header('claude-sdd \u2014 Doctor');
      const { runDoctor } = await import('../lib/doctor.mjs');
      await runDoctor();
      break;
    }

    case 'version':
    case '--version':
    case '-v':
      console.log(`claude-sdd v${VERSION}`);
      break;

    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;

    default:
      console.log(colors.red(`Unknown command: ${command}`));
      console.log();
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`${colors.bold('claude-sdd')} v${VERSION}`);
  console.log('Spec-Driven Development lifecycle with Claude Code Agent Teams');
  console.log();
  console.log(colors.bold('Usage:'));
  console.log('  claude-sdd <command>');
  console.log();
  console.log(colors.bold('Commands:'));
  console.log('  install     Interactive setup wizard');
  console.log('  check       Check dependency status');
  console.log('  doctor      Deep diagnostics');
  console.log('  version     Show version');
  console.log('  help        Show this help');
  console.log();
  console.log(colors.bold('Quick Start:'));
  console.log('  npx github:joypop-lguplus/claude-sdd install');
  console.log();
  console.log(colors.bold('SDD Lifecycle (inside Claude Code):'));
  console.log('  /sdd-init       Initialize project for SDD');
  console.log('  /sdd-intake     Gather requirements');
  console.log('  /sdd-spec       Generate technical specs');
  console.log('  /sdd-plan       Decompose tasks & assign teams');
  console.log('  /sdd-build      Implement with Agent Teams');
  console.log('  /sdd-review     Quality gate verification');
  console.log('  /sdd-integrate  Integration, PR & docs');
  console.log('  /sdd-status     Status dashboard');
  console.log('  /sdd            Auto-detect phase & continue');
}

main().catch((err) => {
  console.error(colors.red(`Error: ${err.message}`));
  process.exit(1);
});
