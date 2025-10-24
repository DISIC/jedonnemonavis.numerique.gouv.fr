# Export Satisfaction Evolution

This script exports satisfaction evolution data for all products over the last 2 years, divided into 3-month periods.

## Setup

1. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Edit `.env` file with your actual database and API configuration:

```
DATABASE_URL=postgresql://user:password@127.0.0.1:5434/jdma
API_BASE_URL=http://localhost:3000
```

## Usage

Run the script:

```bash
python export_satisfaction_evolution.py
```

The script will:

1. Connect to the PostgreSQL database
2. Fetch all product IDs and names from the `public.Product` table
3. Generate 8 date ranges of 3 months each, going back 2 years
4. For each product and date range, call the API endpoint `/api/trpc/answer.getObservatoireStats`
5. Extract satisfaction scores from the API responses
6. Export the data to a CSV file with timestamp

## Output

The CSV file will contain:

- `product_id`: The product ID
- `product_name`: The product name
- `satisfaction_range_1_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the first 3-month period
- `satisfaction_range_2_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the second 3-month period
- `satisfaction_range_3_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the third 3-month period
- `satisfaction_range_4_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the fourth 3-month period
- `satisfaction_range_5_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the fifth 3-month period
- `satisfaction_range_6_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the sixth 3-month period
- `satisfaction_range_7_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the seventh 3-month period
- `satisfaction_range_8_YYYY-MM-DD_to_YYYY-MM-DD`: Satisfaction score for the eighth 3-month period

## Notes

- The script handles approximately 2000 products as mentioned
- API calls are made sequentially to avoid overwhelming the server
- Missing or invalid data is represented as `None` in the CSV
- The script includes error handling for database and API failures
