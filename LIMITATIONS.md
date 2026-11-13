# YTC Campus Navigator - Engineering Constraints & Limitations
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**Project Category:** Smart Campus Geospatial Discovery & Navigation System  
**Academic Year:** Third-Year AI & Data Science Engineering  

---

## 1. Executive Summary

This document transparently outlines the technical boundaries, physical constraints, and engineering trade-offs inherent in the current implementation of **YTC Campus Navigator**, along with our architected mitigations and future roadmap.

---

## 2. Geospatial & GPS Precision Limitations

### 2.1 Browser Geolocation API Accuracy
- **Constraint:** Standard consumer smartphones accessing the W3C Geolocation API rely on mobile tower triangulation, WiFi BSSID scanning, and GNSS satellite receivers. In open outdoor campus environments, accuracy typically ranges between **5 to 15 meters**. Near tall building facades or dense campus tree canopy, multipath interference can degrade accuracy up to 25 meters.
- **Engineered Mitigation:** The outdoor routing engine utilizes a **Nearest-Node Snapping Algorithm**. When a student requests a route from their current GPS fix, the system calculates the Haversine distance to all outdoor graph vertices and snaps the source to the closest verified pedestrian waypoint if within 30 meters.

### 2.2 Lack of Live Indoor GPS
- **Constraint:** GPS satellite signals undergo high attenuation through reinforced concrete slabs and metal roofing, rendering satellite positioning ineffective indoors.
- **Current Architecture:** Indoor navigation is **checkpoint- and discovery-driven**. The user selects their entrance or scans an indoor checkpoint, after which the system renders a continuous walking vector path to the destination room.
- **Roadmap Resolution:** Phase 5 will introduce Bluetooth Low Energy (BLE) iBeacon trilateration and QR code doorway anchor scanning.

---

## 3. Floor Plan Architectural Blueprints & Normalized Coordinates

### 3.1 Aspect Ratio Consistency
- **Constraint:** While our relative normalized coordinate system $(relative\_x, relative\_y) \in [0.0, 1.0]$ guarantees resolution independence, significant changes in blueprint aspect ratios (e.g., swapping a $16:9$ architectural drawing with an ultrawide $21:9$ layout) can cause slight visual displacement if the building footprint proportions alter.
- **Mitigation:** Administrators are provided with guidelines specifying standard blueprint dimensions ($1200 \times 800$ or standard 3:2 ratio). The Admin Visual Positioner allows instantaneous single-click repositioning of any pin.

### 3.2 2D Floor Plan Projection
- **Constraint:** Floor plans are currently represented as 2D orthographic projections. Complex multi-level mezzanines or split-level stairs are flattened into discrete zero-indexed floor tiers ($0, 1, 2, 3$).

---

## 4. Database & Concurrency Limitations

### 4.1 SQLite Concurrency in Development
- **Constraint:** The development environment uses SQLite (`campus.db`). While SQLite supports unlimited concurrent readers, write operations require an exclusive table-level lock. Under heavy concurrent administrative writes ($>50$ simultaneous updates/sec), write contention could occur.
- **Production Resolution:** The system is built with SQLAlchemy ORM and standard 12-factor configuration. Switching to enterprise **PostgreSQL** requires only updating the `DATABASE_URL` environment variable (`postgresql://user:pass@host:5432/ytc_campus`) with zero code alterations.

---

## 5. Offline Caching & Progressive Web App (PWA)

### 5.1 Storage Quotas
- **Constraint:** Modern browsers allocate a quota for CacheStorage and LocalStorage (typically 50MB to a few gigabytes depending on device free space).
- **Mitigation:** Vector SVGs are chosen over dense raster satellite imagery, requiring under 5MB for the entire Yashoda Technical Campus map, floor plans, and graph dataset.

### 5.2 HTTPS Requirement
- **Constraint:** Service Workers and browser Geolocation APIs require a secure context (`https://` or `localhost`). Deployment on unencrypted HTTP domains will disable PWA offline caching and GPS positioning.
- **Mitigation:** Included Nginx production configurations and cloud platform presets (Render/Vercel) automatically enforce TLS/SSL certificates via Let's Encrypt.

