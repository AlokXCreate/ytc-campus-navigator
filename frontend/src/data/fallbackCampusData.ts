import {
  CampusSummary,
  Building,
  Room,
  Facility,
  PointOfInterest,
  CampusBoundary,
  FloorPlan,
  CampusPath,
  Floor,
  IndoorNavigationNode,
  IndoorNavigationEdge,
  FloorTransition
} from '../types/campus';

export const fallbackCampusSummary: CampusSummary = {
  institution_name: "Yashoda Technical Campus",
  short_name: "YTC Satara",
  address: "NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra, India",
  department: "Artificial Intelligence and Data Science",
  total_buildings: 9,
  total_rooms: 23,
  total_facilities: 6,
  total_pois: 14,
  total_paths: 15,
  total_floor_plans: 6,
  center_latitude: 17.7215,
  center_longitude: 74.0205,
  building_types: [
    "Academic Engineering",
    "Administrative Academic",
    "Academic Pharmacy",
    "Library",
    "Workshop",
    "Amenity",
    "Residential",
    "Sports"
  ],
  is_demo_dataset: true
};

export const fallbackCampusBoundary: CampusBoundary = {
  "type": "Feature",
  "properties": {
    "name": "YTC Satara Main Campus Boundary",
    "institution": "Yashoda Technical Campus, Satara",
    "area_hectares": 8.4,
    "is_demonstration": true
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          74.0185,
          17.7198
        ],
        [
          74.0228,
          17.7198
        ],
        [
          74.0232,
          17.7245
        ],
        [
          74.0188,
          17.7245
        ],
        [
          74.0185,
          17.7215
        ],
        [
          74.0185,
          17.7198
        ]
      ]
    ]
  }
};

export const fallbackBuildings: Building[] = [
  {
    "id": "bldg-a",
    "name": "Main Administrative & Academic Building",
    "building_code": "ADM-A",
    "description": "Houses the Directorate, Principal Office, Student Services, Registrar, and Central Administration.",
    "latitude": 17.7218,
    "longitude": 74.0202,
    "entrance_latitude": 17.7216,
    "entrance_longitude": 74.0202,
    "total_floors": 4,
    "available_floors": [
      0,
      1,
      2,
      3
    ],
    "building_type": "administrative_academic",
    "image_url": "/images/bldg-admin.jpg",
    "is_active": true
  },
  {
    "id": "bldg-b",
    "name": "Engineering & Technology Block",
    "building_code": "ENG-B",
    "description": "Home to the AI & DS, Computer, Mechanical, Civil, and Electrical Engineering Departments, faculty offices, and high-performance labs.",
    "latitude": 17.7224,
    "longitude": 74.0208,
    "entrance_latitude": 17.7222,
    "entrance_longitude": 74.0207,
    "total_floors": 4,
    "available_floors": [
      0,
      1,
      2,
      3
    ],
    "building_type": "academic_engineering",
    "image_url": "/images/bldg-eng.jpg",
    "is_active": true
  },
  {
    "id": "bldg-c",
    "name": "Pharmacy & Polytechnic Complex",
    "building_code": "PHARM-C",
    "description": "Houses Faculty of Pharmacy, Diploma Engineering departments, chemical laboratories, and research chambers.",
    "latitude": 17.7227,
    "longitude": 74.0195,
    "entrance_latitude": 17.7225,
    "entrance_longitude": 74.0196,
    "total_floors": 3,
    "available_floors": [
      0,
      1,
      2
    ],
    "building_type": "academic_pharmacy",
    "image_url": "/images/bldg-pharm.jpg",
    "is_active": true
  },
  {
    "id": "bldg-d",
    "name": "Central Library & Knowledge Resource Center",
    "building_code": "LIB-D",
    "description": "Two-storey library housing over 40,000 volumes, national/international journals, digital reading lounge, and research cubicles.",
    "latitude": 17.7212,
    "longitude": 74.0212,
    "entrance_latitude": 17.7213,
    "entrance_longitude": 74.0211,
    "total_floors": 2,
    "available_floors": [
      0,
      1
    ],
    "building_type": "library",
    "image_url": "/images/bldg-library.jpg",
    "is_active": true
  },
  {
    "id": "bldg-e",
    "name": "Central Workshop & Innovation Hub",
    "building_code": "WS-E",
    "description": "Machining, welding, carpentry, foundry sections, and student robotics innovation and prototyping workspaces.",
    "latitude": 17.7231,
    "longitude": 74.0215,
    "entrance_latitude": 17.723,
    "entrance_longitude": 74.0213,
    "total_floors": 1,
    "available_floors": [
      0
    ],
    "building_type": "workshop",
    "image_url": "/images/bldg-workshop.jpg",
    "is_active": true
  },
  {
    "id": "bldg-f",
    "name": "Student Cafeteria & Canteen",
    "building_code": "CAN-F",
    "description": "Multi-cuisine food service, spacious dining hall, bakery, and open snack patio for students and staff.",
    "latitude": 17.7208,
    "longitude": 74.0198,
    "entrance_latitude": 17.7209,
    "entrance_longitude": 74.0199,
    "total_floors": 2,
    "available_floors": [
      0,
      1
    ],
    "building_type": "amenity",
    "image_url": "/images/bldg-canteen.jpg",
    "is_active": true
  },
  {
    "id": "bldg-g",
    "name": "Boys Hostel Complex",
    "building_code": "HSTL-B",
    "description": "Four-storey residential block with study halls, recreational lounge, and Wi-Fi connectivity.",
    "latitude": 17.7236,
    "longitude": 74.0222,
    "entrance_latitude": 17.7234,
    "entrance_longitude": 74.0221,
    "total_floors": 4,
    "available_floors": [
      0,
      1,
      2,
      3
    ],
    "building_type": "residential",
    "image_url": "/images/bldg-hostel.jpg",
    "is_active": true
  },
  {
    "id": "bldg-h",
    "name": "Girls Hostel Complex",
    "building_code": "HSTL-G",
    "description": "Dedicated secure residential facility with 24/7 security, solar water heating, and study amenities.",
    "latitude": 17.7239,
    "longitude": 74.02,
    "entrance_latitude": 17.7237,
    "entrance_longitude": 74.0201,
    "total_floors": 4,
    "available_floors": [
      0,
      1,
      2,
      3
    ],
    "building_type": "residential",
    "image_url": "/images/bldg-hostel-girls.jpg",
    "is_active": true
  },
  {
    "id": "bldg-i",
    "name": "Sports Complex & Athletic Ground",
    "building_code": "SPRT-I",
    "description": "Open athletic track, cricket pitch, basketball court, badminton facilities, and physical education office.",
    "latitude": 17.7202,
    "longitude": 74.022,
    "entrance_latitude": 17.7204,
    "entrance_longitude": 74.0218,
    "total_floors": 1,
    "available_floors": [
      0
    ],
    "building_type": "sports",
    "image_url": "/images/bldg-sports.jpg",
    "is_active": true
  }
];

