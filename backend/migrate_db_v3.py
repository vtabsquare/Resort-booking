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

# Old columns to remove
OLD_COLS = ['breakfastVeg', 'breakfastNonVeg', 'lunchVeg', 'lunchNonVeg', 'dinnerVeg', 'dinnerNonVeg']

# New 18 combo columns to add
NEW_COLS = [
    'bfVeg1', 'bfVeg2', 'bfVeg3',   # Breakfast Veg Combo 1, 2, 3
    'bfNv1',  'bfNv2',  'bfNv3',    # Breakfast Non-Veg Combo 1, 2, 3
    'lnVeg1', 'lnVeg2', 'lnVeg3',   # Lunch Veg Combo 1, 2, 3
    'lnNv1',  'lnNv2',  'lnNv3',    # Lunch Non-Veg Combo 1, 2, 3
    'dnVeg1', 'dnVeg2', 'dnVeg3',   # Dinner Veg Combo 1, 2, 3
    'dnNv1',  'dnNv2',  'dnNv3',    # Dinner Non-Veg Combo 1, 2, 3
]

# Default combo seeds per plan
DEFAULTS = {
    'breakfast': {
        'bfVeg1': 'Idli + Sambar + Coconut Chutney',
        'bfVeg2': 'Masala Dosa + Tomato Chutney',
        'bfVeg3': 'Poha + Pickle + Banana',
        'bfNv1': 'Egg Omelette + Toast + Juice',
        'bfNv2': 'Chicken Sausage + Scrambled Eggs',
        'bfNv3': 'Fish Fry + Puttu + Kadala Curry',
        'lnVeg1': '', 'lnVeg2': '', 'lnVeg3': '',
        'lnNv1': '', 'lnNv2': '', 'lnNv3': '',
        'dnVeg1': '', 'dnVeg2': '', 'dnVeg3': '',
        'dnNv1': '', 'dnNv2': '', 'dnNv3': '',
    },
    'half-board': {
        'bfVeg1': 'Idli + Sambar + Coconut Chutney',
        'bfVeg2': 'Masala Dosa + Tomato Chutney',
        'bfVeg3': 'Poha + Pickle + Banana',
        'bfNv1': 'Egg Omelette + Toast + Juice',
        'bfNv2': 'Chicken Sausage + Scrambled Eggs',
        'bfNv3': 'Fish Fry + Puttu + Kadala Curry',
        'lnVeg1': 'Kerala Veg Sadya (Full Meals)',
        'lnVeg2': 'Paneer Butter Masala + Chapathi',
        'lnVeg3': 'Dal Tadka + Jeera Rice + Papad',
        'lnNv1': 'Thalassery Chicken Biryani',
        'lnNv2': 'Fish Curry Meals (Kerala Style)',
        'lnNv3': 'Egg Roast + Parotta',
        'dnVeg1': 'Chapathi + Veg Korma + Dal',
        'dnVeg2': 'Kadai Paneer + Naan + Raita',
        'dnVeg3': 'Veg Fried Rice + Manchurian',
        'dnNv1': 'Mutton Coconut Fry + Appam',
        'dnNv2': 'Tandoori Chicken + Naan + Salad',
        'dnNv3': 'Kerala Parotta + Chicken Curry',
    },
    'full-board': {
        'bfVeg1': 'Idli + Sambar + Coconut Chutney',
        'bfVeg2': 'Masala Dosa + Tomato Chutney',
        'bfVeg3': 'Poha + Pickle + Banana',
        'bfNv1': 'Egg Omelette + Toast + Juice',
        'bfNv2': 'Chicken Sausage + Scrambled Eggs',
        'bfNv3': 'Fish Fry + Puttu + Kadala Curry',
        'lnVeg1': 'Kerala Veg Sadya (Full Meals)',
        'lnVeg2': 'Paneer Butter Masala + Chapathi',
        'lnVeg3': 'Dal Tadka + Jeera Rice + Papad',
        'lnNv1': 'Thalassery Chicken Biryani',
        'lnNv2': 'Fish Curry Meals (Kerala Style)',
        'lnNv3': 'Egg Roast + Parotta',
        'dnVeg1': 'Chapathi + Veg Korma + Dal',
        'dnVeg2': 'Kadai Paneer + Naan + Raita',
        'dnVeg3': 'Veg Fried Rice + Manchurian',
        'dnNv1': 'Mutton Coconut Fry + Appam',
        'dnNv2': 'Tandoori Chicken + Naan + Salad',
        'dnNv3': 'Kerala Parotta + Chicken Curry',
    }
}

def migrate():
    print("Connecting to Google Sheets...")
    sheet = get_sheet()

    try:
        food_ws = sheet.worksheet('Food')
        records = food_ws.get_all_records()
        headers = food_ws.row_values(1)
        print("Current Food headers:", headers)

        # Check if we need to migrate
        already_done = all(col in headers for col in NEW_COLS)
        if already_done:
            print("Food sheet already has new combo columns. No migration needed.")
            return

        # Build updated headers: remove old cols, add new cols
        updated_headers = [h for h in headers if h not in OLD_COLS]
        for col in NEW_COLS:
            if col not in updated_headers:
                updated_headers.append(col)

        print("New headers will be:", updated_headers)

        rows_to_update = [updated_headers]
        for record in records:
            pkg_id = record.get('id', '')
            seed = DEFAULTS.get(pkg_id, DEFAULTS['full-board'])  # use full-board defaults for unknown plans

            # Remove old fields, populate new combo fields
            for old_col in OLD_COLS:
                record.pop(old_col, None)

            for col, val in seed.items():
                if not record.get(col):  # only if not already set
                    record[col] = val

            row = [record.get(h, '') for h in updated_headers]
            rows_to_update.append(row)

        print(f"Writing {len(rows_to_update)} rows to Food sheet...")
        food_ws.clear()
        food_ws.update(
            values=rows_to_update,
            range_name=f"A1:{col_letter(len(updated_headers))}{len(rows_to_update)}"
        )
        print("Food sheet migration v3 complete!")

    except Exception as e:
        print(f"Error migrating Food sheet: {e}")
        import traceback; traceback.print_exc()

if __name__ == '__main__':
    migrate()
