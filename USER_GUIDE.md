# YTC Campus Navigator - Student & Visitor User Guide
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**System URL:** `https://navigator.ytc.edu.in` (Local: `http://localhost:3000`)  

---

## 1. Welcome to YTC Campus Navigator

Welcome to **YTC Campus Navigator**, the official smart navigation and geospatial discovery web application for **Yashoda Technical Campus, Satara**.

Whether you are a newly admitted student searching for your first Artificial Intelligence & Data Science lecture, an academic visitor attending a national conference, or a parent exploring campus facilities, this application guides you seamlessly from campus gates directly to the door of any classroom or laboratory.

---

## 2. Installing the App as a PWA (Progressive Web App)

You can install YTC Campus Navigator directly onto your phone’s home screen without downloading anything from an app store:

### On Android (Google Chrome):
1. Open Chrome and visit the application website.
2. Tap the three-dot menu (**⋮**) in the top-right corner.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. The **YTC Navigator** icon will appear on your phone with full offline access!

### On iPhone / iPad (Safari):
1. Open Safari and visit the application website.
2. Tap the **Share** button at the bottom of the screen (square with upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.

---

## 3. Outdoor Campus Navigation

### 3.1 Exploring the Interactive Campus Map
- **Open Map:** Click **"Campus Map"** in the sidebar navigation or visit `/map`.
- **Pan & Zoom:** Use two fingers to drag and pinch-zoom on mobile, or your mouse scroll wheel on desktop.
- **Campus Buildings:** Tap any 3D building polygon to reveal its name, building code, academic departments, and total floors.
- **Facility Markers:** Icons on the map highlight campus gates, the Central Library, Canteen, Administrative Complex, Workshop, and Sports Grounds.

### 3.2 Finding Your Current Location
- Tap the **"My Location"** crosshair icon in the floating map controls.
- When prompted, tap **"Allow"** to grant browser GPS permission.
- A glowing blue marker will indicate your live position on the campus grounds.

### 3.3 Calculating the Shortest Walking Route
1. In the left navigation panel, choose your **Starting Point** (or tap *"Use My Current GPS"*).
2. Select your **Destination** (e.g. *Central Library & Digital Reading Hall*).
3. If you require step-free transit, toggle **"Wheelchair Accessible Route"**.
4. Tap **"Find Walking Route"**.
5. The system will plot a royal blue route line with:
   - Total walking distance in meters.
   - Estimated walking time at a comfortable student pace.
   - Turn-by-turn walking instructions with cardinal compass directions.

---

## 4. Indoor Multi-Storey Navigation

### 4.1 Accessing Indoor Floor Plans
1. Click **"Indoor Navigation"** in the sidebar or visit `/indoor`.
2. Choose your building from the dropdown or building cards:
   - **Engineering & Technology Block** (AI & DS, Computer, Mechanical, Civil, Electrical)
   - **Pharmacy Block** (Pharmaceutics, Pharmacology, Analytical Labs)
   - **Administrative Complex** (Director Office, Registrar, Admissions, Student Section)
   - **Central Library & Reading Hall**
3. Select your desired floor level using the floor selector tabs (**GF**, **1F**, **2F**, **3F**).

### 4.2 Locating Classrooms & Laboratories
- Interactive pins indicate all classrooms, faculty cabins, and laboratories.
- Tap any pin (e.g., **Room 202: AI & Deep Learning Lab**) to open its detail sheet with room specs, floor level, and associated department.
- Tap **"Navigate Here"** to automatically compute walking directions from the entrance.

### 4.3 Multi-Storey Step-by-Step Directions
- If your destination is on another floor (e.g., from Ground Entrance to Floor 2), the system calculates a multi-storey route.
- Choose your transition preference: **Stairs** or **Elevator / Lift**.
- The floor plan displays path segments for Floor 0, guides you to Staircase A, and lets you view the continuation on Floor 2.

---

## 5. Outdoor-to-Indoor Seamless Navigation Flow

When you navigate from an outdoor location (such as the Main Entrance Gate) to an indoor classroom (such as *AI & DS Lab - Room 202*):
1. The outdoor map guides you to the front portico of the **Engineering Block**.
2. A green notification pill appears: *"Arrived at Engineering Block. View Indoor Floor Plan"*.
3. Tapping the button transitions you straight into the indoor floor view with your classroom highlighted!

---

## 6. Campus Directory & Search

- Use the global search bar in the top navigation bar at any time.
- Type any term, such as `"AI Lab"`, `"Library"`, `"Hostel"`, `"Registrar"`, or `"Room 202"`.
- Results display instantly, organized by building, floor, and facility type. Tap any result to immediately inspect its location on the map.

---

## 7. Offline Mode

When walking through areas with weak cellular reception or offline campus spots:
- The top banner will indicate: **"Offline Mode Active"**.
- All pre-cached maps, indoor blueprints, search directories, and pathfinding continue to work uninterrupted without requiring internet connectivity!