export const fallbackPOIs: PointOfInterest[] = [
  {
    "id": "poi-gate",
    "name": "Main Entrance & Security Gate",
    "category": "gate",
    "description": "Primary entry and exit point on Wadhe Phata connecting to NH-4 highway.",
    "latitude": 17.721,
    "longitude": 74.019,
    "building_id": null,
    "entrance_latitude": 17.721,
    "entrance_longitude": 74.019,
    "icon": "DoorOpen",
    "image": "/images/poi-gate.jpg",
    "search_keywords": "gate, entrance, security, highway, wadhe phata, nh4",
    "is_active": true
  },
  {
    "id": "poi-park-a",
    "name": "Parking Area A (Students & Visitors)",
    "category": "parking",
    "description": "Main parking for two-wheelers and four-wheelers near Administration Building.",
    "latitude": 17.7213,
    "longitude": 74.0193,
    "building_id": null,
    "entrance_latitude": 17.7213,
    "entrance_longitude": 74.0193,
    "icon": "Car",
    "image": "/images/poi-parking.jpg",
    "search_keywords": "parking, bike, car, vehicle, two wheeler",
    "is_active": true
  },
  {
    "id": "poi-park-b",
    "name": "Parking Area B (Hostel & Workshop)",
    "category": "parking",
    "description": "Rear campus parking area dedicated for hostel residents and workshop staff.",
    "latitude": 17.7226,
    "longitude": 74.0218,
    "building_id": null,
    "entrance_latitude": 17.7226,
    "entrance_longitude": 74.0218,
    "icon": "Car",
    "image": "/images/poi-parking-b.jpg",
    "search_keywords": "parking, rear parking, hostel parking",
    "is_active": true
  },
  {
    "id": "poi-adm-office",
    "name": "Directorate & Principal Office",
    "category": "admin",
    "description": "Main administration, Principal office, and student services counters.",
    "latitude": 17.7216,
    "longitude": 74.0202,
    "building_id": "bldg-a",
    "entrance_latitude": 17.7216,
    "entrance_longitude": 74.0202,
    "icon": "Briefcase",
    "image": "/images/poi-admin.jpg",
    "search_keywords": "principal, director, administration, exam, fee counter, registrar, adm-a",
    "is_active": true
  },
  {
    "id": "poi-aids-dept",
    "name": "AI & Data Science Department",
    "category": "department",
    "description": "Academic offices, AI research chambers, and Deep Learning laboratories on Floor 2.",
    "latitude": 17.7222,
    "longitude": 74.0207,
    "building_id": "bldg-b",
    "entrance_latitude": 17.7222,
    "entrance_longitude": 74.0207,
    "icon": "Sparkles",
    "image": "/images/poi-aids.jpg",
    "search_keywords": "ai, data science, aids, artificial intelligence, eng-b, floor 2",
    "is_active": true
  },
  {
    "id": "poi-comp-dept",
    "name": "Computer Engineering Department",
    "category": "department",
    "description": "Computer Engineering HOD, faculty rooms, and software development labs on Floor 1.",
    "latitude": 17.7223,
    "longitude": 74.0206,
    "building_id": "bldg-b",
    "entrance_latitude": 17.7222,
    "entrance_longitude": 74.0207,
    "icon": "Code",
    "image": "/images/poi-computer.jpg",
    "search_keywords": "computer, cse, software, coding, floor 1, eng-b",
    "is_active": true
  },
  {
    "id": "poi-library",
    "name": "Central Library & Knowledge Hub",
    "category": "library",
    "description": "Over 40,000 academic volumes, journal subscriptions, and digital study cubicles.",
    "latitude": 17.7213,
    "longitude": 74.0211,
    "building_id": "bldg-d",
    "entrance_latitude": 17.7213,
    "entrance_longitude": 74.0211,
    "icon": "BookOpen",
    "image": "/images/poi-library.jpg",
    "search_keywords": "library, books, reading, journals, quiet study, e-resource, lib-d",
    "is_active": true
  },
  {
    "id": "poi-workshop",
    "name": "Central Workshop & Innovation Lab",
    "category": "workshop",
    "description": "Hands-on mechanical machining, welding, carpentry, and robotics testing areas.",
    "latitude": 17.723,
    "longitude": 74.0213,
    "building_id": "bldg-e",
    "entrance_latitude": 17.723,
    "entrance_longitude": 74.0213,
    "icon": "Wrench",
    "image": "/images/poi-workshop.jpg",
    "search_keywords": "workshop, mechanical, robotics, machining, welding, tools, ws-e",
    "is_active": true
  },
  {
    "id": "poi-canteen",
    "name": "Student Cafeteria & Food Court",
    "category": "canteen",
    "description": "Multi-cuisine fresh meals, refreshments, tea, coffee, and open dining tables.",
    "latitude": 17.7209,
    "longitude": 74.0199,
    "building_id": "bldg-f",
    "entrance_latitude": 17.7209,
    "entrance_longitude": 74.0199,
    "icon": "Coffee",
    "image": "/images/poi-canteen.jpg",
    "search_keywords": "canteen, food, cafeteria, breakfast, lunch, tea, snacks, can-f",
    "is_active": true
  },
  {
    "id": "poi-boys-hostel",
    "name": "Boys Hostel Complex",
    "category": "hostel",
    "description": "Four-storey residential quarters with high-speed internet and recreation zone.",
    "latitude": 17.7234,
    "longitude": 74.0221,
    "building_id": "bldg-g",
    "entrance_latitude": 17.7234,
    "entrance_longitude": 74.0221,
    "icon": "Home",
    "image": "/images/poi-hostel.jpg",
    "search_keywords": "hostel, boys hostel, residence, rooms, mess",
    "is_active": true
  },
  {
    "id": "poi-girls-hostel",
    "name": "Girls Hostel Complex",
    "category": "hostel",
    "description": "Secure residential complex with round-the-clock security and reading rooms.",
    "latitude": 17.7237,
    "longitude": 74.0201,
    "building_id": "bldg-h",
    "entrance_latitude": 17.7237,
    "entrance_longitude": 74.0201,
    "icon": "Home",
    "image": "/images/poi-hostel-girls.jpg",
    "search_keywords": "girls hostel, ladies hostel, residence, secure",
    "is_active": true
  },
  {
    "id": "poi-sports",
    "name": "Sports Complex & Athletic Ground",
    "category": "sports",
    "description": "Cricket field, basketball court, volleyball ground, and athletic running tracks.",
    "latitude": 17.7204,
    "longitude": 74.0218,
    "building_id": "bldg-i",
    "entrance_latitude": 17.7204,
    "entrance_longitude": 74.0218,
    "icon": "Trophy",
    "image": "/images/poi-sports.jpg",
    "search_keywords": "sports, cricket, basketball, athletic ground, football, fitness, sprt-i",
    "is_active": true
  },
  {
    "id": "poi-health",
    "name": "Health & First Aid Center",
    "category": "medical",
    "description": "First-aid medical support, resting beds, and emergency care.",
    "latitude": 17.7217,
    "longitude": 74.02,
    "building_id": "bldg-a",
    "entrance_latitude": 17.7216,
    "entrance_longitude": 74.0202,
    "icon": "HeartPulse",
    "image": "/images/poi-health.jpg",
    "search_keywords": "doctor, clinic, medical, first aid, emergency, health",
    "is_active": true
  },
  {
    "id": "poi-atm",
    "name": "ATM & Student Stationery Center",
    "category": "facility",
    "description": "24/7 Cash withdrawal ATM, photocopying, printing, and spiral binding service.",
    "latitude": 17.7211,
    "longitude": 74.0196,
    "building_id": null,
    "entrance_latitude": 17.7211,
    "entrance_longitude": 74.0196,
    "icon": "CreditCard",
    "image": "/images/poi-atm.jpg",
    "search_keywords": "atm, cash, xerox, print, stationery, banking",
    "is_active": true
  }
];

