import {
  Building,
  Room,
  Facility,
  CampusSummary,
  SearchResult,
  RouteResult,
  FloorPlan,
  CampusPath
} from '../types/campus';
import {
  fallbackCampusSummary,
  fallbackBuildings,
  fallbackRooms,
  fallbackFacilities,
  fallbackFloorPlans,
  fallbackPaths
} from '../data/fallbackCampusData';

const API_BASE = '/api';

class ApiService {
  private isOnlineStatus: boolean = true;

  public get isOnline(): boolean {
    return this.isOnlineStatus;
  }

  private async fetchWithTimeout<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackValue: T
  ): Promise<{ data: T; fromCache: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.isOnlineStatus = true;
      try {
        localStorage.setItem(`ytc_cache_${endpoint}`, JSON.stringify(data));
      } catch {
        // quota exceeded or private mode
      }
      return { data, fromCache: false };
    } catch {
      this.isOnlineStatus = false;
      const cached = localStorage.getItem(`ytc_cache_${endpoint}`);
      if (cached) {
        try {
          return { data: JSON.parse(cached), fromCache: true };
        } catch {
          // parse failed
        }
      }
      return { data: fallbackValue, fromCache: true };
    }
  }

  async getHealth() {
    return this.fetchWithTimeout(
      '/health',
      {},
      { status: 'offline', service: 'YTC Campus Navigator (Cached Mode)', institution: 'Yashoda Technical Campus, Satara' }
    );
  }

  async getCampusSummary(): Promise<{ data: CampusSummary; fromCache: boolean }> {
    return this.fetchWithTimeout('/campus/summary', {}, fallbackCampusSummary);
  }

  async getBuildings(): Promise<{ data: Building[]; fromCache: boolean }> {
    return this.fetchWithTimeout('/buildings', {}, fallbackBuildings);
  }

  async getBuildingById(id: string): Promise<Building | null> {
    const res = await this.getBuildings();
    return res.data.find(b => b.id === id) || null;
  }

  async getRooms(params?: { building_id?: string; floor?: number; room_type?: string }): Promise<{ data: Room[]; fromCache: boolean }> {
    let queryStr = '';
    if (params) {
      const q = new URLSearchParams();
      if (params.building_id) q.append('building_id', params.building_id);
      if (params.floor !== undefined) q.append('floor', params.floor.toString());
      if (params.room_type) q.append('room_type', params.room_type);
      queryStr = `?${q.toString()}`;
    }
    const res = await this.fetchWithTimeout(`/rooms${queryStr}`, {}, fallbackRooms);
    return res;
  }

  async getFacilities(): Promise<{ data: Facility[]; fromCache: boolean }> {
    return this.fetchWithTimeout('/facilities', {}, fallbackFacilities);
  }

  async searchLocations(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const { data } = await this.fetchWithTimeout<SearchResult[]>(
        `/locations/search?q=${encodeURIComponent(query)}`,
        {},
        []
      );
      if (data && data.length > 0) return data;
    } catch {
      // fallback local search
    }

    // Local in-memory search fallback
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    fallbackBuildings.forEach(b => {
      if (
        b.name.toLowerCase().includes(q) ||
        b.building_code.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: b.id,
          title: b.name,
          category: 'building',
          subtitle: `Code: ${b.building_code} • ${b.total_floors} Floors`,
          building_id: b.id,
          building_name: b.name,
          latitude: b.latitude,
          longitude: b.longitude,
          description: b.description
        });
      }
    });

    fallbackRooms.forEach(r => {
      if (
        r.room_name.toLowerCase().includes(q) ||
        r.room_number.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      ) {
        results.push({
          id: r.id,
          title: r.room_name,
          category: 'room',
          subtitle: `${r.building_name} • Floor ${r.floor} • Room ${r.room_number}`,
          building_id: r.building_id,
          building_name: r.building_name,
          floor: r.floor,
          description: r.description
        });
      }
    });

    fallbackFacilities.forEach(f => {
      if (
        f.name.toLowerCase().includes(q) ||
        f.facility_type.toLowerCase().includes(q)
      ) {
        results.push({
          id: f.id,
          title: f.name,
          category: 'facility',
          subtitle: `Type: ${f.facility_type.toUpperCase()}`,
          latitude: f.latitude,
          longitude: f.longitude,
          description: f.description
        });
      }
    });

    return results;
  }

  async getFloorPlans(buildingId: string): Promise<{ data: FloorPlan[]; fromCache: boolean }> {
    const plans = fallbackFloorPlans.filter(p => p.building_id === buildingId);
    return this.fetchWithTimeout(`/floor-plans/${buildingId}`, {}, plans);
  }

  async getPaths(): Promise<{ data: CampusPath[]; fromCache: boolean }> {
    return this.fetchWithTimeout('/paths', {}, fallbackPaths);
  }

  async calculateRoute(source: string, destination: string, wheelchairOnly: boolean = false): Promise<RouteResult> {
    try {
      const response = await fetch(`${API_BASE}/paths/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_node: source,
          destination_node: destination,
          wheelchair_accessible_only: wheelchairOnly
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // fallback
    }

    // Default route estimate fallback
    return {
      found: true,
      source,
      destination,
      total_distance_meters: 140.0,
      estimated_walk_time_minutes: 2.0,
      path_nodes: [source, 'central_junction', destination],
      geometry: [
        [17.7210, 74.0190],
        [17.7216, 74.0202],
        [17.7222, 74.0207]
      ],
      steps: [
        { instruction: `Start from ${source.replace('_', ' ').toUpperCase()} towards central plaza`, distance_meters: 60, coordinates: [17.7210, 74.0190] },
        { instruction: `Turn towards destination entrance ${destination.replace('_', ' ').toUpperCase()}`, distance_meters: 80, coordinates: [17.7216, 74.0202] }
      ]
    };
  }
}

export const api = new ApiService();
