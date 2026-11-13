import pytest
from app.api.v1.health import health_check
from app.api.v1.campus import get_campus_summary
from app.api.v1.buildings import get_buildings, get_building_by_id
from app.api.v1.locations import search_campus_locations
from app.database.session import SessionLocal
from app.database.seed_data import seed_database

@pytest.fixture(scope="module")
def db():
    seed_database()
    session = SessionLocal()
    yield session
    session.close()

def test_health_check():
    data = health_check()
    assert data["status"] == "healthy"
    assert "Yashoda Technical Campus" in data["institution"]

def test_campus_summary(db):
    data = get_campus_summary(db=db)
    assert data.total_buildings > 0
    assert data.total_rooms > 0
    assert data.institution_name == "Yashoda Technical Campus"

def test_buildings_list(db):
    buildings = get_buildings(db=db)
    assert len(buildings) > 0
    assert any(b.id == "bldg-a" for b in buildings)
    assert any(b.id == "bldg-b" for b in buildings)

def test_location_search(db):
    results = search_campus_locations(q="AI", db=db)
    assert len(results) > 0
    assert any("AI" in r.title for r in results)
