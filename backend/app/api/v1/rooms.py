from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import Room, Building
from app.schemas.campus import RoomResponse

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("", response_model=List[RoomResponse])
def get_rooms(
    building_id: Optional[str] = Query(None, description="Filter rooms by building ID"),
    floor: Optional[int] = Query(None, description="Filter rooms by floor level"),
    room_type: Optional[str] = Query(None, description="Filter rooms by type (e.g. laboratory, classroom)"),
    db: Session = Depends(get_db)
):
    """Retrieves campus rooms with optional filtering by building, floor, or room type."""
    query = db.query(Room, Building.name.label("building_name")).join(Building, Room.building_id == Building.id)
    
    if building_id:
        query = query.filter(Room.building_id == building_id)
    if floor is not None:
        query = query.filter(Room.floor == floor)
    if room_type:
        query = query.filter(Room.room_type == room_type)
        
    results = query.filter(Room.is_active == True).all()
    
    response = []
    for room, bldg_name in results:
        r_dict = {
            "id": room.id,
            "room_name": room.room_name,
            "room_number": room.room_number,
            "building_id": room.building_id,
            "floor": room.floor,
            "room_type": room.room_type,
            "description": room.description,
            "relative_x": room.relative_x,
            "relative_y": room.relative_y,
            "is_active": room.is_active,
            "building_name": bldg_name
        }
        response.append(r_dict)
    return response

@router.get("/{room_id}", response_model=RoomResponse)
def get_room_by_id(room_id: str, db: Session = Depends(get_db)):
    """Retrieves a specific room by ID."""
    result = db.query(Room, Building.name.label("building_name"))\
        .join(Building, Room.building_id == Building.id)\
        .filter(Room.id == room_id).first()
        
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room '{room_id}' not found."
        )
    room, bldg_name = result
    return {
        "id": room.id,
        "room_name": room.room_name,
        "room_number": room.room_number,
        "building_id": room.building_id,
        "floor": room.floor,
        "room_type": room.room_type,
        "description": room.description,
        "relative_x": room.relative_x,
        "relative_y": room.relative_y,
        "is_active": room.is_active,
        "building_name": bldg_name
    }
