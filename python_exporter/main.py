import os
import re
import json
import time
import calendar
import smtplib
import requests
import zipfile
import boto3
import psycopg
import threading
import pandas as pd
import csv
import gc
from datetime import datetime, timedelta
from collections import defaultdict
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from dotenv import load_dotenv
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
from io import StringIO, BytesIO

# Import optionnel pour le monitoring mémoire
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("psutil non disponible - monitoring mémoire désactivé")

# Charger les variables d'environnement à partir du fichier .env
load_dotenv()

# Vérifier la présence des variables d'environnement
required_env_vars = [
    'POSTGRESQL_ADDON_URI', 'PAGE_SIZE', 'CONCURRENCY_LIMIT',
    'CELLAR_ADDON_HOST', 'CELLAR_ADDON_KEY_ID', 'CELLAR_ADDON_KEY_SECRET', 'BUCKET_NAME',
    'NODEMAILER_HOST', 'NODEMAILER_PORT', 'NODEMAILER_FROM', 'MAILPACE_API_KEY', 'MAX_LINES_SWITCH'
]
env_vars = {var: os.getenv(var) for var in required_env_vars}
missing_vars = [var for var, val in env_vars.items() if not val]
if missing_vars:
    raise EnvironmentError(f"Les variables d'environnement suivantes sont manquantes: {', '.join(missing_vars)}")

PAGE_SIZE = int(env_vars['PAGE_SIZE'])
CONCURRENCY_LIMIT = int(env_vars['CONCURRENCY_LIMIT'])
NODEMAILER_PORT = int(env_vars['NODEMAILER_PORT'])
MAX_LINES_SWITCH = int(env_vars['MAX_LINES_SWITCH'])

# Client S3 réutilisable (singleton pattern)
_s3_client = None

def get_s3_client():
    """Retourne un client S3 réutilisable pour éviter de créer plusieurs connexions"""
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            's3',
            endpoint_url=f'https://{env_vars["CELLAR_ADDON_HOST"]}',
            aws_access_key_id=env_vars['CELLAR_ADDON_KEY_ID'],
            aws_secret_access_key=env_vars['CELLAR_ADDON_KEY_SECRET']
        )
    return _s3_client

def log_memory_usage(label=""):
    """Log l'utilisation de la mémoire pour détecter les fuites"""
    if PSUTIL_AVAILABLE:
        process = psutil.Process(os.getpid())
        mem_mb = process.memory_info().rss / 1024 / 1024
        print(f"[MEMORY {label}] {mem_mb:.2f} MB")

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        main()
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Export process initiated")

def run_server():
    with TCPServer(("", 8080), Handler) as httpd:
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
        conn = psycopg.connect(env_vars['POSTGRESQL_ADDON_URI'])
        print("Connexion BDD réussie")
        return conn
    except Exception as e:
        print(f"Erreur connexion BDD: {e}")
        return None

def execute_query(conn, query, params=None):
    """Exécute une requête avec gestion robuste des erreurs de connexion"""
    with conn.cursor() as cursor:
        try:
            cursor.execute(query, params)
            conn.commit()
        except Exception as e:
            print(f"Erreur exécution requête: {e}")
            # Tentative de rollback - peut échouer si la connexion est morte
            try:
                conn.rollback()
            except Exception as rollback_error:
                print(f"Erreur lors du rollback (connexion probablement perdue): {rollback_error}")
                # Lever une exception spécifique pour indiquer que la connexion est perdue
                raise ConnectionError("La connexion à la base de données est perdue") from e
            # Re-lever l'exception originale si le rollback a réussi
            raise

def fetch_query(conn, query, params=None):
    with conn.cursor() as cursor:
        try:
            cursor.execute(query, params)
            return cursor.fetchall()
        except Exception as e:
            print(f"Erreur récupération résultats: {e}")
            return []

def upload_to_s3(file_data, bucket, object_name):
    """Upload un fichier sur S3 en utilisant le client réutilisable"""
    s3_client = get_s3_client()
    try:
        # Utiliser directement le BytesIO sans créer de copie avec getvalue()
        file_data.seek(0)
        s3_client.upload_fileobj(file_data, bucket, object_name)
        return True
    except Exception as e:
        print(f"Erreur lors de l'upload du fichier sur S3: {e}")
        return False

