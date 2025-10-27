#!/usr/bin/env python3
"""
Export Satisfaction Evolution Script

This script exports satisfaction evolution data for all products over the last 2 years,
divided into 3-month periods.
"""

import os
import sys
import json
import csv
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import psycopg2
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SatisfactionExporter:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        self.api_base_url = os.getenv('API_BASE_URL')
        self.session_token = os.getenv('SESSION_TOKEN')
        
        if not self.db_url or not self.api_base_url or not self.session_token:
            raise ValueError("DATABASE_URL, API_BASE_URL and SESSION_TOKEN must be set in .env file")
    
    def connect_to_database(self):
        """Connect to PostgreSQL database"""
        try:
            conn = psycopg2.connect(self.db_url)
            return conn
        except Exception as e:
            print(f"Error connecting to database: {e}")
            sys.exit(1)
    
    def get_all_product_ids(self) -> List[Dict]:
        """Fetch all product IDs and names from the database"""
        conn = self.connect_to_database()
        cursor = conn.cursor()
        
        try:
            query = "SELECT id, title FROM public.\"Product\""
            cursor.execute(query)
            products = cursor.fetchall()
            
            product_list = []
            for product in products:
                product_list.append({
                    'id': product[0],
                    'name': product[1] or f"Product {product[0]}"
                })

            
            print(f"Found {len(product_list)} products")
            return product_list
            
        except Exception as e:
            print(f"Error fetching products: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    def generate_date_ranges(self) -> List[Dict]:
        """Generate 8 date ranges of 3 months each, going back 2 years"""
        now = datetime.now()
        ranges = []
        
        for i in range(8):
            # Calculate end date (3 months back from previous range)
            end_date = now - timedelta(days=i * 90)  # Approximately 3 months
            start_date = end_date - timedelta(days=90)  # 3 months before end_date
            
            # Convert to milliseconds (timestamp * 1000)
            start_ms = int(start_date.timestamp() * 1000)
            end_ms = int(end_date.timestamp() * 1000)
            
            ranges.append({
                'start_date': start_ms,
                'end_date': end_ms,
                'label': f"{start_date.strftime('%Y-%m')} to {end_date.strftime('%Y-%m')}"
            })
        
        # Reverse to have chronological order
        ranges.reverse()
        return ranges
    
    def get_satisfaction_data(self, product_id: int, start_date: int, end_date: int) -> Optional[float]:
        """Fetch satisfaction data for a product in a given date range"""
        url = f"{self.api_base_url}/api/trpc/answer.getObservatoireStats"
        
        # Convert payload structure to query parameters (convert milliseconds to strings)
        input_json = json.dumps({
            "product_id": product_id,
            "start_date": str(start_date),
            "end_date": str(end_date)
        })
        
        params = {
            "input": json.dumps({"json": json.loads(input_json)})
        }
        
        # Add headers to mimic browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cookie': f'__Secure-next-auth.session-token={self.session_token}'
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Navigate to the satisfaction data
            if 'result' in data and 'data' in data['result'] and 'json' in data['result']['data']:
                json_data = data['result']['data']['json']
                if 'data' in json_data and 'satisfaction' in json_data['data']:
                    return json_data['data']['satisfaction']
            
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"API request failed for product {product_id}: {e}")
            return None
        except (KeyError, TypeError) as e:
            print(f"Error parsing response for product {product_id}: {e}")
            return None
    
    def export_to_csv(self, data: List[Dict], filename: str = None):
        """Export data to CSV file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"satisfaction_evolution_{timestamp}.csv"
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                if not data:
                    print("No data to export")
                    return
                
                fieldnames = data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for row in data:
                    writer.writerow(row)
                
                print(f"Data exported to {filename}")
                
        except Exception as e:
            print(f"Error writing CSV file: {e}")
    
    def run_export(self):
        """Main export process"""
        print("Starting satisfaction evolution export...")
        
        # Get all products
        products = self.get_all_product_ids()
        if not products:
            print("No products found")
            return
        
        # Generate date ranges
        date_ranges = self.generate_date_ranges()
        print(f"Generated {len(date_ranges)} date ranges:")
        for i, range_info in enumerate(date_ranges):
            print(f"  Range {i+1}: {range_info['label']}")
        
        # Prepare data structure
        export_data = []
        
        # Process each product
        for idx, product in enumerate(products):
            print(f"Processing product {idx+1}/{len(products)}: {product['name']} (ID: {product['id']})")
            
            row_data = {
                'product_id': product['id'],
                'product_name': product['name']
            }
            
            # Get satisfaction data for each date range
            range_results = []
            for i, date_range in enumerate(date_ranges):
                satisfaction = self.get_satisfaction_data(
                    product['id'],
                    date_range['start_date'],
                    date_range['end_date']
                )
                
                # Convert milliseconds back to readable dates for column names
                start_readable = datetime.fromtimestamp(date_range['start_date'] / 1000).strftime('%Y-%m-%d')
                end_readable = datetime.fromtimestamp(date_range['end_date'] / 1000).strftime('%Y-%m-%d')
                column_name = f"satisfaction_range_{i+1}_{start_readable}_to_{end_readable}"
                row_data[column_name] = satisfaction
                
                if satisfaction is not None:
                    range_results.append(f"Range {i+1}: {satisfaction:.2f}")
                else:
                    range_results.append(f"Range {i+1}: No data")
            
            print(f"  {' / '.join(range_results)}")
            
            export_data.append(row_data)
        
        # Export to CSV
        self.export_to_csv(export_data)
        print("Export completed!")

def main():
    """Main function"""
    try:
        exporter = SatisfactionExporter()
        exporter.run_export()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()