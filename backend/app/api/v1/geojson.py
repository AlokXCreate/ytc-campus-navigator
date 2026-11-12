from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.campus import (
    GeoJSONValidateRequest,
    GeoJSONValidationResponse,
    GeoJSONImportRequest,
    GeoJSONImportResponse
)
from app.services.geojson_service import geojson_service

router = APIRouter(prefix="/geojson", tags=["GeoJSON Spatial Management"])

@router.post("/validate", response_model=GeoJSONValidationResponse)
def validate_geojson_data(payload: GeoJSONValidateRequest):
    """Validates arbitrary GeoJSON FeatureCollection syntax, geometry integrity, and coordinate bounds."""
    result = geojson_service.validate_geojson(payload.geojson)
    return result

@router.post("/import", response_model=GeoJSONImportResponse)
def import_geojson_data(payload: GeoJSONImportRequest, db: Session = Depends(get_db)):
    """Imports validated features (POIs, LineStrings, or Polygon boundaries) into the campus database."""
    result = geojson_service.import_geojson(
        db=db,
        data=payload.geojson,
        target_type=payload.target_type,
        overwrite=payload.overwrite_existing
    )
    return result
