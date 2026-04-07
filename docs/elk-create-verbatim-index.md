# Elasticsearch deployment guide for `jdma-answers-tokens`

## Objective

This setup builds a searchable index of verbatim answers enriched with the full review context.

At the end of the process:

- `jdma-review-context` contains one document per `review_id`
- `jdma-review-context-policy` exposes that review context to ingest pipelines
- `jdma_tokens_pipeline` enriches each verbatim answer with review-level context
- `jdma-answers-tokens` contains the final searchable documents

## Prerequisites

- Source index `jdma-answers` already exists and is populated
- Source documents contain at least:
  - `review_id`
  - `review_created_at`
  - `form_id`
  - `button_id`
  - `product_id`
  - `field_code`
  - `answer_text`
- `field_code.keyword` and `answer_text.keyword` are available in `jdma-answers`

---

## 1. Create target index `jdma-answers-tokens`

```json
PUT /jdma-answers-tokens
{
  "settings": {
    "index": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "routing": {
        "allocation": {
          "include": {
            "_tier_preference": "data_content"
          }
        }
      },
      "analysis": {
        "filter": {
          "my_shingle": {
            "type": "shingle",
            "min_shingle_size": 2,
            "max_shingle_size": 2,
            "output_unigrams": true
          },
          "my_french_stop": {
            "type": "stop",
            "stopwords": [
              "_french_",
              "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
              "me", "moi", "te", "toi", "se", "soi", "leur", "leurs", "lui", "eux",
              "ce", "cet", "cette", "ces", "cela", "ça", "ca", "ceci", "celui", "celle", "ceux", "c'",
              "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos",
              "y", "en", "ne", "n'", "pas", "jamais", "rien", "aucun", "aucune", "nul", "nulle",
              "et", "ou", "mais", "car", "donc", "or", "ni",
              "de", "du", "des", "d'",
              "la", "le", "les", "au", "aux",
              "dans", "sur", "sous", "chez", "par", "pour", "avec", "sans", "entre", "vers", "envers", "contre",
              "après", "avant", "depuis", "pendant", "durant",
              "comme", "ainsi", "alors", "puis",
              "ici", "là", "ailleurs", "déjà", "encore", "toujours", "souvent", "parfois", "rarement", "peu", "trop", "assez", "aussi",
              "que", "qu'", "qui", "dont", "où", "lorsque", "lorsqu'", "quand",
              "est", "a", "j'ai", "n'ai", "c'est", "n'est",
              "un", "une", "des", "si", "tout", "tous"
            ]
          }
        },
        "analyzer": {
          "keywords_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [
              "lowercase",
              "asciifolding",
              "my_french_stop",
              "my_shingle"
            ]
          },
          "standard_analyzer": {
            "type": "standard"
          }
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "review_id": {
        "type": "long"
      },
      "review_created_at": {
        "type": "date"
      },
      "form_id": {
        "type": "integer"
      },
      "button_id": {
        "type": "integer"
      },
      "product_id": {
        "type": "integer"
      },
      "field_code": {
        "type": "keyword"
      },
      "answer_text": {
        "type": "text",
        "analyzer": "standard_analyzer"
      },
      "answer_tokens": {
        "type": "text",
        "analyzer": "keywords_analyzer",
        "fielddata": true
      },
      "satisfaction": {
        "type": "keyword"
      },
      "review_answers": {
        "type": "flattened"
      }
    }
  }
}
```

---

## 2. Create review context index

This index stores one document per `review_id`.

```json
PUT /jdma-review-context
{
  "mappings": {
    "properties": {
      "review_id": {
        "type": "long"
      },
      "review_created_at": {
        "type": "date"
      },
      "form_id": {
        "type": "integer"
      },
      "button_id": {
        "type": "integer"
      },
      "product_id": {
        "type": "integer"
      },
      "review_answers": {
        "type": "flattened"
      }
    }
  }
}
```

---

## 3. Create enrich policy

This policy matches on `review_id` and exposes `review_answers` during ingest.

```json
PUT /_enrich/policy/jdma-review-context-policy
{
  "match": {
    "indices": "jdma-review-context",
    "match_field": "review_id",
    "enrich_fields": ["review_answers"]
  }
}
```