export const fallbackFacilities: Facility[] = [
  {
    "id": "fac-01",
    "name": "Main Entrance & Security Gate",
    "facility_type": "gate",
    "building_id": null,
    "latitude": 17.721,
    "longitude": 74.019,
    "description": "Primary campus entrance on Wadhe Phata connecting NH-4. Visitor registration and security desk.",
    "opening_information": "24/7 Access for authorized visitors & campus vehicles",
    "image_url": "/images/fac-gate.jpg"
  },
  {
    "id": "fac-02",
    "name": "Central Campus Cafeteria",
    "facility_type": "canteen",
    "building_id": "bldg-f",
    "latitude": 17.7208,
    "longitude": 74.0198,
    "description": "Breakfast, lunch, tea, and snack services with clean filtered drinking water stations.",
    "opening_information": "Monday to Saturday: 8:00 AM \u2013 7:00 PM",
    "image_url": "/images/fac-canteen.jpg"
  },
  {
    "id": "fac-03",
    "name": "Vehicle Parking Area A (Students & Visitors)",
    "facility_type": "parking",
    "building_id": null,
    "latitude": 17.7213,
    "longitude": 74.0193,
    "description": "Covered two-wheeler and four-wheeler parking lots near Main Admin Building.",
    "opening_information": "Open daily: 7:30 AM \u2013 8:30 PM",
    "image_url": "/images/fac-parking.jpg"
  },
  {
    "id": "fac-04",
    "name": "Health Center & First Aid Ward",
    "facility_type": "medical",
    "building_id": "bldg-a",
    "latitude": 17.7217,
    "longitude": 74.02,
    "description": "Emergency first-aid, doctor on call, ambulance assistance, and resting beds.",
    "opening_information": "Monday to Saturday: 9:00 AM \u2013 5:30 PM",
    "image_url": "/images/fac-medical.jpg"
  },
  {
    "id": "fac-05",
    "name": "ATM & Student Utility Store",
    "facility_type": "banking",
    "building_id": null,
    "latitude": 17.7211,
    "longitude": 74.0196,
    "description": "24/7 ATM kiosk, photocopy, stationery printing, and spiral binding shop.",
    "opening_information": "Stationery: 8:30 AM \u2013 6:30 PM; ATM: 24/7",
    "image_url": "/images/fac-utility.jpg"
  },
  {
    "id": "fac-06",
    "name": "Outdoor Basketball & Badminton Court",
    "facility_type": "sports",
    "building_id": "bldg-i",
    "latitude": 17.7202,
    "longitude": 74.022,
    "description": "All-weather concrete court with floodlights for evening athletic activities.",
    "opening_information": "Open daily: 6:00 AM \u2013 8:00 PM",
    "image_url": "/images/fac-sports.jpg"
  }
];

