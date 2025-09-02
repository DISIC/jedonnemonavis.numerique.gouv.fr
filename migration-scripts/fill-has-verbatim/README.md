# Has Verbatim Migration Script

This script updates the `has_verbatim` field for existing reviews in the database that have verbatim answers but aren't marked as such.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Copy and configure environment variables:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

## Usage

### Dry Run (Recommended First)

```bash
python update_has_verbatim.py --cutoff-date "2024-12-01" --dry-run
```

### Actual Migration

```bash
python update_has_verbatim.py --cutoff-date "2024-12-01"
```

### Options

- `--cutoff-date`: Only update reviews created before this date (YYYY-MM-DD format)
- `--dry-run`: Show statistics without making any changes
- `--database-url`: Override database URL (optional, uses env var by default)

## How It Works

1. **Statistics**: Shows how many reviews need updating
2. **Temporary Table**: Creates a temp table with reviews that have verbatim answers
3. **Batch Processing**: Updates reviews in batches of 1,000 for optimal performance
4. **Progress Tracking**: Shows real-time progress and logs everything
5. **Verification**: Shows final statistics after completion

## Performance Optimizations

- Uses existing database indexes on `Answer(review_id, field_code)`
- Processes in batches to avoid memory issues
- Uses temporary tables for efficient joins
- Commits after each batch to avoid long-running transactions
- Filters out empty verbatim answers

## Safety Features

- Dry run mode to preview changes
- User confirmation before actual updates
- Comprehensive logging to `migration.log`
- Transaction rollback on errors
- Progress tracking and statistics

## Expected Performance

For 16M reviews with 54M answers:

- Dry run: ~2-5 minutes
- Actual migration: ~30-60 minutes (depending on how many need updates)

The script is designed to be resumable - if it fails, you can run it again and it will only process remaining reviews.
