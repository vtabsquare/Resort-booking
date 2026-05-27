// Resort Data Model for "Eden Spot Homestay, Marayoor, Kerala"

export const resortDetails = {
  name: "Eden Spot Homestay",
  tagline: "Just a Peaceful home away from Home",
  location: "Marayoor, Idukki, Kerala, India",
  address: "The House of Shalom, Puthachivayal, Marayoor, Idukki, Kerala 685620",
  phone: "+91 94462 20966, +91 94469 33963",
  email: "edenspot.homestay@gmail.com",
  rating: 4.9,
  reviewsCount: 412,
  description: "Located in the picturesque valley of Marayoor, Idukki, Eden Spot Homestay offers a peaceful retreat surrounded by natural sandalwood forests and scenic green hills. Experience warm homestay hospitality, authentic home-cooked Kerala delicacies, and a tranquil escape from the bustle of daily life.",
  heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
  ]
};

export const amenitiesList = [
  { id: "wifi", name: "Complimentary High-Speed Wi-Fi", category: "Connectivity" },
  { id: "pool", name: "Infinity Pool & Private Lake Deck", category: "Leisure" },
  { id: "ayurveda", name: "Ayurvedic Treatment Wellness Center", category: "Wellness" },
  { id: "dining", name: "Traditional Kerala & Multi-Cuisine Fine Dining", category: "Food & Beverage" },
  { id: "butler", name: "24/7 Dedicated Butler Service", category: "Service" },
  { id: "yoga", name: "Morning Lakefront Yoga Pavilion", category: "Wellness" },
  { id: "shuttle", name: "Private Speedboat Airport Pickups", category: "Service" },
  { id: "bar", name: "Sunset Floating Beverage Lounge", category: "Food & Beverage" },
  { id: "tours", name: "Bespoke Canal Cruises & Houseboat Safaris", category: "Service" },
  { id: "ac", name: "Fully Climate-Controlled Villas", category: "Comfort" }
];

export const roomsData = [
  {
    id: "heritage-lakefront-villa",
    name: "Heritage Lakefront Pool Villa",
    category: "Villa",
    price: 35000,
    rating: 4.9,
    reviewsCount: 142,
    size: 1100,
    view: "Direct Vembanad Lake View",
    bedType: "King Bed",
    maxOccupancy: { adults: 2, children: 1, rooms: 1 },
    description: "Perched right at the edge of the scenic Vembanad Lake, this private villa features traditional woodwork and private pools. It includes a spacious teak sun deck, private stairs descending to the lake edge, and a premium open-roof rain shower bathroom.",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80"
    ],
    highlights: [
      "Private Lakefront Infinity Pool",
      "Traditional Kerala Woodwork Interior",
      "Open-air Garden Bathroom",
      "Complementary Evening Tea & Snacks"
    ],
    amenities: ["wifi", "ac", "dining", "butler", "shuttle", "pool"]
  },
  {
    id: "meandering-pool-cottage",
    name: "Meandering Pool Premium Cottage",
    category: "Cottage",
    price: 24000,
    rating: 4.8,
    reviewsCount: 114,
    size: 900,
    view: "Direct Access to Meandering Pool",
    bedType: "1 King Bed",
    maxOccupancy: { adults: 2, children: 2, rooms: 1 },
    description: "A heritage cottage linked directly to our unique 150-meter meandering swimming pool. Walk out from your private veranda straight into the cool water. Features traditional architecture and beautiful water garden scenery.",
    images: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80"
    ],
    highlights: [
      "Veranda with Direct Step-into Meandering Pool",
      "Climate Controlled Living Chamber",
      "Heritage Nalukettu Courtyard Touch",
      "Hammock in Private Garden Patch"
    ],
    amenities: ["wifi", "ac", "pool", "shuttle", "dining"]
  },
  {
    id: "luxury-houseboat-suite",
    name: "Vembanad Luxury Floating Houseboat",
    category: "Houseboat",
    price: 42000,
    rating: 5.0,
    reviewsCount: 98,
    size: 1200,
    view: "360° Floating Backwater View",
    bedType: "1 Imperial King Bed",
    maxOccupancy: { adults: 2, children: 1, rooms: 1 },
    description: "A luxury private houseboat (Kettuvallam) anchored at the resort's private jetty. Fully climate-controlled inside with modern amenities while cruising the peaceful backwaters. Comes with a dedicated private captain and onboard chef.",
    images: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80"
    ],
    highlights: [
      "Scenic mountain valley treks",
      "Private Onboard Traditional Chef",
      "Eco-Friendly Coir & Bamboo Design",
      "Fully AC Luxury Bed Suite"
    ],
    amenities: ["wifi", "ac", "butler", "shuttle", "dining", "tours"]
  },
  {
    id: "presidential-backwater-sanctuary",
    name: "Eden Spot Presidential Sanctuary",
    category: "Sanctuary",
    price: 85000,
    rating: 4.95,
    reviewsCount: 30,
    size: 2400,
    view: "Panoramic Mountain Sunset View",
    bedType: "2 Grand Master King Beds",
    maxOccupancy: { adults: 6, children: 3, rooms: 2 },
    description: "The crown jewel of Eden Spot, this massive mountain cottage features two master bedrooms, private dining pavilion, and scenic views of the valleys.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
    ],
    highlights: [
      "Mountain View Panoramic Sun Deck",
      "Private In-villa Ayurvedic Spa Suite",
      "Dedicated Butler & Private Chef Team",
      "Exclusive Sunrise Trekking & Viewing Deck"
    ],
    amenities: ["wifi", "ac", "pool", "ayurveda", "dining", "butler", "yoga", "shuttle", "bar"]
  }
];

