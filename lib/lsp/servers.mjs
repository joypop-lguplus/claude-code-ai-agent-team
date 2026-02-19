/**
 * lib/lsp/servers.mjs — 언어 서버 레지스트리
 *
 * 7개 언어 서버 정의 및 파일/언어 기반 서버 조회.
 */

import { extname, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

/** 지원되는 언어 서버 정의 */
export const SERVER_REGISTRY = {
  typescript: {
    command: 'typescript-language-server',
    args: ['--stdio'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
    languageId: 'typescript',
    initializationOptions: {},
  },
  python: {
    command: 'pyright-langserver',
    args: ['--stdio'],
    extensions: ['.py', '.pyi'],
    languageId: 'python',
    initializationOptions: {},
  },
  go: {
    command: 'gopls',
    args: ['serve'],
    extensions: ['.go'],
    languageId: 'go',
    initializationOptions: {},
  },
  rust: {
    command: 'rust-analyzer',
    args: [],
    extensions: ['.rs'],
    languageId: 'rust',
    initializationOptions: {},
  },
  cpp: {
    command: 'clangd',
    args: ['--log=error'],
    extensions: ['.c', '.cc', '.cpp', '.cxx', '.h', '.hpp', '.hxx'],
    languageId: 'cpp',
    initializationOptions: {},
  },
  java: {
    command: 'jdtls',
    args: [],
    dynamicArgs: (rootPath) => {
      const hash = createHash('md5').update(rootPath).digest('hex').slice(0, 12);
      const dataDir = resolve(tmpdir(), 'sdd-jdtls-data', hash);
      return ['-data', dataDir];
    },
    initTimeout: 90_000,
    extensions: ['.java'],
    languageId: 'java',
    initializationOptions: {},
  },
  kotlin: {
    command: 'kotlin-language-server',
    args: [],
    extensions: ['.kt', '.kts'],
    languageId: 'kotlin',
    initializationOptions: {},
  },
};

/** 확장자→languageId 매핑 (LSP textDocument/didOpen에 사용) */
const EXT_TO_LANGUAGE_ID = {
  '.ts': 'typescript',
  '.tsx': 'typescriptreact',
  '.js': 'javascript',
  '.jsx': 'javascriptreact',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.pyi': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.c': 'c',
  '.cc': 'cpp',
  '.cpp': 'cpp',
  '.cxx': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.hxx': 'cpp',
  '.java': 'java',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
};

/**
 * 파일 경로의 확장자로 적합한 서버를 찾습니다.
 * @param {string} filePath
 * @returns {{ name: string, config: object, languageId: string } | null}
 */
export function getServerForFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  for (const [name, config] of Object.entries(SERVER_REGISTRY)) {
    if (config.extensions.includes(ext)) {
      return { name, config, languageId: EXT_TO_LANGUAGE_ID[ext] || config.languageId };
    }
  }
  return null;
}

/**
 * 언어명으로 서버를 찾습니다.
 * @param {string} language - typescript, python, go, rust, cpp, java, kotlin
 * @returns {{ name: string, config: object } | null}
 */
export function getServerByLanguage(language) {
  const key = language.toLowerCase();
  const config = SERVER_REGISTRY[key];
  if (!config) return null;
  return { name: key, config };
}

/**
 * 명령어가 시스템에 설치되어 있는지 확인합니다.
 * @param {string} command
 * @returns {boolean}
 */
export function isServerInstalled(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 모든 서버의 설치 상태를 반환합니다.
 * @returns {Record<string, { command: string, installed: boolean }>}
 */
export function getAllServerStatus() {
  const result = {};
  for (const [name, config] of Object.entries(SERVER_REGISTRY)) {
    result[name] = {
      command: config.command,
      installed: isServerInstalled(config.command),
    };
  }
  return result;
}
