import pytest
import networkx as nx
from app.services.routing import routing_service, haversine_distance, calculate_bearing
from app.services.geojson_service import geojson_service
from app.database.session import SessionLocal
from app.database.seed_data import seed_database

@pytest.fixture(scope="module")
def db():
    seed_database()
    session = SessionLocal()
    yield session
    session.close()

def test_haversine_distance():
    # Wadhe Phata to Satara center approx distance
    d = haversine_distance(17.7215, 74.0205, 17.7225, 74.0215)
    assert 100 < d < 200

def test_calculate_bearing():
    bearing = calculate_bearing(17.7210, 74.0190, 17.7220, 74.0190)
    assert bearing == "North"

def test_dijkstra_shortest_path(db):
    res = routing_service.find_route(
        db=db,
        source="gate_main",
        destination="bldg_b_entrance",
        algorithm="dijkstra"
    )
    assert res["found"] is True
    assert res["total_distance_meters"] > 0
    assert "gate_main" in res["path_nodes"]
    assert "bldg_b_entrance" in res["path_nodes"]
    assert len(res["steps"]) > 0

def test_astar_route(db):
    res = routing_service.find_route(
        db=db,
        source="gate_main",
        destination="bldg_b_entrance",
        algorithm="astar"
    )
    assert res["found"] is True
    assert res["total_distance_meters"] > 0
    assert "A*" in res["algorithm_used"]

def test_same_start_and_end(db):
    res = routing_service.find_route(
        db=db,
        source="gate_main",
        destination="gate_main"
    )
    assert res["found"] is True
    assert res["total_distance_meters"] == 0.0
    assert len(res["steps"]) == 1

def test_unreachable_node(db):
    res = routing_service.find_route(
        db=db,
        source="gate_main",
        destination="non_existent_node_xyz"
    )
    assert res["found"] is False

def test_gps_coordinate_snapping(db):
    # Coordinate near gate_main (17.7210, 74.0190)
    res = routing_service.find_route(
        db=db,
        source_coord={"latitude": 17.72105, "longitude": 74.01905},
        destination="bldg_a_entrance"
    )
    assert res["found"] is True
    assert res["is_snapped_from_gps"] is True

def test_geojson_validation():
    valid_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "p1",
                "geometry": {"type": "Point", "coordinates": [74.0205, 17.7215]},
                "properties": {"name": "Test Point"}
            }
        ]
    }
    res = geojson_service.validate_geojson(valid_geojson)
    assert res["valid"] is True
    assert res["points_count"] == 1

def test_geojson_invalid():
    invalid_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": []},
                "properties": {"name": "Broken"}
            }
        ]
    }
    res = geojson_service.validate_geojson(invalid_geojson)
    assert res["valid"] is False
    assert len(res["errors"]) > 0
