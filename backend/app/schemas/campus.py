from typing import List, Optional, Any
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
    floor: int
    room_type: str
    description: Optional[str] = None
    relative_x: float = 0.5
    relative_y: float = 0.5
    is_active: bool = True

class RoomResponse(RoomBase):
    building_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

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

class RouteRequest(BaseModel):
    source_node: str
    destination_node: str
    wheelchair_accessible_only: bool = False

class RouteResponse(BaseModel):
    found: bool
    source: str
    destination: str
    total_distance_meters: float
    estimated_walk_time_minutes: float
    path_nodes: List[str]
    geometry: List[List[float]]
    steps: List[RouteStep]

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
# SEARCH SCHEMAS
# ============================
class SearchResultItem(BaseModel):
    id: str
    title: str
    category: str  # "building", "room", "facility"
    subtitle: str
    building_id: Optional[str] = None
    building_name: Optional[str] = None
    floor: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None

class SearchHistoryResponse(BaseModel):
    id: int
    search_query: str
    selected_location_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

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
    total_floor_plans: int
    center_latitude: float
    center_longitude: float
    building_types: List[str]
    is_demo_dataset: bool = True

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
