# YTC Campus Navigator - Architectural Specification
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**Project Category:** Smart Campus Geospatial Discovery & Navigation System  
**Academic Year:** Third-Year AI & Data Science Engineering  

---

## 1. Executive Architecture Summary

YTC Campus Navigator is built on a clean, decoupled, layered micro-architecture designed to deliver high performance, offline resilience, and precise outdoor and multi-storey indoor navigation.

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Layer (React 18 + TypeScript + Vite)"]
        UI["UI Components & Pages (Tailwind CSS)"]
        MapEngine["Leaflet GIS Outdoor Map"]
        IndoorEngine["SVG Vector Canvas Indoor Floor Plans"]
        PWA["Service Worker & LocalStorage Cache"]
        APIClient["Typed API Service (Axios / Fetch)"]
    end

    subgraph ServerLayer["Backend Layer (Python FastAPI + ASGI)"]
        Router["FastAPI REST Endpoints (/api/v1)"]
        Security["Auth & RBAC (PBKDF2 + JWT Tokens)"]
        RoutingCore["Geospatial & Graph Routing Engine (NetworkX)"]
        OutdoorAlgo["Outdoor Dijkstra & A* (Haversine Distance)"]
        IndoorAlgo["Indoor Multi-Storey Graph & Stair/Lift Transitions"]
        AuditLog["Activity Audit Logger"]
    end

    subgraph DataLayer["Persistence Layer"]
        ORM["SQLAlchemy ORM"]
        DB[("SQLite / PostgreSQL Database")]
        StaticAssets["Floor Plan Vector SVGs & Blueprint Repository"]
    end

    UI --> MapEngine
    UI --> IndoorEngine
    UI --> APIClient
    APIClient <-->|Cache-First / Stale-While-Revalidate| PWA
    APIClient <-->|REST JSON / Bearer JWT| Router

    Router --> Security
    Router --> RoutingCore
    Router --> AuditLog
    RoutingCore --> OutdoorAlgo
    RoutingCore --> IndoorAlgo

    Router --> ORM
    AuditLog --> ORM
    ORM <--> DB
    IndoorEngine <--> StaticAssets
```

---

## 2. Key Architectural Tenets

1. **Decoupled Architecture:** Frontend and backend communicate purely via structured JSON REST APIs over HTTP/HTTPS, enabling independent scalability, containerization, and cross-platform clients (e.g. mobile apps).
2. **Normalized Relative Spatial Coordinates:** All indoor room markers and navigation nodes use relative normalized coordinates $(x, y) \in [0.0, 1.0]$. This guarantees that regardless of screen resolution, viewport resizing, device pixel ratio, or blueprint image replacement, coordinates remain pixel-perfect.
3. **Dual-Tier Graph Routing Engine:**
   - Outdoor: Geospatial graph using WGS84 GPS latitude/longitude coordinates and Haversine metric distances.
   - Indoor: Directed multi-storey graph utilizing Euclidean distance on floor planes connected by vertical edges (stairs/elevators).
4. **Offline-First Resilience:** The application is architected to operate even when campus WiFi or cellular connectivity is intermittent. Core assets, blueprints, and fallbacks are cached by the browser Service Worker and LocalStorage.
5. **Role-Based Access Control (RBAC):** Three distinct privilege tiers (`superadmin`, `campus_admin`, `viewer`) secure sensitive configuration routes while keeping navigation endpoints public.

---

## 3. Outdoor Navigation Engine

### 3.1 Geospatial Graph Construction
The campus grounds are represented as a weighted undirected graph $G_{outdoor} = (V, E)$:
- **Vertices ($V$):** Campus entrance gates, pathway intersections, building entry porticos, parking lots, canteen plazas, sports complexes.
- **Edges ($E$):** Paved pedestrian walkways, roads, and ramps.

### 3.2 Distance & Heuristic Computation
The edge weights represent real-world physical walking distances calculated using the Haversine formula:

$$\Delta\sigma = 2 \arcsin \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)}$$

$$d = R \cdot \Delta\sigma$$

Where $R = 6,371,000\text{ meters}$, $\phi$ is latitude in radians, and $\lambda$ is longitude in radians.

### 3.3 Pathfinding Algorithms
- **Dijkstra's Algorithm:** Guarantees optimal shortest path by exploring lowest cumulative cost:
  $$d(u) = \min_{v \in adj(u)} (d(v) + w(v, u))$$
  Time Complexity: $\mathcal{O}((V + E) \log V)$ using a binary min-heap priority queue.
- **A\* Algorithm:** Incorporates a Euclidean or Haversine distance heuristic $h(n)$ to direct path search towards destination:
  $$f(n) = g(n) + h(n)$$
  Significantly reduces the search space for large campus networks.
- **Wheelchair Accessibility Mode:** Graph edge filters dynamically prune pathways with `wheelchair_accessible == False` (e.g., stairs, steep steps, gravel paths).

---

## 4. Indoor Multi-Storey Navigation Engine

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Visitor
    participant UI as Indoor Navigator Page
    participant Router as Indoor Routing Engine (FastAPI)
    participant Graph as Multi-Storey Graph (NetworkX)

    User->>UI: Select Source (e.g., Ground Main Entrance)
    User->>UI: Select Destination (e.g., Room 202 - AI & DS Lab, 2nd Floor)
    User->>UI: Select Accessibility Preference (Stairs / Elevator)
    UI->>Router: POST /api/indoor/routes/calculate {building_id, source, dest, preference}
    Router->>Graph: Retrieve nodes for building
    Graph->>Graph: Traverse floor 0 corridor to vertical node
    Graph->>Graph: Traverse vertical transition (stairs/lift edge) to floor 2
    Graph->>Graph: Traverse floor 2 corridor to destination room
    Graph-->>Router: Return path nodes, sub-segments per floor & turn-by-turn steps
    Router-->>UI: Return 200 OK with IndoorRouteResult
    UI->>UI: Render Floor 0 SVG with animated green/blue path
    UI->>UI: Render Floor Transition Banner with 3D floor step controls
    UI->>UI: Auto-switch to Floor 2 SVG displaying arrival pin
```

