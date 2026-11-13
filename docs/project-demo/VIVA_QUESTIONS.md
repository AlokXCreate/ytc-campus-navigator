# YTC Campus Navigator - Master Viva Voce Preparation Guide
**Department:** Artificial Intelligence & Data Science Engineering  
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**Course:** Final / Pre-Final Year B.Tech Project Evaluation  

---

## Part 1: Graph Theory & Algorithms

### Q1: What algorithm did you use for shortest path calculation, and what is its time complexity?
**Answer:**
We implemented **Dijkstra's Algorithm** and **A\* (A-Star) Search Algorithm** using Python's `NetworkX` library.
- For Dijkstra's algorithm implemented with a binary min-heap (priority queue), the time complexity is:
  $$\mathcal{O}((V + E) \log V)$$
  where $V$ is the number of vertices (walkway intersections/room nodes) and $E$ is the number of edges (walkable path segments).
- A* improves upon Dijkstra by incorporating an admissible heuristic function $h(n)$ (Euclidean or Haversine distance to the goal):
  $$f(n) = g(n) + h(n)$$
  Because $h(n) \le d(n, \text{goal})$ (never overestimates true cost), A* is guaranteed to be optimal while exploring significantly fewer nodes.

---

### Q2: How do you calculate distances between GPS coordinates on the outdoor map?
**Answer:**
We use the **Haversine Formula**, which calculates the great-circle distance between two points on the surface of a sphere given their latitudes and longitudes:
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \arctan2(\sqrt{a}, \sqrt{1 - a})$$
$$d = R \cdot c$$
where $R = 6,371,000\text{ meters}$ (mean radius of the Earth), $\phi$ is latitude in radians, and $\lambda$ is longitude in radians. This accounts for the spherical curvature of the Earth, providing millimeter accuracy across our campus grounds.

---

### Q3: How does your indoor multi-storey routing work algorithmically?
**Answer:**
We represent the multi-storey building as a **single unified 3D directed graph**:
1. Corridors and rooms on Floor 0 form a planar sub-graph $G_0$.
2. Corridors and rooms on Floor 2 form a planar sub-graph $G_2$.
3. Vertical transit elements (staircases and elevators) are represented as vertical bridge edges connecting nodes between floors (e.g. `node_b0_stairs_w` $\to$ `node_b2_stairs_w`).
4. When calculating a route between Floor 0 and Floor 2, Dijkstra's algorithm naturally traverses the corridor on Floor 0, transitions across the vertical staircase edge, and completes traversal along Floor 2.
5. In wheelchair accessible mode, staircase edges are filtered out, forcing the graph solver to route through elevator/lift edges.

---

## Part 2: Spatial Coordinates & Computer Graphics

### Q4: Why did you use normalized relative coordinates $[0.0, 1.0]$ instead of fixed pixel coordinates for indoor rooms?
**Answer:**
Fixed pixel coordinates (e.g., $X = 850\text{px}, Y = 420\text{px}$) break whenever the blueprint image is rendered on different screen sizes (smartphones vs 4K monitors), resized in CSS, or when higher-resolution blueprints are uploaded.
By storing normalized coordinates:
$$\text{relative\_x} = \frac{\text{pixel\_x}}{\text{original\_width}} \in [0.0, 1.0]$$
$$\text{relative\_y} = \frac{\text{pixel\_y}}{\text{original\_height}} \in [0.0, 1.0]$$
The frontend simply multiplies relative coordinates by the current bounding box dimensions of the SVG container:
$$\text{screen\_x} = \text{container\_width} \times \text{relative\_x}$$
$$\text{screen\_y} = \text{container\_height} \times \text{relative\_y}$$
This ensures mathematical resolution invariance across all devices.

---

### Q5: How does the admin visual pin positioning work under the hood?
**Answer:**
When an administrator clicks on the floor plan blueprint canvas:
1. The DOM `MouseEvent` captures `clientX` and `clientY`.
2. We query `canvas.getBoundingClientRect()` to compute:
   $$\text{offsetX} = \text{clientX} - \text{rect.left}$$
   $$\text{offsetY} = \text{clientY} - \text{rect.top}$$
