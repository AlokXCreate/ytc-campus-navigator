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
  building_name?: string | null;
  floor_id?: string | null;
  floor: number;
  room_type: string;
  description?: string | null;
  relative_x: number;
  relative_y: number;
  is_accessible?: boolean;
  is_active: boolean;
}

export interface Facility {
  id: string;
  name: string;
  facility_type: string;
  building_id?: string | null;
  latitude: number;
  longitude: number;
  description?: string | null;
  opening_information?: string | null;
  image_url?: string | null;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  building_id?: string | null;
  building_name?: string | null;
  entrance_latitude?: number | null;
  entrance_longitude?: number | null;
  icon?: string | null;
  image?: string | null;
  search_keywords?: string | null;
  is_active: boolean;
}

export interface CampusBoundary {
  id?: string;
  name?: string;
  type?: string;
  geojson_data?: {
    type: string;
    properties?: Record<string, any>;
    geometry: {
      type: string;
      coordinates: number[][][] | number[][][][];
    };
  };
  geometry?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties?: Record<string, any>;
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
  floor_label?: string | null;
  image_path: string;
  width: number;
  height: number;
  is_approximate: boolean;
  description?: string | null;
  rooms?: Room[];
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  floor_label?: string | null;
  floor_plan_image: string;
  image_width: number;
  image_height: number;
  is_approximate: boolean;
  is_active: boolean;
  rooms?: Room[];
}

export interface IndoorNavigationNode {
  id: string;
  building_id: string;
  floor_id?: string | null;
  floor_number: number;
  node_type: 'room' | 'corridor' | 'intersection' | 'staircase' | 'lift' | 'entrance';
  node_name: string;
  relative_x: number;
  relative_y: number;
  room_id?: string | null;
}

export interface IndoorNavigationEdge {
  id: string;
  building_id: string;
  floor_id?: string | null;
  source_node_id: string;
  destination_node_id: string;
  distance: number;
  movement_type: 'corridor' | 'room_access' | 'staircase' | 'lift' | 'entrance_connection';
  accessible: boolean;
  is_active?: boolean;
}

export interface FloorTransition {
  id: string;
  building_id: string;
  source_floor_id: string;
  destination_floor_id: string;
  transition_type: 'staircase' | 'lift' | 'ramp';
  source_node_id: string;
  destination_node_id: string;
  is_accessible: boolean;
}

export interface IndoorRouteStep {
  instruction: string;
  distance_meters: number;
  node_id: string;
  relative_x: number;
  relative_y: number;
  floor_number: number;
  floor_label?: string | null;
  step_type: 'start' | 'walk' | 'staircase' | 'lift' | 'door' | 'arrive';
}

export interface IndoorFloorSegment {
  floor_number: number;
  floor_label: string;
  floor_plan_image: string;
  path_coordinates: [number, number][]; // [relative_x, relative_y]
  steps: IndoorRouteStep[];
  subtotal_distance_meters: number;
}

export interface IndoorRouteRequest {
  building_id: string;
  source_node_id?: string;
  destination_node_id?: string;
  source_room_id?: string;
  destination_room_id?: string;
  preferred_transition?: 'stairs' | 'lift' | 'accessible';
  algorithm?: 'dijkstra' | 'astar';
}

export interface IndoorRouteResult {
  found: boolean;
  building_id: string;
  building_name: string;
  source_name: string;
  destination_name: string;
  total_distance_meters: number;
  estimated_walk_time_minutes: number;
  is_multi_floor: boolean;
  floors_traversed: number[];
  floor_segments: IndoorFloorSegment[];
  all_path_nodes: string[];
  instructions: string[];
  accessibility_used: string;
  message?: string;
}

export interface FloorPlanUploadResult {
  success: boolean;
  building_id: string;
  floor_number: number;
  image_url: string;
  message: string;
}

export interface CampusSummary {
  institution_name: string;
  short_name: string;
  address: string;
  department: string;
  total_buildings: number;
  total_rooms: number;
  total_facilities: number;
  total_pois?: number;
  total_paths?: number;
  total_floor_plans: number;
  center_latitude: number;
  center_longitude: number;
  building_types: string[];
  is_demo_dataset: boolean;
}

export interface NavigationSummary {
  total_buildings: number;
  total_pois: number;
  total_pathways: number;
  total_nodes: number;
  campus_boundary_available: boolean;
  bounding_box: [number, number][];
  default_center: [number, number];
  is_demo_dataset: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  category: 'building' | 'room' | 'facility' | 'poi';
  subtitle: string;
  building_id?: string | null;
  building_name?: string | null;
  floor?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  keywords?: string | null;
}

export interface RouteStep {
  instruction: string;
  distance_meters: number;
  coordinates: [number, number];
  bearing?: string;
}

export interface RouteAlternative {
  name: string;
  total_distance_meters: number;
  estimated_walk_time_minutes: number;
  path_nodes: string[];
  geometry: [number, number][];
  steps: RouteStep[];
}

export interface RouteResult {
  found: boolean;
  source: string;
  destination: string;
  algorithm_used?: string;
  total_distance_meters: number;
  estimated_walk_time_minutes: number;
  path_nodes: string[];
  geometry: [number, number][];
  steps: RouteStep[];
  alternatives?: RouteAlternative[];
  is_snapped_from_gps?: boolean;
  message?: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  building_name?: string;
  created_at: number;
}

export interface GeoJSONValidationResult {
  valid: boolean;
  feature_count: number;
  points_count: number;
  lines_count: number;
  polygons_count: number;
  errors: string[];
  warnings: string[];
}

export interface GeoJSONImportResult {
  success: boolean;
  imported_count: number;
  rejected_count: number;
  summary: {
    points: number;
    paths: number;
    boundaries: number;
  };
  messages: string[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'visitor' | 'admin';
  is_active: boolean;
}
