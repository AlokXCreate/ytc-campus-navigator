# YTC Campus Navigator - Quality Assurance & Testing Report
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**Project Category:** Smart Campus Geospatial Discovery & Navigation System  
**Academic Year:** Third-Year AI & Data Science Engineering  

---

## 1. Testing Philosophy & Test Pyramid

YTC Campus Navigator implements a multi-tiered testing strategy ensuring that geospatial graph algorithms, multi-storey transitions, REST endpoints, and the React frontend execute with zero regressions.

```
                  ▲
                 / \
                /   \     E2E / PWA Tests (Service Worker, Offline Cache)
               /-----\
              /   ▲   \   Integration Tests (FastAPI Client, DB Migrations)
             /   / \   \
            /---/---\---\
           /  Unit Tests \ Backend Pytest (28/28 Passing) + Frontend TypeScript (0 Errors)
          /_______________\
```

---

## 2. Automated Backend Test Suite (`pytest`)

The backend test suite is located in `backend/tests/` and comprises **28 automated tests** executed against an in-memory test database.

### 2.1 Test Execution Command
```bash
cd backend
python -m pytest tests/ -v
```

### 2.2 Test Results Matrix (28 Passed, 0 Failed)

| Test Module | Test Function | Purpose & Validation | Status |
|---|---|---|---|
| **`test_routing.py`** | `test_dijkstra_shortest_path` | Verifies Dijkstra computes optimal route between Main Gate and Engineering Block | **PASSED** |
| | `test_astar_shortest_path` | Verifies A* heuristic converges to identical shortest path | **PASSED** |
| | `test_wheelchair_accessible_routing` | Verifies non-accessible stairs are pruned in wheelchair mode | **PASSED** |
| | `test_unreachable_node_handling` | Confirms graceful `found: false` response when graph is disconnected | **PASSED** |
| | `test_same_source_and_destination` | Verifies zero-distance immediate arrival condition | **PASSED** |
| | `test_turn_by_turn_instructions` | Validates compass bearings (North, East, South, West) in human instructions | **PASSED** |
| | `test_estimated_walking_time` | Verifies walking speed calibration (~5 km/h) | **PASSED** |
| | `test_nearest_node_matching` | Tests nearest coordinate snapping for arbitrary GPS fixes | **PASSED** |
| | `test_path_geometry_coordinates` | Validates GeoJSON LineString coordinates format | **PASSED** |
| **`test_indoor_routing.py`** | `test_same_floor_indoor_route` | Verifies indoor corridor pathfinding on Floor 2 | **PASSED** |
| | `test_multi_floor_indoor_route` | Verifies route traversal across Floor 0 to Floor 2 via Staircase A | **PASSED** |
| | `test_elevator_accessible_route` | Verifies lift edge selection when `accessible_only=True` | **PASSED** |
| | `test_indoor_turn_by_turn` | Verifies step-by-step corridor and stair instructions | **PASSED** |
| | `test_non_existent_room_handling` | Confirms 404 response for invalid room IDs | **PASSED** |
| | `test_isolated_room_routing` | Validates fallback message when no indoor edges connect to room | **PASSED** |
| **`test_api.py`** | `test_health_check` | Confirms `/api/health` returns status ok and institution metadata | **PASSED** |
| | `test_campus_summary` | Verifies aggregation of buildings, POIs, and coordinate bbox | **PASSED** |
| | `test_buildings_list` | Tests retrieval of academic, administrative, and amenity buildings | **PASSED** |
| | `test_location_search` | Verifies instant keyword search across rooms and buildings | **PASSED** |
| **`test_admin.py`** | `test_password_hashing_and_verification` | Verifies PBKDF2-SHA256 salted hashing and verification | **PASSED** |
| | `test_jwt_token_encode_decode` | Verifies token signing, role claims, and expiration validation | **PASSED** |
| | `test_admin_stats` | Confirms admin stats endpoint aggregates entity counts | **PASSED** |
| | `test_building_crud` | Verifies building creation, retrieval, update, and deletion | **PASSED** |
| | `test_floor_crud` | Verifies floor creation and association with building | **PASSED** |
| | `test_room_crud_with_relative_coords` | Validates room insertion with normalized coordinates in $[0.0, 1.0]$ | **PASSED** |
| | `test_facility_crud` | Verifies facility creation and category filtering | **PASSED** |
| | `test_path_crud` | Verifies creation and modification of outdoor walkway edges | **PASSED** |
| | `test_export_campus_data` | Verifies data export in JSON, CSV, and GeoJSON formats | **PASSED** |

---

## 3. Frontend Static Type Checking & Production Build

The frontend is implemented in TypeScript with strict null checks.

### 3.1 Verification Command
```bash
cd frontend
npm run build
```

### 3.2 Compilation Output
```
> tsc && vite build

vite v6.4.6 building for production...
transforming...
✓ 1669 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   2.03 kB │ gzip:   0.96 kB
dist/assets/index-BupVRZWz.css   55.21 kB │ gzip:   9.03 kB
dist/assets/index-B9EL5pOA.js   664.80 kB │ gzip: 168.28 kB
✓ built in 4.81s
```
- **TypeScript Errors:** 0
- **Build Status:** Success (Exit Code: 0)

---

## 4. Manual QA & End-to-End Test Scenarios

### Scenario 1: Outdoor Navigation from Main Gate to Central Library
1. Open web application at `/map`.
2. Select *"Main Entrance Gate"* as starting point.
3. Select *"Central Library"* as destination.
4. Click *"Find Walking Route"*.
5. **Expected Result:** Polyline renders in royal blue, step-by-step walking directions display estimated time (2.3 minutes, 185 meters), elevation notes, and turn directions.

### Scenario 2: Indoor Classroom Finder (Room 202 - AI & DS Lab)
1. Open `/indoor`.
2. Select *"Engineering & Technology Block"*.
3. Select *"Floor 2"*.
4. **Expected Result:** High-resolution architectural floor plan renders. Room 202 is highlighted with an emerald interactive pin. Clicking the pin displays department, capacity, and equipment details.

### Scenario 3: Admin Visual Room Pin Positioning
1. Login to `/admin` with credentials `admin@ytc.edu.in` / `ytcadmin2026`.
2. Navigate to **Rooms** tab.
3. Click **"Switch to Visual Positioner"**.
4. Click anywhere on the floor plan blueprint canvas.
5. **Expected Result:** Coordinate picker dynamically sets `relative_x` and `relative_y` in $[0.0, 1.0]$, previews the pin, and saves successfully to the database.

### Scenario 4: Offline PWA Simulation
1. Open Chrome DevTools $\to$ **Network** tab $\to$ Select **Offline**.
2. Refresh page or navigate between `/map`, `/indoor`, and `/directory`.
3. **Expected Result:** Top amber banner appears (*"Offline Mode Active"*), floor plan SVGs and cached campus directory render instantly from Service Worker and LocalStorage.
