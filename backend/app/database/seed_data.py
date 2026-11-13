import os
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.campus import (
    Building,
    Floor,
    Room,
    Facility,
    CampusPath,
    FloorPlan,
    PointOfInterest,
    CampusBoundary,
    IndoorNavigationNode,
    IndoorNavigationEdge,
    FloorTransition,
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
    """Initializes tables and seeds initial campus and indoor navigation data."""
    # Auto-migrate SQLite columns if table already existed from earlier prompts
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            cursor = conn.connection.cursor()
            cursor.execute("PRAGMA table_info(rooms)")
            cols = [c[1] for c in cursor.fetchall()]
            if "floor_id" not in cols:
                conn.execute(text("ALTER TABLE rooms ADD COLUMN floor_id VARCHAR(50)"))
            if "is_accessible" not in cols:
                conn.execute(text("ALTER TABLE rooms ADD COLUMN is_accessible BOOLEAN DEFAULT 1"))
            conn.commit()
    except Exception as me:
        print(f"Migration note: {me}")

    Base.metadata.create_all(bind=engine)
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        data = get_sample_data()

        # 1. Seed Buildings
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

        # 2. Seed Floors
        for fl in data.get("floors", []):
            existing = db.query(Floor).filter(Floor.id == fl["id"]).first()
            if not existing:
                floor_obj = Floor(
                    id=fl["id"],
                    building_id=fl["building_id"],
                    floor_number=fl["floor_number"],
                    floor_label=fl.get("floor_label"),
                    floor_plan_image=fl.get("floor_plan_image"),
                    image_width=fl.get("image_width", 1000),
                    image_height=fl.get("image_height", 600),
                    is_approximate=fl.get("is_approximate", True),
                    is_active=fl.get("is_active", True)
                )
                db.add(floor_obj)
            else:
                existing.floor_plan_image = fl.get("floor_plan_image")
                existing.floor_label = fl.get("floor_label")
        db.commit()
        print(f"[OK] Seeded {len(data.get('floors', []))} building floors.")

        # 3. Seed Points of Interest (POIs)
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

        # 4. Seed Campus Boundary
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

        # 5. Seed Rooms
        for r in data.get("rooms", []):
            existing = db.query(Room).filter(Room.id == r["id"]).first()
            if not existing:
                room = Room(
                    id=r["id"],
                    room_name=r["room_name"],
                    room_number=r["room_number"],
                    building_id=r["building_id"],
                    floor_id=r.get("floor_id"),
                    floor=r["floor"],
                    room_type=r.get("room_type", "classroom"),
                    description=r.get("description"),
                    relative_x=r.get("relative_x", 0.5),
                    relative_y=r.get("relative_y", 0.5),
                    is_accessible=r.get("is_accessible", True),
                    is_active=r.get("is_active", True)
                )
                db.add(room)
            else:
                existing.floor_id = r.get("floor_id")
                existing.relative_x = r.get("relative_x", 0.5)
                existing.relative_y = r.get("relative_y", 0.5)
                existing.is_accessible = r.get("is_accessible", True)
        db.commit()
        print(f"[OK] Seeded and updated {len(data.get('rooms', []))} rooms.")

        # 6. Seed Facilities
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

        # 7. Seed Campus Paths
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

        # 8. Seed Floor Plans (Legacy Compatibility)
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

        # 9. Seed Indoor Navigation Nodes
        for nd in data.get("indoor_nodes", []):
            existing = db.query(IndoorNavigationNode).filter(IndoorNavigationNode.id == nd["id"]).first()
            if not existing:
                node_obj = IndoorNavigationNode(
                    id=nd["id"],
                    building_id=nd["building_id"],
                    floor_id=nd["floor_id"],
                    floor_number=nd.get("floor_number", 0),
                    node_type=nd["node_type"],
                    node_name=nd["node_name"],
                    relative_x=nd["relative_x"],
                    relative_y=nd["relative_y"],
                    room_id=nd.get("room_id")
                )
                db.add(node_obj)
        db.commit()
        print(f"[OK] Seeded {len(data.get('indoor_nodes', []))} indoor navigation nodes.")

        # 10. Seed Indoor Navigation Edges
        for ed in data.get("indoor_edges", []):
            existing = db.query(IndoorNavigationEdge).filter(IndoorNavigationEdge.id == ed["id"]).first()
            if not existing:
                edge_obj = IndoorNavigationEdge(
                    id=ed["id"],
                    building_id=ed["building_id"],
                    floor_id=ed.get("floor_id"),
                    source_node_id=ed["source_node_id"],
                    destination_node_id=ed["destination_node_id"],
                    distance=ed.get("distance", 10.0),
                    movement_type=ed.get("movement_type", "corridor"),
                    accessible=ed.get("accessible", True),
                    is_active=True
                )
                db.add(edge_obj)
        db.commit()
        print(f"[OK] Seeded {len(data.get('indoor_edges', []))} indoor navigation edges.")

        # 11. Seed Floor Transitions
        for tr in data.get("floor_transitions", []):
            existing = db.query(FloorTransition).filter(FloorTransition.id == tr["id"]).first()
            if not existing:
                trans_obj = FloorTransition(
                    id=tr["id"],
                    building_id=tr["building_id"],
                    source_floor_id=tr["source_floor_id"],
                    destination_floor_id=tr["destination_floor_id"],
                    transition_type=tr["transition_type"],
                    source_node_id=tr["source_node_id"],
                    destination_node_id=tr["destination_node_id"],
                    is_accessible=tr.get("is_accessible", True)
                )
                db.add(trans_obj)
        db.commit()
        print(f"[OK] Seeded {len(data.get('floor_transitions', []))} vertical floor transitions.")

        # 12. Seed Default Users
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
