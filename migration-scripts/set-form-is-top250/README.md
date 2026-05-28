# set-form-is-top250

Backfill migration: sets `Form.isTop250 = true` on the root form of every service
currently marked as `Product.isTop250 = true`.

**Run this BEFORE the Prisma migration `20260526120000_form_is_top250`**, which
drops the `Product.isTop250` column.

## Setup

```bash
pip install psycopg2-binary python-dotenv
```

## Usage

```bash
# Preview what will change (no writes)
python set_form_is_top250.py --dry-run

# Run against the database defined in .env (POSTGRESQL_ADDON_URI)
python set_form_is_top250.py

# Run against a specific database
python set_form_is_top250.py --database-url postgresql://user:pass@host:5432/db
```

## What it does

For each `Product` where `isTop250 = true`:
- Finds its `Form(s)` linked to the `FormTemplate` with `slug = 'root'`
- Sets `Form.isTop250 = true` on those forms
- Logs any Top250 product that has no root form (requires manual investigation)

A log file `set_form_is_top250.log` is written alongside the script.
