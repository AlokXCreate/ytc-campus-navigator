from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import CampusPath
from app.schemas.campus import CampusPathResponse, RouteCalculateRequest, RouteResponse
from app.services.routing import routing_service

router = APIRouter(prefix="/paths", tags=["Walkway Paths & Routing"])

@router.get("", response_model=List[CampusPathResponse])
def get_all_paths(db: Session = Depends(get_db)):
    """Retrieves all connected outdoor walkways and pathways."""
    return db.query(CampusPath).all()

@router.post("/route", response_model=RouteResponse)
def calculate_route(request: RouteCalculateRequest, db: Session = Depends(get_db)):
    """Computes the shortest walking route between two campus nodes using Dijkstra's algorithm."""
    src_coord = {"latitude": request.source_coord.latitude, "longitude": request.source_coord.longitude} if request.source_coord else None
    dst_coord = {"latitude": request.destination_coord.latitude, "longitude": request.destination_coord.longitude} if request.destination_coord else None

    return routing_service.find_route(
        db=db,
        source=request.source_node,
        destination=request.destination_node,
        source_coord=src_coord,
        destination_coord=dst_coord,
        algorithm=request.algorithm or "dijkstra",
        wheelchair_only=request.wheelchair_accessible_only
    )
