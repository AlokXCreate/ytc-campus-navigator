from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.campus import Building, Room, Facility, SearchHistory
from app.schemas.campus import SearchResultItem, SearchHistoryResponse

router = APIRouter(prefix="/locations", tags=["Locations & Search"])

@router.get("/search", response_model=List[SearchResultItem])
def search_campus_locations(
    q: str = Query(..., min_length=1, description="Search term for building, room, lab, department or facility"),
    db: Session = Depends(get_db)
):
    """Unified case-insensitive search across buildings, classrooms, labs, departments, and campus facilities."""
    pattern = f"%{q.strip().lower()}%"
    results: List[SearchResultItem] = []

    # 1. Search Buildings
    matching_buildings = db.query(Building).filter(
        Building.is_active == True,
        or_(
            Building.name.ilike(pattern),
            Building.building_code.ilike(pattern),
            Building.description.ilike(pattern),
            Building.building_type.ilike(pattern)
        )
    ).all()

    for b in matching_buildings:
        results.append(
            SearchResultItem(
                id=b.id,
                title=b.name,
                category="building",
                subtitle=f"Code: {b.building_code} • {b.total_floors} Floors",
                building_id=b.id,
                building_name=b.name,
                floor=None,
                latitude=b.latitude,
                longitude=b.longitude,
                description=b.description
            )
        )

    # 2. Search Rooms
    matching_rooms = db.query(Room, Building.name.label("building_name"), Building.latitude, Building.longitude)\
        .join(Building, Room.building_id == Building.id)\
        .filter(
            Room.is_active == True,
            or_(
                Room.room_name.ilike(pattern),
                Room.room_number.ilike(pattern),
                Room.description.ilike(pattern),
                Room.room_type.ilike(pattern)
            )
        ).all()

    for r, b_name, b_lat, b_lng in matching_rooms:
        results.append(
            SearchResultItem(
                id=r.id,
                title=r.room_name,
                category="room",
                subtitle=f"{b_name} • Floor {r.floor} • Room {r.room_number}",
                building_id=r.building_id,
                building_name=b_name,
                floor=r.floor,
                latitude=b_lat,
                longitude=b_lng,
                description=r.description
            )
        )

    # 3. Search Facilities
    matching_facilities = db.query(Facility).filter(
        or_(
            Facility.name.ilike(pattern),
            Facility.facility_type.ilike(pattern),
            Facility.description.ilike(pattern)
        )
    ).all()

    for f in matching_facilities:
        results.append(
            SearchResultItem(
                id=f.id,
                title=f.name,
                category="facility",
                subtitle=f"Facility Type: {f.facility_type.title()}",
                building_id=f.building_id,
                building_name=None,
                floor=None,
                latitude=f.latitude,
                longitude=f.longitude,
                description=f.description
            )
        )

    # Log search query asynchronously in history
    try:
        first_match_id = results[0].id if results else None
        history_entry = SearchHistory(
            search_query=q.strip(),
            selected_location_id=first_match_id
        )
        db.add(history_entry)
        db.commit()
    except Exception:
        db.rollback()

    return results

@router.get("/recent-searches", response_model=List[SearchHistoryResponse])
def get_recent_searches(limit: int = 5, db: Session = Depends(get_db)):
    """Fetches the most recent location searches."""
    return db.query(SearchHistory).order_by(SearchHistory.created_at.desc()).limit(limit).all()
