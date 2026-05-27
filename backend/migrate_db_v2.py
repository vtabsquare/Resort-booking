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

    # 1. Update Food Sheet
    try:
        food_ws = sheet.worksheet('Food')
        records = food_ws.get_all_records()
        headers = food_ws.row_values(1)
        print("Current headers in Food:", headers)
        
        new_food_headers = ['breakfastVeg', 'breakfastNonVeg', 'lunchVeg', 'lunchNonVeg', 'dinnerVeg', 'dinnerNonVeg']
        needs_migration = any(h not in headers for h in new_food_headers)
        
        if needs_migration:
            # Construct full headers list
            updated_headers = list(headers)
            for h in new_food_headers:
                if h not in updated_headers:
                    updated_headers.append(h)
            
            # Default options to seed
            default_veg_bf = "Idli Sambar, Masala Dosa, Poha"
            default_non_veg_bf = "Egg Omelette, Chicken Sausage, French Toast"
            default_veg_lunch = "Kerala Veg Sadya, Paneer Butter Masala, Dal Tadka"
            default_non_veg_lunch = "Thalassery Chicken Biryani, Fish Curry Meals, Egg Roast"
            default_veg_dinner = "Wheat Chapathi with Veg Korma, Kadai Paneer, Fried Rice"
            default_non_veg_dinner = "Mutton Coconut Fry, Tandoori Chicken, Kerala Parotta with Chicken Curry"
            
            rows_to_update = [updated_headers]
            for record in records:
                pkg_id = record.get('id', '')
                
                # Assign options based on plan inclusions
                if pkg_id == 'breakfast':
                    record['breakfastVeg'] = record.get('breakfastVeg') or default_veg_bf
                    record['breakfastNonVeg'] = record.get('breakfastNonVeg') or default_non_veg_bf
                    record['lunchVeg'] = record.get('lunchVeg') or ""
                    record['lunchNonVeg'] = record.get('lunchNonVeg') or ""
                    record['dinnerVeg'] = record.get('dinnerVeg') or ""
                    record['dinnerNonVeg'] = record.get('dinnerNonVeg') or ""
                elif pkg_id == 'half-board':
                    record['breakfastVeg'] = record.get('breakfastVeg') or default_veg_bf
                    record['breakfastNonVeg'] = record.get('breakfastNonVeg') or default_non_veg_bf
                    record['lunchVeg'] = record.get('lunchVeg') or default_veg_lunch
                    record['lunchNonVeg'] = record.get('lunchNonVeg') or default_non_veg_lunch
                    record['dinnerVeg'] = record.get('dinnerVeg') or default_veg_dinner
                    record['dinnerNonVeg'] = record.get('dinnerNonVeg') or default_non_veg_dinner
                else: # full-board or custom
                    record['breakfastVeg'] = record.get('breakfastVeg') or default_veg_bf
                    record['breakfastNonVeg'] = record.get('breakfastNonVeg') or default_non_veg_bf
                    record['lunchVeg'] = record.get('lunchVeg') or default_veg_lunch
                    record['lunchNonVeg'] = record.get('lunchNonVeg') or default_non_veg_lunch
                    record['dinnerVeg'] = record.get('dinnerVeg') or default_veg_dinner
                    record['dinnerNonVeg'] = record.get('dinnerNonVeg') or default_non_veg_dinner
                
                row = [record.get(h, "") for h in updated_headers]
                rows_to_update.append(row)
                
            print("Migrating Food sheet with new headers:", updated_headers)
            food_ws.clear()
            food_ws.update(values=rows_to_update, range_name=f"A1:{col_letter(len(updated_headers))}{len(rows_to_update)}")
            print("Food sheet migration complete!")
        else:
            print("Food package customization columns already exist.")
    except Exception as e:
        print(f"Error migrating Food sheet: {e}")

    # 2. Update Sightseeing Sheet
    try:
        sight_ws = sheet.worksheet('Sightseeing')
        records = sight_ws.get_all_records()
        headers = sight_ws.row_values(1)
        print("Current headers in Sightseeing:", headers)
        
        if 'image' not in headers:
            updated_headers = headers + ['image']
            
            # Map of place ID to default Unsplash images of Kumarakom/Kerala
            image_map = {
                "bird-sanctuary": "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80",
                "canal-cruise": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
                "houseboat-tour": "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
            }
            
            rows_to_update = [updated_headers]
            for record in records:
                place_id = record.get('id', '')
                default_img = image_map.get(place_id, "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80")
                record['image'] = record.get('image') or default_img
                
                row = [record.get(h, "") for h in updated_headers]
                rows_to_update.append(row)
                
            print("Migrating Sightseeing sheet with new headers:", updated_headers)
            sight_ws.clear()
            sight_ws.update(values=rows_to_update, range_name=f"A1:{col_letter(len(updated_headers))}{len(rows_to_update)}")
            print("Sightseeing sheet migration complete!")
        else:
            print("Sightseeing image column already exists.")
    except Exception as e:
        print(f"Error migrating Sightseeing sheet: {e}")

if __name__ == '__main__':
    migrate()
