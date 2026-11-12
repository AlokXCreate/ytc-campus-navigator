from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import Facility
from app.schemas.campus import FacilityResponse

router = APIRouter(prefix="/facilities", tags=["Facilities"])

@router.get("", response_model=List[FacilityResponse])
def get_facilities(
    facility_type: Optional[str] = Query(None, description="Filter by facility type (canteen, parking, etc.)"),
    db: Session = Depends(get_db)
):
    """Retrieves all campus facilities and utility locations."""
    query = db.query(Facility)
    if facility_type:
        query = query.filter(Facility.facility_type == facility_type)
    return query.all()
