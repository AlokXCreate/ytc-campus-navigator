import {
  CampusSummary,
  Building,
  Room,
  Facility,
  PointOfInterest,
  CampusBoundary,
  FloorPlan,
  CampusPath
} from '../types/campus';

export const fallbackCampusSummary: CampusSummary = {
  institution_name: "Yashoda Technical Campus",
  short_name: "YTC Satara",
  address: "NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra, India",
  department: "Artificial Intelligence and Data Science",
  total_buildings: 9,
  total_rooms: 11,
  total_facilities: 6,
  total_pois: 14,
  total_paths: 15,
  total_floor_plans: 2,
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
  id: "ytc-main-boundary",
  name: "YTC Satara Main Campus Boundary",
  geojson_data: {
    type: "Feature",
    properties: {
      name: "YTC Satara Main Campus Boundary",
      institution: "Yashoda Technical Campus, Satara"
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [74.0185, 17.7198],
          [74.0228, 17.7198],
          [74.0232, 17.7245],
          [74.0188, 17.7245],
          [74.0185, 17.7215],
          [74.0185, 17.7198]
        ]
      ]
    }
  }
};

export const fallbackBuildings: Building[] = [
  {
    id: "bldg-a",
    name: "Main Administrative & Academic Building",
    building_code: "ADM-A",
    description: "Houses the Directorate, Principal Office, Student Services, Registrar, and Central Administration.",
    latitude: 17.7218,
    longitude: 74.0202,
    entrance_latitude: 17.7216,
    entrance_longitude: 74.0202,
    total_floors: 4,
    available_floors: [0, 1, 2, 3],
    building_type: "administrative_academic",
    is_active: true
  },
  {
    id: "bldg-b",
    name: "Engineering & Technology Block",
    building_code: "ENG-B",
    description: "Home to the AI & DS, Computer, Mechanical, Civil, and Electrical Engineering Departments, faculty offices, and high-performance labs.",
    latitude: 17.7224,
    longitude: 74.0208,
    entrance_latitude: 17.7222,
    entrance_longitude: 74.0207,
    total_floors: 4,
    available_floors: [0, 1, 2, 3],
    building_type: "academic_engineering",
    is_active: true
  },
  {
    id: "bldg-c",
    name: "Pharmacy & Polytechnic Complex",
    building_code: "PHARM-C",
    description: "Houses Faculty of Pharmacy, Diploma Engineering departments, chemical laboratories, and research chambers.",
    latitude: 17.7227,
    longitude: 74.0195,
    entrance_latitude: 17.7225,
    entrance_longitude: 74.0196,
    total_floors: 3,
    available_floors: [0, 1, 2],
    building_type: "academic_pharmacy",
    is_active: true
  },
  {
    id: "bldg-d",
    name: "Central Library & Knowledge Resource Center",
    building_code: "LIB-D",
    description: "Two-storey library housing over 40,000 volumes, national/international journals, digital reading lounge, and research cubicles.",
    latitude: 17.7212,
    longitude: 74.0212,
    entrance_latitude: 17.7213,
    entrance_longitude: 74.0211,
    total_floors: 2,
    available_floors: [0, 1],
    building_type: "library",
    is_active: true
  },
  {
    id: "bldg-e",
    name: "Central Workshop & Innovation Hub",
    building_code: "WS-E",
    description: "Machining, welding, carpentry, foundry sections, and student robotics innovation and prototyping workspaces.",
    latitude: 17.7231,
    longitude: 74.0215,
    entrance_latitude: 17.7230,
    entrance_longitude: 74.0213,
    total_floors: 1,
    available_floors: [0],
    building_type: "workshop",
    is_active: true
  },
  {
    id: "bldg-f",
    name: "Student Cafeteria & Canteen",
    building_code: "CAN-F",
    description: "Multi-cuisine food service, spacious dining hall, bakery, and open snack patio for students and staff.",
    latitude: 17.7208,
    longitude: 74.0198,
    entrance_latitude: 17.7209,
    entrance_longitude: 74.0199,
    total_floors: 2,
    available_floors: [0, 1],
    building_type: "amenity",
    is_active: true
  },
  {
    id: "bldg-g",
    name: "Boys Hostel Complex",
    building_code: "HSTL-B",
    description: "Four-storey residential block with study halls, recreational lounge, and Wi-Fi connectivity.",
    latitude: 17.7236,
    longitude: 74.0222,
    entrance_latitude: 17.7234,
    entrance_longitude: 74.0221,
    total_floors: 4,
    available_floors: [0, 1, 2, 3],
    building_type: "residential",
    is_active: true
  },
  {
    id: "bldg-h",
    name: "Girls Hostel Complex",
    building_code: "HSTL-G",
    description: "Dedicated secure residential facility with 24/7 security, solar water heating, and study amenities.",
    latitude: 17.7239,
    longitude: 74.0200,
    entrance_latitude: 17.7237,
    entrance_longitude: 74.0201,
    total_floors: 4,
    available_floors: [0, 1, 2, 3],
    building_type: "residential",
    is_active: true
  },
  {
    id: "bldg-i",
    name: "Sports Complex & Athletic Ground",
    building_code: "SPRT-I",
    description: "Open athletic track, cricket pitch, basketball court, badminton facilities, and physical education office.",
    latitude: 17.7202,
    longitude: 74.0220,
    entrance_latitude: 17.7204,
    entrance_longitude: 74.0218,
    total_floors: 1,
    available_floors: [0],
    building_type: "sports",
    is_active: true
  }
];

