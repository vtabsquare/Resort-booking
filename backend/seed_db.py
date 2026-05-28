import os
import json
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials', 'google-credentials.json')
if not os.path.exists(CREDENTIALS_FILE):
    CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'google-credentials.json')

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def get_sheet():
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
    client = gspread.authorize(creds)
    return client.open_by_key(SPREADSHEET_ID)

# Initial data mapped from resortData.js and schema
seed_data = {
    "Rooms": [
        ["id", "name", "category", "price", "rating", "reviewsCount", "size", "view", "bedType", "isOccupied", "amenities", "description", "images"],
        [
            "heritage-lakefront-villa",
            "Heritage Lakefront Pool Villa",
            "Villa",
            35000,
            4.9,
            142,
            1100,
            "Direct Vembanad Lake View",
            "King Bed",
            False,
            "wifi,ac,dining,butler,shuttle,pool",
            "Perched right at the edge of the scenic Vembanad Lake, this private villa features traditional woodwork and private pools. It includes a spacious teak sun deck, private stairs descending to the lake edge, and a premium open-roof rain shower bathroom.",
            '["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80"]'
        ],
        [
            "meandering-pool-cottage",
            "Meandering Pool Premium Cottage",
            "Cottage",
            24000,
            4.8,
            114,
            900,
            "Direct Access to Meandering Pool",
            "1 King Bed",
            False,
            "wifi,ac,pool,shuttle,dining",
            "A heritage cottage linked directly to our unique 150-meter meandering swimming pool. Walk out from your private veranda straight into the cool water. Features traditional architecture and beautiful water garden scenery.",
            '["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80"]'
        ],
        [
            "luxury-houseboat-suite",
            "Vembanad Luxury Floating Houseboat",
            "Houseboat",
            42000,
            5.0,
            98,
            1200,
            "360° Floating Backwater View",
            "1 Imperial King Bed",
            False,
            "wifi,ac,butler,shuttle,dining,tours",
            "A luxury private houseboat (Kettuvallam) anchored at the resort's private jetty. Fully climate-controlled inside with modern amenities while cruising the peaceful backwaters. Comes with a dedicated private captain and onboard chef.",
            '["https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80"]'
        ],
        [
            "presidential-backwater-sanctuary",
            "Nirvana Presidential Backwater Sanctuary",
            "Sanctuary",
            85000,
            4.95,
            30,
            2400,
            "Panoramic Lake Sunset View",
            "2 Grand Master King Beds",
            False,
            "wifi,ac,pool,ayurveda,dining,butler,yoga,shuttle,bar",
            "The crown jewel of Nirvana, this massive lakeside estate features two master bedrooms, private dining pavilion, a personal Ayurvedic massage cottage, and a large infinity pool jutting out towards the lake.",
            '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"]'
        ]
    ],
    "Bookings": [
        ["id", "guestName", "email", "phone", "roomName", "checkIn", "checkOut", "guests", "food", "sightseeing", "specialRequests", "totalAmount", "status", "dateCreated", "gstRate"],
        ["B-9842", "Anjali Menon", "anjali.menon@gmail.com", "+919876543210", "Heritage Lakefront Pool Villa", "2026-06-15", "2026-06-18", "2 Adults", "None", "None", "None", 105000, "Confirmed", "2026-05-20", "12"]
    ],
    "Reviews": [
        ["id", "name", "date", "rating", "comment", "room", "avatar", "approved"],
        ["1", "Anjali Menon", "May 2026", 5, "Absolutely stunning...", "Heritage Lakefront Pool Villa", "url", True]
    ],
    "Food": [
        ["id", "type", "name", "price", "veg1", "veg2", "veg3", "nv1", "nv2", "nv3"],
        ["breakfast-standard", "breakfast", "Standard Breakfast", 300, 
         "Idli + Sambar + Chutney", "Masala Dosa + Chutney", "Poha + Banana", 
         "Egg Omelette + Toast", "Chicken Sausage + Eggs", "Fish Fry + Puttu"],
        ["lunch-standard", "lunch", "Traditional Lunch Buffet", 500, 
         "Kerala Veg Sadya", "Paneer Masala + Chapathi", "Dal Tadka + Rice", 
         "Chicken Biryani", "Fish Curry Meals", "Egg Roast + Parotta"],
        ["dinner-standard", "dinner", "Deluxe Dinner Buffet", 600, 
         "Chapathi + Veg Korma", "Kadai Paneer + Naan", "Veg Fried Rice", 
         "Mutton Fry + Appam", "Tandoori Chicken + Naan", "Parotta + Chicken Curry"]
    ],
    "Sightseeing": [
        ["id", "name", "description", "places", "image", "priceStandard", "priceLow", "pricePeak"],
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
    ],
    "settings": [
        ["key", "value"],
        ["seasonalMultiplier", "1.0"],
        ["discountEnabled", "false"],
        ["activeDiscountType", "standard"],
        ["discountLow", "500"],
        ["discountStandard", "1000"],
        ["discountPeak", "1500"],
        ["gstRate", "12"],
        ["facebookLink", "#"],
        ["instagramLink", "#"],
        ["googleMapsEmbed", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3935.1322238461943!2d76.42159637587787!3d9.505086890577532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087df8646b9a89%3A0xb3ba1a166cb3f9cf!2sKumarakom%20Backwaters!5e0!3m2!1sen!2sin!4v1716200000000!5m2!1sen!2sin"]
    ],
    "Admins": [
        ["id", "username", "password"],
        ["admin_1", "gokul", "gokul@45"]
    ],
    "Gallery": [
        ["id", "url", "name"],
        ["1", "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80", "Main Pool Area"],
        ["2", "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80", "Backwater View"],
        ["3", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", "Luxury Suite"],
        ["4", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80", "Water Garden Cottage"],
        ["5", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", "Presidential Sanctuary"]
    ],

    "Amenities ": [
        ["id", "name", "icon"],
        ["wifi", "Complimentary High-Speed Wi-Fi", "📶"],
        ["pool", "Infinity Pool & Private Lake Deck", "🏊"],
        ["ayurveda", "Ayurvedic Treatment Wellness Center", "💆"],
        ["dining", "Traditional Kerala & Multi-Cuisine Fine Dining", "🍽️"],
        ["butler", "24/7 Dedicated Butler Service", "🛎️"],
        ["yoga", "Morning Lakefront Yoga Pavilion", "🧘"],
        ["shuttle", "Private Speedboat Airport Pickups", "⛵"],
        ["bar", "Sunset Floating Beverage Lounge", "🥂"],
        ["tours", "Bespoke Canal Cruises & Houseboat Safaris", "🚤"],
        ["ac", "Fully Climate-Controlled Villas", "❄️"],
        ["gym", "Fitness Centre", "🏋️"],
        ["bonfire", "Bonfire Evenings", "🔥"]
    ]
}

def seed():
    print("Connecting to Google Sheets...")
    sheet = get_sheet()
    
    for table_name, data in seed_data.items():
        try:
            print(f"Checking table: {table_name}")
            try:
                worksheet = sheet.worksheet(table_name)
            except gspread.exceptions.WorksheetNotFound:
                print(f"Creating worksheet {table_name}...")
                worksheet = sheet.add_worksheet(title=table_name, rows="100", cols="20")
                
            print(f"Clearing and populating {table_name}...")
            worksheet.clear()
            worksheet.update(values=data, range_name=f"A1:{chr(65+len(data[0])-1)}{len(data)}")
            
        except Exception as e:
            print(f"Error seeding {table_name}: {e}")
            
    print("Seeding complete!")

if __name__ == '__main__':
    seed()
