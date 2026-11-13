import json
from pathlib import Path

data = json.load(open("data/sample-campus-data.json", encoding="utf-8"))

ts_code = """import {
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

export const fallbackCampusBoundary: CampusBoundary = """ + json.dumps(data["campus_boundary"], indent=2) + """;

export const fallbackBuildings: Building[] = """ + json.dumps(data["buildings"], indent=2) + """;

export const fallbackPOIs: PointOfInterest[] = """ + json.dumps(data["points_of_interest"], indent=2) + """;

export const fallbackFacilities: Facility[] = """ + json.dumps(data["facilities"], indent=2) + """;

export const fallbackFloorPlans: FloorPlan[] = """ + json.dumps(data["floor_plans"], indent=2) + """;

export const fallbackPaths: CampusPath[] = """ + json.dumps(data["paths"], indent=2) + """;

export const fallbackFloors: Floor[] = """ + json.dumps(data["floors"], indent=2) + """;

export const fallbackRooms: Room[] = """ + json.dumps(data["rooms"], indent=2) + """;

export const fallbackIndoorNodes: IndoorNavigationNode[] = """ + json.dumps(data["indoor_nodes"], indent=2) + """;

export const fallbackIndoorEdges: IndoorNavigationEdge[] = """ + json.dumps(data["indoor_edges"], indent=2) + """;

export const fallbackFloorTransitions: FloorTransition[] = """ + json.dumps(data["floor_transitions"], indent=2) + """;
"""

with open("frontend/src/data/fallbackCampusData.ts", "w", encoding="utf-8") as f:
    f.write(ts_code)

print("[OK] frontend/src/data/fallbackCampusData.ts successfully updated.")
