import asyncio
import httpx
from app.main import app

async def main():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health
        r = await client.get("/api/health")
        print("Health check status:", r.status_code, r.json())
        assert r.status_code == 200

        # 2. Campus Summary
        r = await client.get("/api/campus/summary")
        print("Campus summary status:", r.status_code, r.json())
        assert r.status_code == 200

        # 3. Buildings
        r = await client.get("/api/buildings")
        print(f"Buildings status: {r.status_code}, count: {len(r.json())}")
        assert r.status_code == 200 and len(r.json()) > 0

        # 4. Rooms
        r = await client.get("/api/rooms")
        print(f"Rooms status: {r.status_code}, count: {len(r.json())}")
        assert r.status_code == 200 and len(r.json()) > 0

        # 5. Facilities
        r = await client.get("/api/facilities")
        print(f"Facilities status: {r.status_code}, count: {len(r.json())}")
        assert r.status_code == 200 and len(r.json()) > 0

        # 6. Search
        r = await client.get("/api/locations/search?q=AI")
        print(f"Search status: {r.status_code}, matches: {len(r.json())}")
        assert r.status_code == 200 and len(r.json()) > 0

        # 7. Floor Plans
        r = await client.get("/api/floor-plans/bldg-b")
        print(f"Floor plans status: {r.status_code}, count: {len(r.json())}")
        assert r.status_code == 200

        # 8. Path Routing
        r = await client.post("/api/paths/route", json={
            "source_node": "gate_main",
            "destination_node": "bldg_b_entrance",
            "wheelchair_accessible_only": False
        })
        print("Route calculation status:", r.status_code, r.json())
        assert r.status_code == 200 and r.json()["found"] is True

        print("\nALL 8 BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
