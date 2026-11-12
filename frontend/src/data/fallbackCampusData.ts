import { CampusSummary, Building, Room, Facility, FloorPlan, CampusPath } from '../types/campus';

export const fallbackCampusSummary: CampusSummary = {
  institution_name: "Yashoda Technical Campus",
  short_name: "YTC Satara",
  address: "NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra, India",
  department: "Artificial Intelligence and Data Science",
  total_buildings: 9,
  total_rooms: 11,
  total_facilities: 6,
  total_floor_plans: 2,
  center_latitude: 17.7215,
  center_longitude: 74.0205,
  building_types: ["Academic Engineering", "Administrative Academic", "Academic Pharmacy", "Library", "Workshop", "Amenity", "Residential", "Sports"],
  is_demo_dataset: true
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
    id: "rm-102",
    room_name: "Student Section & Examination Cell",
    room_number: "ADM-004",
    building_id: "bldg-a",
    building_name: "Main Administrative & Academic Building",
    floor: 0,
    room_type: "administrative",
    description: "Admission verification, fee payment, examination hall tickets, and scholarship documentation.",
    relative_x: 0.70,
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
  },
  {
    id: "rm-203",
    room_name: "Big Data Analytics & Cloud Lab",
    room_number: "ENG-206",
    building_id: "bldg-b",
    building_name: "Engineering & Technology Block",
    floor: 2,
    room_type: "laboratory",
    description: "High-speed networked terminals for Distributed Computing, Hadoop, Spark, and Data Engineering workflows.",
    relative_x: 0.75,
    relative_y: 0.25,
    is_active: true
  },
  {
    id: "rm-204",
    room_name: "AI & DS Classroom (Third Year)",
    room_number: "ENG-208",
    building_id: "bldg-b",
    building_name: "Engineering & Technology Block",
    floor: 2,
    room_type: "classroom",
    description: "Smart interactive lecture hall with HD projector and audio amplification for TY AI & DS.",
    relative_x: 0.35,
    relative_y: 0.75,
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
    description: "Primary campus entrance on Wadhe Phata connecting NH-4. Visitor registration and security desk.",
    opening_information: "24/7 Access for authorized visitors & campus vehicles"
  },
  {
    id: "fac-02",
    name: "Central Campus Cafeteria",
    facility_type: "canteen",
    building_id: "bldg-f",
    latitude: 17.7208,
    longitude: 74.0198,
    description: "Breakfast, lunch, tea, and snack services with clean filtered drinking water stations.",
    opening_information: "Monday to Saturday: 8:00 AM – 7:00 PM"
  },
  {
    id: "fac-03",
    name: "Vehicle Parking Area A (Students & Visitors)",
    facility_type: "parking",
    latitude: 17.7213,
    longitude: 74.0193,
    description: "Covered two-wheeler and four-wheeler parking lots near Main Admin Building.",
    opening_information: "Open daily: 7:30 AM – 8:30 PM"
  },
  {
    id: "fac-04",
    name: "Health Center & First Aid Ward",
    facility_type: "medical",
    building_id: "bldg-a",
    latitude: 17.7217,
    longitude: 74.0200,
    description: "Emergency first-aid, doctor on call, ambulance assistance, and resting beds.",
    opening_information: "Monday to Saturday: 9:00 AM – 5:30 PM"
  },
  {
    id: "fac-05",
    name: "ATM & Student Utility Store",
    facility_type: "banking",
    latitude: 17.7211,
    longitude: 74.0196,
    description: "24/7 ATM kiosk, photocopy, stationery printing, and spiral binding shop.",
    opening_information: "Stationery: 8:30 AM – 6:30 PM; ATM: 24/7"
  },
  {
    id: "fac-06",
    name: "Outdoor Basketball & Badminton Court",
    facility_type: "sports",
    building_id: "bldg-i",
    latitude: 17.7202,
    longitude: 74.0220,
    description: "All-weather concrete court with floodlights for evening athletic activities.",
    opening_information: "Open daily: 6:00 AM – 8:00 PM"
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
  }
];
