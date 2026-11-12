from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import CampusPath, Building, PointOfInterest, CampusBoundary
from app.schemas.campus import (
    RouteCalculateRequest,
    RouteResponse,
    NavigationSummaryResponse
)
from app.services.routing import routing_service

router = APIRouter(prefix="/routes", tags=["Route Finding & Navigation Engine"])

@router.post("/calculate", response_model=RouteResponse)
def calculate_optimal_route(request: RouteCalculateRequest, db: Session = Depends(get_db)):
    """Computes the shortest walking route between campus waypoints or GPS coordinates using Dijkstra or A*."""
    src_coord = {"latitude": request.source_coord.latitude, "longitude": request.source_coord.longitude} if request.source_coord else None
    dst_coord = {"latitude": request.destination_coord.latitude, "longitude": request.destination_coord.longitude} if request.destination_coord else None

    result = routing_service.find_route(
        db=db,
        source=request.source_node,
        destination=request.destination_node,
        source_coord=src_coord,
        destination_coord=dst_coord,
        algorithm=request.algorithm or "dijkstra",
        wheelchair_only=request.wheelchair_accessible_only
    )
    return result

@router.get("/{route_id}", response_model=RouteResponse)
def get_route_by_id(route_id: str, db: Session = Depends(get_db)):
    """Returns route details for standard route presets (e.g. 'gate-to-aids', 'canteen-to-library')."""
    presets = {
        "gate-to-aids": ("gate_main", "bldg_b_entrance"),
        "gate-to-admin": ("gate_main", "bldg_a_entrance"),
        "canteen-to-library": ("canteen_entrance", "lib_entrance"),
        "parking-to-sports": ("parking_a", "sports_ground")
    }

    if route_id not in presets:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route preset '{route_id}' not found. Available: {', '.join(presets.keys())}"
        )

    src, dst = presets[route_id]
    return routing_service.find_route(db=db, source=src, destination=dst)

# Navigation summary router
nav_router = APIRouter(prefix="/navigation", tags=["Navigation Overview"])

@nav_router.get("/summary", response_model=NavigationSummaryResponse)
def get_navigation_summary(db: Session = Depends(get_db)):
    """Retrieves spatial topology statistics: total nodes, paths, POIs, boundary status, and campus bounds."""
    routing_service.build_graph(db)

    total_buildings = db.query(Building).filter(Building.is_active == True).count()
    total_pois = db.query(PointOfInterest).filter(PointOfInterest.is_active == True).count()
    total_paths = db.query(CampusPath).count()
    total_nodes = len(routing_service.graph.nodes)

    boundary = db.query(CampusBoundary).filter(CampusBoundary.id == "ytc-main-boundary").first()

    # Bounding box around YTC Satara campus
    bounding_box = [
        [17.7198, 74.0185],
        [17.7245, 74.0232]
    ]

    return NavigationSummaryResponse(
        total_buildings=total_buildings,
        total_pois=total_pois,
        total_pathways=total_paths,
        total_nodes=total_nodes,
        campus_boundary_available=boundary is not None,
        bounding_box=bounding_box,
        default_center=[17.7215, 74.0205],
        is_demo_dataset=True
    )
