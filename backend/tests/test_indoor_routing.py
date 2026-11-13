import pytest
from app.services.indoor_routing import indoor_routing_service
from app.database.session import SessionLocal
from app.database.seed_data import seed_database
from app.models.campus import Building, Floor, Room, IndoorNavigationNode

@pytest.fixture(scope="module")
def db():
    seed_database()
    session = SessionLocal()
    yield session
    session.close()

def test_building_and_floors_exist(db):
    bldg = db.query(Building).filter(Building.id == "bldg-b").first()
    assert bldg is not None
    assert bldg.name == "Engineering & Technology Block"

    floors = db.query(Floor).filter(Floor.building_id == "bldg-b").all()
    assert len(floors) >= 3
    floor_nums = [f.floor_number for f in floors]
    assert 0 in floor_nums
    assert 1 in floor_nums
    assert 2 in floor_nums

def test_rooms_normalized_coordinates(db):
    rooms = db.query(Room).filter(Room.building_id == "bldg-b").all()
    assert len(rooms) >= 10
    for r in rooms:
        assert 0.0 <= r.relative_x <= 1.0
        assert 0.0 <= r.relative_y <= 1.0
        assert r.floor in [0, 1, 2]

def test_indoor_same_floor_route(db):
    # Route on 2nd Floor from AI Dept Office to Deep Learning Lab
    res = indoor_routing_service.calculate_indoor_route(
        db=db,
        building_id="bldg-b",
        source_room_id="rm-b-201",
        destination_room_id="rm-b-202"
    )
    assert res["found"] is True
    assert res["is_multi_floor"] is False
    assert res["total_distance_meters"] > 0
    assert len(res["floors_traversed"]) == 1
    assert res["floors_traversed"][0] == 2
    assert len(res["floor_segments"]) == 1
    assert len(res["instructions"]) > 0

def test_indoor_multi_floor_route_staircase(db):
    # Route from Ground Floor Entrance to 2nd Floor AI & Deep Learning Lab
    res = indoor_routing_service.calculate_indoor_route(
        db=db,
        building_id="bldg-b",
        source_node_id="node_b0_entrance",
        destination_room_id="rm-b-202",
        preferred_transition="stairs"
    )
    assert res["found"] is True
    assert res["is_multi_floor"] is True
    assert 0 in res["floors_traversed"]
    assert 2 in res["floors_traversed"]
    assert len(res["floor_segments"]) >= 2
    # Ensure staircase movement is mentioned in steps or instructions
    stair_steps = [s for s in res["instructions"] if "stair" in s.lower()]
    assert len(stair_steps) > 0

def test_indoor_multi_floor_accessible_lift(db):
    # Accessible route from Ground Floor to 2nd Floor
    res = indoor_routing_service.calculate_indoor_route(
        db=db,
        building_id="bldg-b",
        source_node_id="node_b0_entrance",
        destination_room_id="rm-b-202",
        preferred_transition="accessible"
    )
    assert res["found"] is True
    assert res["is_multi_floor"] is True
    # In accessible mode, it must traverse lift nodes rather than stairs
    lift_nodes = [n for n in res["all_path_nodes"] if "lift" in n.lower()]
    assert len(lift_nodes) > 0

def test_indoor_unreachable_destination(db):
    res = indoor_routing_service.calculate_indoor_route(
        db=db,
        building_id="bldg-b",
        source_node_id="node_b0_entrance",
        destination_node_id="non_existent_room_node_999"
    )
    assert res["found"] is False