export const fallbackFloorPlans: FloorPlan[] = [
  {
    "id": "fp-bldg-b-fl2",
    "building_id": "bldg-b",
    "floor_number": 2,
    "floor_label": "Second Floor (AI & DS Department)",
    "image_path": "/floor-plans/eng-floor-2.svg",
    "width": 1000,
    "height": 600,
    "is_approximate": true,
    "description": "Department of Artificial Intelligence & Data Science Labs, Classrooms, and Faculty cabins."
  },
  {
    "id": "fp-bldg-a-fl0",
    "building_id": "bldg-a",
    "floor_number": 0,
    "floor_label": "Ground Floor (Administration)",
    "image_path": "/floor-plans/admin-floor-0.svg",
    "width": 1000,
    "height": 600,
    "is_approximate": true,
    "description": "Directorate, Examination Cell, Student Counter, and Central Reception."
  }
];

export const fallbackPaths: CampusPath[] = [
  {
    "id": "path-01",
    "source_node": "gate_main",
    "destination_node": "parking_a",
    "distance": 45.0,
    "path_type": "paved_road",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.721,
        74.019
      ],
      [
        17.7213,
        74.0193
      ]
    ]
  },
  {
    "id": "path-02",
    "source_node": "parking_a",
    "destination_node": "bldg_a_entrance",
    "distance": 85.0,
    "path_type": "pedestrian_walkway",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.7213,
        74.0193
      ],
      [
        17.7216,
        74.0202
      ]
    ]
  },
  {
    "id": "path-03",
    "source_node": "bldg_a_entrance",
    "destination_node": "bldg_b_entrance",
    "distance": 110.0,
    "path_type": "pedestrian_walkway",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.7216,
        74.0202
      ],
      [
        17.7222,
        74.0207
      ]
    ]
  },
  {
    "id": "path-04",
    "source_node": "bldg_a_entrance",
    "destination_node": "lib_entrance",
    "distance": 95.0,
    "path_type": "garden_pathway",
    "accessibility": "accessible",
    "geometry": [
      [
        17.7216,
        74.0202
      ],
      [
        17.7213,
        74.0211
      ]
    ]
  },
  {
    "id": "path-05",
    "source_node": "bldg_b_entrance",
    "destination_node": "workshop_entrance",
    "distance": 125.0,
    "path_type": "paved_walkway",
    "accessibility": "accessible",
    "geometry": [
      [
        17.7222,
        74.0207
      ],
      [
        17.723,
        74.0213
      ]
    ]
  },
  {
    "id": "path-06",
    "source_node": "gate_main",
    "destination_node": "canteen_entrance",
    "distance": 90.0,
    "path_type": "pedestrian_walkway",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.721,
        74.019
      ],
      [
        17.7209,
        74.0199
      ]
    ]
  },
  {
    "id": "path-07",
    "source_node": "canteen_entrance",
    "destination_node": "bldg_a_entrance",
    "distance": 80.0,
    "path_type": "pedestrian_walkway",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.7209,
        74.0199
      ],
      [
        17.7216,
        74.0202
      ]
    ]
  },
  {
    "id": "path-08",
    "source_node": "lib_entrance",
    "destination_node": "sports_ground",
    "distance": 130.0,
    "path_type": "paved_walkway",
    "accessibility": "accessible",
    "geometry": [
      [
        17.7213,
        74.0211
      ],
      [
        17.7204,
        74.0218
      ]
    ]
  },
  {
    "id": "path-09",
    "source_node": "bldg_a_entrance",
    "destination_node": "bldg_c_entrance",
    "distance": 115.0,
    "path_type": "pedestrian_walkway",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.7216,
        74.0202
      ],
      [
        17.7225,
        74.0196
      ]
    ]
  },
  {
    "id": "path-10",
    "source_node": "bldg_c_entrance",
    "destination_node": "girls_hostel_entrance",
    "distance": 120.0,
    "path_type": "paved_walkway",
    "accessibility": "accessible",
    "geometry": [
      [
        17.7225,
        74.0196
      ],
      [
        17.7237,
        74.0201
      ]
    ]
  },
  {
    "id": "path-11",
    "source_node": "bldg_b_entrance",
    "destination_node": "parking_b",
    "distance": 110.0,
    "path_type": "paved_road",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.7222,
        74.0207
      ],
      [
        17.7226,
        74.0218
      ]
    ]
  },
  {
    "id": "path-12",
    "source_node": "parking_b",
    "destination_node": "boys_hostel_entrance",
    "distance": 90.0,
    "path_type": "paved_walkway",
    "accessibility": "accessible",
    "geometry": [
      [
        17.7226,
        74.0218
      ],
      [
        17.7234,
        74.0221
      ]
    ]
  },
  {
    "id": "path-13",
    "source_node": "workshop_entrance",
    "destination_node": "boys_hostel_entrance",
    "distance": 95.0,
    "path_type": "connecting_path",
    "accessibility": "accessible",
    "geometry": [
      [
        17.723,
        74.0213
      ],
      [
        17.7234,
        74.0221
      ]
    ]
  },
  {
    "id": "path-14",
    "source_node": "canteen_entrance",
    "destination_node": "sports_ground",
    "distance": 170.0,
    "path_type": "secondary_pathway",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.7209,
        74.0199
      ],
      [
        17.7204,
        74.0218
      ]
    ]
  },
  {
    "id": "path-15",
    "source_node": "bldg_b_entrance",
    "destination_node": "lib_entrance",
    "distance": 105.0,
    "path_type": "pedestrian_walkway",
    "accessibility": "wheelchair_friendly",
    "geometry": [
      [
        17.7222,
        74.0207
      ],
      [
        17.7213,
        74.0211
      ]
    ]
  }
];

