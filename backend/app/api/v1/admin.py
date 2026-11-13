import os
import io
import csv
import json
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.database.session import get_db
from app.models.campus import (
    Building,
    Floor,
    Room,
    Facility,
    PointOfInterest,
    CampusPath,
    CampusBoundary,
    IndoorNavigationNode,
    IndoorNavigationEdge,
    FloorTransition,
    ActivityLog,
    User
)
from app.schemas.campus import (
    AdminStatsResponse,
    ActivityLogResponse,
    ActivityLogCreate,
    BuildingCreate,
    BuildingUpdate,
    BuildingResponse,
    FloorCreate,
    FloorUpdate,
    FloorResponse,
    RoomCreate,
    RoomUpdate,
    RoomResponse,
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    POICreate,
    POIUpdate,
    POIResponse,
    CampusPathCreate,
    CampusPathUpdate,
    CampusPathResponse,
    IndoorNodeCreate,
    IndoorNodeUpdate,
    IndoorNodeResponse,
    IndoorEdgeCreate,
    IndoorEdgeUpdate,
    IndoorEdgeResponse
)
from app.core.security import get_admin_user

router = APIRouter(prefix="/admin", tags=["Administrative Spatial Management"])

# ============================
# 1. OVERVIEW & AUDIT LOGS
# ============================
@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_statistics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Calculates live statistical metrics and checks for incomplete records across the campus database."""
    total_buildings = db.query(Building).count()
    total_floors = db.query(Floor).count()
    total_rooms = db.query(Room).count()
    total_facilities = db.query(Facility).count()
    total_pois = db.query(PointOfInterest).count()
    total_outdoor_paths = db.query(CampusPath).count()
    total_indoor_nodes = db.query(IndoorNavigationNode).count()
    total_indoor_edges = db.query(IndoorNavigationEdge).count()
    total_floor_transitions = db.query(FloorTransition).count()
    total_users = db.query(User).count()

    # Incomplete records check: buildings without entrance coordinates, rooms without floor_id, etc.
    incomplete = (
        db.query(Building).filter(or_(Building.entrance_latitude == None, Building.entrance_longitude == None)).count() +
        db.query(Room).filter(or_(Room.floor_id == None, Room.relative_x == 0.5, Room.relative_y == 0.5)).count()
    )

    recent_logs = db.query(ActivityLog).order_by(desc(ActivityLog.timestamp)).limit(10).all()

    return AdminStatsResponse(
        total_buildings=total_buildings,
        total_floors=total_floors,
        total_rooms=total_rooms,
        total_facilities=total_facilities,
        total_pois=total_pois,
        total_outdoor_paths=total_outdoor_paths,
        total_indoor_nodes=total_indoor_nodes,
        total_indoor_edges=total_indoor_edges,
        total_floor_transitions=total_floor_transitions,
        total_users=total_users,
        incomplete_records=incomplete,
        recent_activities=recent_logs
    )

@router.get("/activity-logs", response_model=List[ActivityLogResponse])
def get_activity_logs(
    limit: int = Query(50, ge=1, le=200),
    entity_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Retrieves immutable audit trail of campus administrative actions."""
    query = db.query(ActivityLog)
    if entity_type:
        query = query.filter(ActivityLog.entity_type == entity_type)
    return query.order_by(desc(ActivityLog.timestamp)).limit(limit).all()

@router.post("/activity-logs", response_model=ActivityLogResponse)
def create_activity_log(
    payload: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Manually records an operational note or survey activity."""
    log = ActivityLog(
        user_email=current_admin.email,
        action=payload.action,
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        summary=payload.summary
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

# ============================
# 2. BUILDING CRUD
# ============================
@router.post("/buildings", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(
    payload: BuildingCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Registers a new campus building block."""
    existing = db.query(Building).filter(
        or_(Building.id == payload.id, Building.building_code == payload.building_code)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Building with ID '{payload.id}' or code '{payload.building_code}' already exists."
        )

    bldg = Building(
        id=payload.id,
        name=payload.name,
        building_code=payload.building_code,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        entrance_latitude=payload.entrance_latitude or payload.latitude,
        entrance_longitude=payload.entrance_longitude or payload.longitude,
        total_floors=payload.total_floors,
        available_floors=payload.available_floors,
        building_type=payload.building_type,
        image_url=payload.image_url,
        is_active=payload.is_active
    )
    db.add(bldg)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="building",
        entity_id=bldg.id,
        summary=f"Added building '{bldg.name}' ({bldg.building_code})."
    ))
    db.commit()
    db.refresh(bldg)
    return bldg

