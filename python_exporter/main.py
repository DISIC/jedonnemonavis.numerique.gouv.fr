import http.server
import socketserver
import threading
import time
import requests
import boto3
import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from io import StringIO
import csv
from datetime import datetime
import re
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header

# Charger les variables d'environnement à partir du fichier .env
load_dotenv()

# Vérifier la présence des variables d'environnement
required_env_vars = [
    'POSTGRESQL_ADDON_URI', 'PAGE_SIZE', 'CONCURRENCY_LIMIT',
    'CELLAR_ADDON_HOST', 'CELLAR_ADDON_KEY_ID', 'CELLAR_ADDON_KEY_SECRET', 'BUCKET_NAME',
    'NODEMAILER_HOST', 'NODEMAILER_PORT', 'NODEMAILER_FROM', 'MAILPACE_API_KEY'
]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise EnvironmentError(f"Les variables d'environnement suivantes sont manquantes: {', '.join(missing_vars)}")

POSTGRESQL_ADDON_URI = os.getenv('POSTGRESQL_ADDON_URI')
PAGE_SIZE = int(os.getenv('PAGE_SIZE'))
CONCURRENCY_LIMIT = int(os.getenv('CONCURRENCY_LIMIT'))

CELLAR_ADDON_HOST = os.getenv('CELLAR_ADDON_HOST')
CELLAR_ADDON_KEY_ID = os.getenv('CELLAR_ADDON_KEY_ID')
CELLAR_ADDON_KEY_SECRET = os.getenv('CELLAR_ADDON_KEY_SECRET')
BUCKET_NAME = os.getenv('BUCKET_NAME')

NODEMAILER_HOST = os.getenv('NODEMAILER_HOST')
NODEMAILER_PORT = int(os.getenv('NODEMAILER_PORT'))
NODEMAILER_FROM = os.getenv('NODEMAILER_FROM')
MAILPACE_API_KEY = os.getenv('MAILPACE_API_KEY')

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        main()
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Export process initiated")

def run_server():
    with socketserver.TCPServer(("", 8080), Handler) as httpd:
        print("Serving on port 8080")
        httpd.serve_forever()

def call_self_every_minute():
    while True:
        time.sleep(60)
        try:
            response = requests.get("http://localhost:8080")
            print("Self call response:", response.status_code)
        except requests.exceptions.RequestException as e:
            print("Failed to call self:", e)

def create_connection():
    try:
        conn = psycopg2.connect(POSTGRESQL_ADDON_URI)
        print("Connexion BDD réussie")
        return conn
    except Exception as e:
        print(f"Erreur connexion BDD: {e}")
        return None

def execute_query(conn, query, params=None):
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()
    except Exception as e:
        print(f"Erreur exécution requête: {e}")
        conn.rollback()

def fetch_query(conn, query, params=None):
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            results = cursor.fetchall()
            return results
    except Exception as e:
        print(f"Erreur récupération résultats: {e}")
        return []

def upload_to_s3(file_data, bucket, object_name):
    s3_client = boto3.client('s3',
                             endpoint_url=f'https://{CELLAR_ADDON_HOST}',
                             aws_access_key_id=CELLAR_ADDON_KEY_ID,
                             aws_secret_access_key=CELLAR_ADDON_KEY_SECRET)
    try:
        s3_client.put_object(Bucket=bucket, Key=object_name, Body=file_data.getvalue())
        return True
    except Exception as e:
        print(f"Erreur lors de l'upload du fichier sur S3: {e}")
        return False

def generate_download_link(bucket, object_name, expiration=2592000):
    s3_client = boto3.client('s3',
                             endpoint_url=f'https://{CELLAR_ADDON_HOST}',
                             aws_access_key_id=CELLAR_ADDON_KEY_ID,
                             aws_secret_access_key=CELLAR_ADDON_KEY_SECRET)
    try:
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': bucket, 'Key': object_name},
                                                    ExpiresIn=expiration)
        return response
    except Exception as e:
        print(f"Erreur lors de la génération du lien de téléchargement: {e}")
        return None

def sanitize_filename(filename):
    return re.sub(r'[^\w\-]', '_', filename)

