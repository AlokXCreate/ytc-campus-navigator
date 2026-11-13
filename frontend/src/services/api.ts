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
  GeoJSONImportResult,
  Floor,
  IndoorNavigationNode,
  IndoorNavigationEdge,
  FloorTransition,
  IndoorRouteRequest,
  IndoorRouteResult,
  FloorPlanUploadResult,
  User,
  AuthResponse,
  ActivityLog,
  AdminStats
} from '../types/campus';
import {
  fallbackCampusSummary,
  fallbackBuildings,
  fallbackRooms,
  fallbackFacilities,
  fallbackPOIs,
  fallbackCampusBoundary,
  fallbackFloorPlans,
  fallbackPaths,
  fallbackFloors,
  fallbackIndoorNodes,
  fallbackIndoorEdges,
  fallbackFloorTransitions
} from '../data/fallbackCampusData';

const API_BASE = '/api';

class ApiService {
  private isOnlineStatus: boolean = true;
  private token: string | null = typeof window !== 'undefined' ? localStorage.getItem('ytc_auth_token') : null;

  public get isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public setAuthToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('ytc_auth_token', token);
      else localStorage.removeItem('ytc_auth_token');
    }
  }

  public getAuthToken(): string | null {
    return this.token;
  }

  public authHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...customHeaders };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
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

  async getRooms(params?: { building_id?: string; floor?: number; floor_id?: string; room_type?: string }): Promise<{ data: Room[]; fromCache: boolean }> {
    let queryStr = '';
    if (params) {
      const q = new URLSearchParams();
      if (params.building_id) q.append('building_id', params.building_id);
      if (params.floor !== undefined) q.append('floor', params.floor.toString());
      if (params.floor_id) q.append('floor_id', params.floor_id);
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
          subtitle: `${r.building_name || 'Building'} • Floor ${r.floor} • Room ${r.room_number}`,
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

  async getMapPaths(): Promise<{ data: CampusPath[]; fromCache: boolean }> {
    return this.getPaths();
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

  // ==========================================
  // INDOOR NAVIGATION API CLIENT
  // ==========================================
  async getIndoorBuildings(): Promise<{ data: Building[]; fromCache: boolean }> {
    return this.fetchWithTimeout('/indoor/buildings', {}, fallbackBuildings);
  }

  async getIndoorBuildingDetail(buildingId: string): Promise<Building | null> {
    const res = await this.getIndoorBuildings();
    return res.data.find(b => b.id === buildingId) || null;
  }

  async getIndoorFloors(buildingId: string): Promise<{ data: Floor[]; fromCache: boolean }> {
    const defaultFloors = fallbackFloors.filter(f => f.building_id === buildingId);
    return this.fetchWithTimeout(`/indoor/buildings/${buildingId}/floors`, {}, defaultFloors);
  }

  async getBuildingFloors(buildingId: string): Promise<{ data: Floor[]; fromCache: boolean }> {
    return this.getIndoorFloors(buildingId);
  }

  async getIndoorFloor(floorId: string): Promise<{ data: Floor | null; fromCache: boolean }> {
    const fallback = fallbackFloors.find(f => f.id === floorId) || fallbackFloors[0] || null;
    return this.fetchWithTimeout(`/indoor/floors/${floorId}`, {}, fallback);
  }

  async getIndoorFloorRooms(floorId: string): Promise<{ data: Room[]; fromCache: boolean }> {
    const fallback = fallbackRooms.filter(r => r.floor_id === floorId);
    return this.fetchWithTimeout(`/indoor/floors/${floorId}/rooms`, {}, fallback);
  }

  async getIndoorRoom(roomId: string): Promise<{ data: Room | null; fromCache: boolean }> {
    const fallback = fallbackRooms.find(r => r.id === roomId) || null;
    return this.fetchWithTimeout(`/indoor/rooms/${roomId}`, {}, fallback);
  }

  async searchIndoorRooms(
    query: string,
    buildingId?: string,
    floor?: number
  ): Promise<Room[]> {
    if (!query.trim()) return [];
    try {
      const q = new URLSearchParams({ q: query });
      if (buildingId) q.append('building_id', buildingId);
      if (floor !== undefined) q.append('floor', floor.toString());

      const res = await fetch(`${API_BASE}/indoor/rooms/search?${q.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }

    const term = query.toLowerCase().trim();
    return fallbackRooms.filter(r => {
      const matchesText =
        r.room_name.toLowerCase().includes(term) ||
        r.room_number.toLowerCase().includes(term) ||
        r.room_type.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term));
      const matchesBldg = !buildingId || r.building_id === buildingId;
      const matchesFloor = floor === undefined || r.floor === floor;
      return matchesText && matchesBldg && matchesFloor;
    });
  }

  async getIndoorNodes(buildingId: string, floorNumber?: number): Promise<{ data: IndoorNavigationNode[]; fromCache: boolean }> {
    const fallback = fallbackIndoorNodes.filter(
      n => n.building_id === buildingId && (floorNumber === undefined || n.floor_number === floorNumber)
    );
    const query = floorNumber !== undefined ? `?floor_number=${floorNumber}` : '';
    return this.fetchWithTimeout(`/indoor/nodes/${buildingId}${query}`, {}, fallback);
  }

  async getIndoorEdges(buildingId: string): Promise<{ data: IndoorNavigationEdge[]; fromCache: boolean }> {
    const fallback = fallbackIndoorEdges.filter(e => e.building_id === buildingId);
    return this.fetchWithTimeout(`/indoor/edges/${buildingId}`, {}, fallback);
  }

  async calculateIndoorRoute(params: IndoorRouteRequest): Promise<IndoorRouteResult> {
    try {
      const res = await fetch(`${API_BASE}/indoor/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }

    // Client-side offline fallback calculation
    const bldg = fallbackBuildings.find(b => b.id === params.building_id);
    const bldgName = bldg?.name || 'Engineering & Technology Block';

    const srcRoom = fallbackRooms.find(r => r.id === params.source_room_id);
    const dstRoom = fallbackRooms.find(r => r.id === params.destination_room_id);

    const srcName = srcRoom?.room_name || 'Ground Entrance';
    const dstName = dstRoom?.room_name || 'AI & Deep Learning Lab';

    const startFloor = srcRoom ? srcRoom.floor : 0;
    const destFloor = dstRoom ? dstRoom.floor : 2;

    const isMultiFloor = startFloor !== destFloor;
    const traversed = isMultiFloor
      ? [startFloor, destFloor].sort((a, b) => a - b)
      : [startFloor];

    const segments = traversed.map(fn => {
      const floorObj = fallbackFloors.find(f => f.building_id === params.building_id && f.floor_number === fn);
      const isStart = fn === startFloor;
      const isEnd = fn === destFloor;

      const pathCoords: [number, number][] = isStart
        ? [[0.50, 0.88], [0.50, 0.50], [0.085, 0.50]]
        : [[0.085, 0.50], [0.24, 0.50], [0.485, 0.24]];

      const stepDesc = isStart && isMultiFloor
        ? `Proceed to West Stairs A and ascend to Floor ${destFloor}`
        : isEnd && isMultiFloor
        ? `Arrive on Floor ${destFloor} and proceed to ${dstName}`
        : `Walk along corridor to ${dstName}`;

      return {
        floor_number: fn,
        floor_label: floorObj?.floor_label || `Floor ${fn}`,
        floor_plan_image: floorObj?.floor_plan_image || `/floor-plans/engineering/floor-${fn}.svg`,
        path_coordinates: pathCoords,
        steps: [
          {
            instruction: stepDesc,
            distance_meters: 22.0,
            node_id: `node_fl${fn}_path`,
            relative_x: pathCoords[0][0],
            relative_y: pathCoords[0][1],
            floor_number: fn,
            floor_label: floorObj?.floor_label,
            step_type: (isMultiFloor && isStart ? 'staircase' : isEnd ? 'arrive' : 'walk') as any
          }
        ],
        subtotal_distance_meters: 25.0
      };
    });

    return {
      found: true,
      building_id: params.building_id,
      building_name: bldgName,
      source_name: srcName,
      destination_name: dstName,
      total_distance_meters: 48.0,
      estimated_walk_time_minutes: 1.5,
      is_multi_floor: isMultiFloor,
      floors_traversed: traversed,
      floor_segments: segments,
      all_path_nodes: ['node_b0_entrance', 'node_b0_c_mid', 'node_b0_stairs_w', 'node_b2_stairs_w', 'node_b2_c_mid', 'node_b2_rm_202'],
      instructions: [
        `Start at ${srcName}`,
        isMultiFloor ? `Head to Stairs A and move to Floor ${destFloor}` : `Follow corridor to ${dstName}`,
        `You have reached ${dstName}`
      ],
      accessibility_used: params.preferred_transition || 'stairs'
    };
  }

  async uploadFloorPlan(
    buildingId: string,
    floorNumber: number,
    file: File
  ): Promise<FloorPlanUploadResult> {
    const formData = new FormData();
    formData.append('building_id', buildingId);
    formData.append('floor_number', floorNumber.toString());
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/indoor/floor-plans/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Floor plan upload failed');
    }
    return await res.json();
  }

  async createIndoorRoom(room: Partial<Room>): Promise<Room> {
    const res = await fetch(`${API_BASE}/indoor/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Room creation failed');
    }
    return await res.json();
  }

  async updateIndoorRoom(roomId: string, room: Partial<Room>): Promise<Room> {
    const res = await fetch(`${API_BASE}/indoor/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Room update failed');
    }
    return await res.json();
  }

  async deleteIndoorRoom(roomId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/indoor/rooms/${roomId}`, {
      method: 'DELETE'
    });
    return res.ok;
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

  // ============================
  // AUTHENTICATION & USERS
  // ============================
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data: AuthResponse = await res.json();
        this.setAuthToken(data.access_token);
        return data;
      }
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Invalid credentials');
    } catch (e: any) {
      // Local fallback credentials if backend is unreachable
      if (email.toLowerCase() === 'admin@ytc.edu.in' && (password === 'admin123' || password === 'ytcadmin2026')) {
        const fallbackAuth: AuthResponse = {
          access_token: 'demo-token-ytc-superadmin-1',
          token_type: 'bearer',
          user: {
            id: 1,
            email: 'admin@ytc.edu.in',
            full_name: 'YTC System Administrator',
            role: 'superadmin',
            is_active: true
          }
        };
        this.setAuthToken(fallbackAuth.access_token);
        return fallbackAuth;
      }
      throw e;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.authHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return null;
  }

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        headers: this.authHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [
      { id: 1, email: 'admin@ytc.edu.in', full_name: 'YTC System Administrator', role: 'superadmin', is_active: true },
      { id: 2, email: 'manager@ytc.edu.in', full_name: 'YTC Campus Facility Manager', role: 'campus_admin', is_active: true },
      { id: 3, email: 'viewer@ytc.edu.in', full_name: 'Academic Auditor / Visitor', role: 'viewer', is_active: true },
      { id: 4, email: 'student@ytc.edu.in', full_name: 'AI & DS Student', role: 'student', is_active: true }
    ];
  }

  async createUser(payload: { email: string; full_name: string; password: string; role: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create user' }));
      throw new Error(err.detail || 'Failed to create user');
    }
    return await res.json();
  }

  async updateUser(userId: number, payload: any): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update user' }));
      throw new Error(err.detail || 'Failed to update user');
    }
    return await res.json();
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete user' }));
      throw new Error(err.detail || 'Failed to delete user');
    }
    return await res.json();
  }

  // ============================
  // ADMIN DASHBOARD STATS & AUDIT LOGS
  // ============================
  async getAdminStats(): Promise<AdminStats> {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: this.authHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    // Offline fallback calculations
    return {
      total_buildings: fallbackBuildings.length,
      total_floors: fallbackFloors.length,
      total_rooms: fallbackRooms.length,
      total_facilities: fallbackFacilities.length,
      total_pois: fallbackPOIs.length,
      total_outdoor_paths: fallbackPaths.length,
      total_indoor_nodes: fallbackIndoorNodes.length,
      total_indoor_edges: fallbackIndoorEdges.length,
      total_floor_transitions: fallbackFloorTransitions.length,
      total_users: 4,
      incomplete_records: 1,
      recent_activities: [
        {
          id: 1,
          user_email: 'admin@ytc.edu.in',
          action: 'create',
          entity_type: 'building',
          entity_id: 'bldg-b',
          summary: 'Configured Engineering & Technology Block with 3 accessible storeys.',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          user_email: 'manager@ytc.edu.in',
          action: 'upload',
          entity_type: 'floor_plan',
          entity_id: 'bldg-b-fl-2',
          summary: 'Uploaded vector architectural SVG floor plan for AI & DS lab.',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  async getActivityLogs(limit: number = 50, entityType?: string): Promise<ActivityLog[]> {
    try {
      const url = new URL(`${API_BASE}/admin/activity-logs`, window.location.origin);
      url.searchParams.set('limit', limit.toString());
      if (entityType) url.searchParams.set('entity_type', entityType);

      const res = await fetch(url.toString(), {
        headers: this.authHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [
      {
        id: 1,
        user_email: 'admin@ytc.edu.in',
        action: 'create',
        entity_type: 'building',
        entity_id: 'bldg-b',
        summary: 'Configured Engineering Block with 3 floors.',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        user_email: 'manager@ytc.edu.in',
        action: 'update',
        entity_type: 'room',
        entity_id: 'rm-b-202',
        summary: 'Updated relative coordinates for AI & Deep Learning Lab.',
        timestamp: new Date().toISOString()
      }
    ];
  }

  async createActivityLog(payload: { action: string; entity_type: string; entity_id?: string; summary: string }): Promise<ActivityLog> {
    const res = await fetch(`${API_BASE}/admin/activity-logs`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  // ============================
  // BUILDING CRUD
  // ============================
  async createBuilding(payload: any): Promise<Building> {
    const res = await fetch(`${API_BASE}/admin/buildings`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create building' }));
      throw new Error(err.detail || 'Failed to create building');
    }
    return await res.json();
  }

  async updateBuilding(buildingId: string, payload: any): Promise<Building> {
    const res = await fetch(`${API_BASE}/admin/buildings/${buildingId}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update building' }));
      throw new Error(err.detail || 'Failed to update building');
    }
    return await res.json();
  }

  async deleteBuilding(buildingId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/buildings/${buildingId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete building' }));
      throw new Error(err.detail || 'Failed to delete building');
    }
    return await res.json();
  }

  // ============================
  // FLOOR CRUD
  // ============================
  async createFloor(payload: any): Promise<Floor> {
    const res = await fetch(`${API_BASE}/admin/floors`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create floor' }));
      throw new Error(err.detail || 'Failed to create floor');
    }
    return await res.json();
  }

  async updateFloor(floorId: string, payload: any): Promise<Floor> {
    const res = await fetch(`${API_BASE}/admin/floors/${floorId}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update floor' }));
      throw new Error(err.detail || 'Failed to update floor');
    }
    return await res.json();
  }

  async deleteFloor(floorId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/floors/${floorId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete floor' }));
      throw new Error(err.detail || 'Failed to delete floor');
    }
    return await res.json();
  }

  // ============================
  // ROOM CRUD & MARKER POSITIONING
  // ============================
  async createRoom(payload: any): Promise<Room> {
    const res = await fetch(`${API_BASE}/admin/rooms`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create room' }));
      throw new Error(err.detail || 'Failed to create room');
    }
    return await res.json();
  }

  async updateRoom(roomId: string, payload: any): Promise<Room> {
    const res = await fetch(`${API_BASE}/admin/rooms/${roomId}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update room' }));
      throw new Error(err.detail || 'Failed to update room');
    }
    return await res.json();
  }

  async deleteRoom(roomId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/rooms/${roomId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete room' }));
      throw new Error(err.detail || 'Failed to delete room');
    }
    return await res.json();
  }

  // ============================
  // FACILITY CRUD
  // ============================
  async createFacility(payload: any): Promise<Facility> {
    const res = await fetch(`${API_BASE}/admin/facilities`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create facility' }));
      throw new Error(err.detail || 'Failed to create facility');
    }
    return await res.json();
  }

  async updateFacility(facilityId: string, payload: any): Promise<Facility> {
    const res = await fetch(`${API_BASE}/admin/facilities/${facilityId}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update facility' }));
      throw new Error(err.detail || 'Failed to update facility');
    }
    return await res.json();
  }

  async deleteFacility(facilityId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/facilities/${facilityId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete facility' }));
      throw new Error(err.detail || 'Failed to delete facility');
    }
    return await res.json();
  }

  // ============================
  // OUTDOOR PATHWAYS CRUD
  // ============================
  async createPath(payload: any): Promise<CampusPath> {
    const res = await fetch(`${API_BASE}/admin/paths`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create pathway' }));
      throw new Error(err.detail || 'Failed to create pathway');
    }
    return await res.json();
  }

  async updatePath(pathId: string, payload: any): Promise<CampusPath> {
    const res = await fetch(`${API_BASE}/admin/paths/${pathId}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update pathway' }));
      throw new Error(err.detail || 'Failed to update pathway');
    }
    return await res.json();
  }

  async deletePath(pathId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/paths/${pathId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete pathway' }));
      throw new Error(err.detail || 'Failed to delete pathway');
    }
    return await res.json();
  }

  // ============================
  // INDOOR NODES & EDGES CRUD
  // ============================
  async createIndoorNode(payload: any): Promise<IndoorNavigationNode> {
    const res = await fetch(`${API_BASE}/admin/indoor-nodes`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create node' }));
      throw new Error(err.detail || 'Failed to create node');
    }
    return await res.json();
  }

  async deleteIndoorNode(nodeId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/indoor-nodes/${nodeId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete node' }));
      throw new Error(err.detail || 'Failed to delete node');
    }
    return await res.json();
  }

  async createIndoorEdge(payload: any): Promise<IndoorNavigationEdge> {
    const res = await fetch(`${API_BASE}/admin/indoor-edges`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create edge' }));
      throw new Error(err.detail || 'Failed to create edge');
    }
    return await res.json();
  }

  async deleteIndoorEdge(edgeId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/indoor-edges/${edgeId}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete edge' }));
      throw new Error(err.detail || 'Failed to delete edge');
    }
    return await res.json();
  }

  // ============================
  // FLOOR PLAN UPLOADS
  // ============================
  async uploadFloorPlanFile(buildingId: string, floorNumber: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('building_id', buildingId);
    formData.append('floor_number', floorNumber.toString());
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}/admin/floor-plans/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  }

  // ============================
  // DATA EXPORT DOWNLOAD
  // ============================
  async exportCampusData(entityType: string, format: 'json' | 'csv' | 'geojson'): Promise<Blob> {
    const res = await fetch(`${API_BASE}/admin/export/${entityType}?format=${format}`, {
      headers: this.authHeaders()
    });
    if (!res.ok) {
      throw new Error(`Export failed for ${entityType}`);
    }
    return await res.blob();
  }
}

export const api = new ApiService();
