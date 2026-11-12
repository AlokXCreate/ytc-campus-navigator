# YTC Campus Navigator

A smart web-based campus navigation and location discovery application designed for **Yashoda Technical Campus, Satara**, Maharashtra, India.

Developed as a third-year Artificial Intelligence & Data Science academic project.

---

## Key Highlights

- **Outdoor Campus Navigation**: Interactive map with building footprints, entrances, and key outdoor facilities.
- **Indoor Floor-Wise Discovery**: Multi-storey level browsing with interactive room markers and floor selectors.
- **Smart Campus Search**: Quick search across classrooms, laboratories, administrative offices, and amenities.
- **Shortest Walking Paths**: Campus pathway graph routing using Dijkstra / A* shortest path algorithms.
- **Offline Resilient Architecture**: Local caching of campus metadata, room directories, and floor plans.
- **Modern Web Architecture**: React 18, TypeScript, Tailwind CSS, Leaflet.js, FastAPI, and SQLite.

---

## Repository Structure

```
ytc-campus-navigator/
├── frontend/             # React + TypeScript + Vite + Tailwind CSS UI
├── backend/              # Python FastAPI REST API & Routing Engine
├── data/                 # Campus buildings, rooms, pathways & floor-plans
├── docs/                 # Architecture, API specifications & user guides
├── scripts/              # Utility & database migration scripts
├── .gitignore            # Git exclusion rules
└── README.md             # Project documentation
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.database.seed_data
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The web application will launch at: `http://localhost:5173`

---

## Institutional Attribution

- **Institution**: Yashoda Technical Campus, Satara
- **Location**: NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra, India.
- **Department**: Artificial Intelligence and Data Science
