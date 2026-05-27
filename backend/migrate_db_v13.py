import os
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

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
        # 1. Check and update Bookings worksheet
        print("Checking Bookings worksheet headers...")
        bookings_ws = sheet.worksheet('Bookings')
        headers = bookings_ws.row_values(1)
        if 'gstRate' not in headers:
            print("Adding 'gstRate' column to Bookings headers...")
            bookings_ws.update_cell(1, len(headers) + 1, 'gstRate')
            print("Bookings headers updated successfully.")
        else:
            print("'gstRate' column already exists in Bookings headers.")

        # 2. Check and update settings worksheet
        print("Checking settings worksheet...")
        settings_ws = sheet.worksheet('settings')
        records = settings_ws.get_all_records()
        setting_keys = [r.get('key') for r in records]
        if 'gstRate' not in setting_keys:
            print("Adding 'gstRate' setting (default: 12)...")
            settings_ws.append_row(['gstRate', '12'])
            print("settings worksheet updated successfully.")
        else:
            print("'gstRate' setting already exists in settings worksheet.")
            
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == '__main__':
    migrate()