export const fallbackPOIs: PointOfInterest[] = [
  {
    id: "poi-gate",
    name: "Main Entrance & Security Gate",
    category: "gate",
    description: "Primary entry and exit point on Wadhe Phata connecting to NH-4 highway.",
    latitude: 17.7210,
    longitude: 74.0190,
    entrance_latitude: 17.7210,
    entrance_longitude: 74.0190,
    icon: "DoorOpen",
    is_active: true
  },
  {
    id: "poi-park-a",
    name: "Parking Area A (Students & Visitors)",
    category: "parking",
    description: "Main parking for two-wheelers and four-wheelers near Administration Building.",
    latitude: 17.7213,
    longitude: 74.0193,
    icon: "Car",
    is_active: true
  },
  {
    id: "poi-park-b",
    name: "Parking Area B (Hostel & Workshop)",
    category: "parking",
    description: "Rear campus parking area dedicated for hostel residents and workshop staff.",
    latitude: 17.7226,
    longitude: 74.0218,
    icon: "Car",
    is_active: true
  },
  {
    id: "poi-adm-office",
    name: "Directorate & Principal Office",
    category: "admin",
    description: "Main administration, Principal office, and student services counters.",
    latitude: 17.7216,
    longitude: 74.0202,
    building_id: "bldg-a",
    building_name: "Main Administrative & Academic Building",
    icon: "Briefcase",
    is_active: true
  },
  {
    id: "poi-aids-dept",
    name: "AI & Data Science Department",
    category: "department",
    description: "Academic offices, AI research chambers, and Deep Learning laboratories on Floor 2.",
    latitude: 17.7222,
    longitude: 74.0207,
    building_id: "bldg-b",
    building_name: "Engineering & Technology Block",
    icon: "Sparkles",
    is_active: true
  },
  {
    id: "poi-library",
    name: "Central Library & Knowledge Hub",
    category: "library",
    description: "Over 40,000 academic volumes, journal subscriptions, and digital study cubicles.",
    latitude: 17.7213,
    longitude: 74.0211,
    building_id: "bldg-d",
    building_name: "Central Library & Knowledge Resource Center",
    icon: "BookOpen",
    is_active: true
  },
  {
    id: "poi-canteen",
    name: "Student Cafeteria & Food Court",
    category: "canteen",
    description: "Multi-cuisine fresh meals, refreshments, tea, coffee, and open dining tables.",
    latitude: 17.7209,
    longitude: 74.0199,
    building_id: "bldg-f",
    building_name: "Student Cafeteria & Canteen",
    icon: "Coffee",
    is_active: true
  },
  {
    id: "poi-workshop",
    name: "Central Workshop & Innovation Lab",
    category: "workshop",
    description: "Hands-on mechanical machining, welding, carpentry, and robotics testing areas.",
    latitude: 17.7230,
    longitude: 74.0213,
    building_id: "bldg-e",
    building_name: "Central Workshop & Innovation Hub",
    icon: "Wrench",
    is_active: true
  },
  {
    id: "poi-sports",
    name: "Sports Complex & Athletic Ground",
    category: "sports",
    description: "Cricket field, basketball court, volleyball ground, and athletic running tracks.",
    latitude: 17.7204,
    longitude: 74.0218,
    building_id: "bldg-i",
    building_name: "Sports Complex & Athletic Ground",
    icon: "Trophy",
    is_active: true
  }
];

