export interface Building {
  id: string;
  name: string;
  building_code: string;
  description: string;
  latitude: number;
  longitude: number;
  entrance_latitude?: number;
  entrance_longitude?: number;
  total_floors: number;
  available_floors: number[];
  building_type: string;
  image_url?: string;
  is_active: boolean;
}

export interface Room {
  id: string;
  room_name: string;
  room_number: string;
  building_id: string;
  building_name?: string;
  floor: number;
  room_type: string;
  description?: string;
  relative_x: number;
  relative_y: number;
  is_active: boolean;
}

export interface Facility {
  id: string;
  name: string;
  facility_type: string;
  building_id?: string;
  latitude: number;
  longitude: number;
  description?: string;
  opening_information?: string;
  image_url?: string;
}

export interface CampusPath {
  id: string;
  source_node: string;
  destination_node: string;
  distance: number;
  path_type: string;
  accessibility: string;
  geometry?: [number, number][];
}

export interface FloorPlan {
  id: string;
  building_id: string;
  floor_number: number;
  floor_label?: string;
  image_path: string;
  width: number;
  height: number;
  is_approximate: boolean;
  rooms?: Room[];
}

export interface CampusSummary {
  institution_name: string;
  short_name: string;
  address: string;
  department: string;
  total_buildings: number;
  total_rooms: number;
  total_facilities: number;
  total_floor_plans: number;
  center_latitude: number;
  center_longitude: number;
  building_types: string[];
  is_demo_dataset: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  category: 'building' | 'room' | 'facility';
  subtitle: string;
  building_id?: string;
  building_name?: string;
  floor?: number;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface RouteStep {
  instruction: string;
  distance_meters: number;
  coordinates: [number, number];
}

export interface RouteResult {
  found: boolean;
  source: string;
  destination: string;
  total_distance_meters: number;
  estimated_walk_time_minutes: number;
  path_nodes: string[];
  geometry: [number, number][];
  steps: RouteStep[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'visitor' | 'admin';
  is_active: boolean;
}
