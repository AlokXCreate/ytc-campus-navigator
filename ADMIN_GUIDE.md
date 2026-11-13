# YTC Campus Navigator - Campus Administrator Handbook
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**Audience:** Campus Facility Managers, IT Administrators, Department Coordinators  
**Admin Portal URL:** `http://localhost:3000/admin` (Production: `https://navigator.ytc.edu.in/admin`)  

---

## 1. Accessing the Administration Portal

The Admin Dashboard provides campus authorities with a no-code visual management suite to maintain buildings, classrooms, outdoor walkways, indoor blueprints, and security permissions.

### 1.1 Initial Login
1. Navigate to `/admin`.
2. Enter your authorized administrative credentials:
   - **Super Administrator:** `admin@ytc.edu.in` / `ytcadmin2026` (Full permissions)
   - **Campus Facility Admin:** `manager@ytc.edu.in` / `manager123` (Campus data editing)
   - **Auditor / Viewer:** `viewer@ytc.edu.in` / `viewer123` (Read-only review)
3. Upon authentication, a secure JWT session token is created, granting access to the 12 administrative modules.

---

## 2. Managing Campus Buildings & Floors

### 2.1 Adding a New Building
1. Navigate to the **Buildings** tab on the left sidebar.
2. Click **"Add Building"**.
3. Fill in:
   - **Building Name:** (e.g. *Polytechnic & Diploma Block*)
   - **Building Code:** (e.g. *POLY*)
   - **Category:** Academic, Administrative, Hostel, Amenity, or Sports
   - **GPS Latitude & Longitude:** Center point coordinates
   - **Total Floors:** Above-ground storeys
   - **Boundary Polygon (Optional):** Array of coordinates defining perimeter
4. Click **"Save Building"**. An audit record is automatically logged.

### 2.2 Managing Storeys & Floors
1. Navigate to the **Floors** tab.
2. Select the target building from the dropdown.
3. Add or edit floor levels, set floor numbers (0 = Ground, 1 = 1st, etc.), floor labels (`GF`, `1F`, `2F`), and blueprint vector SVG paths.

---

## 3. Visual Room Pin Positioning on Blueprint Canvas

One of the standout features of YTC Campus Navigator is the **Visual Pin Positioner**, which eliminates manual coordinate guessing:

```
[ Floor Plan Blueprint Canvas ]
┌──────────────────────────────────────────────┐
│  [Room 201]        [Room 202: AI Lab] 📍    │
│  ┌────────┐        ┌────────┐               │
│  │        │        │ Click  │  Corridor     │
│  │        │        │ to Pin │═════════════  │
│  └────────┘        └────────┘               │
│                                              │
│  📍 Pin Preview: X=0.68, Y=0.35              │
└──────────────────────────────────────────────┘
```

1. Navigate to the **Rooms** tab.
2. Click **"Switch to Visual Positioner"**.
3. Select the **Building** and **Floor Level**.
4. Select the room from the list or click **"Create Room at Pin"**.
5. **Click directly on the floor plan canvas** where the room's entrance door is located.
6. The system calculates the exact normalized coordinates:
   $$\text{relative\_x} = \frac{\text{click\_x}}{\text{canvas\_width}}, \quad \text{relative\_y} = \frac{\text{click\_y}}{\text{canvas\_height}}$$
7. Click **"Save Pin Location"**. The pin position updates instantly for all students and visitors across devices.

---

## 4. Outdoor Walkway & Pathway Graph Management

1. Navigate to the **Outdoor Paths** tab.
2. Review the list of walkable pathway segments connecting campus nodes.
3. Click **"Add Pathway Segment"**:
   - **Source & Destination Node IDs:** (e.g. `node_main_gate` to `node_canteen`)
   - **Distance (Meters):** Real-world metric distance
   - **Wheelchair Accessible:** Check if step-free and ramp-equipped
   - **Surface Type:** Paved, Asphalt, Gravel, or Cobblestone
4. The outdoor Dijkstra routing engine automatically includes the updated edges in path calculations.

---

## 5. Indoor Navigation Graph & Path Simulator

1. Navigate to the **Indoor Pathways** tab.
2. View waypoint nodes (`room`, `corridor`, `staircase`, `lift`, `entrance`) and edges.
3. **Interactive Path Simulator:**
   - Select Source Node and Destination Node.
   - Click **"Simulate Route"** to watch the Dijkstra algorithm compute the indoor path live and verify distance calculations before deploying to students.

---

## 6. Blueprint Upload & GeoJSON Data Import / Export

### 6.1 Uploading Architectural Floor Plans
1. Navigate to the **Floor Plans** tab.
2. Select target Building and Floor Number.
3. Drag & drop the SVG or PNG blueprint (recommended dimensions: $1200 \times 800$, max size 5MB).
4. Click **"Upload Blueprint"**.

### 6.2 GeoJSON Import with Live Validation
1. Navigate to the **Import & Export** tab.
2. Paste or upload any standard GeoJSON FeatureCollection.
3. Click **"Validate GeoJSON"** to inspect feature count, geometry types, and coordinate boundaries before importing into the database.

### 6.3 One-Click Data Export
1. Under **Data Export**, choose the entity (Buildings, Rooms, Facilities, Outdoor Paths).
2. Select output format: **JSON**, **CSV**, or **GeoJSON**.
3. Click **"Export Data"** for instant backup download.

---

## 7. User Management, RBAC & Activity Audit Trail

1. **User Accounts (`/admin` $\to$ Users):**
   - Super Administrators can provision new accounts, modify passwords, and assign roles:
     - `superadmin`: Unrestricted system access.
     - `campus_admin`: Operational campus data management.
     - `viewer`: Read-only verification.
2. **Activity Logs (`/admin` $\to$ Activity Logs):**
   - Review every administrative action, user email, entity affected, and timestamp to maintain data accountability.
