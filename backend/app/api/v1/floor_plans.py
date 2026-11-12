from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import FloorPlan, Room, Building
from app.schemas.campus import FloorPlanResponse, RoomResponse

router = APIRouter(prefix="/floor-plans", tags=["Floor Plans"])

@router.get("/{building_id}", response_model=List[FloorPlanResponse])
def get_floor_plans_by_building(building_id: str, db: Session = Depends(get_db)):
    """Retrieves all registered indoor floor plans for a given campus building."""
    plans = db.query(FloorPlan).filter(FloorPlan.building_id == building_id).all()
    if not plans:
        # Check if building exists
        bldg = db.query(Building).filter(Building.id == building_id).first()
        if not bldg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Building '{building_id}' not found."
            )
        return []

    response = []
    for p in plans:
        # Load rooms on this floor
        rooms = db.query(Room).filter(
            Room.building_id == building_id,
            Room.floor == p.floor_number,
            Room.is_active == True
        ).all()

        p_dict = {
            "id": p.id,
            "building_id": p.building_id,
            "floor_number": p.floor_number,
            "floor_label": p.floor_label,
            "image_path": p.image_path,
            "width": p.width,
            "height": p.height,
            "is_approximate": p.is_approximate,
            "last_updated": p.last_updated,
            "rooms": [
                RoomResponse(
                    id=r.id,
                    room_name=r.room_name,
                    room_number=r.room_number,
                    building_id=r.building_id,
                    floor=r.floor,
                    room_type=r.room_type,
                    description=r.description,
                    relative_x=r.relative_x,
                    relative_y=r.relative_y,
                    is_active=r.is_active,
                    building_name=bldg.name if (bldg := db.query(Building).filter(Building.id == r.building_id).first()) else ""
                )
                for r in rooms
            ]
        }
        response.append(p_dict)
    return response

@router.get("/{building_id}/{floor}", response_model=FloorPlanResponse)
def get_floor_plan_detail(building_id: str, floor: int, db: Session = Depends(get_db)):
    """Retrieves specific floor plan and room overlays for a building and floor number."""
    p = db.query(FloorPlan).filter(
        FloorPlan.building_id == building_id,
        FloorPlan.floor_number == floor
    ).first()

    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Floor plan for building '{building_id}' floor '{floor}' not found."
        )

    bldg = db.query(Building).filter(Building.id == building_id).first()
    rooms = db.query(Room).filter(
        Room.building_id == building_id,
        Room.floor == floor,
        Room.is_active == True
    ).all()

    return {
        "id": p.id,
        "building_id": p.building_id,
        "floor_number": p.floor_number,
        "floor_label": p.floor_label,
        "image_path": p.image_path,
        "width": p.width,
        "height": p.height,
        "is_approximate": p.is_approximate,
        "last_updated": p.last_updated,
        "rooms": [
            RoomResponse(
                id=r.id,
                room_name=r.room_name,
                room_number=r.room_number,
                building_id=r.building_id,
                floor=r.floor,
                room_type=r.room_type,
                description=r.description,
                relative_x=r.relative_x,
                relative_y=r.relative_y,
                is_active=r.is_active,
                building_name=bldg.name if bldg else ""
            )
            for r in rooms
        ]
    }