def send_email(to_email, download_link):
    msg = MIMEMultipart('alternative')
    msg['From'] = str(Header(NODEMAILER_FROM, 'utf-8'))
    msg['To'] = to_email
    msg['Subject'] = str(Header('Votre export est prêt', 'utf-8'))

    text = f"Bonjour,\n\nVotre fichier d'export est prêt. Vous pouvez le télécharger en utilisant le lien suivant :\n\n{download_link}\n\nCe lien expirera dans 30 jours.\n\nCordialement,\nL'équipe JDMA"
    html = f"""\
    <!DOCTYPE html>
	<html>
		<head>
			<style>
				body {{
					font-family: Arial, sans-serif;
				}}
				.container {{
					max-width: 640px;
					margin: 0 auto;
					padding: 20px;
				}}
				.code {{
					font-size: 24px;
					font-weight: bold;
					margin: 20px 0;
				}}
				.footer {{
					font-size: 12px;
					padding: 16px 32px; 
					background: #F5F5FE;
					margin-top: 30px;
				}}
				.header {{
					margin-bottom: 30px;
				}}
				.header img {{
					height: 88px;
				}}
				blockquote {{
					background-color: #f3f3f3;
					margin: 0;
					padding: 20px;
				}}
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<img src="https://jdma-develop.cleverapps.io/assets/JDMA_Banner.png"/>
				</div>
				<div>
                    <p>Bonjour,<br><br>
                    Votre fichier d'export est prêt. Vous pouvez le télécharger en utilisant le lien suivant :<br><br>
                    <a href="{download_link}">Télécharger le fichier</a><br><br>
                    Ce lien expirera dans 30 jours.<br><br>
                    </p>
                </div>
				<p>
					Besoin d’aide ? Vous pouvez nous écrire à l'adresse <a href="mailto:experts@design.numerique.gouv.fr">experts@design.numerique.gouv.fr</a>.<br/>
					La Brigade d'Intervention du Numérique (BIN).
				</p>
				<div class="footer">
					<p>
						Ce message a ete envoyé par <a href="https://design.numerique.gouv.fr/" target="_blank">la Brigade d'Intervention Numérique</a>,
						propulsé par la <a href="https://www.numerique.gouv.fr/" target="_blank">Direction interministérielle du numérique</a>. 
					</p>
					<p>
						Pour toute question, merci de nous contacter à experts@design.numerique.gouv.fr.
					</p>
				</div>
			</div>
		</body>
	</html>
    <html>
      <head></head>
      <body>
      </body>
    </html>
    """

    part1 = MIMEText(text, 'plain', 'utf-8')
    part2 = MIMEText(html, 'html', 'utf-8')

    msg.attach(part1)
    msg.attach(part2)

    try:
        server = smtplib.SMTP(NODEMAILER_HOST, NODEMAILER_PORT)
        server.starttls()
        server.login(MAILPACE_API_KEY, MAILPACE_API_KEY)
        text = msg.as_string()
        server.sendmail(NODEMAILER_FROM, to_email, text)
        server.quit()
        print(f"Email envoyé avec succès à {to_email}")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email: {e}")

def build_filters_query(filters, search_term):
    conditions = []
    values = []
    
    if 'satisfaction' in filters and filters['satisfaction']:
        conditions.append(
            "EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'satisfaction' AND a.intention = ANY(ARRAY[%s]::\"AnswerIntention\"[]))"
        )
        values.append(filters['satisfaction'])

    if 'comprehension' in filters and filters['comprehension']:
        conditions.append(
            "EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'comprehension' AND a.answer_text = ANY(ARRAY[%s]::text[]))"
        )
        values.append(filters['comprehension'])

    if filters.get('needVerbatim'):
        conditions.append(
            "EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'verbatim')"
        )

    if search_term:
        conditions.append(
            "EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'verbatim' AND a.answer_text ILIKE %s)"
        )
        values.append(f'%{search_term}%')

    return " AND ".join(conditions), values

def fetch_query_with_filters(conn, query, params):
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            results = cursor.fetchall()
            return results
    except Exception as e:
        print(f"Erreur récupération résultats avec filtres: {e}")
        return []

def print_progress_bar(iteration, total, prefix='', suffix='', decimals=1, length=50, fill='█'):
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filled_length = int(length * iteration // total)
    bar = fill * filled_length + '-' * (length - filled_length)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end='\r')
    if iteration == total:
        print()

