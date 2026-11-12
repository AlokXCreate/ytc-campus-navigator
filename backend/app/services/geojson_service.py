from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models.campus import PointOfInterest, CampusPath, CampusBoundary, Building

class GeoJSONService:
    def validate_geojson(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validates GeoJSON FeatureCollection structure, geometry, and coordinates."""
        errors: List[str] = []
        warnings: List[str] = []

        if not isinstance(data, dict):
            return {
                "valid": False,
                "feature_count": 0,
                "points_count": 0,
                "lines_count": 0,
                "polygons_count": 0,
                "errors": ["Root object must be a valid GeoJSON dictionary."],
                "warnings": []
            }

        data_type = data.get("type")
        if data_type not in ["FeatureCollection", "Feature"]:
            errors.append(f"Expected GeoJSON 'FeatureCollection' or 'Feature', found '{data_type}'.")

        features = data.get("features", [])
        if data_type == "Feature":
            features = [data]

        points_count = 0
        lines_count = 0
        polygons_count = 0
        seen_ids = set()

        for idx, feat in enumerate(features):
            f_id = feat.get("id") or feat.get("properties", {}).get("id") or f"feature_{idx}"
            if f_id in seen_ids:
                warnings.append(f"Duplicate feature ID detected: '{f_id}'.")
            seen_ids.add(f_id)

            geom = feat.get("geometry")
            if not geom or not isinstance(geom, dict):
                errors.append(f"Feature '{f_id}' is missing a valid geometry object.")
                continue

            g_type = geom.get("type")
            coords = geom.get("coordinates")

            if not coords:
                errors.append(f"Feature '{f_id}' has empty coordinates.")
                continue

            if g_type == "Point":
                points_count += 1
                if not isinstance(coords, list) or len(coords) < 2:
                    errors.append(f"Point '{f_id}' must have at least [longitude, latitude] coordinates.")
                else:
                    lng, lat = coords[0], coords[1]
                    self._check_coords(lat, lng, f_id, errors, warnings)

            elif g_type == "LineString":
                lines_count += 1
                if not isinstance(coords, list) or len(coords) < 2:
                    errors.append(f"LineString '{f_id}' must have at least 2 coordinate pairs.")
                else:
                    for c in coords:
                        if isinstance(c, list) and len(c) >= 2:
                            self._check_coords(c[1], c[0], f_id, errors, warnings)

            elif g_type == "Polygon":
                polygons_count += 1
                if not isinstance(coords, list) or len(coords) < 1:
                    errors.append(f"Polygon '{f_id}' must have at least one linear ring.")

            else:
                warnings.append(f"Feature '{f_id}' uses unsupported geometry type '{g_type}'.")

        is_valid = len(errors) == 0

        return {
            "valid": is_valid,
            "feature_count": len(features),
            "points_count": points_count,
            "lines_count": lines_count,
            "polygons_count": polygons_count,
            "errors": errors,
            "warnings": warnings
        }

    def _check_coords(self, lat: float, lng: float, f_id: str, errors: List[str], warnings: List[str]):
        if not (-90.0 <= lat <= 90.0):
            errors.append(f"Feature '{f_id}' has invalid latitude: {lat}")
        if not (-180.0 <= lng <= 180.0):
            errors.append(f"Feature '{f_id}' has invalid longitude: {lng}")

        # Warning if coordinates are outside Maharashtra / Satara region (roughly 15-22N, 72-80E)
        if not (15.0 <= lat <= 22.0 and 72.0 <= lng <= 80.0):
            warnings.append(f"Feature '{f_id}' coordinates ({lat:.4f}, {lng:.4f}) fall outside Maharashtra/Satara region.")

    def import_geojson(
        self,
        db: Session,
        data: Dict[str, Any],
        target_type: str = "auto",
        overwrite: bool = False
    ) -> Dict[str, Any]:
        """Imports features from a valid GeoJSON payload into POIs, Pathways, or Boundaries."""
        val = self.validate_geojson(data)
        if not val["valid"]:
            return {
                "success": False,
                "imported_count": 0,
                "rejected_count": val["feature_count"],
                "summary": {"points": 0, "paths": 0, "boundaries": 0},
                "messages": val["errors"]
            }

        features = data.get("features", [])
        if data.get("type") == "Feature":
            features = [data]

        imported_points = 0
        imported_paths = 0
        imported_boundaries = 0
        messages: List[str] = []

        for idx, feat in enumerate(features):
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            g_type = geom.get("type")
            f_id = feat.get("id") or props.get("id") or f"import_{idx}_{g_type.lower()}"
            name = props.get("name") or f"Imported {g_type} {idx + 1}"

            try:
                # 1. Point -> PointOfInterest
                if g_type == "Point" and target_type in ["auto", "poi"]:
                    lng, lat = geom["coordinates"][0], geom["coordinates"][1]
                    existing = db.query(PointOfInterest).filter(PointOfInterest.id == str(f_id)).first()
                    if existing:
                        if overwrite:
                            existing.name = name
                            existing.category = props.get("category", "facility")
                            existing.description = props.get("description", "")
                            existing.latitude = lat
                            existing.longitude = lng
                            imported_points += 1
                    else:
                        poi = PointOfInterest(
                            id=str(f_id),
                            name=name,
                            category=props.get("category", "facility"),
                            description=props.get("description", "Imported campus location"),
                            latitude=lat,
                            longitude=lng,
                            building_id=props.get("building_id"),
                            icon=props.get("icon", "MapPin"),
                            search_keywords=props.get("keywords")
                        )
                        db.add(poi)
                        imported_points += 1

                # 2. LineString -> CampusPath
                elif g_type == "LineString" and target_type in ["auto", "path"]:
                    coords = [[c[1], c[0]] for c in geom["coordinates"]]  # GeoJSON is [lng, lat] -> Leaflet [lat, lng]
                    src_node = props.get("source_node") or f"node_{f_id}_start"
                    dst_node = props.get("destination_node") or f"node_{f_id}_end"
                    dist = float(props.get("distance_meters") or props.get("distance") or 50.0)

                    existing = db.query(CampusPath).filter(CampusPath.id == str(f_id)).first()
                    if existing:
                        if overwrite:
                            existing.source_node = src_node
                            existing.destination_node = dst_node
                            existing.distance = dist
                            existing.geometry = coords
                            imported_paths += 1
                    else:
                        path = CampusPath(
                            id=str(f_id),
                            source_node=src_node,
                            destination_node=dst_node,
                            distance=dist,
                            path_type=props.get("path_type", "pedestrian_walkway"),
                            accessibility="wheelchair_friendly" if props.get("accessible") else "accessible",
                            geometry=coords
                        )
                        db.add(path)
                        imported_paths += 1

                # 3. Polygon -> CampusBoundary
                elif g_type == "Polygon" and target_type in ["auto", "boundary"]:
                    existing = db.query(CampusBoundary).filter(CampusBoundary.id == str(f_id)).first()
                    if existing:
                        if overwrite:
                            existing.name = name
                            existing.geojson_data = feat
                            existing.properties = props
                            imported_boundaries += 1
                    else:
                        bound = CampusBoundary(
                            id=str(f_id),
                            name=name,
                            geojson_data=feat,
                            properties=props
                        )
                        db.add(bound)
                        imported_boundaries += 1

            except Exception as e:
                messages.append(f"Failed to import feature '{f_id}': {str(e)}")

        db.commit()

        total = imported_points + imported_paths + imported_boundaries
        return {
            "success": True,
            "imported_count": total,
            "rejected_count": len(features) - total,
            "summary": {
                "points": imported_points,
                "paths": imported_paths,
                "boundaries": imported_boundaries
            },
            "messages": messages or [f"Successfully imported {total} campus spatial records."]
        }

geojson_service = GeoJSONService()
