# YTC Campus Navigator - Deployment & Operations Guide
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**Project Category:** Smart Campus Navigation & Geospatial Discovery System  
**Academic Year:** Third-Year AI & Data Science Engineering  

---

## 1. System Overview & Deployment Architecture

YTC Campus Navigator is designed as a decoupled modern web application:
- **Frontend SPA:** React 18, TypeScript, Tailwind CSS, Leaflet GIS, Progressive Web App (PWA) with Service Worker caching.
- **Backend API:** Python 3.11+, FastAPI (ASGI), NetworkX graph routing algorithms, SQLAlchemy ORM, SQLite/PostgreSQL.
- **Orchestration:** Multi-stage Docker containers with Nginx reverse proxy.

```
                         [ Internet / Students & Visitors ]
                                        │
                                        ▼
                         [ Nginx Reverse Proxy / CDN ]
                                 (Port 80 / 443)
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
     [ Frontend SPA Container ]                    [ Backend API Container ]
    React 18 / Static Nginx (:80)                 FastAPI + Uvicorn (:8000)
    PWA Offline Cache & Assets                                 │
                                                               ▼
                                                      [ SQLite / PostgreSQL ]
                                                      (campus.db / persistence)
```

---

## 2. Local Development Setup

### 2.1 Prerequisites
- **Node.js:** v18.0.0 or v20.x LTS
- **Python:** v3.11 or v3.12 (with `pip` and `venv`)
- **Git:** v2.30+

### 2.2 Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# On Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate

# On Windows (PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt
pip install pytest httpx

# Seed the database with Yashoda Technical Campus campus data
python -m app.database.seed_data

# Run all automated unit & integration tests
python -m pytest tests/ -v

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now live at `http://localhost:8000`.  
Interactive Swagger docs: `http://localhost:8000/docs`.

### 2.3 Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run TypeScript compile & Vite development server
npm run dev
```
The frontend is now accessible at `http://localhost:5173`.

---

## 3. Docker & Docker Compose Deployment (Recommended)

To run the entire production-ready stack in isolated containers with automated networking:

### 3.1 Build & Start Containers
```bash
# Clone the repository
git clone https://github.com/AlokXCreate/ytc-campus-navigator.git
cd ytc-campus-navigator

# Start both backend and frontend via Docker Compose
docker compose up -d --build
```

### 3.2 Verify Container Health
```bash
docker compose ps
```
Output:
```
NAME                    STATUS                  PORTS
ytc-navigator-backend   Up (healthy)            0.0.0.0:8000->8000/tcp
ytc-navigator-frontend  Up                      0.0.0.0:3000->80/tcp
```

### 3.3 Access Application
- **Frontend Web Application:** `http://localhost:3000`
- **Backend API & Swagger:** `http://localhost:8000/docs`
- **Healthcheck:** `http://localhost:8000/api/health`

### 3.4 Stopping Containers
```bash
docker compose down
```

---

## 4. Cloud Platform Deployment

### 4.1 Backend Deployment (Render / Railway / Fly.io)
1. **Repository:** Connect your GitHub repository `ytc-campus-navigator`.
2. **Root Directory:** Set root directory to `backend`.
3. **Environment:** Python 3.
4. **Build Command:**
   ```bash
   pip install -r requirements.txt && python -m app.database.seed_data
   ```
5. **Start Command:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. **Environment Variables:**
   - `ENVIRONMENT=production`
   - `SECRET_KEY=<your-cryptographically-secure-32-byte-hex>`
   - `ACCESS_TOKEN_EXPIRE_MINUTES=480`
   - `CORS_ORIGINS=https://your-frontend-domain.vercel.app`

### 4.2 Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. **Framework Preset:** Vite.
2. **Root Directory:** `frontend`.
3. **Build Command:** `npm run build`.
4. **Output Directory:** `dist`.
5. **Environment Variables:**
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
6. **SPA Routing Config (Vercel `vercel.json`):**
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## 5. Production Nginx & SSL Configuration (VPS / Ubuntu Server)

When deploying on an institution virtual machine or Cloud VPS:

```nginx
# /etc/nginx/sites-available/ytc-navigator
server {
    listen 80;
    server_name navigator.ytc.edu.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name navigator.ytc.edu.in;

    ssl_certificate /etc/letsencrypt/live/navigator.ytc.edu.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/navigator.ytc.edu.in/privkey.pem;

    # Frontend Static Distribution
    root /var/www/ytc-navigator/frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    # API Reverse Proxy to FastAPI Uvicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 6. Environment Variables Reference

| Variable | Scope | Default | Description |
|---|---|---|---|
| `ENVIRONMENT` | Backend | `development` | Environment mode (`development`, `staging`, `production`) |
| `DEBUG` | Backend | `False` | Debug mode for logging |
| `DATABASE_URL` | Backend | `sqlite:///./campus.db` | SQLAlchemy connection URL |
| `SECRET_KEY` | Backend | - | JWT signing secret key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | `480` | JWT expiration duration in minutes |
| `CORS_ORIGINS` | Backend | `http://localhost:3000,http://localhost:5173` | Allowed CORS origins |
| `VITE_API_URL` | Frontend | `http://localhost:8000/api` | Base URL for API requests |
| `PORT` | Frontend/Backend | `3000` / `8000` | Port for web server |

---

## 7. Monitoring & Healthchecks

- **Health Endpoint:** `GET /api/health`
  - Returns `{"status": "ok", "service": "YTC Campus Navigator API", "institution": "Yashoda Technical Campus, Satara"}`
- **Campus Summary:** `GET /api/campus/summary`
- **Admin System Stats:** `GET /api/admin/stats` (requires Admin JWT)
- **Container Health:** Integrated Docker healthcheck verifies `/api/health` every 20s.

