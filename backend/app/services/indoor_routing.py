import math
import networkx as nx
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.campus import (
    Building,
    Floor,
    Room,
    IndoorNavigationNode,
    IndoorNavigationEdge,
    FloorTransition
)

class IndoorRoutingService:
    def __init__(self):
        self.graphs: Dict[str, nx.Graph] = {}
        self.node_metadata: Dict[str, Dict[str, Any]] = {}

    def build_building_graph(self, db: Session, building_id: str):
        """Constructs a NetworkX graph for indoor navigation inside a building."""
        g = nx.Graph()
        nodes = db.query(IndoorNavigationNode).filter(IndoorNavigationNode.building_id == building_id).all()
        
        for n in nodes:
            g.add_node(
                n.id,
                building_id=n.building_id,
                floor_id=n.floor_id,
                floor_number=n.floor_number,
                node_type=n.node_type,
                node_name=n.node_name,
                relative_x=n.relative_x,
                relative_y=n.relative_y,
                room_id=n.room_id
            )
            self.node_metadata[n.id] = {
                "id": n.id,
                "building_id": n.building_id,
                "floor_id": n.floor_id,
                "floor_number": n.floor_number,
                "node_type": n.node_type,
                "node_name": n.node_name,
                "relative_x": n.relative_x,
                "relative_y": n.relative_y,
                "room_id": n.room_id
            }

        # Add intra-floor corridor and room access edges
        edges = db.query(IndoorNavigationEdge).filter(
            IndoorNavigationEdge.building_id == building_id,
            IndoorNavigationEdge.is_active == True
        ).all()

        for e in edges:
            if e.source_node_id in g and e.destination_node_id in g:
                g.add_edge(
                    e.source_node_id,
                    e.destination_node_id,
                    weight=e.distance,
                    distance=e.distance,
                    movement_type=e.movement_type,
                    accessible=e.accessible
                )

        # Add inter-floor transitions (Stairs and Lifts)
        transitions = db.query(FloorTransition).filter(FloorTransition.building_id == building_id).all()
        for t in transitions:
            if t.source_node_id in g and t.destination_node_id in g:
                # Vertical transition nominal distance
                vert_dist = 12.0 if t.transition_type == "staircase" else 8.0
                g.add_edge(
                    t.source_node_id,
                    t.destination_node_id,
                    weight=vert_dist,
                    distance=vert_dist,
                    movement_type=t.transition_type,
                    accessible=t.is_accessible,
                    transition_type=t.transition_type
                )

        self.graphs[building_id] = g

    def resolve_room_to_node(
        self,
        db: Session,
        building_id: str,
        room_id: Optional[str] = None,
        node_id: Optional[str] = None
    ) -> Optional[str]:
        """Resolves room ID or direct node ID to a valid graph node."""
        g = self.graphs.get(building_id)
        if not g:
            return None

        if node_id and node_id in g:
            return node_id

        if room_id:
            # 1. Check if node is explicitly linked to room
            node = db.query(IndoorNavigationNode).filter(
                IndoorNavigationNode.building_id == building_id,
                IndoorNavigationNode.room_id == room_id
            ).first()
            if node and node.id in g:
                return node.id

            # 2. Check by room name / room number in node_name
            room = db.query(Room).filter(Room.id == room_id).first()
            if room:
                n_match = db.query(IndoorNavigationNode).filter(
                    IndoorNavigationNode.building_id == building_id,
                    IndoorNavigationNode.floor_number == room.floor,
                    (IndoorNavigationNode.node_name.ilike(f"%{room.room_number}%") |
                     IndoorNavigationNode.node_name.ilike(f"%{room.room_name}%"))
                ).first()
                if n_match and n_match.id in g:
                    return n_match.id

                # 3. Geometric proximity on the same floor
                floor_nodes = [
                    (nid, data) for nid, data in g.nodes(data=True)
                    if data.get("floor_number") == room.floor
                ]
                if floor_nodes:
                    best_nid = None
                    best_dist = float("inf")
                    for nid, data in floor_nodes:
                        dx = data.get("relative_x", 0.5) - room.relative_x
                        dy = data.get("relative_y", 0.5) - room.relative_y
                        dist = math.hypot(dx, dy)
                        if dist < best_dist:
                            best_dist = dist
                            best_nid = nid
                    return best_nid

        return None

    def calculate_indoor_route(
        self,
        db: Session,
        building_id: str,
        source_node_id: Optional[str] = None,
        destination_node_id: Optional[str] = None,
        source_room_id: Optional[str] = None,
        destination_room_id: Optional[str] = None,
        preferred_transition: str = "stairs",  # "stairs", "lift", "accessible"
        algorithm: str = "dijkstra"
    ) -> Dict[str, Any]:
        """Calculates multi-floor indoor walking route inside a building."""
        self.build_building_graph(db, building_id)
        g = self.graphs.get(building_id)

        building = db.query(Building).filter(Building.id == building_id).first()
        bldg_name = building.name if building else "Campus Building"

        if not g or len(g.nodes) == 0:
            return {
                "found": False,
                "building_id": building_id,
                "building_name": bldg_name,
                "source_name": "Unknown",
                "destination_name": "Unknown",
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "is_multi_floor": False,
                "floors_traversed": [],
                "floor_segments": [],
                "all_path_nodes": [],
                "instructions": [],
                "accessibility_used": preferred_transition,
                "message": f"No indoor pathway network configured for building '{bldg_name}'."
            }

        # Resolve endpoints
        src_node = self.resolve_room_to_node(db, building_id, source_room_id, source_node_id)
        dst_node = self.resolve_room_to_node(db, building_id, destination_room_id, destination_node_id)

        # Default source to main entrance if missing
        if not src_node:
            entrance = db.query(IndoorNavigationNode).filter(
                IndoorNavigationNode.building_id == building_id,
                IndoorNavigationNode.node_type == "entrance"
            ).first()
            if entrance:
                src_node = entrance.id
            elif len(g.nodes) > 0:
                src_node = list(g.nodes)[0]

        if not src_node or not dst_node:
            return {
                "found": False,
                "building_id": building_id,
                "building_name": bldg_name,
                "source_name": source_room_id or source_node_id or "Start",
                "destination_name": destination_room_id or destination_node_id or "Destination",
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "is_multi_floor": False,
                "floors_traversed": [],
                "floor_segments": [],
                "all_path_nodes": [],
                "instructions": [],
                "accessibility_used": preferred_transition,
                "message": "Could not identify source or destination location within building."
            }

        src_meta = g.nodes[src_node]
        dst_meta = g.nodes[dst_node]
        src_name = src_meta.get("node_name", src_node)
        dst_name = dst_meta.get("node_name", dst_node)

        # Accessibility & transition weight modifier
        def edge_weight_func(u, v, data):
            movement = data.get("movement_type", "corridor")
            accessible = data.get("accessible", True)
            base_dist = data.get("distance", 10.0) or 10.0

            if preferred_transition in ["lift", "accessible"]:
                if movement == "staircase":
                    if preferred_transition == "accessible":
                        return float("inf")  # Strictly avoid stairs for wheelchair accessibility
                    return base_dist * 6.0   # Strongly penalize stairs for lift preference
                if movement == "lift":
                    return base_dist * 0.8   # Prioritize lift
            elif preferred_transition == "stairs":
                if movement == "lift":
                    return base_dist * 8.0   # Strong penalty for waiting on lift when user chose stairs
                if movement == "staircase":
                    return base_dist * 0.8   # Favor stairs

            return base_dist

        # Compute Shortest Path
        try:
            if algorithm.lower() == "astar":
                def heuristic(u, v):
                    data_u = g.nodes[u]
                    data_v = g.nodes[v]
                    dx = data_u.get("relative_x", 0) - data_v.get("relative_x", 0)
                    dy = data_u.get("relative_y", 0) - data_v.get("relative_y", 0)
                    df = abs(data_u.get("floor_number", 0) - data_v.get("floor_number", 0)) * 10.0
                    return (math.hypot(dx, dy) * 50.0) + df

                path_nodes = nx.astar_path(g, src_node, dst_node, heuristic=heuristic, weight=edge_weight_func)
            else:
                path_nodes = nx.dijkstra_path(g, src_node, dst_node, weight=edge_weight_func)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return {
                "found": False,
                "building_id": building_id,
                "building_name": bldg_name,
                "source_name": src_name,
                "destination_name": dst_name,
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "is_multi_floor": False,
                "floors_traversed": [],
                "floor_segments": [],
                "all_path_nodes": [],
                "instructions": ["No navigable route exists between these locations."],
                "accessibility_used": preferred_transition,
                "message": "No continuous corridor or staircase path links these two locations."
            }

        # Build Multi-Floor Segments & Turn-by-Turn Steps
        floor_map: Dict[int, Floor] = {}
        floors = db.query(Floor).filter(Floor.building_id == building_id).all()
        for f in floors:
            floor_map[f.floor_number] = f

        total_distance = 0.0
        floor_segments: List[Dict[str, Any]] = []
        instructions: List[str] = []
        floors_traversed: List[int] = []

        current_floor = None
        current_segment = None

        for i, nid in enumerate(path_nodes):
            ndata = g.nodes[nid]
            fn = ndata.get("floor_number", 0)
            nname = ndata.get("node_name", nid)
            ntype = ndata.get("node_type", "corridor")
            rx = ndata.get("relative_x", 0.5)
            ry = ndata.get("relative_y", 0.5)

            if fn not in floors_traversed:
                floors_traversed.append(fn)

            # Check floor change
            if current_floor is None or fn != current_floor:
                if current_segment:
                    floor_segments.append(current_segment)

                current_floor = fn
                fl_obj = floor_map.get(fn)
                fl_label = fl_obj.floor_label if fl_obj and fl_obj.floor_label else (f"Ground Floor" if fn == 0 else f"Floor {fn}")
                fl_img = fl_obj.floor_plan_image if fl_obj else f"/floor-plans/engineering/floor-{fn}.svg"

                current_segment = {
                    "floor_number": fn,
                    "floor_label": fl_label,
                    "floor_plan_image": fl_img,
                    "path_coordinates": [],
                    "steps": [],
                    "subtotal_distance_meters": 0.0
                }

            current_segment["path_coordinates"].append([rx, ry])

            # Calculate step distance from previous node
            step_dist = 0.0
            step_type = "walk"
            step_instruction = ""

            if i == 0:
                step_type = "start"
                step_instruction = f"Start at {nname} on {current_segment['floor_label']}"
            else:
                prev_nid = path_nodes[i - 1]
                edge_data = g.get_edge_data(prev_nid, nid) or {}
                step_dist = edge_data.get("distance", 8.0)
                total_distance += step_dist
                current_segment["subtotal_distance_meters"] += step_dist

                m_type = edge_data.get("movement_type", "corridor")
                if m_type == "staircase":
                    step_type = "staircase"
                    step_instruction = f"Take staircase to {current_segment['floor_label']}"
                elif m_type == "lift":
                    step_type = "lift"
                    step_instruction = f"Take elevator/lift to {current_segment['floor_label']}"
                elif ntype == "room":
                    step_type = "arrive"
                    step_instruction = f"Enter {nname}"
                elif ntype == "entrance":
                    step_type = "door"
                    step_instruction = f"Walk through {nname}"
                else:
                    step_instruction = f"Follow corridor towards {nname} ({step_dist:.0f}m)"

            current_segment["steps"].append({
                "instruction": step_instruction,
                "distance_meters": round(step_dist, 1),
                "node_id": nid,
                "relative_x": rx,
                "relative_y": ry,
                "floor_number": fn,
                "floor_label": current_segment["floor_label"],
                "step_type": step_type
            })

            instructions.append(step_instruction)

        if current_segment:
            floor_segments.append(current_segment)

        # Average indoor walking speed: 1.1 m/s (66 m/min), + 30s per floor change
        floor_change_penalties = max(0, len(floors_traversed) - 1) * 0.5
        est_minutes = round((total_distance / 66.0) + floor_change_penalties, 1)
        if est_minutes < 1.0: est_minutes = 1.0

        return {
            "found": True,
            "building_id": building_id,
            "building_name": bldg_name,
            "source_name": src_name,
            "destination_name": dst_name,
            "total_distance_meters": round(total_distance, 1),
            "estimated_walk_time_minutes": est_minutes,
            "is_multi_floor": len(floors_traversed) > 1,
            "floors_traversed": floors_traversed,
            "floor_segments": floor_segments,
            "all_path_nodes": path_nodes,
            "instructions": instructions,
            "accessibility_used": preferred_transition,
            "message": None
        }

indoor_routing_service = IndoorRoutingService()
