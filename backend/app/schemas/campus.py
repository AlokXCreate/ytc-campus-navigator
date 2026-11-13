from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# ============================
# BUILDING SCHEMAS
# ============================
class BuildingBase(BaseModel):
    id: str
    name: str
    building_code: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    entrance_latitude: Optional[float] = None
    entrance_longitude: Optional[float] = None
    total_floors: int = 1
    available_floors: List[int] = []
    building_type: str = "academic"
    image_url: Optional[str] = None
    is_active: bool = True

class BuildingResponse(BuildingBase):
    model_config = ConfigDict(from_attributes=True)

# ============================
# ROOM SCHEMAS
# ============================
class RoomBase(BaseModel):
    id: str
    room_name: str
    room_number: str
    building_id: str
    floor_id: Optional[str] = None
    floor: int
    room_type: str
    description: Optional[str] = None
    relative_x: float = 0.5
    relative_y: float = 0.5
    is_accessible: bool = True
    is_active: bool = True

class RoomResponse(RoomBase):
    building_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class RoomCreate(BaseModel):
    id: Optional[str] = None
    room_name: str
    room_number: str
    building_id: str
    floor_id: Optional[str] = None
    floor: int
    room_type: str = "classroom"
    description: Optional[str] = None
    relative_x: float = 0.5
    relative_y: float = 0.5
    is_accessible: bool = True

class RoomUpdate(BaseModel):
    room_name: Optional[str] = None
    room_number: Optional[str] = None
    floor: Optional[int] = None
    floor_id: Optional[str] = None
    room_type: Optional[str] = None
    description: Optional[str] = None
    relative_x: Optional[float] = None
    relative_y: Optional[float] = None
    is_accessible: Optional[bool] = None
    is_active: Optional[bool] = None

# ============================
# FACILITY SCHEMAS
# ============================
class FacilityBase(BaseModel):
    id: str
    name: str
    facility_type: str
    building_id: Optional[str] = None
    latitude: float
    longitude: float
    description: Optional[str] = None
    opening_information: Optional[str] = None
    image_url: Optional[str] = None

class FacilityResponse(FacilityBase):
    model_config = ConfigDict(from_attributes=True)

# ============================
# POINTS OF INTEREST (POI) SCHEMAS
# ============================
class PointOfInterestBase(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    building_id: Optional[str] = None
    entrance_latitude: Optional[float] = None
    entrance_longitude: Optional[float] = None
    icon: Optional[str] = "MapPin"
    image: Optional[str] = None
    search_keywords: Optional[str] = None
    is_active: bool = True

class PointOfInterestResponse(PointOfInterestBase):
    building_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# ============================
# CAMPUS BOUNDARY SCHEMAS
# ============================
class CampusBoundaryResponse(BaseModel):
    id: str
    name: str
    geojson_data: Dict[str, Any]
    properties: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)

# ============================
# PATH & ROUTING SCHEMAS
# ============================
class CampusPathResponse(BaseModel):
    id: str
    source_node: str
    destination_node: str
    distance: float
    path_type: str
    accessibility: str
    geometry: Optional[List[List[float]]] = None
    model_config = ConfigDict(from_attributes=True)

class RouteStep(BaseModel):
    instruction: str
    distance_meters: float
    coordinates: List[float]
    bearing: Optional[str] = None

class CoordinatePoint(BaseModel):
    latitude: float
    longitude: float

class RouteCalculateRequest(BaseModel):
    source_node: Optional[str] = None
    destination_node: Optional[str] = None
    source_coord: Optional[CoordinatePoint] = None
    destination_coord: Optional[CoordinatePoint] = None
    algorithm: Optional[str] = "dijkstra"  # "dijkstra" or "astar"
    wheelchair_accessible_only: bool = False

class RouteAlternative(BaseModel):
    name: str
    total_distance_meters: float
    estimated_walk_time_minutes: float
    path_nodes: List[str]
    geometry: List[List[float]]
    steps: List[RouteStep]

class RouteResponse(BaseModel):
    found: bool
    source: str
    destination: str
    algorithm_used: str
    total_distance_meters: float
    estimated_walk_time_minutes: float
    path_nodes: List[str]
    geometry: List[List[float]]
    steps: List[RouteStep]
    alternatives: List[RouteAlternative] = []
    is_snapped_from_gps: bool = False
    message: Optional[str] = None

RouteRequest = RouteCalculateRequest

# ============================
# FLOOR PLAN SCHEMAS
# ============================
class FloorPlanResponse(BaseModel):
    id: str
    building_id: str
    floor_number: int
    floor_label: Optional[str] = None
    image_path: str
    width: int
    height: int
    is_approximate: bool
    last_updated: Optional[datetime] = None
    rooms: Optional[List[RoomResponse]] = []
    model_config = ConfigDict(from_attributes=True)