@router.put("/buildings/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: str,
    payload: BuildingUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Updates building metadata, coordinates, or floor counts."""
    bldg = db.query(Building).filter(Building.id == building_id).first()
    if not bldg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Building '{building_id}' not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(bldg, field, val)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="update",
        entity_type="building",
        entity_id=bldg.id,
        summary=f"Updated details for building '{bldg.name}'."
    ))
    db.commit()
    db.refresh(bldg)
    return bldg

@router.delete("/buildings/{building_id}")
def delete_building(
    building_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Deletes or deactivates a building block."""
    bldg = db.query(Building).filter(Building.id == building_id).first()
    if not bldg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Building '{building_id}' not found.")

    name = bldg.name
    db.delete(bldg)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="building",
        entity_id=building_id,
        summary=f"Deleted building '{name}' ({building_id})."
    ))
    db.commit()
    return {"success": True, "message": f"Building '{name}' has been deleted."}

# ============================
# 3. FLOOR CRUD
# ============================
@router.post("/floors", response_model=FloorResponse, status_code=status.HTTP_201_CREATED)
def create_floor(
    payload: FloorCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Creates a new floor level for a building."""
    bldg = db.query(Building).filter(Building.id == payload.building_id).first()
    if not bldg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Parent building '{payload.building_id}' not found.")

    existing = db.query(Floor).filter(Floor.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Floor ID '{payload.id}' already exists.")

    floor = Floor(
        id=payload.id,
        building_id=payload.building_id,
        floor_number=payload.floor_number,
        floor_label=payload.floor_label or f"Floor {payload.floor_number}",
        floor_plan_image=payload.floor_plan_image,
        image_width=payload.image_width,
        image_height=payload.image_height,
        is_approximate=payload.is_approximate,
        is_active=payload.is_active
    )
    db.add(floor)
    
    # Update building available floors list if needed
    if payload.floor_number not in (bldg.available_floors or []):
        floors_list = list(bldg.available_floors or [])
        floors_list.append(payload.floor_number)
        floors_list.sort()
        bldg.available_floors = floors_list
        bldg.total_floors = len(floors_list)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="floor",
        entity_id=floor.id,
        summary=f"Created floor level '{floor.floor_label}' (Floor {floor.floor_number}) for {bldg.name}."
    ))
    db.commit()
    db.refresh(floor)
    return floor

@router.put("/floors/{floor_id}", response_model=FloorResponse)
def update_floor(
    floor_id: str,
    payload: FloorUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Updates floor label, floor plan image URL, or dimensions."""
    floor = db.query(Floor).filter(Floor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Floor '{floor_id}' not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(floor, field, val)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="update",
        entity_type="floor",
        entity_id=floor.id,
        summary=f"Updated configuration for floor '{floor.floor_label}' ({floor.id})."
    ))
    db.commit()
    db.refresh(floor)
    return floor

@router.delete("/floors/{floor_id}")
def delete_floor(
    floor_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Removes a floor configuration."""
    floor = db.query(Floor).filter(Floor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Floor '{floor_id}' not found.")

    label = floor.floor_label
    db.delete(floor)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="floor",
        entity_id=floor_id,
        summary=f"Deleted floor '{label}' ({floor_id})."
    ))
    db.commit()
    return {"success": True, "message": f"Floor '{label}' has been deleted."}

# ============================
# 4. ROOM CRUD & POSITIONING
# ============================
@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    payload: RoomCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Creates a new room with normalized relative coordinates (0.0 to 1.0)."""
    existing = db.query(Room).filter(Room.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Room ID '{payload.id}' already exists.")

    room = Room(
        id=payload.id,
        room_name=payload.room_name,
        room_number=payload.room_number,
        building_id=payload.building_id,
        floor_id=payload.floor_id,
        floor=payload.floor,
        room_type=payload.room_type,
        description=payload.description,
        relative_x=max(0.0, min(1.0, payload.relative_x)),
        relative_y=max(0.0, min(1.0, payload.relative_y)),
        is_accessible=payload.is_accessible,
        is_active=payload.is_active
    )
    db.add(room)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="room",
        entity_id=room.id,
        summary=f"Registered room '{room.room_name}' ({room.room_number}) on Floor {room.floor}."
    ))
    db.commit()
    db.refresh(room)
    return room