---

## 4. Create transform

This transform builds `jdma-review-context` from `jdma-answers`.

It:

- groups documents by `review_id`
- keeps the max value for `review_created_at`, `form_id`, `button_id`, and `product_id`
- builds a `review_answers` object of the form:
  - `field_code: answer_text`

The `sync` block makes this a **continuous transform**: it automatically picks up new documents from `jdma-answers` based on `review_created_at`, checking every 5 minutes.

```json
PUT /_transform/jdma-review-context-transform
{
  "source": {
    "index": "jdma-answers"
  },
  "dest": {
    "index": "jdma-review-context"
  },
  "sync": {
    "time": {
      "field": "review_created_at",
      "delay": "60s"
    }
  },
  "frequency": "5m",
  "pivot": {
    "group_by": {
      "review_id": {
        "terms": {
          "field": "review_id"
        }
      }
    },
    "aggregations": {
      "review_created_at": {
        "max": {
          "field": "review_created_at"
        }
      },
      "form_id": {
        "max": {
          "field": "form_id"
        }
      },
      "button_id": {
        "max": {
          "field": "button_id"
        }
      },
      "product_id": {
        "max": {
          "field": "product_id"
        }
      },
      "review_answers": {
        "scripted_metric": {
          "init_script": "state.answers = new HashMap();",
          "map_script": """
            if (!doc['field_code.keyword'].empty && !doc['answer_text.keyword'].empty) {
              state.answers.put(doc['field_code.keyword'].value, doc['answer_text.keyword'].value);
            }
          """,
          "combine_script": "return state.answers;",
          "reduce_script": """
            def merged = new HashMap();
            for (s in states) {
              if (s != null) {
                for (entry in s.entrySet()) {
                  merged.put(entry.getKey(), entry.getValue());
                }
              }
            }
            return merged;
          """
        }
      }
    }
  }
}
```

---

## 5. Start the transform

```json
POST /_transform/jdma-review-context-transform/_start
```

### Follow transform progress

In Kibana:

- **Stack Management** → **Transforms**

You can also inspect the destination index directly:

```json
GET /jdma-review-context/_count
```

```json
GET /jdma-review-context/_search
{
  "size": 10
}
```

Wait until `jdma-review-context` is populated before executing the enrich policy.

---

## 6. Execute the enrich policy

```json
POST /_enrich/policy/jdma-review-context-policy/_execute?wait_for_completion=false
```

### Follow enrich execution

In Kibana:

- **Stack Management** → **Index Management** → **Enrich Policies**

Useful API checks:

```json
GET /_enrich/_stats
```

If executed asynchronously, Elasticsearch returns a task id that can be tracked with:

```json
GET /_tasks/<task_id>
```

---

## 7. Create ingest pipeline

This pipeline:

- removes unused source fields
- copies `answer_text` into `answer_tokens`
- enriches each document with review context
- writes the review context into `review_answers`

```json
PUT /_ingest/pipeline/jdma_tokens_pipeline
{
  "processors": [
    {
      "remove": {
        "field": [
          "answer_item_id",
          "button_name",
          "created_at",
          "field_label",
          "intention",
          "kind",
          "parent_answer_id",
          "parent_answer_item_id",
          "parent_field_code",
          "product_name",
          "review_user_id"
        ],
        "ignore_missing": true
      }
    },
    {
      "set": {
        "field": "answer_tokens",
        "copy_from": "answer_text"
      }
    },
    {
      "enrich": {
        "policy_name": "jdma-review-context-policy",
        "field": "review_id",
        "target_field": "review_ctx",
        "ignore_missing": true
      }
    },
    {
      "rename": {
        "field": "review_ctx.review_answers",
        "target_field": "review_answers",
        "ignore_missing": true
      }
    },
    {
      "remove": {
        "field": ["review_ctx"],
        "ignore_missing": true
      }
    }
  ]
}
```

---

## 8. Reindex verbatim answers into `jdma-answers-tokens`

This step copies only documents where `field_code = verbatim`.