export const fallbackFloors: Floor[] = [
  {
    "id": "bldg-b-fl-0",
    "building_id": "bldg-b",
    "floor_number": 0,
    "floor_label": "Ground Floor",
    "floor_plan_image": "/floor-plans/engineering/ground.svg",
    "image_width": 1000,
    "image_height": 600,
    "is_approximate": true,
    "is_active": true
  },
  {
    "id": "bldg-b-fl-1",
    "building_id": "bldg-b",
    "floor_number": 1,
    "floor_label": "First Floor",
    "floor_plan_image": "/floor-plans/engineering/first.svg",
    "image_width": 1000,
    "image_height": 600,
    "is_approximate": true,
    "is_active": true
  },
  {
    "id": "bldg-b-fl-2",
    "building_id": "bldg-b",
    "floor_number": 2,
    "floor_label": "Second Floor (AI & DS)",
    "floor_plan_image": "/floor-plans/engineering/second.svg",
    "image_width": 1000,
    "image_height": 600,
    "is_approximate": true,
    "is_active": true
  },
  {
    "id": "bldg-a-fl-0",
    "building_id": "bldg-a",
    "floor_number": 0,
    "floor_label": "Ground Floor",
    "floor_plan_image": "/floor-plans/administration/ground.svg",
    "image_width": 1000,
    "image_height": 600,
    "is_approximate": true,
    "is_active": true
  },
  {
    "id": "bldg-c-fl-0",
    "building_id": "bldg-c",
    "floor_number": 0,
    "floor_label": "Ground Floor",
    "floor_plan_image": "/floor-plans/pharmacy/ground.svg",
    "image_width": 1000,
    "image_height": 600,
    "is_approximate": true,
    "is_active": true
  },
  {
    "id": "bldg-d-fl-0",
    "building_id": "bldg-d",
    "floor_number": 0,
    "floor_label": "Ground Floor",
    "floor_plan_image": "/floor-plans/library/ground.svg",
    "image_width": 1000,
    "image_height": 600,
    "is_approximate": true,
    "is_active": true
  }
];