@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: str,
    payload: RoomUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Updates room details or visual pin coordinates on floor plan."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Room '{room_id}' not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        if field in ["relative_x", "relative_y"] and val is not None:
            val = max(0.0, min(1.0, val))
        setattr(room, field, val)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="update",
        entity_type="room",
        entity_id=room.id,
        summary=f"Updated room '{room.room_name}' (Position: {room.relative_x:.2f}, {room.relative_y:.2f})."
    ))
    db.commit()
    db.refresh(room)
    return room

@router.delete("/rooms/{room_id}")
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Deletes a room from the directory."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Room '{room_id}' not found.")

    name = room.room_name
    db.delete(room)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="room",
        entity_id=room_id,
        summary=f"Deleted room '{name}' ({room_id})."
    ))
    db.commit()
    return {"success": True, "message": f"Room '{name}' has been deleted."}

# ============================
# 5. FACILITIES & POI CRUD
# ============================
@router.post("/facilities", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
def create_facility(
    payload: FacilityCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Adds a campus utility, drinking water point, medical room, or amenity."""
    existing = db.query(Facility).filter(Facility.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Facility ID '{payload.id}' already exists.")

    fac = Facility(
        id=payload.id,
        name=payload.name,
        facility_type=payload.facility_type,
        building_id=payload.building_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        description=payload.description,
        opening_information=payload.opening_information,
        image_url=payload.image_url
    )
    db.add(fac)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="facility",
        entity_id=fac.id,
        summary=f"Added facility '{fac.name}' ({fac.facility_type})."
    ))
    db.commit()
    db.refresh(fac)
    return fac

@router.put("/facilities/{facility_id}", response_model=FacilityResponse)
def update_facility(
    facility_id: str,
    payload: FacilityUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Updates facility coordinates, schedule, or details."""
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Facility '{facility_id}' not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(fac, field, val)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="update",
        entity_type="facility",
        entity_id=fac.id,
        summary=f"Updated facility '{fac.name}'."
    ))
    db.commit()
    db.refresh(fac)
    return fac

@router.delete("/facilities/{facility_id}")
def delete_facility(
    facility_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Removes a facility."""
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Facility '{facility_id}' not found.")

    name = fac.name
    db.delete(fac)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="facility",
        entity_id=facility_id,
        summary=f"Deleted facility '{name}'."
    ))
    db.commit()
    return {"success": True, "message": f"Facility '{name}' has been deleted."}

# ============================
# 6. OUTDOOR PATHWAYS CRUD
# ============================
@router.post("/paths", response_model=CampusPathResponse, status_code=status.HTTP_201_CREATED)
def create_path(
    payload: CampusPathCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Adds a new surveyed outdoor walking path segment."""
    existing = db.query(CampusPath).filter(CampusPath.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Path ID '{payload.id}' already exists.")

    path_obj = CampusPath(
        id=payload.id,
        source_node=payload.source_node,
        destination_node=payload.destination_node,
        distance=payload.distance,
        path_type=payload.path_type,
        accessibility=payload.accessibility,
        geometry=payload.geometry
    )
    db.add(path_obj)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="pathway",
        entity_id=path_obj.id,
        summary=f"Added walkway '{path_obj.source_node}' to '{path_obj.destination_node}' ({path_obj.distance}m)."
    ))
    db.commit()
    db.refresh(path_obj)
    return path_obj

@router.put("/paths/{path_id}", response_model=CampusPathResponse)
def update_path(
    path_id: str,
    payload: CampusPathUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Updates pathway geometry, accessibility status, or distance."""
    path_obj = db.query(CampusPath).filter(CampusPath.id == path_id).first()
    if not path_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Path '{path_id}' not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(path_obj, field, val)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="update",
        entity_type="pathway",
        entity_id=path_obj.id,
        summary=f"Updated outdoor pathway '{path_obj.id}'."
    ))
    db.commit()
    db.refresh(path_obj)
    return path_obj

@router.delete("/paths/{path_id}")
def delete_path(
    path_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Removes a pathway segment."""
    path_obj = db.query(CampusPath).filter(CampusPath.id == path_id).first()
    if not path_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Path '{path_id}' not found.")

    db.delete(path_obj)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="pathway",
        entity_id=path_id,
        summary=f"Removed outdoor walkway segment '{path_id}'."
    ))
    db.commit()
    return {"success": True, "message": f"Path '{path_id}' deleted."}

