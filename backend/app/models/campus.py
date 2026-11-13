import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    building_code = Column(String(30), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    entrance_latitude = Column(Float, nullable=True)
    entrance_longitude = Column(Float, nullable=True)
    total_floors = Column(Integer, default=1)
    available_floors = Column(JSON, default=list)
    building_type = Column(String(50), nullable=False, default="academic")
    image_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

    rooms = relationship("Room", back_populates="building", cascade="all, delete-orphan")
    facilities = relationship("Facility", back_populates="building")
    floor_plans = relationship("FloorPlan", back_populates="building", cascade="all, delete-orphan")
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    indoor_nodes = relationship("IndoorNavigationNode", back_populates="building", cascade="all, delete-orphan")
    indoor_edges = relationship("IndoorNavigationEdge", back_populates="building", cascade="all, delete-orphan")

class Floor(Base):
    __tablename__ = "floors"

    id = Column(String(50), primary_key=True, index=True)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=False, index=True)
    floor_number = Column(Integer, nullable=False, index=True)
    floor_label = Column(String(100), nullable=True)
    floor_plan_image = Column(String(255), nullable=False)
    image_width = Column(Integer, default=1000)
    image_height = Column(Integer, default=600)
    is_approximate = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor_ref")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(50), primary_key=True, index=True)
    room_name = Column(String(150), nullable=False, index=True)
    room_number = Column(String(50), nullable=False, index=True)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=False)
    floor_id = Column(String(50), ForeignKey("floors.id"), nullable=True, index=True)
    floor = Column(Integer, nullable=False, default=0)
    room_type = Column(String(50), nullable=False, default="classroom")
    description = Column(Text, nullable=True)
    relative_x = Column(Float, default=0.5)
    relative_y = Column(Float, default=0.5)
    is_accessible = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    building = relationship("Building", back_populates="rooms")
    floor_ref = relationship("Floor", back_populates="rooms")

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    facility_type = Column(String(50), nullable=False, index=True)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    opening_information = Column(String(200), nullable=True)
    image_url = Column(String(255), nullable=True)

    building = relationship("Building", back_populates="facilities")

class CampusPath(Base):
    __tablename__ = "campus_paths"

    id = Column(String(50), primary_key=True, index=True)
    source_node = Column(String(100), nullable=False, index=True)
    destination_node = Column(String(100), nullable=False, index=True)
    distance = Column(Float, nullable=False)
    path_type = Column(String(50), default="pedestrian")
    accessibility = Column(String(50), default="accessible")
    geometry = Column(JSON, nullable=True)

class FloorPlan(Base):
    __tablename__ = "floor_plans"

    id = Column(String(50), primary_key=True, index=True)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=False)
    floor_number = Column(Integer, nullable=False)
    floor_label = Column(String(100), nullable=True)
    image_path = Column(String(255), nullable=False)
    width = Column(Integer, default=1000)
    height = Column(Integer, default=600)
    is_approximate = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    building = relationship("Building", back_populates="floor_plans")

class PointOfInterest(Base):
    __tablename__ = "points_of_interest"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=True)
    entrance_latitude = Column(Float, nullable=True)
    entrance_longitude = Column(Float, nullable=True)
    icon = Column(String(50), default="MapPin")
    image = Column(String(255), nullable=True)
    search_keywords = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

class CampusBoundary(Base):
    __tablename__ = "campus_boundaries"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    geojson_data = Column(JSON, nullable=False)
    properties = Column(JSON, nullable=True)

class IndoorNavigationNode(Base):
    __tablename__ = "indoor_navigation_nodes"

    id = Column(String(50), primary_key=True, index=True)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=False, index=True)
    floor_id = Column(String(50), nullable=False, index=True)
    floor_number = Column(Integer, default=0, index=True)
    node_type = Column(String(50), nullable=False, index=True)  # "room", "corridor", "intersection", "staircase", "lift", "entrance"
    node_name = Column(String(150), nullable=False)
    relative_x = Column(Float, nullable=False, default=0.5)
    relative_y = Column(Float, nullable=False, default=0.5)
    room_id = Column(String(50), nullable=True, index=True)

    building = relationship("Building", back_populates="indoor_nodes")

class IndoorNavigationEdge(Base):
    __tablename__ = "indoor_navigation_edges"

    id = Column(String(50), primary_key=True, index=True)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=False, index=True)
    floor_id = Column(String(50), nullable=True, index=True)
    source_node_id = Column(String(50), nullable=False, index=True)
    destination_node_id = Column(String(50), nullable=False, index=True)
    distance = Column(Float, nullable=False, default=10.0)
    movement_type = Column(String(50), default="corridor")  # "corridor", "room_access", "staircase", "lift", "entrance_connection"
    accessible = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    building = relationship("Building", back_populates="indoor_edges")

class FloorTransition(Base):
    __tablename__ = "floor_transitions"

    id = Column(String(50), primary_key=True, index=True)
    building_id = Column(String(50), ForeignKey("buildings.id"), nullable=False, index=True)
    source_floor_id = Column(String(50), nullable=False, index=True)
    destination_floor_id = Column(String(50), nullable=False, index=True)
    transition_type = Column(String(50), nullable=False)  # "staircase", "lift", "ramp"
    source_node_id = Column(String(50), nullable=False, index=True)
    destination_node_id = Column(String(50), nullable=False, index=True)
    is_accessible = Column(Boolean, default=True)

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    search_query = Column(String(255), nullable=False)
    selected_location_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="visitor")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
