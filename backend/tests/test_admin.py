import pytest
from app.database.session import SessionLocal
from app.database.seed_data import seed_database
from app.models.campus import User, Building, Floor, Room, Facility, CampusPath, ActivityLog
from app.schemas.campus import (
    UserLogin,
    BuildingCreate,
    BuildingUpdate,
    FloorCreate,
    FloorUpdate,
    RoomCreate,
    RoomUpdate,
    FacilityCreate,
    CampusPathCreate,
    ActivityLogCreate
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token
)
from app.api.v1.auth import login
from app.api.v1.admin import (
    get_admin_statistics,
    get_activity_logs,
    create_activity_log,
    create_building,
    update_building,
    delete_building,
    create_floor,
    update_floor,
    delete_floor,
    create_room,
    update_room,
    delete_room,
    create_facility,
    delete_facility,
    create_path,
    delete_path,
    export_campus_data
)

@pytest.fixture(scope="module")
def db():
    seed_database()
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def admin_user(db):
    user = db.query(User).filter(User.email == "admin@ytc.edu.in").first()
    assert user is not None
    return user

def test_password_hashing():
    pwd = "securepassword2026"
    hashed = get_password_hash(pwd)
    assert hashed.startswith("pbkdf2:sha256:")
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    token = create_access_token({"sub": "admin@ytc.edu.in", "role": "superadmin", "user_id": 1})
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "admin@ytc.edu.in"
    assert decoded["role"] == "superadmin"

def test_auth_login_endpoint(db):
    res = login(UserLogin(email="admin@ytc.edu.in", password="admin123"), db=db)
    assert res.access_token is not None
    assert res.user.email == "admin@ytc.edu.in"
    assert res.user.role in ["superadmin", "admin"]

def test_admin_statistics(db, admin_user):
    stats = get_admin_statistics(db=db, current_admin=admin_user)
    assert stats.total_buildings >= 5
    assert stats.total_floors >= 6
    assert stats.total_rooms >= 20
    assert stats.total_outdoor_paths >= 10
    assert stats.total_indoor_nodes >= 25
    assert len(stats.recent_activities) > 0

def test_activity_logs(db, admin_user):
    # Create test log
    new_log = create_activity_log(
        ActivityLogCreate(
            action="update",
            entity_type="room",
            entity_id="rm-test-01",
            summary="Unit test activity logging."
        ),
        db=db,
        current_admin=admin_user
    )
    assert new_log.id is not None
    
    logs = get_activity_logs(limit=10, entity_type="room", db=db, current_admin=admin_user)
    assert any(l.entity_id == "rm-test-01" for l in logs)

def test_building_crud(db, admin_user):
    test_bldg_id = "bldg-test-mech"
    # Create
    bldg = create_building(
        BuildingCreate(
            id=test_bldg_id,
            name="Mechanical Engineering Workshops",
            building_code="MECH-BLK",
            description="CNC, Lathe, and Welding workshop bays.",
            latitude=17.7220,
            longitude=74.0210,
            total_floors=1,
            available_floors=[0],
            building_type="workshop"
        ),
        db=db,
        current_admin=admin_user
    )
    assert bldg.id == test_bldg_id
    assert bldg.name == "Mechanical Engineering Workshops"

    # Update
    updated = update_building(
        building_id=test_bldg_id,
        payload=BuildingUpdate(description="Upgraded Industry 4.0 CNC laboratory."),
        db=db,
        current_admin=admin_user
    )
    assert "Industry 4.0" in updated.description

    # Delete
    del_res = delete_building(test_bldg_id, db=db, current_admin=admin_user)
    assert del_res["success"] is True

def test_floor_and_room_crud(db, admin_user):
    test_fl_id = "bldg-b-fl-99"
    test_rm_id = "rm-b-999"

    # Create Floor
    floor = create_floor(
        FloorCreate(
            id=test_fl_id,
            building_id="bldg-b",
            floor_number=99,
            floor_label="Rooftop Drone Testing Deck",
            floor_plan_image="/floor-plans/engineering/second.svg"
        ),
        db=db,
        current_admin=admin_user
    )
    assert floor.id == test_fl_id

    # Create Room with normalized coordinates
    room = create_room(
        RoomCreate(
            id=test_rm_id,
            room_name="Drone Avionics Hub",
            room_number="999",
            building_id="bldg-b",
            floor_id=test_fl_id,
            floor=99,
            room_type="laboratory",
            relative_x=0.45,
            relative_y=0.65
        ),
        db=db,
        current_admin=admin_user
    )
    assert room.id == test_rm_id
    assert room.relative_x == 0.45

    # Update Room Coordinates
    up_room = update_room(
        room_id=test_rm_id,
        payload=RoomUpdate(relative_x=0.55, relative_y=0.70),
        db=db,
        current_admin=admin_user
    )
    assert up_room.relative_x == 0.55
    assert up_room.relative_y == 0.70

    # Cleanup
    delete_room(test_rm_id, db=db, current_admin=admin_user)
    delete_floor(test_fl_id, db=db, current_admin=admin_user)

def test_facility_and_path_crud(db, admin_user):
    fac_id = "fac-test-ev"
    fac = create_facility(
        FacilityCreate(
            id=fac_id,
            name="EV Fast Charging Station",
            facility_type="utility",
            latitude=17.7214,
            longitude=74.0195,
            description="60kW DC Fast charging point."
        ),
        db=db,
        current_admin=admin_user
    )
    assert fac.id == fac_id
    delete_facility(fac_id, db=db, current_admin=admin_user)

    # Pathway
    p_id = "path-test-ev"
    path_obj = create_path(
        CampusPathCreate(
            id=p_id,
            source_node="gate_main",
            destination_node="bldg_b_entrance",
            distance=45.0
        ),
        db=db,
        current_admin=admin_user
    )
    assert path_obj.id == p_id
    delete_path(p_id, db=db, current_admin=admin_user)

def test_data_export(db, admin_user):
    # Export buildings in JSON
    res_json = export_campus_data("buildings", format="json", db=db, current_admin=admin_user)
    assert res_json.media_type == "application/json"

    # Export rooms in CSV
    res_csv = export_campus_data("rooms", format="csv", db=db, current_admin=admin_user)
    assert res_csv.media_type == "text/csv"

