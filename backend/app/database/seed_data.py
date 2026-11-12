import os
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.campus import Building, Room, Facility, CampusPath, FloorPlan, User

def get_sample_data():
    # Try finding sample-campus-data.json from project paths
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

def seed_database(db: Session = None):
    """Initializes tables and seeds initial campus data."""
    Base.metadata.create_all(bind=engine)
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        data = get_sample_data()

        # Seed Buildings
        if db.query(Building).count() == 0:
            for b in data.get("buildings", []):
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

        # Seed Rooms
        if db.query(Room).count() == 0:
            for r in data.get("rooms", []):
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
        if db.query(Facility).count() == 0:
            for fac in data.get("facilities", []):
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

        # Seed Campus Paths
        if db.query(CampusPath).count() == 0:
            for p in data.get("paths", []):
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
            print(f"[OK] Seeded {len(data.get('paths', []))} campus walkway paths.")

        # Seed Floor Plans
        if db.query(FloorPlan).count() == 0:
            for fp in data.get("floor_plans", []):
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

        # Seed Default Users (Admin & Student)
        if db.query(User).count() == 0:
            # Simple demonstration hashes; in full production, bcrypt/argon2 is used
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