3. The relative coordinates are computed:
   $$\text{relative\_x} = \min(1.0, \max(0.0, \text{offsetX} / \text{rect.width}))$$
   $$\text{relative\_y} = \min(1.0, \max(0.0, \text{offsetY} / \text{rect.height}))$$
4. These floating-point values are rounded to 4 decimal places and transmitted via `PUT /api/admin/rooms/{id}` with JWT authentication.

---

## Part 3: Web Architecture, Offline & Security

### Q6: How does the application function offline?
**Answer:**
We implemented a **Progressive Web App (PWA)** architecture combining two caching layers:
1. **Service Worker (`sw.js`):** Intercepts browser HTTP fetch requests. Static assets (HTML, CSS, JS, logos, vector SVG blueprints) are served using a **Cache-First** strategy with Stale-While-Revalidate background updates.
2. **Client-Side Local Storage Fallback:** Pre-seeded campus datasets (buildings, POIs, rooms, walkways) are bundled into the frontend client. If an API request to FastAPI fails due to lack of network, the client gracefully serves the cached database without throwing fatal exceptions.

---

### Q7: Explain your authentication and authorization mechanism.
**Answer:**
1. **Password Hashing:** Passwords are never stored in plaintext. We utilize **PBKDF2 (Password-Based Key Derivation Function 2)** with HMAC-SHA256 and a random 16-byte salt across 600,000 iterations to protect against rainbow table and brute-force attacks.
2. **Session Security:** On successful login, the server issues a signed **JSON Web Token (JWT)** encoded with HMAC-SHA256 (`HS256`).
3. **Role-Based Access Control (RBAC):** The JWT payload contains the user's role:
   - `superadmin`: Full CRUD permissions and user account provisioning.
   - `campus_admin`: Modifies campus entities (buildings, rooms, blueprints).
   - `viewer`: Read-only data inspection and audit log review.
4. Protected FastAPI endpoints enforce this using dependency injection (`Depends(get_admin_user)`).

---

### Q8: What database is used, and how will it scale in production?
**Answer:**
- In development, we use **SQLite** (`campus.db`) for lightweight, zero-configuration local execution and portability.
- Because we use **SQLAlchemy ORM** adhering to the 12-factor app methodology, migrating to an enterprise **PostgreSQL** database requires only updating the `DATABASE_URL` environment variable. The table definitions, foreign keys, and indexes are 100% dialect-agnostic.

---

## Part 4: Quality Assurance & Code Integrity

### Q9: What automated testing did you perform?
**Answer:**
We engineered a suite of **28 automated unit and integration tests** in Python using `pytest`:
- 9 tests for outdoor graph algorithms (Dijkstra, A*, wheelchair filtering, nearest node snapping, turn-by-turn bearings).
- 6 tests for indoor multi-storey routing and vertical floor transitions.
- 4 tests for public campus discovery APIs.
- 9 tests for administrative security, JWT generation, CRUD operations with normalized coordinates, and data export.
All 28 tests pass in ~2 seconds. The frontend is verified through strict TypeScript compile checking (`tsc`) with zero errors.

---

### Q10: What is the main innovation or unique contribution of this project compared to existing solutions?
**Answer:**
Most existing campus systems either offer only an outdoor map or only a static indoor PDF image.
Our innovation lies in **seamless outdoor-to-indoor multimodal navigation**:
1. Calculating continuous shortest paths from external campus perimeter gates right to the target desk in a 2nd-floor laboratory.
2. Resolution-independent normalized coordinate mapping on SVG blueprints.
3. Offline-first PWA resilience that continues to work inside reinforced concrete buildings where cellular data drops.
4. A no-code visual admin panel that allows non-technical campus facility staff to click-and-pin room locations interactively.