export const fallbackRooms: Room[] = [
  {
    id: "rm-101",
    room_name: "Director & Principal Office",
    room_number: "ADM-001",
    building_id: "bldg-a",
    building_name: "Main Administrative & Academic Building",
    floor: 0,
    room_type: "administrative",
    description: "Executive administration, Principal reception, and official inquiry chamber.",
    relative_x: 0.25,
    relative_y: 0.35,
    is_active: true
  },
  {
    id: "rm-201",
    room_name: "AI & Data Science Department Office",
    room_number: "ENG-201",
    building_id: "bldg-b",
    building_name: "Engineering & Technology Block",
    floor: 2,
    room_type: "department_office",
    description: "Head of Department (AI & DS), faculty cubicles, and departmental academic coordination desk.",
    relative_x: 0.20,
    relative_y: 0.25,
    is_active: true
  },
  {
    id: "rm-202",
    room_name: "Artificial Intelligence & Deep Learning Lab",
    room_number: "ENG-204",
    building_id: "bldg-b",
    building_name: "Engineering & Technology Block",
    floor: 2,
    room_type: "laboratory",
    description: "GPU-accelerated lab equipped for Neural Networks, Computer Vision, and Generative AI practicals.",
    relative_x: 0.40,
    relative_y: 0.25,
    is_active: true
  }
];

export const fallbackFacilities: Facility[] = [
  {
    id: "fac-01",
    name: "Main Entrance & Security Gate",
    facility_type: "gate",
    latitude: 17.7210,
    longitude: 74.0190,
    description: "Primary campus entrance on Wadhe Phata connecting NH-4.",
    opening_information: "24/7 Access"
  },
  {
    id: "fac-02",
    name: "Central Campus Cafeteria",
    facility_type: "canteen",
    building_id: "bldg-f",
    latitude: 17.7208,
    longitude: 74.0198,
    description: "Breakfast, lunch, tea, and snack services.",
    opening_information: "Mon-Sat: 8:00 AM – 7:00 PM"
  },
  {
    id: "fac-03",
    name: "Vehicle Parking Area A",
    facility_type: "parking",
    latitude: 17.7213,
    longitude: 74.0193,
    description: "Covered parking lots near Main Admin Building.",
    opening_information: "Open daily: 7:30 AM – 8:30 PM"
  }
];

export const fallbackFloorPlans: FloorPlan[] = [
  {
    id: "fp-bldg-b-fl2",
    building_id: "bldg-b",
    floor_number: 2,
    floor_label: "Second Floor (AI & DS Department)",
    image_path: "/floor-plans/eng-floor-2.svg",
    width: 1000,
    height: 600,
    is_approximate: true
  },
  {
    id: "fp-bldg-a-fl0",
    building_id: "bldg-a",
    floor_number: 0,
    floor_label: "Ground Floor (Administration)",
    image_path: "/floor-plans/admin-floor-0.svg",
    width: 1000,
    height: 600,
    is_approximate: true
  }
];

export const fallbackPaths: CampusPath[] = [
  {
    id: "path-01",
    source_node: "gate_main",
    destination_node: "parking_a",
    distance: 45.0,
    path_type: "paved_road",
    accessibility: "wheelchair_friendly",
    geometry: [[17.7210, 74.0190], [17.7213, 74.0193]]
  },
  {
    id: "path-02",
    source_node: "parking_a",
    destination_node: "bldg_a_entrance",
    distance: 85.0,
    path_type: "pedestrian_walkway",
    accessibility: "wheelchair_friendly",
    geometry: [[17.7213, 74.0193], [17.7216, 74.0202]]
  },
  {
    id: "path-03",
    source_node: "bldg_a_entrance",
    destination_node: "bldg_b_entrance",
    distance: 110.0,
    path_type: "pedestrian_walkway",
    accessibility: "wheelchair_friendly",
    geometry: [[17.7216, 74.0202], [17.7222, 74.0207]]
  },
  {
    id: "path-04",
    source_node: "bldg_a_entrance",
    destination_node: "lib_entrance",
    distance: 95.0,
    path_type: "garden_pathway",
    accessibility: "accessible",
    geometry: [[17.7216, 74.0202], [17.7213, 74.0211]]
  },
  {
    id: "path-05",
    source_node: "bldg_b_entrance",
    destination_node: "workshop_entrance",
    distance: 125.0,
    path_type: "paved_walkway",
    accessibility: "accessible",
    geometry: [[17.7222, 74.0207], [17.7230, 74.0213]]
  }
];
