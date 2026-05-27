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
    
    # 1. Update Rooms Sheet Schema
    worksheet = sheet.worksheet('Rooms')
    records = worksheet.get_all_records()
    headers = worksheet.row_values(1)
    
    print("Current headers in Rooms:", headers)
    if 'priceLow' not in headers or 'pricePeak' not in headers:
        # Create new headers list
        new_headers = []
        for h in headers:
            new_headers.append(h)
            if h == 'price':
                if 'priceLow' not in headers:
                    new_headers.append('priceLow')
                if 'pricePeak' not in headers:
                    new_headers.append('pricePeak')
        
        # Calculate new row values for all rows
        rows_to_update = [new_headers]
        for record in records:
            price = int(record.get('price', 0))
            record['priceLow'] = record.get('priceLow') or round(price * 0.9)
            record['pricePeak'] = record.get('pricePeak') or round(price * 1.15)
            
            row = [record.get(h, "") for h in new_headers]
            rows_to_update.append(row)
            
        print("Migrating Rooms sheet with new headers:", new_headers)
        worksheet.clear()
        
        # Determine column letter
        def col_letter(col_num):
            string_val = ""
            while col_num > 0:
                col_num, remainder = divmod(col_num - 1, 26)
                string_val = chr(65 + remainder) + string_val
            return string_val
            
        worksheet.update(values=rows_to_update, range_name=f"A1:{col_letter(len(new_headers))}{len(rows_to_update)}")
        print("Rooms sheet migration complete!")
    else:
        print("priceLow and pricePeak columns already exist.")

if __name__ == '__main__':
    migrate()
