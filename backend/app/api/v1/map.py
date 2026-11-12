from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import Building, CampusPath, PointOfInterest, CampusBoundary
from app.schemas.campus import (
    BuildingResponse,
    CampusPathResponse,
    PointOfInterestResponse,
    CampusBoundaryResponse
)

router = APIRouter(prefix="/map", tags=["Interactive Campus Map"])

@router.get("/points", response_model=List[PointOfInterestResponse])
def get_map_points(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves all campus Points of Interest (POIs) with optional category filtering."""
    query = db.query(PointOfInterest).filter(PointOfInterest.is_active == True)
    if category:
        query = query.filter(PointOfInterest.category == category)
    
    pois = query.all()
    results = []
    for p in pois:
        b_name = None
        if p.building_id:
            bldg = db.query(Building).filter(Building.id == p.building_id).first()
            if bldg:
                b_name = bldg.name

        results.append(
            PointOfInterestResponse(
                id=p.id,
                name=p.name,
                category=p.category,
                description=p.description,
                latitude=p.latitude,
                longitude=p.longitude,
                building_id=p.building_id,
                entrance_latitude=p.entrance_latitude,
                entrance_longitude=p.entrance_longitude,
                icon=p.icon,
                image=p.image,
                search_keywords=p.search_keywords,
                is_active=p.is_active,
                building_name=b_name
            )
        )
    return results

@router.get("/buildings", response_model=List[BuildingResponse])
def get_map_buildings(db: Session = Depends(get_db)):
    """Retrieves all active campus building spatial footprint footprints and coordinates."""
    return db.query(Building).filter(Building.is_active == True).all()

@router.get("/paths", response_model=List[CampusPathResponse])
def get_map_paths(db: Session = Depends(get_db)):
    """Retrieves all connected outdoor walkways, roads, and pedestrian lines."""
    return db.query(CampusPath).all()

@router.get("/boundary", response_model=Optional[CampusBoundaryResponse])
def get_campus_boundary(db: Session = Depends(get_db)):
    """Retrieves the official or demonstrative YTC campus perimeter boundary polygon GeoJSON."""
    boundary = db.query(CampusBoundary).filter(CampusBoundary.id == "ytc-main-boundary").first()
    if not boundary:
        # Fallback first boundary
        boundary = db.query(CampusBoundary).first()
    if not boundary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campus boundary geometry not configured."
        )
    return boundary
