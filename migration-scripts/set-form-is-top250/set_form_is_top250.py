#!/usr/bin/env python3
"""
Migration script: set Form.isTop250 = true for existing démarche essentielle services.

For each Product where isTop250 = true, marks the corresponding Form(s) with
form_template.slug = 'root' as isTop250 = true.

Run BEFORE the Prisma migration that drops Product.isTop250.

Usage:
    python set_form_is_top250.py
    python set_form_is_top250.py --dry-run
    python set_form_is_top250.py --database-url postgresql://...

Requirements:
    pip install psycopg2-binary python-dotenv
"""

import os
import sys
import argparse
import logging
from typing import List, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('set_form_is_top250.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class FormTop250Migration:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.conn = None

    def connect(self):
        try:
            self.conn = psycopg2.connect(self.database_url)
            self.conn.autocommit = False
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    def disconnect(self):
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def get_target_forms(self) -> List[Tuple[int, int, str]]:
        """Return (form_id, product_id, product_title) for root forms of Top250 products."""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT f.id AS form_id, p.id AS product_id, p.title AS product_title
                FROM "Form" f
                JOIN "Product" p ON f.product_id = p.id
                JOIN "FormTemplate" ft ON f.form_template_id = ft.id
                WHERE p."isTop250" = true
                  AND ft.slug = 'root'
                  AND (f."isTop250" IS NULL OR f."isTop250" = false)
                ORDER BY p.id, f.id
            """)
            return cur.fetchall()

    def get_stats(self):
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT COUNT(*) AS top250_products
                FROM "Product"
                WHERE "isTop250" = true
            """)
            top250_products = cur.fetchone()['top250_products']

            cur.execute("""
                SELECT COUNT(*) AS already_migrated
                FROM "Form" f
                JOIN "Product" p ON f.product_id = p.id
                JOIN "FormTemplate" ft ON f.form_template_id = ft.id
                WHERE p."isTop250" = true
                  AND ft.slug = 'root'
                  AND f."isTop250" = true
            """)
            already_migrated = cur.fetchone()['already_migrated']

            cur.execute("""
                SELECT COUNT(*) AS top250_products_without_root_form
                FROM "Product" p
                WHERE p."isTop250" = true
                  AND NOT EXISTS (
                    SELECT 1 FROM "Form" f
                    JOIN "FormTemplate" ft ON f.form_template_id = ft.id
                    WHERE f.product_id = p.id AND ft.slug = 'root'
                  )
            """)
            without_root = cur.fetchone()['top250_products_without_root_form']

            return {
                'top250_products': top250_products,
                'already_migrated': already_migrated,
                'without_root_form': without_root,
            }

    def run(self, dry_run: bool = False):
        try:
            self.connect()

            stats = self.get_stats()
            logger.info("=== Pre-migration statistics ===")
            logger.info(f"  Top250 products total:               {stats['top250_products']}")
            logger.info(f"  Root forms already marked isTop250:  {stats['already_migrated']}")
            logger.info(f"  Top250 products without root form:   {stats['without_root_form']}")

            if stats['without_root_form'] > 0:
                logger.warning(
                    f"{stats['without_root_form']} Top250 product(s) have no root form — "
                    "they will be skipped. Investigate before running the Prisma migration."
                )

            targets = self.get_target_forms()

            if not targets:
                logger.info("Nothing to migrate — all root forms are already marked.")
                return

            logger.info(f"\n{len(targets)} form(s) to update:")
            for row in targets:
                logger.info(
                    f"  form_id={row['form_id']}  product_id={row['product_id']}  "
                    f"product='{row['product_title']}'"
                )

            if dry_run:
                logger.info("\nDRY RUN — no changes written.")
                return

            response = input(f"\nUpdate {len(targets)} form(s)? (y/N): ")
            if response.lower() not in ('y', 'yes'):
                logger.info("Migration cancelled.")
                return

            form_ids = [row['form_id'] for row in targets]

            with self.conn.cursor() as cur:
                cur.execute(
                    'UPDATE "Form" SET "isTop250" = true WHERE id = ANY(%s)',
                    (form_ids,)
                )
                updated = cur.rowcount

            self.conn.commit()
            logger.info(f"\nMigration complete — {updated} form(s) updated.")

        except Exception as e:
            logger.error(f"Migration failed: {e}")
            if self.conn:
                self.conn.rollback()
            raise
        finally:
            self.disconnect()


def main():
    parser = argparse.ArgumentParser(
        description="Set Form.isTop250 = true for root forms of Top250 products"
    )
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without writing anything')
    parser.add_argument('--database-url',
                        help='PostgreSQL connection string (default: POSTGRESQL_ADDON_URI)')
    args = parser.parse_args()

    database_url = args.database_url or os.getenv('POSTGRESQL_ADDON_URI')
    if not database_url:
        logger.error("No database URL. Set POSTGRESQL_ADDON_URI or pass --database-url.")
        sys.exit(1)

    FormTop250Migration(database_url).run(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
