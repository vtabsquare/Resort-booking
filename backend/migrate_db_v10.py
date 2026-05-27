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
        print("Checking QRScanners worksheet...")
        try:
            ws = sheet.worksheet('QRScanners')
            print("QRScanners worksheet already exists.")
        except gspread.exceptions.WorksheetNotFound:
            print("Creating QRScanners worksheet...")
            ws = sheet.add_worksheet(title='QRScanners', rows="100", cols="10")
            print("QRScanners worksheet created successfully.")

        ws.clear()
        
        headers = ["id", "name", "upiId", "qrImage", "isActive"]
        rows = [
            headers,
            [
                "qr-gpay", 
                "Google Pay (GPay)", 
                "gpay-resort@okaxis", 
                "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=gpay-resort@okaxis&pn=Nirvana%20Resort", 
                "true"
            ],
            [
                "qr-phonepe", 
                "PhonePe", 
                "phonepe-resort@ybl", 
                "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=phonepe-resort@ybl&pn=Nirvana%20Resort", 
                "true"
            ],
            [
                "qr-paytm", 
                "Paytm", 
                "paytm-resort@paytm", 
                "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=paytm-resort@paytm&pn=Nirvana%20Resort", 
                "true"
            ]
        ]
        
        ws.update(values=rows, range_name=f"A1:E{len(rows)}")
        print("QRScanners worksheet populated with default QR scanner codes successfully.")
        
    except Exception as e:
        print(f"Error migrating QRScanners sheet: {e}")

if __name__ == '__main__':
    migrate()
