import json
from pathlib import Path

data_path = Path("data/sample-campus-data.json")
with open(data_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 1. FLOORS
floors = [
    {
        "id": "bldg-b-fl-0",
        "building_id": "bldg-b",
        "floor_number": 0,
        "floor_label": "Ground Floor",
        "floor_plan_image": "/floor-plans/engineering/ground.svg",
        "image_width": 1000,
        "image_height": 600,
        "is_approximate": True,
        "is_active": True
    },
    {
        "id": "bldg-b-fl-1",
        "building_id": "bldg-b",
        "floor_number": 1,
        "floor_label": "First Floor",
        "floor_plan_image": "/floor-plans/engineering/first.svg",
        "image_width": 1000,
        "image_height": 600,
        "is_approximate": True,
        "is_active": True
    },
    {
        "id": "bldg-b-fl-2",
        "building_id": "bldg-b",
        "floor_number": 2,
        "floor_label": "Second Floor (AI & DS)",
        "floor_plan_image": "/floor-plans/engineering/second.svg",
        "image_width": 1000,
        "image_height": 600,
        "is_approximate": True,
        "is_active": True
    },
    {
        "id": "bldg-a-fl-0",
        "building_id": "bldg-a",
        "floor_number": 0,
        "floor_label": "Ground Floor",
        "floor_plan_image": "/floor-plans/administration/ground.svg",
        "image_width": 1000,
        "image_height": 600,
        "is_approximate": True,
        "is_active": True
    },
    {
        "id": "bldg-c-fl-0",
        "building_id": "bldg-c",
        "floor_number": 0,
        "floor_label": "Ground Floor",
        "floor_plan_image": "/floor-plans/pharmacy/ground.svg",
        "image_width": 1000,
        "image_height": 600,
        "is_approximate": True,
        "is_active": True
    },
    {
        "id": "bldg-d-fl-0",
        "building_id": "bldg-d",
        "floor_number": 0,
        "floor_label": "Ground Floor",
        "floor_plan_image": "/floor-plans/library/ground.svg",
        "image_width": 1000,
        "image_height": 600,
        "is_approximate": True,
        "is_active": True
    }
]

# 2. EXTENDED ROOMS
extended_rooms = [
    # Engineering Ground Floor (Floor 0)
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
    },

    # Engineering First Floor (Floor 1)
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
    },

    # Engineering Second Floor (Floor 2 - AI & DS)
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
    },

    # Admin Building Ground Floor
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
    },

    # Pharmacy Ground Floor
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
    },

    # Library Ground Floor
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
        "is_accessible": True,
        "is_active": True
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
        "is_accessible": True,
        "is_active": True
    }
]

