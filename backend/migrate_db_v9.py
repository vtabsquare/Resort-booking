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
        print("Checking Sightseeing worksheet...")
        sight_ws = sheet.worksheet('Sightseeing')
        headers = sight_ws.row_values(1)
        if 'placeImages' not in headers:
            headers.append('placeImages')
            # Write back the new headers row
            sight_ws.update(values=[headers], range_name="A1")
            print("Successfully added 'placeImages' column to Sightseeing worksheet!")
        else:
            print("'placeImages' column already exists in Sightseeing worksheet.")
    except Exception as e:
        print(f"Error migrating Sightseeing sheet: {e}")

if __name__ == '__main__':
    migrate()
