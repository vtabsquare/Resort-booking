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

def col_letter(col_num):
    string_val = ""
    while col_num > 0:
        col_num, remainder = divmod(col_num - 1, 26)
        string_val = chr(65 + remainder) + string_val
    return string_val

def migrate():
    print("Connecting to Google Sheets...")
    sheet = get_sheet()

    # 1. Update Admins Credentials
    try:
        print("Checking Admins worksheet...")
        admins_ws = sheet.worksheet('Admins')
        admins_ws.clear()
        
        headers = ["id", "username", "password"]
        rows = [
            headers,
            ["admin_1", "gokul", "gokul@45"]
        ]
        admins_ws.update(values=rows, range_name=f"A1:C2")
        print("Admins worksheet updated with credentials: username=gokul, password=gokul@45")
    except Exception as e:
        print(f"Error updating Admins credentials: {e}")

    # 2. Update Settings with Discount Parameters
    try:
        print("Checking settings worksheet...")
        settings_ws = sheet.worksheet('settings')
        records = settings_ws.get_all_records()
        
        # Build dictionary from current settings
        settings_dict = {}
        for r in records:
            if r.get('key'):
                settings_dict[str(r['key'])] = str(r.get('value', ''))
                
        # Set default values for discount keys if not present
        settings_dict['discountEnabled'] = settings_dict.get('discountEnabled', 'false')
        settings_dict['activeDiscountType'] = settings_dict.get('activeDiscountType', 'standard')
        settings_dict['discountLow'] = settings_dict.get('discountLow', '500')
        settings_dict['discountStandard'] = settings_dict.get('discountStandard', '1000')
        settings_dict['discountPeak'] = settings_dict.get('discountPeak', '1500')
        
        # Rewrite the settings worksheet
        settings_ws.clear()
        headers = ["key", "value"]
        rows = [headers]
        for k, v in settings_dict.items():
            rows.append([k, v])
            
        settings_ws.update(
            values=rows,
            range_name=f"A1:B{len(rows)}"
        )
        print("Settings worksheet updated with discount parameters.")
        
    except Exception as e:
        print(f"Error updating settings: {e}")

    print("Migration complete!")

if __name__ == '__main__':
    migrate()
