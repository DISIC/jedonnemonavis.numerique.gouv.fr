#!/usr/bin/env python3
"""
Migration script to update has_verbatim field for existing reviews.

This script efficiently updates the has_verbatim field in the Review table
for reviews created before a specific date that have verbatim answers.

Usage:
    python update_has_verbatim.py --cutoff-date "2024-12-01"

Requirements:
    pip install psycopg2-binary python-dotenv
"""

import os
import sys
import argparse
import logging
from datetime import datetime
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class VerbatimMigration:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.conn = None
        self.batch_size = 10000  # Process reviews in batches
        self.update_batch_size = 1000  # Update in smaller batches for better performance
        
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(self.database_url)
            self.conn.autocommit = False
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def get_stats(self, cutoff_date: str) -> dict:
        """Get statistics about reviews to be processed"""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Total reviews before cutoff date
            cur.execute("""
                SELECT COUNT(*) as total_reviews
                FROM public."Review" 
                WHERE created_at < %s
            """, (cutoff_date,))
            total_reviews = cur.fetchone()['total_reviews']
            
            # Reviews already marked as has_verbatim = true
            cur.execute("""
                SELECT COUNT(*) as already_marked
                FROM public."Review" 
                WHERE created_at < %s AND has_verbatim = true
            """, (cutoff_date,))
            already_marked = cur.fetchone()['already_marked']
            
            # Reviews that need to be updated (have verbatim answers but not marked)
            cur.execute("""
                SELECT COUNT(*) as need_update
                FROM (
                    SELECT DISTINCT r.id, r.created_at
                    FROM public."Review" r
                    INNER JOIN public."Answer" a ON a.review_id = r.id AND a.review_created_at = r.created_at
                    WHERE r.created_at < %s 
                    AND r.has_verbatim = false
                    AND a.field_code = 'verbatim'
                    AND a.answer_text IS NOT NULL 
                    AND TRIM(a.answer_text) != ''
                ) as distinct_reviews
            """, (cutoff_date,))
            need_update = cur.fetchone()['need_update']
            
            return {
                'total_reviews': total_reviews,
                'already_marked': already_marked,
                'need_update': need_update
            }
    
    def create_temp_table(self):
        """Create temporary table for batch processing"""
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TEMP TABLE temp_reviews_with_verbatim (
                    review_id INT,
                    review_created_at TIMESTAMP,
                    PRIMARY KEY (review_id, review_created_at)
                )
            """)
            logger.info("Temporary table created")
    
    def populate_temp_table(self, cutoff_date: str):
        """Populate temporary table with reviews that have verbatim answers"""
        with self.conn.cursor() as cur:
            logger.info("Populating temporary table with reviews that have verbatim answers...")
            
            # Use INSERT INTO ... SELECT for better performance
            cur.execute("""
                INSERT INTO temp_reviews_with_verbatim (review_id, review_created_at)
                SELECT DISTINCT r.id, r.created_at
                FROM public."Review" r
                INNER JOIN public."Answer" a ON a.review_id = r.id AND a.review_created_at = r.created_at
                WHERE r.created_at < %s 
                AND r.has_verbatim = false
                AND a.field_code = 'verbatim'
                AND a.answer_text IS NOT NULL 
                AND TRIM(a.answer_text) != ''
            """, (cutoff_date,))
            
            rows_inserted = cur.rowcount
            logger.info(f"Temporary table populated with {rows_inserted} reviews")
            return rows_inserted
    
    def update_reviews_batch(self, offset: int, limit: int) -> int:
        """Update a batch of reviews"""
        with self.conn.cursor() as cur:
            cur.execute("""
                UPDATE public."Review" 
                SET has_verbatim = true
                WHERE (id, created_at) IN (
                    SELECT review_id, review_created_at 
                    FROM temp_reviews_with_verbatim 
                    ORDER BY review_id, review_created_at
                    LIMIT %s OFFSET %s
                )
            """, (limit, offset))
            
            updated_count = cur.rowcount
            return updated_count
    
    def run_migration(self, cutoff_date: str, dry_run: bool = False):
        """Run the complete migration"""
        try:
            self.connect()
            
            # Get initial statistics
            stats = self.get_stats(cutoff_date)
            logger.info(f"Migration Statistics:")
            logger.info(f"  Total reviews before {cutoff_date}: {stats['total_reviews']:,}")
            logger.info(f"  Already marked with verbatim: {stats['already_marked']:,}")
            logger.info(f"  Need to be updated: {stats['need_update']:,}")
            
            if stats['need_update'] == 0:
                logger.info("No reviews need to be updated. Migration complete.")
                return
            
            if dry_run:
                logger.info("DRY RUN MODE - No actual updates will be performed")
                return
            
            # Confirm before proceeding
            if not self._confirm_migration(stats['need_update']):
                logger.info("Migration cancelled by user")
                return
            
            # Create and populate temporary table
            self.create_temp_table()
            rows_to_process = self.populate_temp_table(cutoff_date)
            
            if rows_to_process == 0:
                logger.info("No reviews found to update")
                return
            
            # Process in batches
            total_updated = 0
            offset = 0
            
            logger.info(f"Starting batch updates (batch size: {self.update_batch_size})")
            
            while offset < rows_to_process:
                try:
                    updated_count = self.update_reviews_batch(offset, self.update_batch_size)
                    total_updated += updated_count
                    offset += self.update_batch_size
                    
                    # Commit after each batch
                    self.conn.commit()
                    
                    progress = min(offset, rows_to_process)
                    percentage = (progress / rows_to_process) * 100
                    logger.info(f"Progress: {progress:,}/{rows_to_process:,} ({percentage:.1f}%) - Updated: {updated_count:,}")
                    
                except Exception as e:
                    logger.error(f"Error in batch starting at offset {offset}: {e}")
                    self.conn.rollback()
                    raise
            
            logger.info(f"Migration completed successfully!")
            logger.info(f"Total reviews updated: {total_updated:,}")
            
            # Verify results
            final_stats = self.get_stats(cutoff_date)
            logger.info(f"Final statistics:")
            logger.info(f"  Reviews marked with verbatim: {final_stats['already_marked']:,}")
            logger.info(f"  Reviews still needing update: {final_stats['need_update']:,}")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            if self.conn:
                self.conn.rollback()
            raise
        finally:
            self.disconnect()
    
    def _confirm_migration(self, count: int) -> bool:
        """Ask user confirmation before proceeding"""
        response = input(f"\nThis will update {count:,} reviews. Continue? (y/N): ")
        return response.lower() in ['y', 'yes']

def main():
    parser = argparse.ArgumentParser(description='Update has_verbatim field for existing reviews')
    parser.add_argument('--cutoff-date', required=True, 
                       help='Only update reviews created before this date (YYYY-MM-DD)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be updated without making changes')
    parser.add_argument('--database-url', 
                       help='Database URL (defaults to POSTGRESQL_ADDON_URI env var)')
    
    args = parser.parse_args()
    
    # Validate cutoff date
    try:
        datetime.strptime(args.cutoff_date, '%Y-%m-%d')
    except ValueError:
        logger.error("Invalid date format. Use YYYY-MM-DD")
        sys.exit(1)
    
    # Get database URL
    database_url = args.database_url or os.getenv('POSTGRESQL_ADDON_URI')
    if not database_url:
        logger.error("Database URL not provided. Set POSTGRESQL_ADDON_URI env var or use --database-url")
        sys.exit(1)
    
    # Run migration
    migration = VerbatimMigration(database_url)
    migration.run_migration(args.cutoff_date, args.dry_run)

if __name__ == '__main__':
    main()