// Sightseeing spots in Kerala
export const keralaSightseeingPlaces = [
  {
    id: "sandalwood-forest",
    name: "Marayoor Sandalwood Forest Walk",
    price: 1000,
    description: "Explore the only natural sandalwood forests in Kerala under local expert guidance.",
    duration: "2 Hours"
  },
  {
    id: "chinnar-sanctuary",
    name: "Chinnar Wildlife Sanctuary Safari",
    price: 3000,
    description: "Trek through the dry deciduous forests of Chinnar to spot grizzled giant squirrels, star tortoises, and birds.",
    duration: "4 Hours"
  },
  {
    id: "lakkam-waterfalls",
    name: "Lakkam Waterfalls & Tea Gardens Tour",
    price: 1500,
    description: "Visit the stunning Lakkam Waterfalls cascading down the rocks, surrounded by lush tea gardens.",
    duration: "3 Hours"
  },
  {
    id: "kanthalloor-orchards",
    name: "Kanthalloor Fruit Orchards Visit",
    price: 2000,
    description: "Experience the cool climate and farming of apples, oranges, strawberries, and passion fruit in Kanthalloor.",
    duration: "3 Hours"
  },
  {
    id: "munnar-echo-point",
    name: "Munnar Echo Point & Dam Sightseeing",
    price: 4000,
    description: "Take a trip to Munnar's scenic Echo Point, Mattupetty Dam, and Kundala Lake.",
    duration: "Full Day (6 Hours)"
  }
];

export const mockReviews = [
  {
    id: 1,
    name: "Anjali Menon",
    date: "May 12, 2026",
    rating: 5,
    comment: "An absolute dream. The Heritage Lakefront Pool Villa was worth every single rupee. Waking up to the view of Vembanad Lake and having the resort arrange a private boat ride from our room deck is a memory we will cherish forever. Service is outstanding.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    room: "Heritage Lakefront Pool Villa"
  },
  {
    id: 2,
    name: "Dr. Rajesh Kurup",
    date: "April 28, 2026",
    rating: 5,
    comment: "Outstanding wellness retreat. Visited many high-end resorts globally, but the Ayurvedic spa treatments and quietness of the Meandering Pool Cottage were spectacular. The local cuisine (Karimeen Pollichathu) is excellent.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    room: "Meandering Pool Premium Cottage"
  },
  {
    id: 3,
    name: "Elena & Jean Dupont",
    date: "April 15, 2026",
    rating: 4.8,
    comment: "Wonderful architecture. The floating houseboat room was magical and extremely clean. The yoga sessions by the lake are peaceful. We had a great time and will return to Kumarakom.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
    room: "Vembanad Luxury Floating Houseboat"
  }
];

