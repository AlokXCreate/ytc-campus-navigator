from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.campus import Building, Room, Facility, PointOfInterest, SearchHistory
from app.schemas.campus import SearchResultItem, SearchHistoryResponse

router = APIRouter(prefix="/locations", tags=["Locations & Search"])

@router.get("/search", response_model=List[SearchResultItem])
def search_campus_locations(
    q: str = Query(..., min_length=1, description="Search term for building, room, lab, department, facility, or keyword"),
    db: Session = Depends(get_db)
):
    """Unified case-insensitive search across buildings, classrooms, labs, departments, POIs, and facilities."""
    pattern = f"%{q.strip().lower()}%"
    results: List[SearchResultItem] = []

    # 1. Search Points of Interest (POIs)
    matching_pois = db.query(PointOfInterest).filter(
        PointOfInterest.is_active == True,
        or_(
            PointOfInterest.name.ilike(pattern),
            PointOfInterest.category.ilike(pattern),
            PointOfInterest.description.ilike(pattern),
            PointOfInterest.search_keywords.ilike(pattern)
        )
    ).all()

    for p in matching_pois:
        b_name = None
        if p.building_id:
            bldg = db.query(Building).filter(Building.id == p.building_id).first()
            if bldg: b_name = bldg.name

        results.append(
            SearchResultItem(
                id=p.id,
                title=p.name,
                category="poi",
                subtitle=f"{p.category.title()} • {b_name or 'Outdoor Campus'}",
                building_id=p.building_id,
                building_name=b_name,
                floor=None,
                latitude=p.latitude,
                longitude=p.longitude,
                description=p.description,
                keywords=p.search_keywords
            )
        )

    # 2. Search Buildings
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

    # 3. Search Rooms & Labs
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

    # 4. Search Facilities
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

    # Log search in history asynchronously
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

@router.get("/{location_id}", response_model=SearchResultItem)
def get_location_by_id(location_id: str, db: Session = Depends(get_db)):
    """Retrieves detailed record for any location entity (Building, POI, Room, or Facility)."""
    # 1. Check POI
    poi = db.query(PointOfInterest).filter(PointOfInterest.id == location_id).first()
    if poi:
        b_name = None
        if poi.building_id:
            bldg = db.query(Building).filter(Building.id == poi.building_id).first()
            if bldg: b_name = bldg.name
        return SearchResultItem(
            id=poi.id,
            title=poi.name,
            category="poi",
            subtitle=f"{poi.category.title()} • {b_name or 'Outdoor Campus'}",
            building_id=poi.building_id,
            building_name=b_name,
            floor=None,
            latitude=poi.latitude,
            longitude=poi.longitude,
            description=poi.description,
            keywords=poi.search_keywords
        )

    # 2. Check Building
    b = db.query(Building).filter(Building.id == location_id).first()
    if b:
        return SearchResultItem(
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

    # 3. Check Room
    r_item = db.query(Room, Building.name.label("building_name"), Building.latitude, Building.longitude)\
        .join(Building, Room.building_id == Building.id)\
        .filter(Room.id == location_id).first()
    if r_item:
        r, b_name, b_lat, b_lng = r_item
        return SearchResultItem(
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

    # 4. Check Facility
    f = db.query(Facility).filter(Facility.id == location_id).first()
    if f:
        return SearchResultItem(
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

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Campus location '{location_id}' not found."
    )

@router.get("/history/recent", response_model=List[SearchHistoryResponse])
def get_recent_searches(limit: int = 10, db: Session = Depends(get_db)):
    """Fetches the most recent location searches."""
    return db.query(SearchHistory).order_by(SearchHistory.created_at.desc()).limit(limit).all()