# ============================
# INDOOR NAVIGATION SCHEMAS
# ============================
class FloorBase(BaseModel):
    id: str
    building_id: str
    floor_number: int
    floor_label: Optional[str] = None
    floor_plan_image: str
    image_width: int = 1000
    image_height: int = 600
    is_approximate: bool = True
    is_active: bool = True

class FloorResponse(FloorBase):
    last_updated: Optional[datetime] = None
    rooms: Optional[List[RoomResponse]] = []
    model_config = ConfigDict(from_attributes=True)

class IndoorNodeBase(BaseModel):
    id: str
    building_id: str
    floor_id: str
    floor_number: int = 0
    node_type: str  # "room", "corridor", "intersection", "staircase", "lift", "entrance"
    node_name: str
    relative_x: float
    relative_y: float
    room_id: Optional[str] = None

class IndoorNodeResponse(IndoorNodeBase):
    model_config = ConfigDict(from_attributes=True)

class IndoorEdgeBase(BaseModel):
    id: str
    building_id: str
    floor_id: Optional[str] = None
    source_node_id: str
    destination_node_id: str
    distance: float = 10.0
    movement_type: str = "corridor"  # "corridor", "room_access", "staircase", "lift", "entrance_connection"
    accessible: bool = True
    is_active: bool = True

class IndoorEdgeResponse(IndoorEdgeBase):
    model_config = ConfigDict(from_attributes=True)

class FloorTransitionResponse(BaseModel):
    id: str
    building_id: str
    source_floor_id: str
    destination_floor_id: str
    transition_type: str
    source_node_id: str
    destination_node_id: str
    is_accessible: bool
    model_config = ConfigDict(from_attributes=True)

class IndoorRouteStep(BaseModel):
    instruction: str
    distance_meters: float
    node_id: str
    relative_x: float
    relative_y: float
    floor_number: int
    floor_label: Optional[str] = None
    step_type: str = "walk"  # "walk", "staircase", "lift", "door", "arrive"

class IndoorFloorSegment(BaseModel):
    floor_number: int
    floor_label: str
    floor_plan_image: str
    path_coordinates: List[List[float]]
    steps: List[IndoorRouteStep]
    subtotal_distance_meters: float

class IndoorRouteCalculateRequest(BaseModel):
    building_id: str
    source_node_id: Optional[str] = None
    destination_node_id: Optional[str] = None
    source_room_id: Optional[str] = None
    destination_room_id: Optional[str] = None
    preferred_transition: Optional[str] = "stairs"  # "stairs", "lift", "accessible"
    algorithm: Optional[str] = "dijkstra"  # "dijkstra" or "astar"

class IndoorRouteResponse(BaseModel):
    found: bool
    building_id: str
    building_name: str
    source_name: str
    destination_name: str
    total_distance_meters: float
    estimated_walk_time_minutes: float
    is_multi_floor: bool
    floors_traversed: List[int]
    floor_segments: List[IndoorFloorSegment]
    all_path_nodes: List[str]
    instructions: List[str]
    accessibility_used: str
    message: Optional[str] = None

class FloorPlanUploadResponse(BaseModel):
    success: bool
    building_id: str
    floor_number: int
    image_url: str
    message: str

# ============================
# SEARCH SCHEMAS
# ============================
class SearchResultItem(BaseModel):
    id: str
    title: str
    category: str  # "building", "room", "facility", "poi"
    subtitle: str
    building_id: Optional[str] = None
    building_name: Optional[str] = None
    floor: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    keywords: Optional[str] = None

class SearchHistoryResponse(BaseModel):
    id: int
    search_query: str
    selected_location_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ============================
# GEOJSON VALIDATION & IMPORT SCHEMAS
# ============================
class GeoJSONValidateRequest(BaseModel):
    geojson: Dict[str, Any]

class GeoJSONValidationResponse(BaseModel):
    valid: bool
    feature_count: int
    points_count: int
    lines_count: int
    polygons_count: int
    errors: List[str] = []
    warnings: List[str] = []

class GeoJSONImportRequest(BaseModel):
    geojson: Dict[str, Any]
    target_type: str = "auto"  # "auto", "poi", "path", "boundary", "building"
    overwrite_existing: bool = False

class GeoJSONImportResponse(BaseModel):
    success: bool
    imported_count: int
    rejected_count: int
    summary: Dict[str, int]
    messages: List[str] = []

# ============================
# SUMMARY & AUTH SCHEMAS
# ============================
class CampusSummaryResponse(BaseModel):
    institution_name: str
    short_name: str
    address: str
    department: str
    total_buildings: int
    total_rooms: int
    total_facilities: int
    total_pois: int = 0
    total_paths: int = 0
    total_floor_plans: int
    center_latitude: float
    center_longitude: float
    building_types: List[str]
    is_demo_dataset: bool = True

class NavigationSummaryResponse(BaseModel):
    total_buildings: int
    total_pois: int
    total_pathways: int
    total_nodes: int
    campus_boundary_available: bool
    bounding_box: List[List[float]]
    default_center: List[float]
    is_demo_dataset: bool

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
