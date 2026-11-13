from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database.seed_data import seed_database
from app.api.v1 import (
    health,
    map as map_router,
    buildings,
    rooms,
    facilities,
    locations,
    floor_plans,
    campus,
    paths,
    routes,
    geojson,
    indoor,
    auth
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created and seeded
    try:
        seed_database()
        print("[OK] YTC Campus Navigator database verified.")
    except Exception as e:
        print(f"Database seed initialization warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend REST API and Pathfinding Engine for Yashoda Technical Campus Navigator (Satara, Maharashtra).",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": request.url.path
        }
    )

# Include API v1 Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(map_router.router, prefix=settings.API_V1_STR)
app.include_router(buildings.router, prefix=settings.API_V1_STR)
app.include_router(rooms.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(floor_plans.router, prefix=settings.API_V1_STR)
app.include_router(campus.router, prefix=settings.API_V1_STR)
app.include_router(paths.router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix=settings.API_V1_STR)
app.include_router(routes.nav_router, prefix=settings.API_V1_STR)
app.include_router(geojson.router, prefix=settings.API_V1_STR)
app.include_router(indoor.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "institution": settings.INSTITUTION,
        "department": "Artificial Intelligence & Data Science",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR
    }