# ============================
# 7. INDOOR NODES & EDGES
# ============================
@router.post("/indoor-nodes", response_model=IndoorNodeResponse, status_code=status.HTTP_201_CREATED)
def create_indoor_node(
    payload: IndoorNodeCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Registers an indoor routing waypoint, corridor junction, or transition anchor."""
    existing = db.query(IndoorNavigationNode).filter(IndoorNavigationNode.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Node ID '{payload.id}' already exists.")

    node_obj = IndoorNavigationNode(
        id=payload.id,
        building_id=payload.building_id,
        floor_id=payload.floor_id,
        floor_number=payload.floor_number,
        node_type=payload.node_type,
        node_name=payload.node_name,
        relative_x=max(0.0, min(1.0, payload.relative_x)),
        relative_y=max(0.0, min(1.0, payload.relative_y)),
        room_id=payload.room_id
    )
    db.add(node_obj)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="indoor_pathway",
        entity_id=node_obj.id,
        summary=f"Created indoor node '{node_obj.node_name}' ({node_obj.node_type}) in {node_obj.building_id}."
    ))
    db.commit()
    db.refresh(node_obj)
    return node_obj

@router.delete("/indoor-nodes/{node_id}")
def delete_indoor_node(
    node_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Removes an indoor navigation node and its connected edges."""
    node_obj = db.query(IndoorNavigationNode).filter(IndoorNavigationNode.id == node_id).first()
    if not node_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Node '{node_id}' not found.")

    # Remove connected edges
    db.query(IndoorNavigationEdge).filter(
        or_(
            IndoorNavigationEdge.source_node_id == node_id,
            IndoorNavigationEdge.destination_node_id == node_id
        )
    ).delete(synchronize_session=False)

    db.delete(node_obj)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="indoor_pathway",
        entity_id=node_id,
        summary=f"Deleted indoor node '{node_id}' and connected edges."
    ))
    db.commit()
    return {"success": True, "message": f"Indoor node '{node_id}' deleted."}

@router.post("/indoor-edges", response_model=IndoorEdgeResponse, status_code=status.HTTP_201_CREATED)
def create_indoor_edge(
    payload: IndoorEdgeCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Connects two indoor nodes with a walkable corridor or transition edge."""
    existing = db.query(IndoorNavigationEdge).filter(IndoorNavigationEdge.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Edge ID '{payload.id}' already exists.")

    edge_obj = IndoorNavigationEdge(
        id=payload.id,
        building_id=payload.building_id,
        floor_id=payload.floor_id,
        source_node_id=payload.source_node_id,
        destination_node_id=payload.destination_node_id,
        distance=payload.distance,
        movement_type=payload.movement_type,
        accessible=payload.accessible,
        is_active=payload.is_active
    )
    db.add(edge_obj)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="indoor_pathway",
        entity_id=edge_obj.id,
        summary=f"Connected indoor nodes '{edge_obj.source_node_id}' <-> '{edge_obj.destination_node_id}' ({edge_obj.distance}m)."
    ))
    db.commit()
    db.refresh(edge_obj)
    return edge_obj

@router.delete("/indoor-edges/{edge_id}")
def delete_indoor_edge(
    edge_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Removes an indoor corridor edge."""
    edge_obj = db.query(IndoorNavigationEdge).filter(IndoorNavigationEdge.id == edge_id).first()
    if not edge_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Edge '{edge_id}' not found.")

    db.delete(edge_obj)
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="indoor_pathway",
        entity_id=edge_id,
        summary=f"Removed indoor corridor edge '{edge_id}'."
    ))
    db.commit()
    return {"success": True, "message": f"Indoor edge '{edge_id}' deleted."}

# ============================
# 8. FLOOR PLAN FILE UPLOADS
# ============================
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