def main():
    print('------ START EXPORT ------')
    conn = create_connection()
    if not conn:
        return
    
    # Check the number of exports currently being processed
    concurrency_check_query = """
    SELECT COUNT(*) FROM public."Export" WHERE status = 'processing'::"StatusExport"
    """

    # Execute the query and fetch the results
    result = fetch_query(conn, concurrency_check_query)

    # Check if the result is not empty
    if result:
        concurrency_count = result[0][0]
    else:
        concurrency_count = 0  # Or handle it as per your requirement

    # Now you can use concurrency_count
    print(f"Concurrency count: {concurrency_count}")
    
    if concurrency_count >= CONCURRENCY_LIMIT:
        print("Le nombre limite d'exports en cours de traitement est atteint.")
        return
    
    # Select the first export with status 'idle'
    select_query_export = """
    SELECT e.*, u.email, p.title
    FROM public."Export" e
    JOIN public."User" u ON e.user_id = u.id
    JOIN public."Product" p ON e.product_id = p.id
    WHERE e.status = 'idle'::"StatusExport"
    ORDER BY e.created_at ASC
    LIMIT 1
    """
    results_export = fetch_query(conn, select_query_export)
    
    if results_export:
        first_result_export = results_export[0]
        export_id = first_result_export[0]
        
        # Update the status and startDate of the selected export to 'processing'
        start_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        update_status_query = """
        UPDATE public."Export" SET status = 'processing'::"StatusExport", "startDate" = %s WHERE id = %s
        """
        execute_query(conn, update_status_query, (start_date, export_id))
        
        product_id = first_result_export[5]
        filter_params_raw = first_result_export[3]

        filters_query = ""
        filters_values = []
        filter_params = {}
        search_term = ""

        if isinstance(filter_params_raw, str):
            try:
                filter_params = json.loads(filter_params_raw)
                search_term = filter_params.get('search', '')
                filters_query, filters_values = build_filters_query(filter_params.get('filters', {}), search_term)
            except json.JSONDecodeError:
                print("Erreur lors du décodage des paramètres de filtre JSON. Aucun filtre ne sera appliqué.")

        # Récupérer le nombre total de reviews à traiter
        count_query = f"""
        SELECT COUNT(*)
        FROM public."Review" r
        WHERE r.product_id = %s
        AND r.created_at BETWEEN %s AND %s
        {f'AND {filters_query}' if filters_query else ''}
        """

        start_date = filter_params.get('startDate', '1900-01-01')
        end_date = filter_params.get('endDate', datetime.now().strftime('%Y-%m-%d'))
        count_params = [product_id, start_date, end_date] + filters_values
        total_reviews = fetch_query_with_filters(conn, count_query, count_params)[0][0]
        print(f"{total_reviews} avis concernés")

        current_date = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        file_name = f"Avis_{sanitize_filename(first_result_export[10])}_{current_date}.csv"

        all_reviews = []
        field_labels = set()

        offset = 0
        retrieved_reviews = 0
        while True:
            select_query_review = f"""
            SELECT
                r.id AS review_id,
                r.form_id,
                r.product_id,
                r.button_id,
                r.xwiki_id,
                r.user_id,
                r.created_at AS review_created_at,
                json_agg(
                    json_build_object(
                        'answer_id', a.id,
                        'field_label', a.field_label,
                        'field_code', a.field_code,
                        'answer_item_id', a.answer_item_id,
                        'answer_text', a.answer_text,
                        'intention', a.intention,
                        'kind', a.kind,
                        'review_id', a.review_id,
                        'review_created_at', a.review_created_at,
                        'parent_answer_id', a.parent_answer_id,
                        'created_at', a.created_at
                    )
                ) AS answers
            FROM
                public."Review" r
            JOIN
                public."Answer" a
            ON
                r.id = a.review_id
                AND r.created_at = a.review_created_at
            WHERE
                r.product_id = %s
                AND r.created_at BETWEEN %s AND %s
                {f'AND {filters_query}' if filters_query else ''}
            GROUP BY
                r.id, r.form_id, r.product_id, r.button_id, r.xwiki_id, r.user_id, r.created_at
            ORDER BY
                r.created_at ASC
            LIMIT %s OFFSET %s;
            """

            query_params = [product_id, start_date, end_date] + filters_values + [PAGE_SIZE, offset]
            
            results_reviews = fetch_query_with_filters(conn, select_query_review, query_params)

            if not results_reviews:
                break

            for row in results_reviews:
                review_id, form_id, product_id, button_id, xwiki_id, user_id, review_created_at, answers = row
                review_data = {
                    'review_id': review_id,
                    'form_id': form_id,
                    'product_id': product_id,
                    'button_id': button_id,
                    'xwiki_id': xwiki_id,
                    'review_created_at': review_created_at,
                    'answers': {answer['field_label']: answer['answer_text'] for answer in answers}
                }
                all_reviews.append(review_data)
                field_labels.update(review_data['answers'].keys())

            retrieved_reviews += len(results_reviews)
            print_progress_bar(retrieved_reviews, total_reviews, prefix='Progress:', suffix='Complete', length=50)

            offset += PAGE_SIZE

        field_labels = sorted(field_labels)  # Sort field labels for consistent column order

        # Create CSV with all the reviews and answers
        csv_buffer = StringIO()
        writer = csv.writer(csv_buffer)
        # Write header
        header = ['Review ID', 'Form ID', 'Product ID', 'Button ID', 'XWiki ID', 'Review Created At'] + field_labels
        writer.writerow(header)

        for review in all_reviews:
            row = [
                review['review_id'], 
                review['form_id'], 
                review['product_id'], 
                review['button_id'], 
                review['xwiki_id'], 
                review['review_created_at']
            ]
            for label in field_labels:
                row.append(review['answers'].get(label, ''))
            writer.writerow(row)

        # Upload the CSV to S3
        if upload_to_s3(csv_buffer, BUCKET_NAME, file_name):
            print(f"Fichier {file_name} uploadé avec succès sur le bucket {BUCKET_NAME}.")

            # Generate a presigned URL for downloading the file
            download_link = generate_download_link(BUCKET_NAME, file_name)
            if download_link:
                print(f"Le lien de téléchargement est : {download_link}")
                # Send email to the user with the download link
                send_email(first_result_export[9], download_link)

                end_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                update_query = """
                UPDATE public."Export" SET status = 'done'::"StatusExport", "endDate" = %s, link = %s WHERE id = %s
                """
                execute_query(conn, update_query, (end_date, download_link, export_id))
    else:
        print("Aucun export à traiter.")

    print('------- END EXPORT -------')

def app(environ, start_response):
    """Simplified application callable for uWSGI"""
    start_response('200 OK', [('Content-Type', 'text/plain')])
    main()
    return [b"Export process initiated"]

if __name__ == "__main__":
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    call_self_every_minute()
