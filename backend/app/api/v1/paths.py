from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import CampusPath
from app.schemas.campus import CampusPathResponse, RouteRequest, RouteResponse
from app.services.routing import routing_service

router = APIRouter(prefix="/paths", tags=["Walkway Paths & Routing"])

@router.get("", response_model=List[CampusPathResponse])
def get_all_paths(db: Session = Depends(get_db)):
    """Retrieves all connected outdoor walkways and pathways."""
    return db.query(CampusPath).all()

@router.post("/route", response_model=RouteResponse)
def calculate_route(request: RouteRequest, db: Session = Depends(get_db)):
    """Computes the shortest walking route between two campus nodes using Dijkstra's algorithm."""
    result = routing_service.find_shortest_path(
        db=db,
        source=request.source_node,
        destination=request.destination_node,
        wheelchair_only=request.wheelchair_accessible_only
    )
    return result
