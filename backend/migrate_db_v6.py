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

SIGHTSEEING_HEADERS = ["id", "name", "description", "places", "image", "priceStandard", "priceLow", "pricePeak"]
SIGHTSEEING_SEED_DATA = [
    ["jeep-classic", "Munnar Classic Jeep Tour", 
     "Explore the prime highlights of Munnar in a rugged 4x4 Jeep. Enjoy beautiful tea plantation views, mist-clad lakes, and high-altitude viewpoints. Driver and Jeep transport are fully included.",
     "Mattupetty Dam, Echo Point, Kundala Lake, Top Station, Tea Museum",
     "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
     5000, 4000, 6000],
    ["jeep-wild", "Munnar Wild Offroad Adventure", 
     "An offroad journey through rugged terrains, deep woods, and high-altitude peaks in a specialized 4x4 Jeep. Perfect for thrill-seekers looking to explore Munnar's wild side. Driver and Jeep transport are fully included.",
     "Kolukkumalai Sunrise, Lockhart Gap, Anakulam Elephant Spot, Attukad Waterfalls, Chokramudi Peak",
     "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
     7500, 6000, 9000]
]

def migrate():
    print("Connecting to Google Sheets...")
    sheet = get_sheet()

    # 1. Clear or Delete Vehicles Worksheet
    try:
        try:
            veh_ws = sheet.worksheet('Vehicles')
            print("Removing Vehicles worksheet...")
            sheet.del_worksheet(veh_ws)
            print("Vehicles worksheet removed successfully!")
        except gspread.exceptions.WorksheetNotFound:
            print("Vehicles worksheet not found, skipping removal.")
    except Exception as e:
        print(f"Error removing Vehicles sheet: {e}")

    # 2. Overhaul Sightseeing Worksheet
    try:
        try:
            sight_ws = sheet.worksheet('Sightseeing')
            print("Sightseeing worksheet found. Clearing old data...")
            sight_ws.clear()
        except gspread.exceptions.WorksheetNotFound:
            print("Creating worksheet Sightseeing...")
            sight_ws = sheet.add_worksheet(title='Sightseeing', rows="100", cols="20")
            
        print("Populating Sightseeing sheet with unified Jeep tour packages...")
        rows = [SIGHTSEEING_HEADERS] + SIGHTSEEING_SEED_DATA
        sight_ws.update(
            values=rows,
            range_name=f"A1:{col_letter(len(SIGHTSEEING_HEADERS))}{len(rows)}"
        )
        print("Sightseeing sheet migrated successfully!")
    except Exception as e:
        print(f"Error migrating Sightseeing sheet: {e}")

    print("Migration complete!")

if __name__ == '__main__':
    migrate()
