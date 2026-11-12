import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Yashoda Technical Campus" in data["institution"]

def test_campus_summary(client):
    response = client.get("/api/campus/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_buildings"] > 0
    assert data["total_rooms"] > 0

def test_buildings_list(client):
    response = client.get("/api/buildings")
    assert response.status_code == 200
    buildings = response.json()
    assert len(buildings) > 0
    assert any(b["id"] == "bldg-a" for b in buildings)

def test_location_search(client):
    response = client.get("/api/locations/search?q=AI")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