### 4.1 Normalized Spatial Coordinate Mapping
Indoor rooms and waypoints are stored as:
$$\text{Relative } x = \frac{\text{Pixel } X}{\text{Image Width}} \in [0.0, 1.0]$$
$$\text{Relative } y = \frac{\text{Pixel } Y}{\text{Image Height}} \in [0.0, 1.0]$$

During frontend rendering:
$$\text{Screen } X = \text{Container Width} \times \text{Relative } x$$
$$\text{Screen } Y = \text{Container Height} \times \text{Relative } y$$

This mathematical abstraction ensures:
- Visual stability across smartphones, tablets, and high-DPI desktop screens.
- Zero coordinate drift when architectural blueprints or SVG artwork are updated.

### 4.2 Multi-Floor Transitions
Floors are connected via vertical transition edges:
- `staircase`: Accessible for able-bodied users, zero energy latency.
- `lift`: Filtered as preferred/required for wheelchair or accessibility mode.

---

## 5. Unified Outdoor-to-Indoor Seamless Transition

When navigating from an outdoor location (e.g., Main Entrance Gate) to an indoor classroom (e.g., Pharmacy Seminar Hall, 1st Floor):
1. **Leg 1 (Outdoor):** Outdoor routing engine guides user from Main Gate $\to$ Pharmacy Building Entrance Portico.
2. **Automatic Context Handover:** When the destination building entrance is reached, the UI presents an interactive prompt: *"You have arrived at Pharmacy Block. Switch to Indoor Floor Plan?"*
3. **Leg 2 (Indoor):** Indoor routing engine automatically sets the building entrance as the starting node and guides the user to the destination classroom.

---

## 6. Offline-First Architecture & Caching Strategy

```mermaid
flowchart LR
    Request["User Request (Page / API / SVG)"] --> SW{"Service Worker Active?"}
    SW -->|Yes| SWCheck{"Resource Type?"}
    SW -->|No / Unsupported| Network["Network Fetch"]

    SWCheck -->|Static Asset / SVG / JS / CSS| CacheFirst["Cache-First Strategy"]
    CacheFirst --> CacheHit{"In Cache?"}
    CacheHit -->|Yes| ReturnCache["Return Cached Asset"]
    CacheHit -->|No| FetchAndCache["Network Fetch & Save to Cache"]

    SWCheck -->|API Data (/api/*)| NetworkFirst["Network-First Strategy"]
    NetworkFirst --> NetSuccess{"Network Available?"}
    NetSuccess -->|Yes| UpdateCache["Return Live Data & Cache"]
    NetSuccess -->|No| FallbackCache["Return LocalStorage Fallback"]
```

1. **Service Worker (`sw.js`):**
   - Precaches app shell (`index.html`, logo SVGs, floor plan blueprints).
   - Stale-While-Revalidate pattern for CSS/JS bundles.
2. **Client-Side LocalStorage Fallbacks:**
   - Pre-seeded campus buildings, rooms, POIs, and walkway nodes are hardcoded as resilient client-side fallbacks.
   - If the backend is offline or unresponsive, all queries, search operations, and route calculations gracefully execute client-side.
3. **Network Status Indicator:**
   - Listens to `window.addEventListener('online')` and `'offline'`.
   - Displays gentle notification pill informing the user that offline cached data is being served.

---

## 7. Security & Role-Based Access Control (RBAC)

```mermaid
stateDiagram-v2
    [*] --> Anonymous
    Anonymous --> Authenticated: POST /api/auth/login (JWT)
    
    state Authenticated {
        [*] --> Viewer: role = 'viewer'
        Viewer --> CampusAdmin: role = 'campus_admin'
        CampusAdmin --> SuperAdmin: role = 'superadmin'
    }

    Anonymous: Public Campus Map & Navigation
    Viewer: Read-Only Audit & Data Inspection
    CampusAdmin: Manage Buildings, Rooms, Pathways, Blueprints
    SuperAdmin: Full CRUD + User Management & Security Settings
```

- **Password Storage:** Salted PBKDF2 with SHA-256 (600,000 iterations).
- **Session Tokens:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 containing expiration, subject email, and user role.
- **Enforcement:** FastAPI dependency injection (`get_current_user`, `get_admin_user`, `get_superadmin_user`) guarantees zero unauthorized access to administrative endpoints.

