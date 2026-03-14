#!/usr/bin/env bash
set -euo pipefail

# Auth flow pre-flight checklist
# Run before committing auth changes: make check-auth

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
  if eval "$2" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $1"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} $1"
    FAIL=$((FAIL + 1))
  fi
}

warn_check() {
  if eval "$2" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $1"
    PASS=$((PASS + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} $1"
    WARN=$((WARN + 1))
  fi
}

echo "=== Auth Pre-flight Checklist ==="
echo ""

# 1. Env vars present
echo "Environment:"
check "LOGTO_APP_ID set in .env" "grep -q 'LOGTO_APP_ID=.' .env"
check "LOGTO_APP_SECRET set in .env" "grep -q 'LOGTO_APP_SECRET=.' .env"
check "AUTH_LOGTO_ID set in .env" "grep -q 'AUTH_LOGTO_ID=.' .env"
check "AUTH_LOGTO_SECRET set in .env" "grep -q 'AUTH_LOGTO_SECRET=.' .env"
check "AUTH_LOGTO_ISSUER set in .env" "grep -q 'AUTH_LOGTO_ISSUER=.' .env"
check "NEXTAUTH_SECRET set in .env" "grep -q 'NEXTAUTH_SECRET=.' .env"
check "JWT_SECRET_KEY set in .env" "grep -q 'JWT_SECRET_KEY=.' .env"
check "MOCK_AUTH set in .env" "grep -q 'MOCK_AUTH=.' .env"
echo ""

# 2. JWT secret consistency
echo "JWT Secret Consistency:"
ENV_SECRET=$(grep '^JWT_SECRET_KEY=' .env 2>/dev/null | cut -d= -f2)
if [ -n "$ENV_SECRET" ]; then
  CONTAINER_SECRET=$(docker compose -f infra/docker-compose.yml exec -T backend env 2>/dev/null | grep JWT_SECRET_KEY | cut -d= -f2 || echo "")
  if [ "$ENV_SECRET" = "$CONTAINER_SECRET" ]; then
    echo -e "  ${GREEN}✓${NC} .env and backend container JWT_SECRET_KEY match"
    PASS=$((PASS + 1))
  elif [ -z "$CONTAINER_SECRET" ]; then
    echo -e "  ${YELLOW}⚠${NC} Backend container not running — can't verify JWT secret"
    WARN=$((WARN + 1))
  else
    echo -e "  ${RED}✗${NC} JWT_SECRET_KEY mismatch between .env and container (rebuild needed)"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "  ${RED}✗${NC} JWT_SECRET_KEY not found in .env"
  FAIL=$((FAIL + 1))
fi
echo ""

# 3. MOCK_AUTH passed to container
echo "Container Config:"
MOCK_VAL=$(docker compose -f infra/docker-compose.yml exec -T backend env 2>/dev/null | grep MOCK_AUTH | cut -d= -f2 || echo "")
if [ -n "$MOCK_VAL" ]; then
  echo -e "  ${GREEN}✓${NC} MOCK_AUTH=$MOCK_VAL in backend container"
  PASS=$((PASS + 1))
else
  warn_check "MOCK_AUTH in docker-compose.yml" "grep -q 'MOCK_AUTH' infra/docker-compose.yml"
fi
echo ""

# 4. Logto OIDC reachable
echo "Logto Cloud:"
ISSUER=$(grep '^AUTH_LOGTO_ISSUER=' .env 2>/dev/null | cut -d= -f2)
if [ -n "$ISSUER" ]; then
  check "OIDC discovery reachable" "curl -sf '${ISSUER}/.well-known/openid-configuration' | grep -q 'issuer'"
else
  echo -e "  ${RED}✗${NC} AUTH_LOGTO_ISSUER not set"
  FAIL=$((FAIL + 1))
fi
echo ""

# 5. Backend health + auth endpoint
echo "Backend:"
warn_check "Backend running at :8000" "curl -sf http://localhost:8000/health"
echo ""

# 6. Frontend
echo "Frontend:"
warn_check "Frontend running at :3000" "curl -sf http://localhost:3000 -o /dev/null"
warn_check "NextAuth providers endpoint" "curl -sf http://localhost:3000/api/auth/providers | grep -q 'logto'"
echo ""

# 7. Callback URL reminder
echo "Logto Cloud Console (manual check):"
echo -e "  ${YELLOW}→${NC} Verify redirect URI: http://localhost:3000/api/auth/callback/logto"
echo -e "  ${YELLOW}→${NC} Verify post-logout URI: http://localhost:3000"
echo ""

# Summary
TOTAL=$((PASS + FAIL + WARN))
echo "=== Results: ${PASS}/${TOTAL} passed, ${FAIL} failed, ${WARN} warnings ==="
if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}Fix the failures above before committing auth changes.${NC}"
  exit 1
else
  echo -e "${GREEN}Auth config looks good!${NC}"
fi
