import os
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.campus import (
    Building,
    Room,
    Facility,
    CampusPath,
    FloorPlan,
    PointOfInterest,
    CampusBoundary,
    User
)

def get_sample_data():
    possible_paths = [
        Path(__file__).resolve().parents[3] / "data" / "sample-campus-data.json",
        Path(__file__).resolve().parents[2] / "data" / "sample-campus-data.json",
        Path("data/sample-campus-data.json"),
        Path("../data/sample-campus-data.json")
    ]
    for p in possible_paths:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
    raise FileNotFoundError("sample-campus-data.json could not be located.")

def seed_database(db: Session = None, force_reseed: bool = False):
    """Initializes tables and seeds initial campus data."""
    Base.metadata.create_all(bind=engine)
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        data = get_sample_data()

        # Seed Buildings
        if db.query(Building).count() == 0 or force_reseed:
            for b in data.get("buildings", []):
                existing = db.query(Building).filter(Building.id == b["id"]).first()
                if not existing:
                    building = Building(
                        id=b["id"],
                        name=b["name"],
                        building_code=b["building_code"],
                        description=b.get("description"),
                        latitude=b["latitude"],
                        longitude=b["longitude"],
                        entrance_latitude=b.get("entrance_latitude"),
                        entrance_longitude=b.get("entrance_longitude"),
                        total_floors=b.get("total_floors", 1),
                        available_floors=b.get("available_floors", []),
                        building_type=b.get("building_type", "academic"),
                        image_url=b.get("image_url"),
                        is_active=b.get("is_active", True)
                    )
                    db.add(building)
            db.commit()
            print(f"[OK] Seeded {len(data.get('buildings', []))} buildings.")

        # Seed Points of Interest (POIs)
        if db.query(PointOfInterest).count() == 0 or force_reseed:
            for poi in data.get("points_of_interest", []):
                existing = db.query(PointOfInterest).filter(PointOfInterest.id == poi["id"]).first()
                if not existing:
                    p_obj = PointOfInterest(
                        id=poi["id"],
                        name=poi["name"],
                        category=poi["category"],
                        description=poi.get("description"),
                        latitude=poi["latitude"],
                        longitude=poi["longitude"],
                        building_id=poi.get("building_id"),
                        entrance_latitude=poi.get("entrance_latitude"),
                        entrance_longitude=poi.get("entrance_longitude"),
                        icon=poi.get("icon", "MapPin"),
                        image=poi.get("image"),
                        search_keywords=poi.get("search_keywords"),
                        is_active=poi.get("is_active", True)
                    )
                    db.add(p_obj)
            db.commit()
            print(f"[OK] Seeded {len(data.get('points_of_interest', []))} Points of Interest.")

        # Seed Campus Boundary
        if db.query(CampusBoundary).count() == 0 or force_reseed:
            bound_data = data.get("campus_boundary")
            if bound_data:
                existing = db.query(CampusBoundary).filter(CampusBoundary.id == "ytc-main-boundary").first()
                if not existing:
                    boundary = CampusBoundary(
                        id="ytc-main-boundary",
                        name="YTC Satara Main Campus Boundary",
                        geojson_data=bound_data,
                        properties=bound_data.get("properties", {})
                    )
                    db.add(boundary)
                    db.commit()
                    print("[OK] Seeded YTC campus boundary polygon.")

        # Seed Rooms
        if db.query(Room).count() == 0 or force_reseed:
            for r in data.get("rooms", []):
                existing = db.query(Room).filter(Room.id == r["id"]).first()
                if not existing:
                    room = Room(
                        id=r["id"],
                        room_name=r["room_name"],
                        room_number=r["room_number"],
                        building_id=r["building_id"],
                        floor=r["floor"],
                        room_type=r.get("room_type", "classroom"),
                        description=r.get("description"),
                        relative_x=r.get("relative_x", 0.5),
                        relative_y=r.get("relative_y", 0.5),
                        is_active=r.get("is_active", True)
                    )
                    db.add(room)
            db.commit()
            print(f"[OK] Seeded {len(data.get('rooms', []))} rooms.")

        # Seed Facilities
        if db.query(Facility).count() == 0 or force_reseed:
            for fac in data.get("facilities", []):
                existing = db.query(Facility).filter(Facility.id == fac["id"]).first()
                if not existing:
                    facility = Facility(
                        id=fac["id"],
                        name=fac["name"],
                        facility_type=fac["facility_type"],
                        building_id=fac.get("building_id"),
                        latitude=fac["latitude"],
                        longitude=fac["longitude"],
                        description=fac.get("description"),
                        opening_information=fac.get("opening_information"),
                        image_url=fac.get("image_url")
                    )
                    db.add(facility)
            db.commit()
            print(f"[OK] Seeded {len(data.get('facilities', []))} facilities.")

        # Seed Campus Paths (update or add all 15 paths)
        for p in data.get("paths", []):
            existing = db.query(CampusPath).filter(CampusPath.id == p["id"]).first()
            if not existing:
                path = CampusPath(
                    id=p["id"],
                    source_node=p["source_node"],
                    destination_node=p["destination_node"],
                    distance=p["distance"],
                    path_type=p.get("path_type", "pedestrian"),
                    accessibility=p.get("accessibility", "accessible"),
                    geometry=p.get("geometry", [])
                )
                db.add(path)
        db.commit()
        print(f"[OK] Seeded and synchronized {len(data.get('paths', []))} campus walkway paths.")

        # Seed Floor Plans
        if db.query(FloorPlan).count() == 0 or force_reseed:
            for fp in data.get("floor_plans", []):
                existing = db.query(FloorPlan).filter(FloorPlan.id == fp["id"]).first()
                if not existing:
                    plan = FloorPlan(
                        id=fp["id"],
                        building_id=fp["building_id"],
                        floor_number=fp["floor_number"],
                        floor_label=fp.get("floor_label"),
                        image_path=fp["image_path"],
                        width=fp.get("width", 1000),
                        height=fp.get("height", 600),
                        is_approximate=fp.get("is_approximate", True)
                    )
                    db.add(plan)
            db.commit()
            print(f"[OK] Seeded {len(data.get('floor_plans', []))} floor plans.")

        # Seed Default Users
        if db.query(User).count() == 0:
            admin_user = User(
                email="admin@ytc.edu.in",
                full_name="YTC Campus Administrator",
                hashed_password="pbkdf2:sha256:ytcadmin2026",
                role="admin",
                is_active=True
            )
            student_user = User(
                email="student@ytc.edu.in",
                full_name="AI & DS Student",
                hashed_password="pbkdf2:sha256:ytcstudent2026",
                role="student",
                is_active=True
            )
            db.add(admin_user)
            db.add(student_user)
            db.commit()
            print("[OK] Seeded default campus accounts (admin@ytc.edu.in, student@ytc.edu.in).")

    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    print("Initializing YTC Campus Navigator Database...")
    seed_database()
    print("Database initialization complete.")