def generate_download_link(bucket, object_name, expiration=2592000):
    """Génère un lien de téléchargement pré-signé en utilisant le client réutilisable"""
    s3_client = get_s3_client()
    try:
        return s3_client.generate_presigned_url('get_object',
                                                Params={'Bucket': bucket, 'Key': object_name},
                                                ExpiresIn=expiration)
    except Exception as e:
        print(f"Erreur lors de la génération du lien de téléchargement: {e}")
        return None

def sanitize_filename(filename):
    return re.sub(r'[^\w\-]', '_', str(filename))

def send_email(to_email, download_link, product_name, switch_to_zip=False):
    msg = MIMEMultipart('alternative')
    msg['From'] = str(Header(env_vars['NODEMAILER_FROM'], 'utf-8'))
    msg['To'] = to_email
    msg['Subject'] = str(Header(f"Votre export est prêt : [{product_name}]", 'utf-8'))
    message = " Étant donné le volume important d'avis concernés, nous les avons séparés par année et regroupés dans un fichier zip." if switch_to_zip else ""

    text = f"Bonjour,\n\nVotre export pour le service {product_name} est prêt.{message} Vous pouvez le télécharger en utilisant le lien suivant :\n\n{download_link}\n\nCe lien expirera dans 30 jours.\n\nCordialement,\nL'équipe JDMA"
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
                    <img src="https://jedonnemonavis.numerique.gouv.fr/assets/JDMA_Banner.png"/>
                </div>
                <div>
                    <p>Bonjour,<br><br>
                    Votre export pour le service "{product_name}" est prêt.{message} Vous pouvez le télécharger en utilisant le lien suivant :<br><br>
                    <a href="{download_link}">Télécharger le fichier</a><br><br>
                    Ce lien expirera dans 30 jours.<br><br>
                    </p>
                </div>
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
        server = smtplib.SMTP(env_vars['NODEMAILER_HOST'], NODEMAILER_PORT)
        server.starttls()
        server.login(env_vars['MAILPACE_API_KEY'], env_vars['MAILPACE_API_KEY'])
        server.sendmail(env_vars['NODEMAILER_FROM'], to_email, msg.as_string())
        server.quit()
        print(f"Email envoyé avec succès à {to_email}")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email: {e}")

def build_filters_query(filters, search_term):
    conditions = []
    values = []
    
    if 'satisfaction' in filters and filters['satisfaction']:
        placeholders = ', '.join(['%s'] * len(filters['satisfaction']))
        conditions.append(
            f"EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'satisfaction' AND a.intention = ANY(ARRAY[{placeholders}]::\"AnswerIntention\"[]) AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')"
        )
        values.extend(filters['satisfaction'])

    if 'comprehension' in filters and filters['comprehension']:
        placeholders = ', '.join(['%s'] * len(filters['comprehension']))
        conditions.append(
            f"EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'comprehension' AND a.answer_text = ANY(ARRAY[{placeholders}]::text[]) AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')"
        )
        values.extend(filters['comprehension'])

    if filters.get('needVerbatim'):
        conditions.append(
            "EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'verbatim' AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')"
        )

    if search_term:
        conditions.append(
            "EXISTS (SELECT 1 FROM public.\"Answer\" a WHERE a.review_id = r.id AND a.field_code = 'verbatim' AND a.answer_text ILIKE %s AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')"
        )
        values.append(f'%{search_term}%')

    return " AND ".join(conditions), values

def fetch_query_with_filters(conn, query, params):
    with conn.cursor() as cursor:
        try:
            cursor.execute(query, params)
            return cursor.fetchall()
        except Exception as e:
            print(f"Erreur récupération résultats avec filtres: {e}")
            return []

def update_export_progress(conn, export_id, progress):
    """Met à jour la progression de l'export sans faire échouer le flux"""
    progress_update_query = """
    UPDATE public."Export" SET progress = %s WHERE id = %s
    """
    try:
        execute_query(conn, progress_update_query, (progress, export_id))
    except ConnectionError as conn_error:
        print(f"Erreur de connexion lors de la mise à jour du progrès: {conn_error}")

def print_progress_bar(iteration, total, prefix='', suffix='', decimals=1, length=50, fill='█'):
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filled_length = int(length * iteration // total)
    bar = fill * filled_length + '-' * (length - filled_length)
    print(f'\r{prefix} |{bar}| {percent}% ({iteration}) {suffix}', end='\r')
    if iteration == total:
        print()

def get_month_ranges(start_date, end_date):
    ranges = []
    current_date = start_date
    while current_date <= end_date:
        # fix for the first month if starting on the 1st bcs of timezone display
        if current_date == start_date and start_date.day == 1:
            start_of_month = current_date
            start_of_month -= timedelta(hours=2)
        else:
            start_of_month = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0) if current_date != start_date else current_date
        end_of_month = current_date.replace(day=calendar.monthrange(current_date.year, current_date.month)[1])
        end_of_month = datetime.combine(end_of_month, datetime.max.time())
        if end_of_month > end_date:
            end_of_month = end_date
        ranges.append((start_of_month, end_of_month))
        current_date = end_of_month + timedelta(days=1)
    return ranges