export const fallbackRooms: Room[] = [
  {
    "id": "rm-eng-001",
    "room_name": "Applied Sciences Laboratory",
    "room_number": "ENG-001",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor": 0,
    "room_type": "laboratory",
    "description": "First-year engineering physics and chemistry experimental laboratory with modern apparatus.",
    "relative_x": 0.24,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-002",
    "room_name": "Basic Electrical Engineering Lab",
    "room_number": "ENG-002",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor": 0,
    "room_type": "laboratory",
    "description": "Electrical circuitry, AC/DC machines, transformers and basic power test benches.",
    "relative_x": 0.48,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-010",
    "room_name": "Main Seminar Hall (Ground)",
    "room_number": "ENG-010",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor": 0,
    "room_type": "seminar_hall",
    "description": "Acoustically treated auditorium with 250 seats, motorized projector, and surround audio.",
    "relative_x": 0.74,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-005",
    "room_name": "Central Workshop Annex",
    "room_number": "ENG-005",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor": 0,
    "room_type": "workshop",
    "description": "Precision fitting, carpentry, sheet metal and rapid prototyping work area.",
    "relative_x": 0.255,
    "relative_y": 0.75,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-008",
    "room_name": "Student Amenities & Health Cell",
    "room_number": "ENG-008",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor": 0,
    "room_type": "facility",
    "description": "First-aid medical bed, pure drinking water dispenser, and accessible rest rooms.",
    "relative_x": 0.745,
    "relative_y": 0.75,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-101",
    "room_name": "Computer Center 1 (Programming)",
    "room_number": "ENG-101",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor": 1,
    "room_type": "laboratory",
    "description": "70 Linux workstations equipped with Python, C++, Java and database development environments.",
    "relative_x": 0.24,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-102",
    "room_name": "Data Structures & Algorithms Lab",
    "room_number": "ENG-102",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor": 1,
    "room_type": "laboratory",
    "description": "Dedicated laboratory for computer engineering algorithm visualization and software projects.",
    "relative_x": 0.48,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-105",
    "room_name": "Faculty Staff Room (First Floor)",
    "room_number": "ENG-105",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor": 1,
    "room_type": "faculty_room",
    "description": "Workstations and consultation cabins for Assistant Professors and Lecturers.",
    "relative_x": 0.74,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-110",
    "room_name": "Classroom 101 (SE Engg)",
    "room_number": "ENG-110",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor": 1,
    "room_type": "classroom",
    "description": "Second-year engineering smart classroom with projector and stepped lecture seating.",
    "relative_x": 0.255,
    "relative_y": 0.75,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-eng-112",
    "room_name": "Classroom 102 (TE Engg)",
    "room_number": "ENG-112",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor": 1,
    "room_type": "classroom",
    "description": "Third-year lecture hall with audio amplification and high-bandwidth Wi-Fi access.",
    "relative_x": 0.745,
    "relative_y": 0.75,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-b-201",
    "room_name": "AI & DS Department Office",
    "room_number": "ENG-201",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor": 2,
    "room_type": "department_office",
    "description": "Head of Department (HOD) cabin, departmental records, student counseling desk, and AI faculty cubicles.",
    "relative_x": 0.24,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-b-202",
    "room_name": "Artificial Intelligence & Deep Learning Lab",
    "room_number": "ENG-204",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor": 2,
    "room_type": "laboratory",
    "description": "Specialized compute lab with NVIDIA RTX GPU workstations for computer vision, NLP, and neural network training.",
    "relative_x": 0.485,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-b-203",
    "room_name": "IoT & Robotics Research Lab",
    "room_number": "ENG-205",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor": 2,
    "room_type": "laboratory",
    "description": "Embedded systems laboratory equipped with Raspberry Pi, ESP32, LIDAR sensors, and robotic arm platforms.",
    "relative_x": 0.745,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-b-204",
    "room_name": "Smart Classroom 201 (BE AI & DS)",
    "room_number": "ENG-202",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor": 2,
    "room_type": "classroom",
    "description": "Final-year lecture room equipped with interactive smart podium, dual projection, and recording camera.",
    "relative_x": 0.255,
    "relative_y": 0.75,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-b-205",
    "room_name": "Cloud Computing & Big Data Lab",
    "room_number": "ENG-208",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor": 2,
    "room_type": "laboratory",
    "description": "Distributed computing and cluster administration training lab for Apache Spark and Kubernetes pipelines.",
    "relative_x": 0.745,
    "relative_y": 0.75,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-a-101",
    "room_name": "Director & Principal Office",
    "room_number": "ADM-001",
    "building_id": "bldg-a",
    "floor_id": "bldg-a-fl-0",
    "floor": 0,
    "room_type": "administrative_office",
    "description": "Office of the Campus Director and Principal with visitor waiting lounge.",
    "relative_x": 0.24,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-a-102",
    "room_name": "Student Section & Accounts Desk",
    "room_number": "ADM-002",
    "building_id": "bldg-a",
    "floor_id": "bldg-a-fl-0",
    "floor": 0,
    "room_type": "administrative_office",
    "description": "Fee counter, bonafide certificates, bus pass verification, and scholarship document counter.",
    "relative_x": 0.49,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-a-103",
    "room_name": "Central Conference Hall & Boardroom",
    "room_number": "ADM-003",
    "building_id": "bldg-a",
    "floor_id": "bldg-a-fl-0",
    "floor": 0,
    "room_type": "seminar_hall",
    "description": "Executive boardroom for Academic Council meetings, campus recruitment drives, and governing body sessions.",
    "relative_x": 0.75,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-a-104",
    "room_name": "Central Admissions & Counseling Cell",
    "room_number": "ADM-004",
    "building_id": "bldg-a",
    "floor_id": "bldg-a-fl-0",
    "floor": 0,
    "room_type": "administrative_office",
    "description": "CAP round verification center, prospectus distribution, and entrance exam guidance bureau.",
    "relative_x": 0.25,
    "relative_y": 0.75,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-c-101",
    "room_name": "Pharmaceutics Laboratory 1",
    "room_number": "PHARM-001",
    "building_id": "bldg-c",
    "floor_id": "bldg-c-fl-0",
    "floor": 0,
    "room_type": "laboratory",
    "description": "Solid dosage preparation, tablet compression, liquid formulation and quality testing lab.",
    "relative_x": 0.25,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-c-102",
    "room_name": "Pharmaceutical Chemistry Lab",
    "room_number": "PHARM-002",
    "building_id": "bldg-c",
    "floor_id": "bldg-c-fl-0",
    "floor": 0,
    "room_type": "laboratory",
    "description": "Synthesis of medicinal compounds, volumetric titrations, and chemical identification tests.",
    "relative_x": 0.75,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-f-101",
    "room_name": "Silent Reading Hall",
    "room_number": "LIB-001",
    "building_id": "bldg-d",
    "floor_id": "bldg-d-fl-0",
    "floor": 0,
    "room_type": "library",
    "description": "Large study hall with individual carrels and silent atmosphere for serious academic preparation.",
    "relative_x": 0.305,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  },
  {
    "id": "rm-f-102",
    "room_name": "Digital E-Resource Center",
    "room_number": "LIB-002",
    "building_id": "bldg-d",
    "floor_id": "bldg-d-fl-0",
    "floor": 0,
    "room_type": "library",
    "description": "30 internet multimedia stations for accessing DELNET, IEEE Xplore, and NPTEL courseware.",
    "relative_x": 0.695,
    "relative_y": 0.24,
    "is_accessible": true,
    "is_active": true
  }
];

