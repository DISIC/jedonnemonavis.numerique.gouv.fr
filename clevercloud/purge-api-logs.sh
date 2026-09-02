#!/bin/bash -l
#
# Purge quotidienne du journal d'audit des open API (table ApiKeyLog).
#
# La logique de rétention vit dans le code applicatif
# (webapp-backoffice/src/server/open-api-log/policy.ts) ; ce script n'est que le
# point d'entrée cron. Voir aussi webapp-backoffice/scripts/purge-api-logs.ts.
#
# Clever Cloud :
#   - #!/bin/bash -l pour charger les variables d'environnement (POSTGRESQL_ADDON_URI…)
#   - clevercloud/cron.json est partagé par webapp-backoffice et webapp-form
#     (monorepo) : les gardes ci-dessous évitent les exécutions en double.
#
# Contrairement à la synchronisation Elasticsearch, ce script n'est pas épinglé
# sur l'APP_ID de production : chaque environnement (production, staging, dev)
# accumule ses propres lignes et doit les purger.
#
# Variables :
#   PURGE_API_LOGS_DISABLED=1   désactive la purge sur cet environnement
#   DRY_RUN=1                   compte sans supprimer

set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BACKOFFICE="${ROOT}/webapp-backoffice"

if [ "${PURGE_API_LOGS_DISABLED:-0}" = "1" ]; then
  echo "Skipping: PURGE_API_LOGS_DISABLED=1"
  exit 0
fi

# Une seule instance : la purge est globale, la rejouer en parallèle ne ferait
# que multiplier les DELETE concurrents sur les mêmes lignes.
if [ -n "${INSTANCE_NUMBER:-}" ] && [ "${INSTANCE_NUMBER}" != "0" ]; then
  echo "Skipping: INSTANCE_NUMBER ${INSTANCE_NUMBER} is not 0"
  exit 0
fi

# Le cron est déclaré à la racine du monorepo, donc lu par les deux applications.
# Seul le déploiement du backoffice installe ses dépendances : c'est ce qui
# distingue les deux sans avoir à épingler un identifiant d'application.
if [ ! -d "${BACKOFFICE}/node_modules" ]; then
  echo "Skipping: ${BACKOFFICE}/node_modules absent (application non backoffice)"
  exit 0
fi

cd "${BACKOFFICE}"

echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] purge du journal open API"
npm run --silent logs:purge
