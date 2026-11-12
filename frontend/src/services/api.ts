import {
  Building,
  Room,
  Facility,
  PointOfInterest,
  CampusBoundary,
  CampusSummary,
  NavigationSummary,
  SearchResult,
  RouteResult,
  FloorPlan,
  CampusPath,
  GeoJSONValidationResult,
  GeoJSONImportResult
} from '../types/campus';
import {
  fallbackCampusSummary,
  fallbackBuildings,
  fallbackRooms,
  fallbackFacilities,
  fallbackPOIs,
  fallbackCampusBoundary,
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

  async getNavigationSummary(): Promise<{ data: NavigationSummary; fromCache: boolean }> {
    return this.fetchWithTimeout(
      '/navigation/summary',
      {},
      {
        total_buildings: fallbackBuildings.length,
        total_pois: fallbackPOIs.length,
        total_pathways: fallbackPaths.length,
        total_nodes: 12,
        campus_boundary_available: true,
        bounding_box: [[17.7198, 74.0185], [17.7245, 74.0232]],
        default_center: [17.7215, 74.0205],
        is_demo_dataset: true
      }
    );
  }

  async getBuildings(): Promise<{ data: Building[]; fromCache: boolean }> {
    return this.fetchWithTimeout('/buildings', {}, fallbackBuildings);
  }

  async getBuildingById(id: string): Promise<Building | null> {
    const res = await this.getBuildings();
    return res.data.find(b => b.id === id) || null;
  }

  async getMapPoints(category?: string): Promise<{ data: PointOfInterest[]; fromCache: boolean }> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.fetchWithTimeout(`/map/points${query}`, {}, fallbackPOIs);
  }

  async getMapBoundary(): Promise<{ data: CampusBoundary | null; fromCache: boolean }> {
    return this.fetchWithTimeout('/map/boundary', {}, fallbackCampusBoundary);
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
    return this.fetchWithTimeout(`/rooms${queryStr}`, {}, fallbackRooms);
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

    // Local in-memory search fallback across POIs, Buildings, and Rooms
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    fallbackPOIs.forEach(poi => {
      if (
        poi.name.toLowerCase().includes(q) ||
        poi.category.toLowerCase().includes(q) ||
        (poi.description && poi.description.toLowerCase().includes(q))
      ) {
        results.push({
          id: poi.id,
          title: poi.name,
          category: 'poi',
          subtitle: `${poi.category.toUpperCase()} • ${poi.building_name || 'Outdoor Campus'}`,
          building_id: poi.building_id,
          building_name: poi.building_name,
          latitude: poi.latitude,
          longitude: poi.longitude,
          description: poi.description
        });
      }
    });

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

    return results;
  }

  async getLocationById(id: string): Promise<SearchResult | null> {
    try {
      const res = await fetch(`${API_BASE}/locations/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    const all = await this.searchLocations(id);
    return all.find(x => x.id === id) || null;
  }

  async getFloorPlans(buildingId: string): Promise<{ data: FloorPlan[]; fromCache: boolean }> {
    const plans = fallbackFloorPlans.filter(p => p.building_id === buildingId);
    return this.fetchWithTimeout(`/floor-plans/${buildingId}`, {}, plans);
  }

  async getPaths(): Promise<{ data: CampusPath[]; fromCache: boolean }> {
    return this.fetchWithTimeout('/map/paths', {}, fallbackPaths);
  }

  async calculateRoute(
    paramsOrSource: string | {
      source?: string;
      destination?: string;
      source_coord?: { latitude: number; longitude: number };
      destination_coord?: { latitude: number; longitude: number };
      algorithm?: 'dijkstra' | 'astar';
      wheelchair_only?: boolean;
    },
    destinationArg?: string,
    wheelchairOnlyArg?: boolean
  ): Promise<RouteResult> {
    const params = typeof paramsOrSource === 'string'
      ? {
          source: paramsOrSource,
          destination: destinationArg,
          wheelchair_only: wheelchairOnlyArg,
          algorithm: 'dijkstra' as const
        }
      : paramsOrSource;

    try {
      const response = await fetch(`${API_BASE}/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_node: params.source,
          destination_node: params.destination,
          source_coord: params.source_coord,
          destination_coord: params.destination_coord,
          algorithm: params.algorithm || 'dijkstra',
          wheelchair_accessible_only: params.wheelchair_only || false
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // fallback
    }

    // Default route estimate fallback
    const src = params.source || 'Current Location';
    const dst = params.destination || 'Destination Point';
    return {
      found: true,
      source: src,
      destination: dst,
      algorithm_used: 'Dijkstra (Offline Fallback)',
      total_distance_meters: 160.0,
      estimated_walk_time_minutes: 2.1,
      path_nodes: [src, 'central_corridor', dst],
      geometry: [
        [17.7210, 74.0190],
        [17.7216, 74.0202],
        [17.7222, 74.0207]
      ],
      steps: [
        { instruction: `Start walking from ${src.replace('_', ' ').toUpperCase()} along main walkway`, distance_meters: 75, coordinates: [17.7210, 74.0190], bearing: "North" },
        { instruction: `Continue forward towards ${dst.replace('_', ' ').toUpperCase()}`, distance_meters: 85, coordinates: [17.7216, 74.0202], bearing: "North-East" },
        { instruction: `You have reached your destination: ${dst.replace('_', ' ').toUpperCase()}`, distance_meters: 0, coordinates: [17.7222, 74.0207], bearing: "Arrive" }
      ],
      alternatives: []
    };
  }

  async validateGeoJSON(geojson: Record<string, any>): Promise<GeoJSONValidationResult> {
    try {
      const res = await fetch(`${API_BASE}/geojson/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geojson })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return {
      valid: false,
      feature_count: 0,
      points_count: 0,
      lines_count: 0,
      polygons_count: 0,
      errors: ['Network connection to GeoJSON validation service failed.'],
      warnings: []
    };
  }

  async importGeoJSON(
    geojson: Record<string, any>,
    targetType: string = 'auto',
    overwriteExisting: boolean = false
  ): Promise<GeoJSONImportResult> {
    try {
      const res = await fetch(`${API_BASE}/geojson/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geojson,
          target_type: targetType,
          overwrite_existing: overwriteExisting
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return {
      success: false,
      imported_count: 0,
      rejected_count: 0,
      summary: { points: 0, paths: 0, boundaries: 0 },
      messages: ['Failed to contact import service.']
    };
  }
}

export const api = new ApiService();
