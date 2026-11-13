# YTC Campus Navigator - REST API Specification
**Base URL:** `http://localhost:8000/api` (Production: `https://navigator.ytc.edu.in/api`)  
**Specification Standard:** OpenAPI 3.0 / FastAPI Swagger  
**Auth Scheme:** HTTP Bearer JSON Web Token (JWT)  

---

## 1. Authentication & User Management

### 1.1 Admin Login
`POST /api/auth/login`

Authenticates administrative users and returns a signed JWT access token.

- **Request Body:**
  ```json
  {
    "email": "admin@ytc.edu.in",
    "password": "ytcadmin2026"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "admin@ytc.edu.in",
      "full_name": "YTC System Administrator",
      "role": "superadmin",
      "is_active": true
    }
  }
  ```
- **Error (401 Unauthorized):**
  ```json
  {
    "detail": "Invalid credentials or inactive account"
  }
  ```

### 1.2 Current User Profile
`GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Current authenticated user entity.

### 1.3 User Management (Super Admin Only)
- `GET /api/auth/users`: List administrative users.
- `POST /api/auth/users`: Create new admin/viewer user.
- `PUT /api/auth/users/{user_id}`: Update user role, full name, or password.
- `DELETE /api/auth/users/{user_id}`: Deactivate/delete admin user.

---

## 2. Campus Discovery & Geospatial Endpoints

### 2.1 System Health
`GET /api/health`
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "service": "YTC Campus Navigator API",
    "institution": "Yashoda Technical Campus, Satara",
    "timestamp": "2026-11-13T12:00:00Z"
  }
  ```

### 2.2 Campus Overview Summary
`GET /api/campus/summary`
- **Response (200 OK):** Returns counts of buildings, POIs, pathways, bounding box, and center coordinate.

### 2.3 Buildings Directory
`GET /api/buildings`
- **Query Params:** `building_type` (optional)
- **Response (200 OK):** Array of all registered campus buildings with lat/lng, polygon perimeter, and total storeys.

### 2.4 Unified Location Search
`GET /api/locations/search?q={query}`
- **Query Params:** `q` (string, required)
- **Response (200 OK):**
  ```json
  [
    {
      "id": "rm-b-202",
      "title": "AI & Deep Learning Lab",
      "category": "room",
      "subtitle": "Engineering Block • Floor 2 • Room 202",
      "building_id": "bldg-b",
      "building_name": "Engineering Block",
      "floor": 2,
      "description": "High-performance GPU computing lab for third-year AI & DS students."
    }
  ]
  ```

---

## 3. Outdoor Routing Engine

### 3.1 Calculate Outdoor Shortest Path
`POST /api/routes/calculate`

Computes the shortest walking route between two points on the campus grounds using Dijkstra or A* algorithms.

- **Request Body:**
  ```json
  {
    "source_node": "node_main_gate",
    "destination_node": "node_eng_portico",
    "algorithm": "dijkstra",
    "wheelchair_accessible_only": false
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "found": true,
    "source": "node_main_gate",
    "destination": "node_eng_portico",
    "algorithm_used": "Dijkstra",
    "total_distance_meters": 142.5,
    "estimated_walk_time_minutes": 1.9,
    "path_nodes": [
      "node_main_gate",
      "node_central_junction",
      "node_eng_portico"
    ],
    "geometry": [
      [17.7202, 74.0195],
      [17.7210, 74.0200],
      [17.7215, 74.0205]
    ],
    "steps": [
      {
        "instruction": "Walk North-East from Main Entrance Gate along the shaded avenue",
        "distance_meters": 65.0,
        "coordinates": [17.7202, 74.0195],
        "bearing": "North-East"
      },
      {
        "instruction": "Turn left at the Central Flagpole Plaza towards Engineering Block",
        "distance_meters": 77.5,
        "coordinates": [17.7210, 74.0200],
        "bearing": "North"
      },
      {
        "instruction": "Arrive at Engineering & Technology Block Main Portico",
        "distance_meters": 0.0,
        "coordinates": [17.7215, 74.0205],
        "bearing": "Arrive"
      }
    ],
    "alternatives": []
  }
  ```

---

## 4. Indoor Multi-Storey Navigation

### 4.1 Indoor Floors of Building
`GET /api/indoor/buildings/{building_id}/floors`
- Returns all floor levels with blueprint SVG URLs, floor labels, and accessibility flags.