export const fallbackIndoorNodes: IndoorNavigationNode[] = [
  {
    "id": "node_b0_entrance",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "entrance",
    "node_name": "Main Entrance Foyer",
    "relative_x": 0.5,
    "relative_y": 0.88,
    "room_id": null
  },
  {
    "id": "node_b0_c_mid",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "intersection",
    "node_name": "Ground Central Concourse",
    "relative_x": 0.5,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b0_c_west",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "corridor",
    "node_name": "West Corridor Junc",
    "relative_x": 0.24,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b0_c_east",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "corridor",
    "node_name": "East Corridor Junc",
    "relative_x": 0.74,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b0_stairs_w",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "staircase",
    "node_name": "Stairs A (West)",
    "relative_x": 0.085,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b0_stairs_e",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "staircase",
    "node_name": "Stairs B (East)",
    "relative_x": 0.915,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b0_lift",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "lift",
    "node_name": "Elevator 1",
    "relative_x": 0.655,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b0_rm_001",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "room",
    "node_name": "Applied Sciences Lab",
    "relative_x": 0.24,
    "relative_y": 0.24,
    "room_id": "rm-eng-001"
  },
  {
    "id": "node_b0_rm_002",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "room",
    "node_name": "Electrical Engg Lab",
    "relative_x": 0.48,
    "relative_y": 0.24,
    "room_id": "rm-eng-002"
  },
  {
    "id": "node_b0_rm_010",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "room",
    "node_name": "Main Seminar Hall",
    "relative_x": 0.74,
    "relative_y": 0.24,
    "room_id": "rm-eng-010"
  },
  {
    "id": "node_b0_rm_005",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "room",
    "node_name": "Central Workshop Annex",
    "relative_x": 0.255,
    "relative_y": 0.75,
    "room_id": "rm-eng-005"
  },
  {
    "id": "node_b0_rm_008",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "floor_number": 0,
    "node_type": "room",
    "node_name": "Amenities & First Aid",
    "relative_x": 0.745,
    "relative_y": 0.75,
    "room_id": "rm-eng-008"
  },
  {
    "id": "node_b1_c_mid",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "intersection",
    "node_name": "First Floor Central Corridor",
    "relative_x": 0.5,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b1_c_west",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "corridor",
    "node_name": "West Wing Corridor",
    "relative_x": 0.24,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b1_c_east",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "corridor",
    "node_name": "East Wing Corridor",
    "relative_x": 0.74,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b1_stairs_w",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "staircase",
    "node_name": "Stairs A (West)",
    "relative_x": 0.085,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b1_stairs_e",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "staircase",
    "node_name": "Stairs B (East)",
    "relative_x": 0.915,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b1_lift",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "lift",
    "node_name": "Elevator 1",
    "relative_x": 0.655,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b1_rm_101",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "room",
    "node_name": "Computer Center 1",
    "relative_x": 0.24,
    "relative_y": 0.24,
    "room_id": "rm-eng-101"
  },
  {
    "id": "node_b1_rm_102",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "room",
    "node_name": "Data Structures Lab",
    "relative_x": 0.48,
    "relative_y": 0.24,
    "room_id": "rm-eng-102"
  },
  {
    "id": "node_b1_rm_105",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "room",
    "node_name": "Faculty Staff Room",
    "relative_x": 0.74,
    "relative_y": 0.24,
    "room_id": "rm-eng-105"
  },
  {
    "id": "node_b1_rm_110",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "room",
    "node_name": "Classroom 101",
    "relative_x": 0.255,
    "relative_y": 0.75,
    "room_id": "rm-eng-110"
  },
  {
    "id": "node_b1_rm_112",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "floor_number": 1,
    "node_type": "room",
    "node_name": "Classroom 102",
    "relative_x": 0.745,
    "relative_y": 0.75,
    "room_id": "rm-eng-112"
  },
  {
    "id": "node_b2_c_mid",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "intersection",
    "node_name": "Second Floor Central Lobby",
    "relative_x": 0.5,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b2_c_west",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "corridor",
    "node_name": "AI Wing Corridor",
    "relative_x": 0.24,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b2_c_east",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "corridor",
    "node_name": "DS Wing Corridor",
    "relative_x": 0.74,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b2_stairs_w",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "staircase",
    "node_name": "Stairs A (West)",
    "relative_x": 0.085,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b2_stairs_e",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "staircase",
    "node_name": "Stairs B (East)",
    "relative_x": 0.915,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b2_lift",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "lift",
    "node_name": "Elevator 1",
    "relative_x": 0.655,
    "relative_y": 0.5,
    "room_id": null
  },
  {
    "id": "node_b2_rm_201",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "room",
    "node_name": "AI & DS Dept. Office",
    "relative_x": 0.24,
    "relative_y": 0.24,
    "room_id": "rm-b-201"
  },
  {
    "id": "node_b2_rm_202",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "room",
    "node_name": "AI & Deep Learning Lab",
    "relative_x": 0.485,
    "relative_y": 0.24,
    "room_id": "rm-b-202"
  },
  {
    "id": "node_b2_rm_203",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "room",
    "node_name": "IoT & Robotics Lab",
    "relative_x": 0.745,
    "relative_y": 0.24,
    "room_id": "rm-b-203"
  },
  {
    "id": "node_b2_rm_204",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "room",
    "node_name": "Smart Classroom 201",
    "relative_x": 0.255,
    "relative_y": 0.75,
    "room_id": "rm-b-204"
  },
  {
    "id": "node_b2_rm_205",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "floor_number": 2,
    "node_type": "room",
    "node_name": "Cloud & Big Data Lab",
    "relative_x": 0.745,
    "relative_y": 0.75,
    "room_id": "rm-b-205"
  }
];