# 3. INDOOR NAVIGATION NODES
indoor_nodes = [
    # Building B - Ground Floor
    {"id": "node_b0_entrance", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "entrance", "node_name": "Main Entrance Foyer", "relative_x": 0.50, "relative_y": 0.88, "room_id": None},
    {"id": "node_b0_c_mid", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "intersection", "node_name": "Ground Central Concourse", "relative_x": 0.50, "relative_y": 0.50, "room_id": None},
    {"id": "node_b0_c_west", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "corridor", "node_name": "West Corridor Junc", "relative_x": 0.24, "relative_y": 0.50, "room_id": None},
    {"id": "node_b0_c_east", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "corridor", "node_name": "East Corridor Junc", "relative_x": 0.74, "relative_y": 0.50, "room_id": None},
    {"id": "node_b0_stairs_w", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "staircase", "node_name": "Stairs A (West)", "relative_x": 0.085, "relative_y": 0.50, "room_id": None},
    {"id": "node_b0_stairs_e", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "staircase", "node_name": "Stairs B (East)", "relative_x": 0.915, "relative_y": 0.50, "room_id": None},
    {"id": "node_b0_lift", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "lift", "node_name": "Elevator 1", "relative_x": 0.655, "relative_y": 0.50, "room_id": None},
    {"id": "node_b0_rm_001", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "room", "node_name": "Applied Sciences Lab", "relative_x": 0.24, "relative_y": 0.24, "room_id": "rm-eng-001"},
    {"id": "node_b0_rm_002", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "room", "node_name": "Electrical Engg Lab", "relative_x": 0.48, "relative_y": 0.24, "room_id": "rm-eng-002"},
    {"id": "node_b0_rm_010", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "room", "node_name": "Main Seminar Hall", "relative_x": 0.74, "relative_y": 0.24, "room_id": "rm-eng-010"},
    {"id": "node_b0_rm_005", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "room", "node_name": "Central Workshop Annex", "relative_x": 0.255, "relative_y": 0.75, "room_id": "rm-eng-005"},
    {"id": "node_b0_rm_008", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "floor_number": 0, "node_type": "room", "node_name": "Amenities & First Aid", "relative_x": 0.745, "relative_y": 0.75, "room_id": "rm-eng-008"},

    # Building B - First Floor
    {"id": "node_b1_c_mid", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "intersection", "node_name": "First Floor Central Corridor", "relative_x": 0.50, "relative_y": 0.50, "room_id": None},
    {"id": "node_b1_c_west", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "corridor", "node_name": "West Wing Corridor", "relative_x": 0.24, "relative_y": 0.50, "room_id": None},
    {"id": "node_b1_c_east", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "corridor", "node_name": "East Wing Corridor", "relative_x": 0.74, "relative_y": 0.50, "room_id": None},
    {"id": "node_b1_stairs_w", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "staircase", "node_name": "Stairs A (West)", "relative_x": 0.085, "relative_y": 0.50, "room_id": None},
    {"id": "node_b1_stairs_e", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "staircase", "node_name": "Stairs B (East)", "relative_x": 0.915, "relative_y": 0.50, "room_id": None},
    {"id": "node_b1_lift", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "lift", "node_name": "Elevator 1", "relative_x": 0.655, "relative_y": 0.50, "room_id": None},
    {"id": "node_b1_rm_101", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "room", "node_name": "Computer Center 1", "relative_x": 0.24, "relative_y": 0.24, "room_id": "rm-eng-101"},
    {"id": "node_b1_rm_102", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "room", "node_name": "Data Structures Lab", "relative_x": 0.48, "relative_y": 0.24, "room_id": "rm-eng-102"},
    {"id": "node_b1_rm_105", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "room", "node_name": "Faculty Staff Room", "relative_x": 0.74, "relative_y": 0.24, "room_id": "rm-eng-105"},
    {"id": "node_b1_rm_110", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "room", "node_name": "Classroom 101", "relative_x": 0.255, "relative_y": 0.75, "room_id": "rm-eng-110"},
    {"id": "node_b1_rm_112", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "floor_number": 1, "node_type": "room", "node_name": "Classroom 102", "relative_x": 0.745, "relative_y": 0.75, "room_id": "rm-eng-112"},

    # Building B - Second Floor (AI & DS)
    {"id": "node_b2_c_mid", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "intersection", "node_name": "Second Floor Central Lobby", "relative_x": 0.50, "relative_y": 0.50, "room_id": None},
    {"id": "node_b2_c_west", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "corridor", "node_name": "AI Wing Corridor", "relative_x": 0.24, "relative_y": 0.50, "room_id": None},
    {"id": "node_b2_c_east", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "corridor", "node_name": "DS Wing Corridor", "relative_x": 0.74, "relative_y": 0.50, "room_id": None},
    {"id": "node_b2_stairs_w", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "staircase", "node_name": "Stairs A (West)", "relative_x": 0.085, "relative_y": 0.50, "room_id": None},
    {"id": "node_b2_stairs_e", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "staircase", "node_name": "Stairs B (East)", "relative_x": 0.915, "relative_y": 0.50, "room_id": None},
    {"id": "node_b2_lift", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "lift", "node_name": "Elevator 1", "relative_x": 0.655, "relative_y": 0.50, "room_id": None},
    {"id": "node_b2_rm_201", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "room", "node_name": "AI & DS Dept. Office", "relative_x": 0.24, "relative_y": 0.24, "room_id": "rm-b-201"},
    {"id": "node_b2_rm_202", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "room", "node_name": "AI & Deep Learning Lab", "relative_x": 0.485, "relative_y": 0.24, "room_id": "rm-b-202"},
    {"id": "node_b2_rm_203", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "room", "node_name": "IoT & Robotics Lab", "relative_x": 0.745, "relative_y": 0.24, "room_id": "rm-b-203"},
    {"id": "node_b2_rm_204", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "room", "node_name": "Smart Classroom 201", "relative_x": 0.255, "relative_y": 0.75, "room_id": "rm-b-204"},
    {"id": "node_b2_rm_205", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "floor_number": 2, "node_type": "room", "node_name": "Cloud & Big Data Lab", "relative_x": 0.745, "relative_y": 0.75, "room_id": "rm-b-205"}
]