### 4.2 Floor Rooms Directory
`GET /api/indoor/floors/{floor_id}/rooms`
- Returns all rooms on the floor with relative normalized coordinates $(relative\_x, relative\_y) \in [0.0, 1.0]$.

### 4.3 Calculate Multi-Storey Indoor Route
`POST /api/indoor/routes/calculate`

Computes an indoor route across single or multiple floors, automatically resolving vertical transition via staircases or elevators.

- **Request Body:**
  ```json
  {
    "building_id": "bldg-b",
    "source_room_id": "node_b0_entrance",
    "destination_room_id": "rm-b-202",
    "preferred_transition": "stairs",
    "accessible_only": false
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "found": true,
    "building_id": "bldg-b",
    "building_name": "Engineering & Technology Block",
    "source_name": "Ground Main Entrance",
    "destination_name": "AI & Deep Learning Lab (Room 202)",
    "total_distance_meters": 48.0,
    "estimated_walk_time_minutes": 1.5,
    "is_multi_floor": true,
    "floors_traversed": [0, 2],
    "floor_segments": [
      {
        "floor_number": 0,
        "floor_label": "GF",
        "blueprint_url": "/floor-plans/eng-floor-0.svg",
        "path_coordinates": [[0.5, 0.9], [0.5, 0.5], [0.2, 0.5]],
        "subtotal_distance_meters": 22.0
      },
      {
        "floor_number": 2,
        "floor_label": "2F",
        "blueprint_url": "/floor-plans/eng-floor-2.svg",
        "path_coordinates": [[0.2, 0.5], [0.5, 0.5], [0.68, 0.35]],
        "subtotal_distance_meters": 26.0
      }
    ],
    "instructions": [
      "Enter Engineering Block Ground Floor Main Foyer",
      "Walk straight down central corridor to Staircase A (West Wing)",
      "Take Staircase A up to Floor 2",
      "Exit staircase and walk along the east hallway",
      "Arrive at Room 202: AI & Deep Learning Lab on your left"
    ]
  }
  ```

---

## 5. Administrative Management (RBAC Protected)

All routes require `Authorization: Bearer <token>` with `superadmin` or `campus_admin` role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | System counts, incomplete records count, and recent activity log |
| `GET` | `/api/admin/activity-logs` | Paginated audit trail logs |
| `POST` | `/api/admin/activity-logs` | Record manual administration log entry |
| `POST` | `/api/admin/buildings` | Register a new campus building |
| `PUT` | `/api/admin/buildings/{id}` | Update building details, boundaries, or storeys |
| `DELETE` | `/api/admin/buildings/{id}` | Remove campus building |
| `POST` | `/api/admin/floors` | Add floor level to building |
| `PUT` | `/api/admin/floors/{id}` | Update floor metadata or blueprint URL |
| `DELETE` | `/api/admin/floors/{id}` | Remove floor level |
| `POST` | `/api/admin/rooms` | Add room with normalized coordinates |
| `PUT` | `/api/admin/rooms/{id}` | Update room name, relative $(x, y)$, or department |
| `DELETE` | `/api/admin/rooms/{id}` | Delete room record |
| `POST` | `/api/admin/facilities` | Create facility / POI record |
| `PUT` | `/api/admin/facilities/{id}` | Update facility details |
| `DELETE` | `/api/admin/facilities/{id}` | Delete facility |
| `POST` | `/api/admin/paths` | Create outdoor walkway edge |
| `PUT` | `/api/admin/paths/{id}` | Update outdoor pathway |
| `DELETE` | `/api/admin/paths/{id}` | Delete outdoor pathway |
| `POST` | `/api/admin/indoor-nodes` | Add indoor navigation waypoint |
| `DELETE` | `/api/admin/indoor-nodes/{id}`| Delete indoor waypoint |
| `POST` | `/api/admin/indoor-edges` | Connect indoor nodes with walkable edge |
| `DELETE` | `/api/admin/indoor-edges/{id}`| Delete indoor edge |
| `POST` | `/api/admin/floor-plans/upload` | Upload SVG/PNG architectural blueprint |
| `GET` | `/api/admin/export/{entity}` | Export dataset as JSON, CSV, or GeoJSON |
| `POST` | `/api/geojson/validate` | Validate GeoJSON geometry format |
| `POST` | `/api/geojson/import` | Bulk import campus boundaries and POIs |
