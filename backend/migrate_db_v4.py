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

HEADERS = ["id", "type", "name", "price", "veg1", "veg2", "veg3", "nv1", "nv2", "nv3"]

SEED_DATA = [
    ["breakfast-standard", "breakfast", "Standard Breakfast", 300, 
     "Idli + Sambar + Chutney", "Masala Dosa + Chutney", "Poha + Banana", 
     "Egg Omelette + Toast", "Chicken Sausage + Eggs", "Fish Fry + Puttu"],
    ["lunch-standard", "lunch", "Traditional Lunch Buffet", 500, 
     "Kerala Veg Sadya", "Paneer Masala + Chapathi", "Dal Tadka + Rice", 
     "Chicken Biryani", "Fish Curry Meals", "Egg Roast + Parotta"],
    ["dinner-standard", "dinner", "Deluxe Dinner Buffet", 600, 
     "Chapathi + Veg Korma", "Kadai Paneer + Naan", "Veg Fried Rice", 
     "Mutton Fry + Appam", "Tandoori Chicken + Naan", "Parotta + Chicken Curry"]
]

def migrate():
    print("Connecting to Google Sheets...")
    sheet = get_sheet()

    try:
        try:
            food_ws = sheet.worksheet('Food')
        except gspread.exceptions.WorksheetNotFound:
            print("Creating worksheet Food...")
            food_ws = sheet.add_worksheet(title='Food', rows="100", cols="20")
            
        print("Clearing and populating Food sheet with new schema...")
        food_ws.clear()
        
        rows_to_write = [HEADERS] + SEED_DATA
        
        food_ws.update(
            values=rows_to_write,
            range_name=f"A1:{col_letter(len(HEADERS))}{len(rows_to_write)}"
        )
        print("Food sheet migration v4 complete!")

    except Exception as e:
        print(f"Error migrating Food sheet: {e}")
        import traceback; traceback.print_exc()

if __name__ == '__main__':
    migrate()