# 4. INDOOR NAVIGATION EDGES
indoor_edges = [
    # Floor 0 Edges
    {"id": "e_b0_ent_mid", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_entrance", "destination_node_id": "node_b0_c_mid", "distance": 18.0, "movement_type": "entrance_connection", "accessible": True},
    {"id": "e_b0_mid_west", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_mid", "destination_node_id": "node_b0_c_west", "distance": 22.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b0_mid_east", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_mid", "destination_node_id": "node_b0_c_east", "distance": 22.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b0_mid_lift", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_mid", "destination_node_id": "node_b0_lift", "distance": 14.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b0_west_stair", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_west", "destination_node_id": "node_b0_stairs_w", "distance": 15.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b0_east_stair", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_east", "destination_node_id": "node_b0_stairs_e", "distance": 15.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b0_west_rm001", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_west", "destination_node_id": "node_b0_rm_001", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b0_mid_rm002", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_mid", "destination_node_id": "node_b0_rm_002", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b0_east_rm010", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_east", "destination_node_id": "node_b0_rm_010", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b0_west_rm005", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_west", "destination_node_id": "node_b0_rm_005", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b0_east_rm008", "building_id": "bldg-b", "floor_id": "bldg-b-fl-0", "source_node_id": "node_b0_c_east", "destination_node_id": "node_b0_rm_008", "distance": 12.0, "movement_type": "room_access", "accessible": True},

    # Floor 1 Edges
    {"id": "e_b1_mid_west", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_mid", "destination_node_id": "node_b1_c_west", "distance": 22.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b1_mid_east", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_mid", "destination_node_id": "node_b1_c_east", "distance": 22.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b1_mid_lift", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_mid", "destination_node_id": "node_b1_lift", "distance": 14.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b1_west_stair", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_west", "destination_node_id": "node_b1_stairs_w", "distance": 15.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b1_east_stair", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_east", "destination_node_id": "node_b1_stairs_e", "distance": 15.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b1_west_rm101", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_west", "destination_node_id": "node_b1_rm_101", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b1_mid_rm102", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_mid", "destination_node_id": "node_b1_rm_102", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b1_east_rm105", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_east", "destination_node_id": "node_b1_rm_105", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b1_west_rm110", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_west", "destination_node_id": "node_b1_rm_110", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b1_east_rm112", "building_id": "bldg-b", "floor_id": "bldg-b-fl-1", "source_node_id": "node_b1_c_east", "destination_node_id": "node_b1_rm_112", "distance": 12.0, "movement_type": "room_access", "accessible": True},

    # Floor 2 Edges (AI & DS)
    {"id": "e_b2_mid_west", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_mid", "destination_node_id": "node_b2_c_west", "distance": 22.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b2_mid_east", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_mid", "destination_node_id": "node_b2_c_east", "distance": 22.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b2_mid_lift", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_mid", "destination_node_id": "node_b2_lift", "distance": 14.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b2_west_stair", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_west", "destination_node_id": "node_b2_stairs_w", "distance": 15.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b2_east_stair", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_east", "destination_node_id": "node_b2_stairs_e", "distance": 15.0, "movement_type": "corridor", "accessible": True},
    {"id": "e_b2_west_rm201", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_west", "destination_node_id": "node_b2_rm_201", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b2_mid_rm202", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_mid", "destination_node_id": "node_b2_rm_202", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b2_east_rm203", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_east", "destination_node_id": "node_b2_rm_203", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b2_west_rm204", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_west", "destination_node_id": "node_b2_rm_204", "distance": 12.0, "movement_type": "room_access", "accessible": True},
    {"id": "e_b2_east_rm205", "building_id": "bldg-b", "floor_id": "bldg-b-fl-2", "source_node_id": "node_b2_c_east", "destination_node_id": "node_b2_rm_205", "distance": 12.0, "movement_type": "room_access", "accessible": True}
]

# 5. FLOOR TRANSITIONS (Vertical Stairs & Lifts)
floor_transitions = [
    # West Stairs (Floor 0 <-> 1 <-> 2)
    {"id": "tr_sw_0_1", "building_id": "bldg-b", "source_floor_id": "bldg-b-fl-0", "destination_floor_id": "bldg-b-fl-1", "transition_type": "staircase", "source_node_id": "node_b0_stairs_w", "destination_node_id": "node_b1_stairs_w", "is_accessible": False},
    {"id": "tr_sw_1_2", "building_id": "bldg-b", "source_floor_id": "bldg-b-fl-1", "destination_floor_id": "bldg-b-fl-2", "transition_type": "staircase", "source_node_id": "node_b1_stairs_w", "destination_node_id": "node_b2_stairs_w", "is_accessible": False},

    # East Stairs (Floor 0 <-> 1 <-> 2)
    {"id": "tr_se_0_1", "building_id": "bldg-b", "source_floor_id": "bldg-b-fl-0", "destination_floor_id": "bldg-b-fl-1", "transition_type": "staircase", "source_node_id": "node_b0_stairs_e", "destination_node_id": "node_b1_stairs_e", "is_accessible": False},
    {"id": "tr_se_1_2", "building_id": "bldg-b", "source_floor_id": "bldg-b-fl-1", "destination_floor_id": "bldg-b-fl-2", "transition_type": "staircase", "source_node_id": "node_b1_stairs_e", "destination_node_id": "node_b2_stairs_e", "is_accessible": False},

    # Elevator 1 (Floor 0 <-> 1 <-> 2, Wheelchair Accessible)
    {"id": "tr_lift_0_1", "building_id": "bldg-b", "source_floor_id": "bldg-b-fl-0", "destination_floor_id": "bldg-b-fl-1", "transition_type": "lift", "source_node_id": "node_b0_lift", "destination_node_id": "node_b1_lift", "is_accessible": True},
    {"id": "tr_lift_1_2", "building_id": "bldg-b", "source_floor_id": "bldg-b-fl-1", "destination_floor_id": "bldg-b-fl-2", "transition_type": "lift", "source_node_id": "node_b1_lift", "destination_node_id": "node_b2_lift", "is_accessible": True}
]

# Merge into master JSON
data["floors"] = floors
data["rooms"] = extended_rooms
data["indoor_nodes"] = indoor_nodes
data["indoor_edges"] = indoor_edges
data["floor_transitions"] = floor_transitions

with open(data_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"[OK] sample-campus-data.json enriched with:")
print(f"  - {len(floors)} floors")
print(f"  - {len(extended_rooms)} rooms")
print(f"  - {len(indoor_nodes)} indoor nodes")
print(f"  - {len(indoor_edges)} indoor edges")
print(f"  - {len(floor_transitions)} floor transitions")

