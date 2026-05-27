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
    
    # 1. Read existing settings and extract discount keys
    discount_keys = {'discountEnabled', 'activeDiscountType', 'discountLow', 'discountStandard', 'discountPeak'}
    existing_settings = {}
    remaining_settings = []
    
    try:
        settings_ws = sheet.worksheet('settings')
        records = settings_ws.get_all_records()
        print("Existing settings:", records)
        for r in records:
            k = str(r.get('key', '')).strip()
            v = str(r.get('value', '')).strip()
            if k in discount_keys:
                existing_settings[k] = v
            else:
                remaining_settings.append([k, v])
    except Exception as e:
        print(f"Error reading settings worksheet: {e}")
        
    # Provide default values if they weren't in settings
    final_discounts = {
        'discountEnabled': existing_settings.get('discountEnabled', 'false'),
        'activeDiscountType': existing_settings.get('activeDiscountType', 'standard'),
        'discountLow': existing_settings.get('discountLow', '500'),
        'discountStandard': existing_settings.get('discountStandard', '1000'),
        'discountPeak': existing_settings.get('discountPeak', '1500'),
    }
    
    # 2. Check/Create Discounts worksheet
    try:
        print("Checking Discounts worksheet...")
        try:
            discounts_ws = sheet.worksheet('Discounts')
            print("Discounts worksheet already exists.")
        except gspread.exceptions.WorksheetNotFound:
            print("Creating Discounts worksheet...")
            discounts_ws = sheet.add_worksheet(title='Discounts', rows="100", cols="5")
            print("Discounts worksheet created successfully.")

        discounts_ws.clear()
        
        headers = ["key", "value"]
        rows = [headers]
        for k, v in final_discounts.items():
            rows.append([k, v])
            
        discounts_ws.update(values=rows, range_name=f"A1:B{len(rows)}")
        print("Discounts worksheet populated with values:", final_discounts)
        
        # 3. Clean up settings worksheet by writing back only remaining settings
        settings_ws.clear()
        settings_headers = ["key", "value"]
        settings_rows = [settings_headers] + remaining_settings
        settings_ws.update(values=settings_rows, range_name=f"A1:B{len(settings_rows)}")
        print("Cleaned up settings worksheet (removed discount keys).")
            
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == '__main__':
    migrate()