export const initialBookings = [
  {
    id: "B-9842",
    guestName: "Anjali Menon",
    email: "anjali.menon@gmail.com",
    roomName: "Heritage Lakefront Pool Villa",
    checkIn: "2026-06-01",
    checkOut: "2026-06-06",
    guests: "2 Adults",
    totalAmount: 215000,
    status: "Confirmed",
    dateCreated: "2026-05-10"
  },
  {
    id: "B-5211",
    guestName: "Dr. Rajesh Kurup",
    email: "rajesh.kurup@wellness.in",
    roomName: "Meandering Pool Premium Cottage",
    checkIn: "2026-05-25",
    checkOut: "2026-05-30",
    guests: "2 Adults, 2 Children",
    totalAmount: 144000,
    status: "Pending",
    dateCreated: "2026-05-18"
  },
  {
    id: "B-1290",
    guestName: "Vikram Chandrasekhar",
    email: "vikram@chandragroup.com",
    roomName: "Eden Spot Presidential Sanctuary",
    checkIn: "2026-07-12",
    checkOut: "2026-07-19",
    guests: "4 Adults, 2 Children",
    totalAmount: 685000,
    status: "Confirmed",
    dateCreated: "2026-05-15"
  }
];

export const foodPackages = [
  {
    id: 'breakfast-standard',
    type: 'breakfast',
    name: 'Standard Breakfast',
    price: 300,
    veg1: 'Idli + Sambar + Chutney',
    veg2: 'Masala Dosa + Chutney',
    veg3: 'Poha + Banana',
    nv1: 'Egg Omelette + Toast',
    nv2: 'Chicken Sausage + Eggs',
    nv3: 'Fish Fry + Puttu'
  },
  {
    id: 'lunch-standard',
    type: 'lunch',
    name: 'Traditional Lunch Buffet',
    price: 500,
    veg1: 'Kerala Veg Sadya',
    veg2: 'Paneer Masala + Chapathi',
    veg3: 'Dal Tadka + Rice',
    nv1: 'Chicken Biryani',
    nv2: 'Fish Curry Meals',
    nv3: 'Egg Roast + Parotta'
  },
  {
    id: 'dinner-standard',
    type: 'dinner',
    name: 'Deluxe Dinner Buffet',
    price: 600,
    veg1: 'Chapathi + Veg Korma',
    veg2: 'Kadai Paneer + Naan',
    veg3: 'Veg Fried Rice',
    nv1: 'Mutton Fry + Appam',
    nv2: 'Tandoori Chicken + Naan',
    nv3: 'Parotta + Chicken Curry'
  }
];

export const sightseeingPackages = [
  {
    id: 'jeep-classic',
    name: 'Munnar Classic Jeep Tour',
    description: 'Explore the prime highlights of Munnar in a rugged 4x4 Jeep. Enjoy beautiful tea plantation views, mist-clad lakes, and high-altitude viewpoints. Driver and Jeep transport are fully included.',
    places: 'Mattupetty Dam, Echo Point, Kundala Lake, Top Station, Tea Museum',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    priceStandard: 5000,
    priceLow: 4000,
    pricePeak: 6000,
    price: 5000
  },
  {
    id: 'jeep-wild',
    name: 'Munnar Wild Offroad Adventure',
    description: 'An offroad journey through rugged terrains, deep woods, and high-altitude peaks in a specialized 4x4 Jeep. Perfect for thrill-seekers looking to explore Munnar\'s wild side. Driver and Jeep transport are fully included.',
    places: 'Kolukkumalai Sunrise, Lockhart Gap, Anakulam Elephant Spot, Attukad Waterfalls, Chokramudi Peak',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    priceStandard: 7500,
    priceLow: 6000,
    pricePeak: 9000,
    price: 7500
  }
];


