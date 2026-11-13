# YTC Campus Navigator - Academic Project Overview
**Academic Program:** Bachelor of Technology (B.Tech)  
**Department:** Artificial Intelligence & Data Science (AI & DS)  
**Academic Year:** Third Year (AY 2025–2026 / 2026–2027)  
**Institution:** Yashoda Technical Campus, Faculty of Engineering, Wadhe Phata, NH-4, Satara, Maharashtra, India  
**Project Title:** Smart Multi-Storey Indoor & Outdoor Campus Navigation System  

---

## 1. Abstract

Navigating expansive collegiate campuses poses notable challenges for incoming freshmen, academic visitors, parents, and examination candidates. Traditional static hoardings, paper maps, and external commercial navigation apps (such as Google Maps) typically terminate guidance at external campus gates, failing to provide pedestrian walkway directions or multi-storey indoor guidance to individual laboratories and classrooms.

**YTC Campus Navigator** resolves this challenge by delivering a web-based, mobile-first, and offline-capable smart navigation platform specifically tailored for Yashoda Technical Campus, Satara. The system couples an interactive outdoor geospatial GIS map with high-resolution vector floor plans. Shortest pedestrian routes are computed dynamically using Dijkstra's and A* graph search algorithms over Haversine-weighted walkway networks. For indoor traversal, the platform introduces a normalized spatial coordinate system $[0.0, 1.0]$ capable of multi-storey routing with automatic vertical staircase/elevator resolution. An administrative portal provides real-time visual pin placement, GeoJSON validation, and role-based access control.

---

## 2. Problem Statement

1. **Outdoor Navigation Gap:** Commercial mapping platforms fail to map internal campus pedestrian walkways, department porticos, or sports complexes, leaving visitors stranded at main entry perimeters.
2. **Indoor Blind Spot:** GPS signals attenuate completely indoors, rendering satellite navigation useless within multi-storey academic edifices like the Engineering and Pharmacy blocks.
3. **Connectivity Vulnerability:** Cellular signals often fluctuate inside concrete academic buildings, necessitating an offline-first architecture.
4. **Administrative Maintenance Overhead:** Hardcoded maps require developer intervention for every room reallocation or timetable adjustment.

---

## 3. Project Objectives

- **Objective 1:** Build an interactive outdoor campus map featuring campus buildings, POIs, and pedestrian walkways using OpenStreetMap and Leaflet GIS.
- **Objective 2:** Implement Dijkstra's and A* graph search algorithms in Python FastAPI to compute optimal walking paths with turn-by-turn guidance and wheelchair accessibility options.
- **Objective 3:** Develop an interactive multi-storey indoor navigation engine capable of navigating between any two classrooms across different floors using normalized coordinates.
- **Objective 4:** Provide a seamless outdoor-to-indoor navigation transition from campus gates directly to target classroom doors.
- **Objective 5:** Deliver an offline-first Progressive Web App (PWA) with Service Worker caching and local fallback data.
- **Objective 6:** Build a comprehensive visual Admin Dashboard with interactive room pin placement, GeoJSON import/export, and RBAC security.

---

## 4. Technology Stack Summary

- **Frontend:** React 18, TypeScript, Tailwind CSS, Leaflet.js, React-Leaflet, Lucide Icons, Vite SPA.
- **Backend:** Python 3.11+, FastAPI (ASGI), NetworkX, Pydantic V2, SQLAlchemy ORM.
- **Algorithms:** Dijkstra's Algorithm, A* Search Algorithm, Haversine Great-Circle Distance Metric.
- **Security:** Salted PBKDF2 Password Hashing, Stateless HMAC-SHA256 JSON Web Tokens (JWT), Role-Based Access Control (RBAC).
- **Offline / PWA:** Service Worker CacheStorage API, Web App Manifest, LocalStorage Stale-While-Revalidate fallback.
- **Deployment & QA:** Multi-stage Docker, Nginx, Docker Compose, GitHub Actions CI, Pytest automated testing suite (28/28 tests passing).