def estimate_line_count(cell_text, wrap_length=30):
    lines = cell_text.split('\n')
    return sum((len(line) // wrap_length) + 1 for line in lines)

def format_excel(writer, df, sheet_name):
    workbook = writer.book
    worksheet = writer.sheets["Avis"]

    # Adjust column widths
    for i, col in enumerate(df.columns):
        try:
            # Handle NaN and float values by converting to string first
            col_values = df[col].fillna('').astype(str)
            max_len = max(col_values.str.len().max(), len(col)) + 2
        except (ValueError, TypeError):
            # Fallback to a default width if calculation fails
            max_len = len(col) + 2
        worksheet.set_column(i, i, max_len)

    # Define header format
    header_format = workbook.add_format({
        'bold': True,
        'font_size': 12,
        'border': 1,
        'bg_color': '#d4d3d3'
    })

    # Define cell format for non-empty cells
    cell_format = workbook.add_format({
        'border': 1,
        'text_wrap': True
    })

    # Define cell format for empty cells
    empty_cell_format = workbook.add_format({
        'border': 0,
        'text_wrap': True
    })

    # Write the header row
    for col_num, value in enumerate(df.columns.values):
        worksheet.write(0, col_num, value, header_format)

    # Write the data rows
    for row_num in range(1, len(df) + 1):
        for col_num in range(len(df.columns)):
            cell_value = df.iloc[row_num - 1, col_num]
            if pd.isna(cell_value) or cell_value == "":
                worksheet.write(row_num, col_num, cell_value, cell_format)
            else:
                worksheet.write(row_num, col_num, cell_value, cell_format)

    # Adjust row heights based on content
    for row_num, row in enumerate(df.itertuples(index=False), start=1):
        max_lines = max(estimate_line_count(str(cell), wrap_length=50) for cell in row)
        line_height = max(15, 15 * max_lines)
        worksheet.set_row(row_num, line_height)

def format_review_content(content):
    if isinstance(content, str):
        return '- ' + re.sub(r' ?\/ ?([a-zA-Z])', r'\n- \1', content)
    return content

def create_csv_buffer(reviews, field_labels):
    """Crée un buffer CSV avec les avis - retourne le contenu pour libérer le buffer"""
    csv_buffer = StringIO()
    try:
        writer = csv.writer(csv_buffer)
        header = ['Review ID', 'Form ID', 'Product ID', 'Button ID', 'XWiki ID', 'Review Created At'] + field_labels
        writer.writerow(header)

        for review in reviews:
            row = [
                review['review_id'][-7:],
                review['form_id'],
                review['product_id'],
                review['button_id'],
                review['xwiki_id'],
                review['review_created_at']
            ]
            for label in field_labels:
                row.append(review['answers'].get(label, ''))
            writer.writerow(row)
        
        csv_buffer.seek(0)
        # Retourner le contenu sous forme de bytes pour pouvoir fermer le buffer
        content = csv_buffer.getvalue().encode('utf-8')
        return content
    finally:
        csv_buffer.close()

def create_xls_buffer(reviews, field_labels, product_name):
    """Crée un buffer Excel avec les avis - retourne directement le BytesIO"""
    rows = []
    for review in reviews:
        row = {
            'Review ID': review['review_id'][-7:],
            'Form ID': review['form_id'],
            'Product ID': review['product_id'],
            'Button ID': review['button_id'],
            'XWiki ID': review['xwiki_id'],
            'Review Created At': review['review_created_at']
        }
        for label in field_labels:
            row[label] = review['answers'].get(label, '')
        rows.append(row)
    
    df = pd.DataFrame(rows)
    try:
        for label in field_labels:
            df[label] = df[label].apply(lambda x: format_review_content(x) if ' / ' in x else x)
        
        xls_buffer = BytesIO()
        with pd.ExcelWriter(xls_buffer, engine='xlsxwriter') as writer:
            writer.book.nan_inf_to_errors = True
            df.to_excel(writer, index=False, sheet_name=f"Avis")
            format_excel(writer, df, f"Avis {product_name}")
        xls_buffer.seek(0)
        # Retourner directement le BytesIO sans extraire le contenu
        return xls_buffer
    finally:
        # Libération explicite du DataFrame
        del df
        del rows
        gc.collect()

def process_single_export(export_format, reviews, field_labels, product_name, current_date):
    """Traite un export simple (non-zippé) et retourne un BytesIO"""
    if export_format == 'csv':
        content = create_csv_buffer(reviews, field_labels)
        file_name = f"Avis_{sanitize_filename(product_name)}_{current_date}.csv"
        buffer = BytesIO(content)
        del content
        return buffer, file_name
    elif export_format == 'xls':
        # create_xls_buffer retourne maintenant directement un BytesIO
        buffer = create_xls_buffer(reviews, field_labels, product_name)
        file_name = f"Avis_{sanitize_filename(product_name)}_{current_date}.xlsx"
        return buffer, file_name

def process_zip_export(export_format, reviews_by_year, field_labels, product_name, current_date):
    """Traite un export zippé avec libération de mémoire entre chaque fichier"""
    zip_buffer = BytesIO()
    try:
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for year, reviews in reviews_by_year.items():
                if export_format == 'csv':
                    content = create_csv_buffer(reviews, field_labels)
                    csv_filename = f"Avis_{year}.csv"
                    zip_file.writestr(csv_filename, content)
                    del content
                elif export_format == 'xls':
                    # create_xls_buffer retourne un BytesIO, on extrait son contenu
                    xls_buffer = create_xls_buffer(reviews, field_labels, product_name)
                    xls_filename = f"Avis_{year}.xlsx"
                    zip_file.writestr(xls_filename, xls_buffer.getvalue())
                    xls_buffer.close()
                    del xls_buffer
                # Libérer les reviews de cette année
                del reviews
                gc.collect()
        
        zip_buffer.seek(0)
        file_name = f"Avis_{sanitize_filename(product_name)}_{current_date}.zip"
        return zip_buffer, file_name
    except Exception as e:
        zip_buffer.close()
        raise

def main_export_logic(switch_to_zip, export_format, all_reviews, all_reviews_by_year, field_labels, product_name, current_date):
    if not switch_to_zip:
        upload_buffer, file_name = process_single_export(export_format, all_reviews, field_labels, product_name, current_date)
    else:
        upload_buffer, file_name = process_zip_export(export_format, all_reviews_by_year, field_labels, product_name, current_date)
    return upload_buffer, file_name

def process_exports(conn):
    print('------ START EXPORT ------')
    log_memory_usage("START_EXPORT")
    
    concurrency_check_query = "SELECT COUNT(*) FROM public.\"Export\" WHERE status = 'processing'::\"StatusExport\""
    concurrency_count = fetch_query(conn, concurrency_check_query)[0][0]

    print(f"Concurrency count: {concurrency_count}")

    if concurrency_count >= CONCURRENCY_LIMIT:
        print("Le nombre limite d'exports en cours de traitement est atteint.")
        return

    select_old_exports_query = """
    SELECT e.*, u.email, p.title
    FROM public."Export" e
    JOIN public."User" u ON e.user_id = u.id
    JOIN public."Product" p ON e.product_id = p.id
    WHERE e.status = 'processing'::"StatusExport"
    AND e."startDate" < NOW() - INTERVAL '1 hour'
    ORDER BY e.created_at ASC
    LIMIT 1
    """
    old_exports = fetch_query(conn, select_old_exports_query)
    for old_export in old_exports:
        export_id = old_export[0]
        print(f"Export {export_id} en cours de traitement depuis plus d'une heure. Réinitialisation du statut.")
        update_status_query = """
        UPDATE public."Export" SET status = 'idle'::"StatusExport", "startDate" = NULL WHERE id = %s
        """
        execute_query(conn, update_status_query, (export_id,))

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

    if not results_export:
        print("Aucun export à traiter.")
        print('------- END EXPORT -------')
        return

    first_result_export = results_export[0]
    export_id = first_result_export[0]

    start_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    update_status_query = """
    UPDATE public."Export" SET status = 'processing'::"StatusExport", "startDate" = %s, progress = 0 WHERE id = %s
    """
    execute_query(conn, update_status_query, (start_date, export_id))

    product_id = first_result_export[5]
    filter_params_raw = first_result_export[3]
    export_format = first_result_export[9]
    name_product = first_result_export[11]
    email_user = first_result_export[10]

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

    count_query = f"""
    SELECT COUNT(*)
    FROM public."Review" r
    WHERE r.product_id = %s
    AND r.created_at BETWEEN %s AND %s
    {f'AND {filters_query}' if filters_query else ''}
    """

    start_date = datetime.strptime(filter_params.get('startDate', '2018-01-01'), '%Y-%m-%d')
    if start_date.day == 1:
        start_date -= timedelta(hours=2) 
    end_date_str = filter_params.get('endDate', datetime.now().strftime('%Y-%m-%d'))
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    end_date = datetime.combine(end_date, datetime.max.time())
    count_params = [product_id, start_date, end_date] + filters_values
    total_reviews = fetch_query_with_filters(conn, count_query, count_params)[0][0]
    print(f"{total_reviews} avis concernés, format d'export : {export_format}")

    current_date = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    all_reviews = []
    all_reviews_by_year = defaultdict(list)
    field_labels = set()

    month_ranges = get_month_ranges(start_date, end_date)
    retrieved_reviews = 0

    for month_start, month_end in month_ranges:
        offset = 0
        while True:
            select_query_review = f"""
            SELECT
                r.id AS review_id,
                r.form_id,
                r.product_id,
                r.button_id,
                r.xwiki_id,
                r.user_id,
                r.created_at AS review_created_at
            FROM
                public."Review" r
            WHERE
                r.product_id = %s
                AND r.created_at BETWEEN %s AND %s
                {f'AND {filters_query}' if filters_query else ''}
            ORDER BY
                r.created_at DESC
            LIMIT %s OFFSET %s;
            """
            query_params = [product_id, month_start, month_end] + filters_values + [PAGE_SIZE, offset]
            results_reviews = fetch_query_with_filters(conn, select_query_review, query_params)

            if not results_reviews:
                break

            review_ids = [row[0] for row in results_reviews]

            if review_ids:
                select_query_answers = f"""
                SELECT
                    a.review_id,
                    a.id AS answer_id,
                    a.parent_answer_id,
                    a.field_label,
                    a.field_code,
                    a.answer_item_id,
                    a.answer_text,
                    a.intention,
                    a.kind,
                    a.created_at
                FROM
                    public."Answer" a
                WHERE
                    a.review_id = ANY(%s)
                    AND a.created_at BETWEEN a.review_created_at - interval '1 day' AND a.review_created_at + interval '1 day'
                """
                results_answers = fetch_query(conn, select_query_answers, (review_ids,))

                answers_dict = defaultdict(list)
                for answer in results_answers:
                    review_id = answer[0]
                    answers_dict[review_id].append(answer)

                for row in results_reviews:
                    review_id, form_id, product_id, button_id, xwiki_id, user_id, review_created_at = row
                    answers = answers_dict.get(review_id, [])
                    review_data = {
                        'review_id': hex(review_id),
                        'form_id': form_id,
                        'product_id': product_id,
                        'button_id': button_id,
                        'xwiki_id': xwiki_id,
                        'review_created_at': datetime.strftime(review_created_at + timedelta(hours=2), '%Y-%m-%d %H:%M:%S'),
                        'answers': defaultdict(list)
                    }

                    for answer in answers:
                        field_label = answer[3]
                        answer_text = answer[6]
                        parent_answer_id = answer[2]

                        if parent_answer_id is not None:
                            parent_answer = next((a for a in answers if a[1] == parent_answer_id), None)
                            if parent_answer:
                                parent_text = parent_answer[6]
                                answer_text = f"{parent_text} : {answer_text}"

                        review_data['answers'][field_label].append(answer_text)

                    review_data['answers'] = {k: ' / '.join(v) for k, v in review_data['answers'].items()}

                    year = review_created_at.year
                    all_reviews_by_year[year].append(review_data)
                    all_reviews.append(review_data)
                    field_labels.update(review_data['answers'].keys())

                retrieved_reviews += len(results_reviews)
                print_progress_bar(retrieved_reviews, total_reviews, prefix='Progress:', suffix='Complete', length=50)

                if total_reviews > 0:
                    # Plafonner la progression à 95% pendant la phase de récupération
                    progress_percent = min(95, int((retrieved_reviews * 95) / total_reviews))
                    update_export_progress(conn, export_id, progress_percent)

                offset += PAGE_SIZE

    desired_order = [
        "De façon générale, comment ça s’est passé ?",
        "Qu'avez-vous pensé des informations et des instructions fournies ?",
        "Durant votre parcours, avez-vous tenté d’obtenir de l’aide par l’un des moyens suivants ?",
        "Quand vous avez cherché de l'aide, avez-vous réussi à joindre l'administration ?",
        "Comment évaluez-vous la qualité de l'aide que vous avez obtenue de la part de l'administration ?",
        "Souhaitez-vous nous en dire plus ?",
        "De façon générale, comment ça s’est passé ? ",
        "Était-ce facile à utiliser ?",
        "Avez-vous rencontré des difficultés ?",
        "Pouvez-vous préciser quelle(s) autre(s) difficulté(s) vous avez rencontré ?",
        "De quelle aide avez vous eu besoin ?",
        "Pouvez-vous préciser de quelle autre aide vous avez eu besoin ?"
    ]

    def custom_sort(labels, order):
        order_dict = {label: index for index, label in enumerate(order)}
        return sorted(labels, key=lambda x: order_dict.get(x, len(order)))

    field_labels = custom_sort(field_labels, desired_order)
    switch_to_zip = total_reviews > MAX_LINES_SWITCH
    
    print(f"Mode ZIP: {switch_to_zip} (seuil: {MAX_LINES_SWITCH})")
    log_memory_usage("BEFORE_FILE_GENERATION")
    
    upload_buffer = None
    try:
        # Indiquer la fin de la phase de récupération sans atteindre 100%
        update_export_progress(conn, export_id, 95)
        print(f"Début génération fichier {export_format}...")
        upload_buffer, file_name = main_export_logic(switch_to_zip, export_format, all_reviews, all_reviews_by_year, field_labels, name_product, current_date)
        print(f"Fichier {file_name} généré avec succès")

        # Progression après génération du fichier
        update_export_progress(conn, export_id, 98)
        
        log_memory_usage("AFTER_FILE_GENERATION")
        
        # Libération des données sources après génération du fichier
        del all_reviews
        del all_reviews_by_year
        gc.collect()
        
        log_memory_usage("AFTER_DATA_CLEANUP")

        # Upload to S3
        if upload_to_s3(upload_buffer, env_vars['BUCKET_NAME'], file_name):
            print(f"Fichier {file_name} uploadé avec succès sur le bucket {env_vars['BUCKET_NAME']}.")

            # Progression après upload
            update_export_progress(conn, export_id, 99)
            
            # Libérer immédiatement le buffer après upload pour libérer la mémoire
            if isinstance(upload_buffer, BytesIO):
                upload_buffer.close()
            del upload_buffer
            upload_buffer = None
            gc.collect()
            log_memory_usage("AFTER_UPLOAD_S3")

            download_link = generate_download_link(env_vars['BUCKET_NAME'], file_name)
            if download_link:
                print(f"Le lien de téléchargement est : {download_link}")
                
                # Envoi d'email séparé de la mise à jour DB pour ne pas bloquer
                email_sent = False
                try:
                    send_email(email_user, download_link, name_product, switch_to_zip)
                    email_sent = True
                except Exception as email_error:
                    print(f"Erreur lors de l'envoi de l'email (non bloquant): {email_error}")

                # Toujours mettre à jour le statut même si l'email a échoué
                end_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                update_query = """
                UPDATE public."Export" SET status = 'done'::"StatusExport", "endDate" = %s, link = %s, progress = 100 WHERE id = %s
                """
                try:
                    execute_query(conn, update_query, (end_date, download_link, export_id))
                except ConnectionError as conn_error:
                    print(f"Erreur de connexion lors de la mise à jour finale: {conn_error}")
                    # L'export est fait et uploadé, on ne peut pas grand chose de plus
    finally:
        # Fermeture du buffer après utilisation (seulement si c'est un BytesIO)
        if upload_buffer:
            if isinstance(upload_buffer, BytesIO):
                upload_buffer.close()
            del upload_buffer
        gc.collect()
        
    log_memory_usage("END_EXPORT")
    print('------- END EXPORT -------')

def main():
    """Point d'entrée principal - garantit la fermeture de la connexion DB"""
    conn = create_connection()
    if not conn:
        return
    
    try:
        process_exports(conn)
    finally:
        # Garantir la fermeture de la connexion même en cas d'erreur
        try:
            conn.close()
            print("Connexion BDD fermée")
        except Exception as e:
            print(f"Erreur lors de la fermeture de la connexion: {e}")
        
        # Double GC pour libérer agressivement la mémoire
        gc.collect()
        gc.collect()
        log_memory_usage("AFTER_FINAL_GC")

def app(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    main()
    return [b"Export process initiated"]

if __name__ == "__main__":
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    call_self_every_minute()