Each matching document is passed through `jdma_tokens_pipeline`, which adds `answer_tokens` and enriches the document with `review_answers`.

```json
POST /_reindex?wait_for_completion=false
{
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
    "pipeline": "jdma_tokens_pipeline"
  }
}
```

### Follow reindex progress

If the call returns a task id, track it with:

```json
GET /_tasks/<task_id>
```

You can also list reindex tasks:

```json
GET /_tasks?actions=*reindex&detailed=true
```

---

## 9. Validation checks

### Check destination count

```json
GET /jdma-answers-tokens/_count
```

### Inspect indexed documents

```json
GET /jdma-answers-tokens/_search
{
  "size": 10
}
```

### Example filter query

This searches `answer_tokens` and filters on review-level answers:

```json
GET /jdma-answers-tokens/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "answer_tokens": "lent"
          }
        }
      ],
      "filter": [
        {
          "term": {
            "review_answers.satisfaction": "Moyen"
          }
        },
        {
          "term": {
            "review_answers.comprehension": "3"
          }
        }
      ]
    }
  }
}
```

---

## 10. Nightly sync

The initial setup (steps 1–9) is a one-shot process. After that, new documents arriving in `jdma-answers` need two things to propagate to `jdma-answers-tokens`:

1. **Transform** — handled automatically by the continuous transform (sync block in step 4). It picks up new docs every 5 minutes.
2. **Enrich policy re-execution + incremental reindex** — must be triggered explicitly. The script `docker/elasticsearch/bin/sync-verbatim-index.sh` does both.

### What the script does

1. Re-executes `jdma-review-context-policy` so the ingest pipeline sees the latest review context
2. Incrementally reindexes new verbatim documents from `jdma-answers` into `jdma-answers-tokens` using `op_type: create` (skips already-indexed docs)
3. Validates counts between source and destination

### Deduplication guards

The monorepo is deployed on both webapp-backoffice and webapp-form instances. The script guards against duplicate execution:

- **`APP_ID`** — only runs on `app_bbb88831-8c1c-4c96-97df-bfaa51cee877` (webapp-backoffice), skips on webapp-form
- **`INSTANCE_NUMBER`** — only runs on instance `0`, skips on scaled instances

Both guards exit cleanly (`exit 0`) so Clever Cloud doesn't report cron failures.

### Usage

The script uses `#!/bin/bash -l` to load Clever Cloud env vars (`ES_ADDON_URI`, `ES_ADDON_USER`, `ES_ADDON_PASSWORD`).

```bash
# On Clever Cloud — triggered automatically via clevercloud/cron.json
# Manual local run:
ES_ADDON_URI=https://localhost:9200 ES_ADDON_USER=elastic ES_ADDON_PASSWORD=secret ./docker/elasticsearch/bin/sync-verbatim-index.sh
```

### Clever Cloud cron setup

The cron is defined in `clevercloud/cron.json` (runs nightly at 2am UTC):

```json
[
  "0 2 * * * $ROOT/docker/elasticsearch/bin/sync-verbatim-index.sh >> /tmp/jdma-es-sync.log 2>&1"
]
```

This file is picked up automatically by Clever Cloud on deploy. Since both apps share the monorepo, the `cron.json` will be present on both, but the `APP_ID` guard in the script ensures it only actually runs on webapp-backoffice.

### Upgrading an existing (batch) transform to continuous

If the transform was already created without the `sync` block, stop it, update it, and restart:

```json
POST /_transform/jdma-review-context-transform/_stop

POST /_transform/jdma-review-context-transform/_update
{
  "sync": {
    "time": {
      "field": "review_created_at",
      "delay": "60s"
    }
  },
  "frequency": "5m"
}

POST /_transform/jdma-review-context-transform/_start
```

---

## Notes and caveats

- The transform assumes `jdma-answers` exposes `field_code.keyword` and `answer_text.keyword`
- If the same `field_code` appears multiple times for the same `review_id`, the scripted metric keeps the last value merged during reduction
- The enrich policy must be re-executed each time `jdma-review-context` is refreshed and you want the pipeline to use the updated data
- `review_answers` is mapped as `flattened`, which is appropriate for exact-match filtering on dynamic keys
