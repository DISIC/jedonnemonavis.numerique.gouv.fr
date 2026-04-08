#!/bin/bash -l
#
# Nightly sync for jdma-answers-tokens
#
# Re-executes the enrich policy (so the ingest pipeline sees fresh review context)
# then incrementally reindexes new verbatim documents.
#
# The continuous transform (jdma-review-context-transform) handles populating
# jdma-review-context automatically — this script only covers the two steps
# that Elasticsearch cannot automate: enrich re-execution and reindex.
#
# Clever Cloud:
#   - Uses #!/bin/bash -l to load env vars (ES_ADDON_URI, etc.)
#   - Guards on APP_ID + INSTANCE_NUMBER to avoid duplicate runs
#     (monorepo: both webapp-backoffice and webapp-form have this code)
#
# Environment variables (Clever Cloud defaults, overridable):
#   ES_ADDON_URI       Elasticsearch URL        (default: https://localhost:9200)
#   ES_ADDON_USER      Elasticsearch user       (default: elastic)
#   ES_ADDON_PASSWORD  Elasticsearch password   (required, no default)
#   ES_CACERT          Path to CA certificate   (optional, skips TLS verify if unset)

set -euo pipefail

# ── Clever Cloud deduplication guards ───────────────────────────────────────
# Only run on webapp-backoffice instance 0 to prevent duplicate execution
# across scaled instances and across apps sharing the monorepo.

TARGET_APP_ID="app_bbb88831-8c1c-4c96-97df-bfaa51cee877"

if [ -n "${APP_ID:-}" ] && [ "${APP_ID}" != "${TARGET_APP_ID}" ]; then
  echo "Skipping: APP_ID ${APP_ID} is not the target app (${TARGET_APP_ID})"
  exit 0
fi

if [ -n "${INSTANCE_NUMBER:-}" ] && [ "${INSTANCE_NUMBER}" != "0" ]; then
  echo "Skipping: INSTANCE_NUMBER ${INSTANCE_NUMBER} is not 0"
  exit 0
fi

# ── Elasticsearch connection ────────────────────────────────────────────────

ES_HOST="${ES_ADDON_URI:-https://localhost:9200}"
ES_USER="${ES_ADDON_USER:-elastic}"
ES_PASSWORD="${ES_ADDON_PASSWORD:-}"

if [ -z "${ES_PASSWORD}" ]; then
  echo "ERROR: ES_ADDON_PASSWORD is required" >&2
  exit 1
fi

CURL_OPTS=(-s -u "${ES_USER}:${ES_PASSWORD}")
if [ -n "${ES_CACERT:-}" ]; then
  CURL_OPTS+=(--cacert "${ES_CACERT}")
else
  CURL_OPTS+=(-k)
fi

log() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"
}

es_request() {
  local method="$1" path="$2"
  shift 2
  curl "${CURL_OPTS[@]}" -X "${method}" "${ES_HOST}${path}" \
    -H 'Content-Type: application/json' "$@"
}

# ── Step 1: Re-execute enrich policy ────────────────────────────────────────

log "Re-executing enrich policy jdma-review-context-policy..."

response=$(es_request POST "/_enrich/policy/jdma-review-context-policy/_execute?wait_for_completion=true")

if echo "${response}" | grep -q '"error"'; then
  log "ERROR: enrich policy execution failed"
  echo "${response}" >&2
  exit 1
fi

log "Enrich policy re-executed successfully."

# ── Step 2: Incremental reindex ─────────────────────────────────────────────
#
# op_type: create → only indexes documents whose _id doesn't already exist
# in jdma-answers-tokens, so previously indexed docs are skipped.
# conflicts: proceed → don't fail on version conflicts from existing docs.

log "Starting incremental reindex of verbatim answers..."

response=$(es_request POST "/_reindex?wait_for_completion=true" -d '{
  "conflicts": "proceed",
  "source": {
    "index": "jdma-answers",
    "query": {
      "term": {
        "field_code.keyword": "verbatim"
      }
    }
  },
  "dest": {
    "index": "jdma-answers-tokens",
    "pipeline": "jdma_tokens_pipeline",
    "op_type": "create"
  }
}')

created=$(echo "${response}" | grep -o '"created":[0-9]*' | cut -d: -f2)
failures=$(echo "${response}" | grep -o '"failures":\[.*\]' | head -1)

if [ -n "${failures}" ] && [ "${failures}" != '"failures":[]' ]; then
  log "WARNING: reindex completed with failures"
  echo "${response}" >&2
else
  log "Reindex complete. New documents indexed: ${created:-0}"
fi

# ── Step 3: Quick validation ────────────────────────────────────────────────

answers_count=$(es_request GET "/jdma-answers/_count?q=field_code.keyword:verbatim" | grep -o '"count":[0-9]*' | cut -d: -f2)
tokens_count=$(es_request GET "/jdma-answers-tokens/_count" | grep -o '"count":[0-9]*' | cut -d: -f2)

log "Validation: jdma-answers verbatim=${answers_count:-?}, jdma-answers-tokens=${tokens_count:-?}"

if [ "${answers_count:-0}" != "${tokens_count:-0}" ]; then
  log "WARNING: counts differ — some documents may have failed enrichment (missing review context at time of indexing)"
fi

log "Done."