export const fallbackIndoorEdges: IndoorNavigationEdge[] = [
  {
    "id": "e_b0_ent_mid",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_entrance",
    "destination_node_id": "node_b0_c_mid",
    "distance": 18.0,
    "movement_type": "entrance_connection",
    "accessible": true
  },
  {
    "id": "e_b0_mid_west",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_mid",
    "destination_node_id": "node_b0_c_west",
    "distance": 22.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b0_mid_east",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_mid",
    "destination_node_id": "node_b0_c_east",
    "distance": 22.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b0_mid_lift",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_mid",
    "destination_node_id": "node_b0_lift",
    "distance": 14.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b0_west_stair",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_west",
    "destination_node_id": "node_b0_stairs_w",
    "distance": 15.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b0_east_stair",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_east",
    "destination_node_id": "node_b0_stairs_e",
    "distance": 15.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b0_west_rm001",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_west",
    "destination_node_id": "node_b0_rm_001",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b0_mid_rm002",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_mid",
    "destination_node_id": "node_b0_rm_002",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b0_east_rm010",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_east",
    "destination_node_id": "node_b0_rm_010",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b0_west_rm005",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_west",
    "destination_node_id": "node_b0_rm_005",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b0_east_rm008",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-0",
    "source_node_id": "node_b0_c_east",
    "destination_node_id": "node_b0_rm_008",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b1_mid_west",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_mid",
    "destination_node_id": "node_b1_c_west",
    "distance": 22.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b1_mid_east",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_mid",
    "destination_node_id": "node_b1_c_east",
    "distance": 22.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b1_mid_lift",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_mid",
    "destination_node_id": "node_b1_lift",
    "distance": 14.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b1_west_stair",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_west",
    "destination_node_id": "node_b1_stairs_w",
    "distance": 15.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b1_east_stair",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_east",
    "destination_node_id": "node_b1_stairs_e",
    "distance": 15.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b1_west_rm101",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_west",
    "destination_node_id": "node_b1_rm_101",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b1_mid_rm102",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_mid",
    "destination_node_id": "node_b1_rm_102",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b1_east_rm105",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_east",
    "destination_node_id": "node_b1_rm_105",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b1_west_rm110",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_west",
    "destination_node_id": "node_b1_rm_110",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b1_east_rm112",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-1",
    "source_node_id": "node_b1_c_east",
    "destination_node_id": "node_b1_rm_112",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b2_mid_west",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_mid",
    "destination_node_id": "node_b2_c_west",
    "distance": 22.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b2_mid_east",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_mid",
    "destination_node_id": "node_b2_c_east",
    "distance": 22.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b2_mid_lift",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_mid",
    "destination_node_id": "node_b2_lift",
    "distance": 14.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b2_west_stair",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_west",
    "destination_node_id": "node_b2_stairs_w",
    "distance": 15.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b2_east_stair",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_east",
    "destination_node_id": "node_b2_stairs_e",
    "distance": 15.0,
    "movement_type": "corridor",
    "accessible": true
  },
  {
    "id": "e_b2_west_rm201",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_west",
    "destination_node_id": "node_b2_rm_201",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b2_mid_rm202",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_mid",
    "destination_node_id": "node_b2_rm_202",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b2_east_rm203",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_east",
    "destination_node_id": "node_b2_rm_203",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b2_west_rm204",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_west",
    "destination_node_id": "node_b2_rm_204",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  },
  {
    "id": "e_b2_east_rm205",
    "building_id": "bldg-b",
    "floor_id": "bldg-b-fl-2",
    "source_node_id": "node_b2_c_east",
    "destination_node_id": "node_b2_rm_205",
    "distance": 12.0,
    "movement_type": "room_access",
    "accessible": true
  }
];

export const fallbackFloorTransitions: FloorTransition[] = [
  {
    "id": "tr_sw_0_1",
    "building_id": "bldg-b",
    "source_floor_id": "bldg-b-fl-0",
    "destination_floor_id": "bldg-b-fl-1",
    "transition_type": "staircase",
    "source_node_id": "node_b0_stairs_w",
    "destination_node_id": "node_b1_stairs_w",
    "is_accessible": false
  },
  {
    "id": "tr_sw_1_2",
    "building_id": "bldg-b",
    "source_floor_id": "bldg-b-fl-1",
    "destination_floor_id": "bldg-b-fl-2",
    "transition_type": "staircase",
    "source_node_id": "node_b1_stairs_w",
    "destination_node_id": "node_b2_stairs_w",
    "is_accessible": false
  },
  {
    "id": "tr_se_0_1",
    "building_id": "bldg-b",
    "source_floor_id": "bldg-b-fl-0",
    "destination_floor_id": "bldg-b-fl-1",
    "transition_type": "staircase",
    "source_node_id": "node_b0_stairs_e",
    "destination_node_id": "node_b1_stairs_e",
    "is_accessible": false
  },
  {
    "id": "tr_se_1_2",
    "building_id": "bldg-b",
    "source_floor_id": "bldg-b-fl-1",
    "destination_floor_id": "bldg-b-fl-2",
    "transition_type": "staircase",
    "source_node_id": "node_b1_stairs_e",
    "destination_node_id": "node_b2_stairs_e",
    "is_accessible": false
  },
  {
    "id": "tr_lift_0_1",
    "building_id": "bldg-b",
    "source_floor_id": "bldg-b-fl-0",
    "destination_floor_id": "bldg-b-fl-1",
    "transition_type": "lift",
    "source_node_id": "node_b0_lift",
    "destination_node_id": "node_b1_lift",
    "is_accessible": true
  },
  {
    "id": "tr_lift_1_2",
    "building_id": "bldg-b",
    "source_floor_id": "bldg-b-fl-1",
    "destination_floor_id": "bldg-b-fl-2",
    "transition_type": "lift",
    "source_node_id": "node_b1_lift",
    "destination_node_id": "node_b2_lift",
    "is_accessible": true
  }
];
