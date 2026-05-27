import os
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import time

load_dotenv()

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials', 'google-credentials.json')

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def get_sheet():
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
    client = gspread.authorize(creds)
    return client.open_by_key(SPREADSHEET_ID)

def migrate():
    print("Connecting to Google Sheets...")
    sheet = get_sheet()
    
    try:
        print("Checking Customers worksheet...")
        try:
            customers_ws = sheet.worksheet('Customers')
            print("Customers worksheet already exists.")
        except gspread.exceptions.WorksheetNotFound:
            print("Creating Customers worksheet...")
            customers_ws = sheet.add_worksheet(title='Customers', rows="1000", cols="5")
            print("Customers worksheet created successfully.")
            
            # Write headers
            headers = ["id", "name", "email", "phone", "dateCreated"]
            customers_ws.update(values=[headers], range_name="A1:E1")
            print("Customers headers populated successfully.")
            
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == '__main__':
    migrate()
