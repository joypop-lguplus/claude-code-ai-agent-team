#!/usr/bin/env bash
# SDD 세션 초기화 — SDD 프로젝트를 감지하고 세션 시작 시 진행 상황을 표시합니다

set -euo pipefail

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

SDD_CONFIG="docs/specs/sdd-config.yaml"
SPEC_DIR="docs/specs"

# SDD 프로젝트인지 확인
if [ ! -f "$SDD_CONFIG" ]; then
  exit 0
fi

echo ""
echo -e "${BOLD}${BLUE}[SDD]${RESET} 스펙 주도 개발 프로젝트 감지됨"

# 멀티 도메인 감지
DOMAINS_DIR="$SPEC_DIR/domains"
if [ -d "$DOMAINS_DIR" ]; then
  DOMAIN_COUNT=$(find "$DOMAINS_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
  if [ "$DOMAIN_COUNT" -gt 0 ]; then
    echo -e "${BOLD}${BLUE}[SDD]${RESET} 멀티 도메인 프로젝트 (${DOMAIN_COUNT}개 도메인)"

    for DOMAIN_DIR in "$DOMAINS_DIR"/*/; do
      [ ! -d "$DOMAIN_DIR" ] && continue
      DOMAIN_ID=$(basename "$DOMAIN_DIR")
      DOMAIN_CHECKLIST="$DOMAIN_DIR/06-spec-checklist.md"

      if [ -f "$DOMAIN_CHECKLIST" ]; then
        D_TOTAL=$(grep -c '^\- \[' "$DOMAIN_CHECKLIST" 2>/dev/null || echo "0")
        D_DONE=$(grep -c '^\- \[x\]' "$DOMAIN_CHECKLIST" 2>/dev/null || echo "0")
        if [ "$D_TOTAL" -gt 0 ]; then
          D_PCT=$(( D_DONE * 100 / D_TOTAL ))
          echo -e "${BOLD}${BLUE}[SDD]${RESET}   ${DOMAIN_ID}: ${GREEN}${D_DONE}${RESET}/${D_TOTAL} (${D_PCT}%)"
        else
          echo -e "${BOLD}${BLUE}[SDD]${RESET}   ${DOMAIN_ID}: ${YELLOW}체크리스트 생성됨${RESET}"
        fi
      elif [ -f "$DOMAIN_DIR/07-task-plan.md" ]; then
        echo -e "${BOLD}${BLUE}[SDD]${RESET}   ${DOMAIN_ID}: ${YELLOW}빌드${RESET}"
      elif [ -f "$DOMAIN_DIR/01-requirements.md" ]; then
        if [ -f "$DOMAIN_DIR/03-api-spec.md" ]; then
          echo -e "${BOLD}${BLUE}[SDD]${RESET}   ${DOMAIN_ID}: ${YELLOW}계획${RESET}"
        else
          echo -e "${BOLD}${BLUE}[SDD]${RESET}   ${DOMAIN_ID}: ${YELLOW}스펙${RESET}"
        fi
      else
        echo -e "${BOLD}${BLUE}[SDD]${RESET}   ${DOMAIN_ID}: ${DIM}인테이크${RESET}"
      fi
    done

    # 크로스 도메인 통합 상태
    CROSS_CHECKLIST="$SPEC_DIR/cross-domain/integration-checklist.md"
    if [ -f "$CROSS_CHECKLIST" ]; then
      C_TOTAL=$(grep -c '^\- \[' "$CROSS_CHECKLIST" 2>/dev/null || echo "0")
      C_DONE=$(grep -c '^\- \[x\]' "$CROSS_CHECKLIST" 2>/dev/null || echo "0")
      if [ "$C_TOTAL" -gt 0 ]; then
        C_PCT=$(( C_DONE * 100 / C_TOTAL ))
        echo -e "${BOLD}${BLUE}[SDD]${RESET}   크로스 도메인: ${GREEN}${C_DONE}${RESET}/${C_TOTAL} (${C_PCT}%)"
      fi
    fi

    echo -e "${DIM}  전체 대시보드를 보려면 /claude-sdd:sdd-status 를 사용하세요${RESET}"
    echo ""
    exit 0
  fi
fi

# 단일 도메인 모드 (기존 동작)
CHECKLIST="$SPEC_DIR/06-spec-checklist.md"
if [ -f "$CHECKLIST" ]; then
  TOTAL=$(grep -c '^\- \[' "$CHECKLIST" 2>/dev/null || echo "0")
  DONE=$(grep -c '^\- \[x\]' "$CHECKLIST" 2>/dev/null || echo "0")
  if [ "$TOTAL" -gt 0 ]; then
    PCT=$(( DONE * 100 / TOTAL ))
    echo -e "${BOLD}${BLUE}[SDD]${RESET} 스펙 체크리스트: ${GREEN}${DONE}${RESET}/${TOTAL} 완료 (${PCT}%)"
  fi
fi

# 기존 파일을 기반으로 현재 단계 표시
if [ -f "$SPEC_DIR/08-review-report.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} 단계: ${GREEN}리뷰 / 통합${RESET}"
elif [ -f "$SPEC_DIR/07-task-plan.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} 단계: ${YELLOW}빌드 (구현)${RESET}"
elif [ -f "$SPEC_DIR/06-spec-checklist.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} 단계: ${YELLOW}계획${RESET}"
elif [ -f "$SPEC_DIR/01-requirements.md" ]; then
  echo -e "${BOLD}${BLUE}[SDD]${RESET} 단계: ${YELLOW}스펙 생성${RESET}"
else
  echo -e "${BOLD}${BLUE}[SDD]${RESET} 단계: ${DIM}인테이크 (요구사항 수집)${RESET}"
fi

echo -e "${DIM}  전체 대시보드를 보려면 /claude-sdd:sdd-status 를 사용하세요${RESET}"
echo ""
