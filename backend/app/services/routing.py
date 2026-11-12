import networkx as nx
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.campus import CampusPath, Building

class RoutingService:
    def __init__(self):
        self.graph = nx.Graph()
        self._initialized = False

    def build_graph(self, db: Session):
        """Constructs the NetworkX path graph from DB records."""
        self.graph.clear()
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
        self._initialized = True

    def find_shortest_path(
        self,
        db: Session,
        source: str,
        destination: str,
        wheelchair_only: bool = False
    ) -> Dict[str, Any]:
        """Finds the shortest walking path between two graph nodes using Dijkstra's algorithm."""
        self.build_graph(db)

        if source not in self.graph or destination not in self.graph:
            return {
                "found": False,
                "source": source,
                "destination": destination,
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "path_nodes": [],
                "geometry": [],
                "steps": []
            }

        try:
            if wheelchair_only:
                def weight_filter(u, v, d):
                    if d.get("accessibility") != "wheelchair_friendly":
                        return float("inf")
                    return d.get("weight", 1.0)
                path_nodes = nx.dijkstra_path(self.graph, source, destination, weight=weight_filter)
            else:
                path_nodes = nx.dijkstra_path(self.graph, source, destination, weight="weight")

            total_distance = nx.dijkstra_path_length(self.graph, source, destination, weight="weight")
            
            # Average student walking speed: ~1.2 meters/second (approx 72 meters/minute)
            walk_time_minutes = round(total_distance / 72.0, 1)
            if walk_time_minutes < 1.0 and total_distance > 0:
                walk_time_minutes = 1.0

            geometry_coords = []
            steps = []

            for i in range(len(path_nodes) - 1):
                u = path_nodes[i]
                v = path_nodes[i + 1]
                edge_data = self.graph.get_edge_data(u, v)
                edge_geom = edge_data.get("geometry", [])
                dist = edge_data.get("distance", 0.0)

                if edge_geom:
                    geometry_coords.extend(edge_geom)
                
                step_coord = edge_geom[0] if edge_geom else [17.7215, 74.0205]
                clean_u = u.replace("_", " ").title()
                clean_v = v.replace("_", " ").title()
                steps.append({
                    "instruction": f"Walk from {clean_u} towards {clean_v} ({dist:.0f} m)",
                    "distance_meters": dist,
                    "coordinates": step_coord
                })

            return {
                "found": True,
                "source": source,
                "destination": destination,
                "total_distance_meters": round(total_distance, 1),
                "estimated_walk_time_minutes": walk_time_minutes,
                "path_nodes": path_nodes,
                "geometry": geometry_coords,
                "steps": steps
            }
        except nx.NetworkXNoPath:
            return {
                "found": False,
                "source": source,
                "destination": destination,
                "total_distance_meters": 0.0,
                "estimated_walk_time_minutes": 0.0,
                "path_nodes": [],
                "geometry": [],
                "steps": []
            }

routing_service = RoutingService()
