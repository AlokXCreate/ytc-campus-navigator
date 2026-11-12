from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import Building
from app.schemas.campus import BuildingResponse

router = APIRouter(prefix="/buildings", tags=["Buildings"])

@router.get("", response_model=List[BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    """Retrieves all active campus buildings."""
    return db.query(Building).filter(Building.is_active == True).all()

@router.get("/{building_id}", response_model=BuildingResponse)
def get_building_by_id(building_id: str, db: Session = Depends(get_db)):
    """Retrieves a specific campus building by ID."""
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Building '{building_id}' not found."
        )
    return building
