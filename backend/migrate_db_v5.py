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

# FOOD SEED DATA (Schema v4)
FOOD_HEADERS = ["id", "type", "name", "price", "veg1", "veg2", "veg3", "nv1", "nv2", "nv3"]
FOOD_SEED_DATA = [
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

# VEHICLES SEED DATA (NEW)
VEHICLE_HEADERS = ["id", "name", "type", "price", "description", "image"]
VEHICLE_SEED_DATA = [
    ["veh-sedan", "Premium Sedan", "Sedan", 3000, 
     "Comfortable 4-seater, fully air-conditioned. Toyota Etios or equivalent. Recommended for couples.", 
     "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"],
    ["veh-suv", "Luxury SUV", "SUV", 5000, 
     "Spacious 6-seater, high ground clearance, premium comfort. Toyota Innova Crysta. Ideal for families.", 
     "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"],
    ["veh-coach", "Executive Mini Coach", "Van", 8000, 
     "Luxury 12-seater traveler with captain seats and premium sound system. Perfect for group excursions.", 
     "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"]
]

def migrate():
    print("Connecting to Google Sheets...")
    sheet = get_sheet()

    # 1. Migrate Food
    try:
        try:
            food_ws = sheet.worksheet('Food')
        except gspread.exceptions.WorksheetNotFound:
            print("Creating worksheet Food...")
            food_ws = sheet.add_worksheet(title='Food', rows="100", cols="20")
            
        print("Clearing and populating Food sheet...")
        food_ws.clear()
        food_rows = [FOOD_HEADERS] + FOOD_SEED_DATA
        food_ws.update(
            values=food_rows,
            range_name=f"A1:{col_letter(len(FOOD_HEADERS))}{len(food_rows)}"
        )
        print("Food sheet migrated successfully!")
    except Exception as e:
        print(f"Error migrating Food sheet: {e}")

    # 2. Migrate Vehicles
    try:
        try:
            veh_ws = sheet.worksheet('Vehicles')
        except gspread.exceptions.WorksheetNotFound:
            print("Creating worksheet Vehicles...")
            veh_ws = sheet.add_worksheet(title='Vehicles', rows="100", cols="20")
            
        print("Clearing and populating Vehicles sheet...")
        veh_ws.clear()
        veh_rows = [VEHICLE_HEADERS] + VEHICLE_SEED_DATA
        veh_ws.update(
            values=veh_rows,
            range_name=f"A1:{col_letter(len(VEHICLE_HEADERS))}{len(veh_rows)}"
        )
        print("Vehicles sheet migrated successfully!")
    except Exception as e:
        print(f"Error migrating Vehicles sheet: {e}")

    print("Migration complete!")

if __name__ == '__main__':
    migrate()
