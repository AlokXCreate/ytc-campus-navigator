from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.database.session import get_db
from app.models.campus import Building, Room, Facility, FloorPlan
from app.schemas.campus import CampusSummaryResponse

router = APIRouter(prefix="/campus", tags=["Campus Overview"])

@router.get("/summary", response_model=CampusSummaryResponse)
def get_campus_summary(db: Session = Depends(get_db)):
    """Provides campus-wide statistical summary derived dynamically from seeded database records."""
    total_buildings = db.query(Building).filter(Building.is_active == True).count()
    total_rooms = db.query(Room).filter(Room.is_active == True).count()
    total_facilities = db.query(Facility).count()
    total_floor_plans = db.query(FloorPlan).count()

    raw_types = db.query(distinct(Building.building_type)).all()
    building_types = [t[0].replace("_", " ").title() for t in raw_types if t[0]]

    return CampusSummaryResponse(
        institution_name="Yashoda Technical Campus",
        short_name="YTC Satara",
        address="NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra, India",
        department="Artificial Intelligence and Data Science",
        total_buildings=total_buildings,
        total_rooms=total_rooms,
        total_facilities=total_facilities,
        total_floor_plans=total_floor_plans,
        center_latitude=17.7215,
        center_longitude=74.0205,
        building_types=building_types,
        is_demo_dataset=True
    )
