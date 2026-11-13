import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCampus } from '../context/CampusContext';
import { FloorPlanViewer } from '../components/navigation/FloorPlanViewer';
import { api } from '../services/api';
import {
  Building,
  Floor,
  Room,
  IndoorNavigationNode,
  IndoorRouteResult
} from '../types/campus';
import { useRecentSearches } from '../hooks/useRecentSearches';
import {
  Layers,
  Building2,
  AlertCircle,
  Sparkles,
  Info,
  Compass,
  ArrowRight,
  Search,
  X,
  DoorOpen,
  Footprints,
  Accessibility,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Navigation,
  Bookmark,
  Share2,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';

export const IndoorNavPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { buildings, selectedBuilding, setSelectedBuilding, selectedRoom, setSelectedRoom } = useCampus();
  const { recentSearches, addRecentSearch } = useRecentSearches();

  // URL Query Parameters
  const paramBuildingId = searchParams.get('building');
  const paramFloor = searchParams.get('floor');
  const paramRoomId = searchParams.get('room');
  const paramFromOutdoor = searchParams.get('fromOutdoor') === 'true';

  // Active Building
  const activeBuilding = buildings.find(b => b.id === (paramBuildingId || selectedBuilding?.id)) ||
    buildings.find(b => b.id === 'bldg-b') ||
    buildings[0];

  // Active Floor & Indoor Data States
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(() => {
    return paramFloor !== null ? parseInt(paramFloor, 10) : 0;
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [indoorNodes, setIndoorNodes] = useState<IndoorNavigationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Indoor Route Planner States
  const [originNodeId, setOriginNodeId] = useState<string>('entrance');
  const [destinationRoomId, setDestinationRoomId] = useState<string>('');
  const [preferredTransition, setPreferredTransition] = useState<'stairs' | 'lift' | 'accessible'>('stairs');
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'astar'>('dijkstra');
  const [routeResult, setRouteResult] = useState<IndoorRouteResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [activeNavStep, setActiveNavStep] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Load Building Floors, Rooms & Nodes
  useEffect(() => {
    if (!activeBuilding) return;

    let isMounted = true;
    const fetchIndoorData = async () => {
      setIsLoading(true);
      try {
        const [floorsRes, roomsRes, nodesRes] = await Promise.all([
          api.getIndoorFloors(activeBuilding.id),
          api.getRooms({ building_id: activeBuilding.id }),
          api.getIndoorNodes(activeBuilding.id)
        ]);

        if (!isMounted) return;

        setFloors(floorsRes.data);
        setRooms(roomsRes.data);
        setIndoorNodes(nodesRes.data);

        // Auto select floor if param or fallback
        if (paramFloor !== null) {
          setSelectedFloor(parseInt(paramFloor, 10));
        } else if (floorsRes.data.length > 0) {
          const hasFloor2 = floorsRes.data.some(f => f.floor_number === 2);
          setSelectedFloor(hasFloor2 ? 2 : floorsRes.data[0].floor_number);
        }

        // Auto select room from URL param
        if (paramRoomId) {
          const matchedRoom = roomsRes.data.find(r => r.id === paramRoomId);
          if (matchedRoom) {
            setSelectedRoom(matchedRoom);
            setDestinationRoomId(matchedRoom.id);
            if (matchedRoom.floor !== undefined) {
              setSelectedFloor(matchedRoom.floor);
            }
          }
        }
      } catch (err) {
        console.warn('Indoor data loading error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchIndoorData();
    return () => { isMounted = false; };
  }, [activeBuilding?.id, paramBuildingId, paramFloor, paramRoomId]);

  // Handle Room Selection from Directory or Click
  const handleSelectRoom = (room: Room | null) => {
    setSelectedRoom(room);
    if (room) {
      setDestinationRoomId(room.id);
      addRecentSearch(room.room_name);
      if (room.floor !== selectedFloor) {
        setSelectedFloor(room.floor);
      }
    }
  };

  // Calculate Route Trigger
  const handleCalculateRoute = async () => {
    if (!activeBuilding || !destinationRoomId) return;

    setIsCalculatingRoute(true);
    setIsNavigating(false);
    setActiveNavStep(0);

    try {
      const srcNode = originNodeId === 'entrance' ? undefined : originNodeId;
      const result = await api.calculateIndoorRoute({
        building_id: activeBuilding.id,
        source_node_id: srcNode,
        destination_room_id: destinationRoomId,
        preferred_transition: preferredTransition,
        algorithm: algorithm
      });

      setRouteResult(result);

      // If multi-floor, ensure the view starts on the departure floor
      if (result.floors_traversed && result.floors_traversed.length > 0) {
        setSelectedFloor(result.floors_traversed[0]);
      }
    } catch (err) {
      console.error('Failed to calculate indoor route:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Clear Active Route
  const handleClearRoute = () => {
    setRouteResult(null);
    setIsNavigating(false);
    setActiveNavStep(0);
  };

  // Extract Route Coordinates for the Current Selected Floor
  const activeFloorSegment = routeResult?.floor_segments.find(
    (seg) => seg.floor_number === selectedFloor
  );
  const routeCoordinatesForFloor: [number, number][] = activeFloorSegment?.path_coordinates || [];

  // Filtered Rooms for Directory
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'classroom' && r.room_type.includes('classroom')) ||
      (categoryFilter === 'laboratory' && r.room_type.includes('lab')) ||
      (categoryFilter === 'office' && (r.room_type.includes('office') || r.room_type.includes('faculty'))) ||
      (categoryFilter === 'seminar' && r.room_type.includes('seminar'));

    return matchesSearch && matchesCategory;
  });

  const currentFloorRooms = filteredRooms.filter((r) => r.floor === selectedFloor);

  if (!activeBuilding) {
    return <div className="p-12 text-center text-xs text-slate-500 font-bold">Loading building catalog...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Outdoor Transition Notification */}
      {paramFromOutdoor && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Arrived at {activeBuilding.name} Entrance
              </div>
              <div className="text-sm font-bold text-slate-900">
                Outdoor route complete. Switching to indoor floor guidance.
              </div>
            </div>
          </div>
          <button
            onClick={() => handleCalculateRoute()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Guide to Room
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Layers className="w-4 h-4" /> Multi-Storey Indoor Campus Navigator
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Indoor Navigation • {activeBuilding.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Floor-wise architectural layouts, classroom discovery, and multi-storey staircase/lift routing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => navigate('/explore')}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            Outdoor Campus Map
          </button>
        </div>
      </div>

      {/* Architectural Blueprint Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Demonstration Notice:</span> All indoor floor plans and room markers represent normalized demonstration coordinates calibrated for Yashoda Technical Campus academic presentation.
        </div>
      </div>

      {/* Main 3-Column Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Room Discovery & Directory (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" /> Room Discovery
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {currentFloorRooms.length} on Floor {selectedFloor}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Room 201, AI Lab, Seminar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'laboratory', label: 'Labs' },
                { id: 'classroom', label: 'Classrooms' },
                { id: 'office', label: 'Offices' },
                { id: 'seminar', label: 'Halls' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Room Directory List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-2.5 max-h-[460px] overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Floor {selectedFloor} Rooms &amp; Labs
            </div>

            {currentFloorRooms.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                No rooms matching the filter on this floor.
              </div>
            ) : (
              <div className="space-y-1.5">
                {currentFloorRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                          : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          <DoorOpen className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {room.room_name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Room {room.room_number} • {room.room_type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Interactive 2D Floor Plan Canvas (6 cols) */}
        <div className="lg:col-span-6 h-[580px]">
          <FloorPlanViewer
            buildings={buildings}
            currentBuilding={activeBuilding}
            floors={floors}
            selectedFloor={selectedFloor}
            rooms={rooms}
            selectedRoom={selectedRoom}
            routeCoordinates={routeCoordinatesForFloor}
            indoorNodes={indoorNodes}
            onSelectBuilding={(b) => {
              setSelectedBuilding(b);
              const bFloors = floors.filter(f => f.building_id === b.id);
              setSelectedFloor(bFloors[0]?.floor_number ?? 0);
              setSelectedRoom(null);
              setRouteResult(null);
            }}
            onSelectFloor={(fl) => setSelectedFloor(fl)}
            onSelectRoom={handleSelectRoom}
          />
        </div>

        {/* RIGHT COLUMN: Route Planner & Room Details (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Selected Room Details Panel */}
          {selectedRoom ? (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Room {selectedRoom.room_number} • Floor {selectedRoom.floor}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {selectedRoom.room_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedRoom.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedRoom.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setDestinationRoomId(selectedRoom.id);
                    handleCalculateRoute();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Footprints className="w-4 h-4" /> Route to This Room
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm text-center py-6 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">No Room Selected</div>
              <div className="text-[11px] text-slate-500">
                Click any room marker on the blueprint or select from the left directory.
              </div>
            </div>
          )}

          {/* Route Calculation Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600" /> Indoor Route Engine
              </span>
              {routeResult && (
                <button
                  onClick={handleClearRoute}
                  className="text-[10px] font-bold text-rose-600 hover:underline"
                >
                  Clear Route
                </button>
              )}
            </div>

            {/* Origin Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Starting Point
              </label>
              <select
                value={originNodeId}
                onChange={(e) => setOriginNodeId(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="entrance">Main Building Entrance (Ground Floor)</option>
                {indoorNodes
                  .filter((n) => n.node_type === 'staircase')
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.node_name} (Floor {n.floor_number})
                    </option>
                  ))}
              </select>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Destination Classroom / Lab
              </label>
              <select
                value={destinationRoomId}
                onChange={(e) => setDestinationRoomId(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select destination room...</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Floor {r.floor} • Room {r.room_number}: {r.room_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transition Mode (Stairs vs Lift) */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Floor Transition Preference
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreferredTransition('stairs')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    preferredTransition === 'stairs'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" /> Stairs (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredTransition('accessible')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    preferredTransition === 'accessible'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Accessibility className="w-3.5 h-3.5" /> Lift (Accessible)
                </button>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculateRoute}
              disabled={!destinationRoomId || isCalculatingRoute}
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all ${
                destinationRoomId
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isCalculatingRoute ? 'Calculating Shortest Route...' : 'Find Indoor Walking Path'}
            </button>

            {/* Active Route Result Card */}
            {routeResult && routeResult.found && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Walking Distance
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {routeResult.total_distance_meters} meters
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Est. Walk Time
                    </div>
                    <div className="text-sm font-black text-blue-600">
                      ~{routeResult.estimated_walk_time_minutes} min
                    </div>
                  </div>
                </div>

                {/* Multi-floor notification */}
                {routeResult.is_multi_floor && (
                  <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-bold flex items-center justify-between">
                    <span>Multi-Storey: Floors {routeResult.floors_traversed.join(' → ')}</span>
                    <button
                      onClick={() => {
                        const nextFl = routeResult.floors_traversed.find(f => f !== selectedFloor) ?? routeResult.floors_traversed[1];
                        if (nextFl !== undefined) setSelectedFloor(nextFl);
                      }}
                      className="text-[10px] font-extrabold text-blue-700 underline"
                    >
                      Switch Floor
                    </button>
                  </div>
                )}

                {/* Step-by-Step Directions */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Turn-by-Turn Guidance
                  </div>
                  {routeResult.instructions.map((inst, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] p-2 rounded-lg bg-white border border-slate-200/80 flex items-start gap-2 text-slate-800"
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-tight">{inst}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
