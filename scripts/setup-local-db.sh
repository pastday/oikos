#!/usr/bin/env bash
#
# 로컬 개발용 PostgreSQL 역할(role)과 데이터베이스를 생성한다.
#
# 사용법:
#   sudo bash scripts/setup-local-db.sh
#
# - 접속정보는 프로젝트 루트의 .env 안 DATABASE_URL 에서 읽는다.
#   따라서 이 스크립트에는 비밀번호가 하드코딩되어 있지 않으며 Git 에 커밋해도 안전하다.
# - Docker 는 사용하지 않는다. 시스템에 설치된 PostgreSQL 을 대상으로 한다.
# - 이 개발 PC 의 5432 포트는 다른 프로젝트의 컨테이너가 점유 중이므로
#   PostgreSQL 클러스터 포트를 .env 에 지정된 포트로 맞춘다.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"

if [[ "${EUID}" -ne 0 ]]; then
  echo "오류: root 권한이 필요합니다.  sudo bash scripts/setup-local-db.sh" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "오류: ${ENV_FILE} 이 없습니다. .env.example 을 복사해 먼저 만드세요." >&2
  exit 1
fi

# --- DATABASE_URL 파싱 -------------------------------------------------------
DATABASE_URL="$(grep -E '^DATABASE_URL=' "${ENV_FILE}" | head -1 | cut -d= -f2- | tr -d '"')"

if [[ -z "${DATABASE_URL}" ]]; then
  echo "오류: .env 에서 DATABASE_URL 을 찾지 못했습니다." >&2
  exit 1
fi

# postgresql://USER:PASSWORD@HOST:PORT/DBNAME?params
DB_USER="$(sed -E 's#^postgresql://([^:]+):.*#\1#' <<<"${DATABASE_URL}")"
DB_PASS="$(sed -E 's#^postgresql://[^:]+:([^@]+)@.*#\1#' <<<"${DATABASE_URL}")"
DB_PORT="$(sed -E 's#^postgresql://[^@]+@[^:]+:([0-9]+)/.*#\1#' <<<"${DATABASE_URL}")"
DB_NAME="$(sed -E 's#^postgresql://[^@]+@[^/]+/([^?]+).*#\1#' <<<"${DATABASE_URL}")"

if [[ -z "${DB_USER}" || -z "${DB_PASS}" || -z "${DB_PORT}" || -z "${DB_NAME}" ]]; then
  echo "오류: DATABASE_URL 형식을 해석하지 못했습니다." >&2
  exit 1
fi

echo "대상 DB   : ${DB_NAME}"
echo "대상 사용자: ${DB_USER}"
echo "대상 포트  : ${DB_PORT}"
echo

# --- 클러스터 포트 확인 ------------------------------------------------------
PG_VERSION="$(ls -1 /etc/postgresql 2>/dev/null | sort -V | tail -1 || true)"
if [[ -z "${PG_VERSION}" ]]; then
  echo "오류: PostgreSQL 클러스터를 찾을 수 없습니다. 먼저 PostgreSQL 을 설치하세요." >&2
  exit 1
fi

CURRENT_PORT="$(pg_conftool "${PG_VERSION}" main show port 2>/dev/null | grep -oE '[0-9]+' || echo "")"
if [[ "${CURRENT_PORT}" != "${DB_PORT}" ]]; then
  echo "클러스터 ${PG_VERSION}/main 포트를 ${CURRENT_PORT:-미확인} -> ${DB_PORT} 로 변경합니다."
  pg_conftool "${PG_VERSION}" main set port "${DB_PORT}"
  systemctl restart "postgresql@${PG_VERSION}-main"
  sleep 2
fi

pg_isready -p "${DB_PORT}" -q || {
  echo "오류: 포트 ${DB_PORT} 에서 PostgreSQL 이 응답하지 않습니다." >&2
  exit 1
}

# --- 역할 및 DB 생성 ---------------------------------------------------------
# 비밀번호는 psql 변수로 전달해 셸 히스토리/프로세스 목록 노출을 줄인다.
# CREATEDB 는 prisma migrate dev 의 shadow database 생성에 필요하다.
# superuser 권한은 부여하지 않는다.
sudo -u postgres psql -p "${DB_PORT}" -v ON_ERROR_STOP=1 \
  -v db_user="${DB_USER}" -v db_pass="${DB_PASS}" -v db_name="${DB_NAME}" <<'SQL'
\set quoted_user '\'' :db_user '\''
\set quoted_pass '\'' :db_pass '\''

SELECT format(
  'CREATE ROLE %I LOGIN CREATEDB PASSWORD %L',
  :'db_user', :'db_pass'
) AS stmt
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'db_user')
\gexec

SELECT format('ALTER ROLE %I PASSWORD %L', :'db_user', :'db_pass') \gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user') AS stmt
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db_name')
\gexec
SQL

# public 스키마 소유권 이전 (PostgreSQL 15+ 기본 권한 변경 대응)
sudo -u postgres psql -p "${DB_PORT}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 \
  -v db_user="${DB_USER}" <<'SQL'
SELECT format('ALTER SCHEMA public OWNER TO %I', :'db_user') \gexec
SQL

echo
echo "완료: 데이터베이스 '${DB_NAME}' 와 사용자 '${DB_USER}' 가 준비되었습니다."
echo "다음 단계: npx prisma migrate dev --name init"
