import math
import networkx as nx
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.campus import CampusPath, Building, PointOfInterest, Facility

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> str:
    """Calculates cardinal direction between two coordinates."""
    d_lon = math.radians(lon2 - lon1)
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)

    y = math.sin(d_lon) * math.cos(lat2_r)
    x = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(d_lon)
    bearing_deg = (math.degrees(math.atan2(y, x)) + 360) % 360

    cardinals = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]
    idx = int((bearing_deg + 22.5) / 45) % 8
    return cardinals[idx]

class RoutingService:
    def __init__(self):
        self.graph = nx.Graph()
        self.node_positions: Dict[str, Tuple[float, float]] = {}

    def build_graph(self, db: Session):
        """Constructs the NetworkX path graph and extracts coordinate positions for all nodes."""
        self.graph.clear()
        self.node_positions.clear()

        paths = db.query(CampusPath).all()
        for path in paths:
            geom = path.geometry or []
            self.graph.add_edge(
                path.source_node,
                path.destination_node,
                weight=path.distance,
                distance=path.distance,
                path_type=path.path_type,
                accessibility=path.accessibility,
                geometry=geom
            )

            # Store node positions from geometry endpoints
            if geom and len(geom) >= 2:
                self.node_positions[path.source_node] = (geom[0][0], geom[0][1])
                self.node_positions[path.destination_node] = (geom[-1][0], geom[-1][1])

        # Also map building entrance nodes if known
        buildings = db.query(Building).all()
        for b in buildings:
            if b.entrance_latitude and b.entrance_longitude:
                # Node key naming convention
                b_node = f"{b.id.replace('-', '_')}_entrance"
                self.node_positions[b_node] = (b.entrance_latitude, b.entrance_longitude)

    def find_nearest_node(self, lat: float, lng: float) -> Tuple[Optional[str], float]:
        """Finds the nearest graph node to an arbitrary coordinate using Haversine distance."""
        nearest_node = None
        min_distance = float("inf")

        for node_id, (n_lat, n_lng) in self.node_positions.items():
            dist = haversine_distance(lat, lng, n_lat, n_lng)
            if dist < min_distance:
                min_distance = dist
                nearest_node = node_id

        return nearest_node, min_distance

    def resolve_location_to_node(
        self,
        db: Session,
        location_identifier: Optional[str],
        coord: Optional[Dict[str, float]]
    ) -> Tuple[Optional[str], Optional[Tuple[float, float]], bool]:
        """Resolves a node ID, POI, Building, or raw GPS coordinate to a graph node."""
        is_snapped = False

        # If raw GPS coordinate is provided
        if coord and "latitude" in coord and "longitude" in coord:
            node_id, dist = self.find_nearest_node(coord["latitude"], coord["longitude"])
            return node_id, (coord["latitude"], coord["longitude"]), True

        if not location_identifier:
            return None, None, False

        loc_clean = location_identifier.strip()

        # 1. Direct graph node match
        if loc_clean in self.graph:
            pos = self.node_positions.get(loc_clean)
            return loc_clean, pos, False

        # 2. Check Point of Interest match
        poi = db.query(PointOfInterest).filter(
            (PointOfInterest.id == loc_clean) | (PointOfInterest.name.ilike(f"%{loc_clean}%"))
        ).first()
        if poi:
            lat = poi.entrance_latitude or poi.latitude
            lng = poi.entrance_longitude or poi.longitude
            node_id, _ = self.find_nearest_node(lat, lng)
            return node_id, (lat, lng), True

        # 3. Check Building match
        bldg = db.query(Building).filter(
            (Building.id == loc_clean) | (Building.building_code.ilike(loc_clean)) | (Building.name.ilike(f"%{loc_clean}%"))
        ).first()
        if bldg:
            lat = bldg.entrance_latitude or bldg.latitude
            lng = bldg.entrance_longitude or bldg.longitude
            node_id, _ = self.find_nearest_node(lat, lng)
            return node_id, (lat, lng), True

        # 4. Check Facility match
        fac = db.query(Facility).filter(
            (Facility.id == loc_clean) | (Facility.name.ilike(f"%{loc_clean}%"))
        ).first()
        if fac:
            node_id, _ = self.find_nearest_node(fac.latitude, fac.longitude)
            return node_id, (fac.latitude, fac.longitude), True

        # Fallback nearest node from all nodes
        return None, None, False

    def astar_heuristic(self, u: str, v: str) -> float:
        """Haversine distance heuristic between node u and goal node v for A* search."""
        pos_u = self.node_positions.get(u)
        pos_v = self.node_positions.get(v)
        if pos_u and pos_v:
            return haversine_distance(pos_u[0], pos_u[1], pos_v[0], pos_v[1])
        return 0.0

    def calculate_path_details(
        self,
        path_nodes: List[str],
        start_connector: Optional[Tuple[float, float]] = None,
        end_connector: Optional[Tuple[float, float]] = None
    ) -> Dict[str, Any]:
        """Calculates distance, walking duration, geometry, and turn-by-turn directions for a node sequence."""
        total_distance = 0.0
        geometry_coords: List[List[float]] = []
        steps: List[Dict[str, Any]] = []

        # Optional GPS start connector step
        if start_connector and path_nodes:
            first_node_pos = self.node_positions.get(path_nodes[0], (start_connector[0], start_connector[1]))
            snap_dist = haversine_distance(start_connector[0], start_connector[1], first_node_pos[0], first_node_pos[1])
            if snap_dist > 5.0:
                direction = calculate_bearing(start_connector[0], start_connector[1], first_node_pos[0], first_node_pos[1])
                steps.append({
                    "instruction": f"Head {direction} towards {path_nodes[0].replace('_', ' ').title()} ({snap_dist:.0f} m)",
                    "distance_meters": snap_dist,
                    "coordinates": [start_connector[0], start_connector[1]],
                    "bearing": direction
                })
                geometry_coords.append([start_connector[0], start_connector[1]])
                total_distance += snap_dist

        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i + 1]
            edge_data = self.graph.get_edge_data(u, v) or {}
            edge_geom = edge_data.get("geometry", [])
            dist = edge_data.get("distance", 0.0)
            total_distance += dist

            if edge_geom:
                geometry_coords.extend(edge_geom)
            else:
                pos_u = self.node_positions.get(u, [17.7215, 74.0205])
                pos_v = self.node_positions.get(v, [17.7215, 74.0205])
                geometry_coords.extend([list(pos_u), list(pos_v)])

            step_coord = geometry_coords[-1] if geometry_coords else [17.7215, 74.0205]
            clean_u = u.replace("_", " ").title()
            clean_v = v.replace("_", " ").title()

            pos_u = self.node_positions.get(u)
            pos_v = self.node_positions.get(v)
            bearing_str = calculate_bearing(pos_u[0], pos_u[1], pos_v[0], pos_v[1]) if pos_u and pos_v else "Forward"

            steps.append({
                "instruction": f"Follow pathway {bearing_str} from {clean_u} towards {clean_v} ({dist:.0f} m)",
                "distance_meters": dist,
                "coordinates": step_coord,
                "bearing": bearing_str
            })

        # Destination arrival step
        if path_nodes:
            last_clean = path_nodes[-1].replace("_", " ").title()
            dest_coord = geometry_coords[-1] if geometry_coords else [17.7215, 74.0205]
            steps.append({
                "instruction": f"You have reached your destination: {last_clean}",
                "distance_meters": 0.0,
                "coordinates": dest_coord,
                "bearing": "Arrive"
            })

        # Average student walking speed: 1.3 meters/second (~78 meters/minute)
        walk_time_minutes = round(total_distance / 78.0, 1)
        if walk_time_minutes < 1.0 and total_distance > 0:
            walk_time_minutes = 1.0

        return {
            "total_distance": round(total_distance, 1),
            "walk_time_minutes": walk_time_minutes,
            "geometry": geometry_coords,
            "steps": steps
        }

    def find_route(
        self,
        db: Session,
        source: Optional[str] = None,
        destination: Optional[str] = None,
        source_coord: Optional[Dict[str, float]] = None,
        destination_coord: Optional[Dict[str, float]] = None,
        algorithm: str = "dijkstra",
        wheelchair_only: bool = False
    ) -> Dict[str, Any]:
        """Calculates optimal campus walking route using Dijkstra or A* shortest path algorithms."""
        self.build_graph(db)

        src_node, src_pos, src_snapped = self.resolve_location_to_node(db, source, source_coord)
        dst_node, dst_pos, dst_snapped = self.resolve_location_to_node(db, destination, destination_coord)

        if not src_node or not dst_node:
            missing = []
            if not src_node: missing.append("origin location")
            if not dst_node: missing.append("destination location")
            return {
                "found": False,
                "source": source or "Current Location",
                "destination": destination or "Destination",
                "algorithm_used": algorithm,
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "path_nodes": [],
                "geometry": [],
                "steps": [],
                "alternatives": [],
                "is_snapped_from_gps": False,
                "message": f"Could not resolve {' and '.join(missing)} to campus pathway graph."
            }

        # Same origin and destination check
        if src_node == dst_node:
            node_clean = src_node.replace("_", " ").title()
            return {
                "found": True,
                "source": src_node,
                "destination": dst_node,
                "algorithm_used": algorithm,
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "path_nodes": [src_node],
                "geometry": [list(self.node_positions.get(src_node, (17.7215, 74.0205)))],
                "steps": [{
                    "instruction": f"You are already at {node_clean}.",
                    "distance_meters": 0.0,
                    "coordinates": list(self.node_positions.get(src_node, (17.7215, 74.0205))),
                    "bearing": "Arrive"
                }],
                "alternatives": [],
                "is_snapped_from_gps": src_snapped,
                "message": "Starting point and destination are the same."
            }

        # Weight filter for wheelchair accessibility
        def weight_func(u, v, d):
            if wheelchair_only and d.get("accessibility") != "wheelchair_friendly":
                return float("inf")
            return d.get("weight", 1.0)

        try:
            # Algorithm Selection: A* vs Dijkstra
            if algorithm.lower() == "astar":
                path_nodes = nx.astar_path(
                    self.graph,
                    src_node,
                    dst_node,
                    heuristic=self.astar_heuristic,
                    weight=weight_func
                )
                algo_name = "A* Heuristic"
            else:
                path_nodes = nx.dijkstra_path(
                    self.graph,
                    src_node,
                    dst_node,
                    weight=weight_func
                )
                algo_name = "Dijkstra Shortest Path"

            details = self.calculate_path_details(
                path_nodes,
                start_connector=src_pos if src_snapped else None,
                end_connector=dst_pos if dst_snapped else None
            )

            # Discover alternative routes if possible
            alternatives = []
            try:
                # Find all simple paths up to 6 hops to see if an alternative route exists
                simple_paths = list(nx.all_simple_paths(self.graph, src_node, dst_node, cutoff=7))
                for alt_nodes in simple_paths:
                    if alt_nodes != path_nodes and len(alternatives) < 2:
                        alt_details = self.calculate_path_details(alt_nodes)
                        # Only include if distance is within 1.6x of optimal
                        if alt_details["total_distance"] <= details["total_distance"] * 1.6:
                            alternatives.append({
                                "name": f"Via {alt_nodes[1].replace('_', ' ').title()}",
                                "total_distance_meters": alt_details["total_distance"],
                                "estimated_walk_time_minutes": alt_details["walk_time_minutes"],
                                "path_nodes": alt_nodes,
                                "geometry": alt_details["geometry"],
                                "steps": alt_details["steps"]
                            })
            except Exception:
                pass

            return {
                "found": True,
                "source": src_node,
                "destination": dst_node,
                "algorithm_used": algo_name,
                "total_distance_meters": details["total_distance"],
                "estimated_walk_time_minutes": details["walk_time_minutes"],
                "path_nodes": path_nodes,
                "geometry": details["geometry"],
                "steps": details["steps"],
                "alternatives": alternatives,
                "is_snapped_from_gps": src_snapped or dst_snapped,
                "message": None
            }

        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return {
                "found": False,
                "source": src_node,
                "destination": dst_node,
                "algorithm_used": algorithm,
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "path_nodes": [],
                "geometry": [],
                "steps": [],
                "alternatives": [],
                "is_snapped_from_gps": src_snapped,
                "message": "No connected walkway path exists between the selected points."
            }

routing_service = RoutingService()
