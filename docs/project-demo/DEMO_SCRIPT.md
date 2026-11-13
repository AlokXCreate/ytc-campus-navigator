# YTC Campus Navigator - Demonstration & Evaluation Script
**Intended Use:** Academic Viva Voce, Final Year Project Review, Project Exhibition  
**Duration:** 10–12 Minutes  
**Target Audience:** External Examiner, Head of Department (HOD), Project Guides  

---

## 1. Setup & Pre-Flight Checklist (1 Minute Before Demo)
- [ ] Backend running: `uvicorn app.main:app --port 8000` (or `docker compose up -d`)
- [ ] Frontend running: `http://localhost:3000` or `http://localhost:5173`
- [ ] Browser window open at `http://localhost:3000`
- [ ] Second tab open at `http://localhost:8000/docs` (Swagger UI)
- [ ] DevTools available to demonstrate responsive mobile view and offline mode

---

## 2. Step-by-Step Demonstration Flow

### Phase 1: Introduction & Problem Context (Minutes 0:00 – 1:30)
**Talking Points:**
> "Respected examiners, good morning. We are presenting **YTC Campus Navigator**, a smart geospatial discovery and navigation system developed specifically for our institution, Yashoda Technical Campus, Satara.
> 
> "Every semester, incoming students, parents, and academic visitors struggle to locate specific laboratories, examination halls, and department cabins across our campus. External platforms like Google Maps stop at our campus gates and cannot navigate our internal pathways or multi-storey buildings.
> 
> "Our solution bridges both worlds: an outdoor pedestrian GIS map combined with high-resolution multi-storey indoor floor plans, running with full offline support as a Progressive Web App."

**Actions on Screen:**
- Display the **Landing Page** with Yashoda Technical Campus branding, animated hero section, and quick search.
- Show the 4-second introductory welcome splash.

---

### Phase 2: Outdoor Campus Map & Shortest Path Routing (Minutes 1:30 – 4:00)
**Talking Points:**
> "Let's first explore our outdoor navigation engine. Here on the **Campus Map**, we have rendered an interactive OpenStreetMap layer overlaying verified GPS coordinates of Yashoda Technical Campus.
> 
> "Students can click any campus building—such as the Engineering & Technology Block—to inspect its departments and total storeys.
> 
> "Now let us simulate a common student scenario: a student enters through the **Main Entrance Gate** and needs to reach the **Central Library**. We select our source and destination and calculate the route.
> 
> "Notice the royal blue polyline generated instantly. Behind this is Python's **NetworkX** and **Dijkstra's Algorithm**, calculating true physical distances using the Haversine formula over our mapped pedestrian walkways. We provide the student with the exact distance in meters, walk time in minutes, and step-by-step compass directions.
> 
> "If a student requires step-free transit, we toggle **Wheelchair Mode**, and the graph dynamically prunes staircases and steep terrain."

**Actions on Screen:**
- Open `/map`.
- Click on building polygons to demonstrate interactive popups.
- Select Start: *Main Entrance Gate*, End: *Central Library*.
- Click **"Find Walking Route"**. Show distance, time, and turn-by-turn cards.
- Toggle **Wheelchair Accessible Mode** and re-calculate.

---

### Phase 3: Indoor Multi-Storey Navigation & Classroom Finder (Minutes 4:00 – 6:30)
**Talking Points:**
> "Now, we transition to our core innovation: **Indoor Multi-Storey Navigation**.
> 
> "Satellite GPS cannot penetrate concrete ceilings. We engineered a vector-based indoor navigation engine using normalized spatial coordinates $[0.0, 1.0]$.
> 
> "Here in the **Engineering Block**, we select **Floor 2**. We can see all classrooms, research labs, and faculty cabins rendered with crisp SVG blueprints.
> 
> "Let's find our third-year lab: **Room 202: AI & Deep Learning Lab**. Clicking the room displays its department, capacity, and specifications.
> 
> "When we request walking directions from the Ground Floor Entrance to Room 202 on Floor 2, our indoor routing algorithm performs a multi-storey traversal. It guides the student along the ground corridor, up **Staircase A**, and directly to the door of Room 202."

**Actions on Screen:**
- Open `/indoor`.
- Select *Engineering & Technology Block* $\to$ *Floor 2*.
- Click on *Room 202 (AI & Deep Learning Lab)*.
- Click **"Navigate Here"** and demonstrate the multi-floor route with floor switcher tabs and step directions.

---

### Phase 4: Administrative Dashboard & Visual Room Pin Placement (Minutes 6:30 – 8:30)
**Talking Points:**
> "To prevent maintenance overhead where administrators have to edit code or JSON files, we built a dedicated, secure **Admin Portal**.
> 
> "We authenticate using role-based access control. Here on the overview, we have real-time counts, audit logs, and an **Incomplete Records** detector that flags rooms missing coordinate pins.
> 
> "Our favorite feature is the **Visual Room Pin Positioner**. Instead of entering numbers manually, the facility manager simply opens the floor plan blueprint and clicks directly on the classroom door. The system mathematically normalizes the click coordinates and saves them instantly to the database.
> 
> "The admin panel also provides a live **Indoor Pathway Simulator**, GeoJSON import validation, and one-click data export in JSON, CSV, and GeoJSON."

**Actions on Screen:**
- Open `/admin` and log in with `admin@ytc.edu.in` / `ytcadmin2026`.
- Show Overview statistics and recent audit logs.
- Go to **Rooms** tab $\to$ click **"Switch to Visual Positioner"**.
- Click on the blueprint canvas to demonstrate live $(x, y)$ coordinate capture.
- Show **Indoor Pathways** simulation.
- Show **Import & Export** tab with JSON/CSV/GeoJSON export buttons.

---

### Phase 5: Offline-First PWA & Automated Testing Verification (Minutes 8:30 – 10:00)
**Talking Points:**
> "Finally, campus connectivity can be spotty. We implemented a **Progressive Web App (PWA)** with a dedicated Service Worker and CacheStorage strategy.
> 
> "To demonstrate this, we open Chrome DevTools, switch the network throttling to **Offline**, and reload the page.
> 
> "Notice the amber banner: **'Offline Mode Active'**. The application continues to render maps, blueprints, search directories, and route calculations without a single network drop.
> 
> "Our codebase is backed by **28 automated Pytest unit tests** verifying Dijkstra correctness, multi-floor transitions, and JWT security, combined with 100% strict TypeScript typing."

**Actions on Screen:**
- Open DevTools $\to$ Network tab $\to$ Select **Offline**.
- Refresh the page and navigate between `/map`, `/indoor`, and `/directory`.
- Point out the amber **Offline Mode Active** banner and instant cache response.
- Show terminal with `28 passed in 2.02s` and `tsc && vite build` passing with 0 errors.

---

### Phase 6: Conclusion & Viva Voce Opening (Minutes 10:00 – End)
**Talking Points:**
> "In conclusion, YTC Campus Navigator provides Yashoda Technical Campus with a complete, production-ready, accessible, and offline-capable spatial navigation solution. We thank our faculty guides and welcome your questions."