@router.post("/floor-plans/upload")
async def upload_floor_plan(
    building_id: str = Form(...),
    floor_number: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Validates and saves architectural floor-plan images (PNG, JPEG, WebP, SVG)."""
    ext = Path(file.filename or "plan.svg").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 10 MB (Got {len(content) / (1024*1024):.1f} MB)."
        )

    # Save to frontend public assets folder for immediate local serving
    upload_dir = Path(__file__).resolve().parents[4] / "frontend" / "public" / "floor-plans" / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    clean_filename = f"{building_id}_floor_{floor_number}{ext}"
    target_path = upload_dir / clean_filename
    
    with open(target_path, "wb") as f:
        f.write(content)

    public_url = f"/floor-plans/uploads/{clean_filename}"

    # Update or create floor record
    floor = db.query(Floor).filter(
        Floor.building_id == building_id,
        Floor.floor_number == floor_number
    ).first()

    if floor:
        floor.floor_plan_image = public_url
    else:
        floor_id = f"{building_id}-fl-{floor_number}"
        floor = Floor(
            id=floor_id,
            building_id=building_id,
            floor_number=floor_number,
            floor_label=f"Floor {floor_number}",
            floor_plan_image=public_url,
            is_approximate=False
        )
        db.add(floor)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="upload",
        entity_type="floor_plan",
        entity_id=f"{building_id}-fl-{floor_number}",
        summary=f"Uploaded new floor plan image ({clean_filename}, {len(content)/1024:.1f} KB)."
    ))
    db.commit()

    return {
        "success": True,
        "building_id": building_id,
        "floor_number": floor_number,
        "image_url": public_url,
        "file_size_kb": round(len(content) / 1024, 1),
        "message": f"Floor plan successfully saved and published at {public_url}"
    }

# ============================
# 9. DATA EXPORT CENTER
# ============================
@router.get("/export/{entity_type}")
def export_campus_data(
    entity_type: str,
    format: str = Query("json", pattern="^(json|csv|geojson)$"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Exports structured campus entities in JSON, CSV, or GeoJSON format."""
    clean_type = entity_type.lower().strip()
    
    data_list = []
    if clean_type == "buildings":
        records = db.query(Building).all()
        data_list = [{
            "id": r.id, "name": r.name, "code": r.building_code, "type": r.building_type,
            "latitude": r.latitude, "longitude": r.longitude, "total_floors": r.total_floors,
            "description": r.description
        } for r in records]
    elif clean_type == "floors":
        records = db.query(Floor).all()
        data_list = [{
            "id": r.id, "building_id": r.building_id, "floor_number": r.floor_number,
            "floor_label": r.floor_label, "image": r.floor_plan_image
        } for r in records]
    elif clean_type == "rooms":
        records = db.query(Room).all()
        data_list = [{
            "id": r.id, "room_name": r.room_name, "room_number": r.room_number,
            "building_id": r.building_id, "floor": r.floor, "room_type": r.room_type,
            "relative_x": r.relative_x, "relative_y": r.relative_y, "is_accessible": r.is_accessible
        } for r in records]
    elif clean_type == "facilities":
        records = db.query(Facility).all()
        data_list = [{
            "id": r.id, "name": r.name, "type": r.facility_type, "latitude": r.latitude,
            "longitude": r.longitude, "opening_hours": r.opening_information
        } for r in records]
    elif clean_type == "paths":
        records = db.query(CampusPath).all()
        data_list = [{
            "id": r.id, "source": r.source_node, "destination": r.destination_node,
            "distance_m": r.distance, "type": r.path_type, "accessibility": r.accessibility
        } for r in records]
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported entity type '{entity_type}'. Choose: buildings, floors, rooms, facilities, paths."
        )

    # Format JSON
    if format == "json":
        output = json.dumps(data_list, indent=2)
        return StreamingResponse(
            io.StringIO(output),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=ytc_{clean_type}.json"}
        )

    # Format CSV
    if format == "csv":
        if not data_list:
            return StreamingResponse(io.StringIO(""), media_type="text/csv")
        csv_buffer = io.StringIO()
        writer = csv.DictWriter(csv_buffer, fieldnames=data_list[0].keys())
        writer.writeheader()
        writer.writerows(data_list)
        csv_buffer.seek(0)
        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=ytc_{clean_type}.csv"}
        )

    # Format GeoJSON for spatial entities
    if format == "geojson":
        features = []
        for d in data_list:
            if "latitude" in d and "longitude" in d:
                features.append({
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [d["longitude"], d["latitude"]]},
                    "properties": d
                })
        geojson_doc = {"type": "FeatureCollection", "features": features}
        return StreamingResponse(
            io.StringIO(json.dumps(geojson_doc, indent=2)),
            media_type="application/geo+json",
            headers={"Content-Disposition": f"attachment; filename=ytc_{clean_type}.geojson"}
        )
