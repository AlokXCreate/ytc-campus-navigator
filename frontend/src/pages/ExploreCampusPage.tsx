import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSavedLocations } from '../hooks/useSavedLocations';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { CampusMap } from '../components/navigation/CampusMap';
import { api } from '../services/api';
import {
  PointOfInterest,
  Building,
  RouteResult,
  CampusPath,
  SearchResult
} from '../types/campus';
import {
  Search,
  Navigation,
  Compass,
  Route,
  ArrowRight,
  ArrowUpDown,
  LocateFixed,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Clock,
  Sparkles,
  Milestone,
  CheckCircle2,
  Accessibility,
  AlertCircle,
  X,
  Layers,
  ChevronRight,
  ChevronDown,
  Play,
  Square
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LiveNavigationHUD } from '../components/navigation/LiveNavigationHUD';
import { voiceNavigation } from '../services/voiceNavigation';

export const ExploreCampusPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    buildings,
    facilities,
    pointsOfInterest,
    campusBoundary,
    selectedBuilding,
    setSelectedBuilding,
    selectedPOI,
    setSelectedPOI,
  } = useCampus();

  const {
    position,
    isTracking,
    error: gpsError,
    getCurrentLocation,
    startTracking,
    stopTracking
  } = useGeolocation();

  const { savedLocations, saveLocation, removeLocation, isSaved } = useSavedLocations();
  const { recentSearches, addSearch, clearAllSearches } = useRecentSearches();

  // Mode: "explore" or "directions"
  const [navMode, setNavMode] = useState<'explore' | 'directions'>('explore');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Directions state
  const [sourceId, setSourceId] = useState<string>('gate_main');
  const [destId, setDestId] = useState<string>('bldg_b_entrance');
  const [useCurrentLocationAsSource, setUseCurrentLocationAsSource] = useState(false);
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'astar'>('dijkstra');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);

  // Active route result
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [paths, setPaths] = useState<CampusPath[]>([]);

  // Live Navigation State
  const [isNavigatingLive, setIsNavigatingLive] = useState(false);
  const [remainingDistance, setRemainingDistance] = useState<number | null>(null);
  const [liveNavCoord, setLiveNavCoord] = useState<[number, number] | null>(null);

  // Mobile Bottom Sheet toggle
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false);

  // Load paths on mount
  useEffect(() => {
    api.getPaths().then((res) => setPaths(res.data));
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await api.searchLocations(searchQuery);
      setSearchResults(res);
      setIsSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Recalculate route when directions parameters change
  const handleCalculateRoute = async () => {
    setIsCalculatingRoute(true);

    const sourceCoord = useCurrentLocationAsSource && position
      ? { latitude: position.latitude, longitude: position.longitude }
      : undefined;

    const res = await api.calculateRoute({
      source: useCurrentLocationAsSource ? undefined : sourceId,
      destination: destId,
      source_coord: sourceCoord,
      algorithm,
      wheelchair_only: wheelchairOnly,
    });

    setRouteResult(res);
    setIsCalculatingRoute(false);
    if (res.found) {
      setRemainingDistance(res.total_distance_meters);
    }
  };

  useEffect(() => {
    if (navMode === 'directions') {
      handleCalculateRoute();
    }
  }, [sourceId, destId, useCurrentLocationAsSource, algorithm, wheelchairOnly, navMode]);

  // When selectedPOI is updated from outside or map click, set as destination
  useEffect(() => {
    if (selectedPOI) {
      setDestId(selectedPOI.id);
      addSearch(selectedPOI.name);
    }
  }, [selectedPOI]);

  // Reverse route action
  const handleReverseRoute = () => {
    if (useCurrentLocationAsSource) {
      setUseCurrentLocationAsSource(false);
    }
    const temp = sourceId;
    setSourceId(destId);
    setDestId(temp);
  };

  // Start Live Navigation
  const handleStartLiveNavigation = () => {
    setIsNavigatingLive(true);
    startTracking();
    setIsMobileSheetExpanded(false);
  };

  const handleStopLiveNavigation = () => {
    setIsNavigatingLive(false);
    setLiveNavCoord(null);
    stopTracking();
    voiceNavigation.setMuted(true);
  };

  // Category filtering
  const filteredPOIs = pointsOfInterest.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // Waypoint Origin & Destination Coordinates for Map Pins
  const routeOriginCoord: [number, number] | null = React.useMemo(() => {
    if (useCurrentLocationAsSource && position) {
      return [position.latitude, position.longitude];
    }
    const p = pointsOfInterest.find((x) => x.id === sourceId);
    if (p) return [p.latitude, p.longitude];
    const b = buildings.find((x) => x.id === sourceId || `${x.id.replace('-', '_')}_entrance` === sourceId);
    if (b) return [b.entrance_latitude || b.latitude, b.entrance_longitude || b.longitude];
    if (sourceId === 'gate_main') return [17.7210, 74.0190];
    return null;
  }, [useCurrentLocationAsSource, position, sourceId, pointsOfInterest, buildings]);

  const routeDestCoord: [number, number] | null = React.useMemo(() => {
    const p = pointsOfInterest.find((x) => x.id === destId);
    if (p) return [p.latitude, p.longitude];
    const b = buildings.find((x) => x.id === destId || `${x.id.replace('-', '_')}_entrance` === destId);
    if (b) return [b.entrance_latitude || b.latitude, b.entrance_longitude || b.longitude];
    if (destId === 'bldg_b_entrance') return [17.7222, 74.0207];
    return null;
  }, [destId, pointsOfInterest, buildings]);

  return (
    <div className="relative flex flex-col lg:flex-row h-[calc(100vh-5.5rem)] -m-4 md:-m-8 overflow-hidden bg-slate-100">
      {/* ======================================================== */}
      {/* LEFT NAVIGATION SIDEBAR (Desktop & Responsive Sheet)    */}
      {/* ======================================================== */}
      <div
        className={`absolute lg:relative z-20 inset-y-0 left-0 w-full lg:w-[420px] bg-white border-r border-slate-200/90 shadow-premium lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileSheetExpanded ? 'translate-y-0' : 'translate-y-[82%] lg:translate-y-0'
        }`}
      >
        {/* Mobile Drag Handle */}
        <div
          onClick={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
          className="lg:hidden flex items-center justify-center py-2.5 bg-slate-50 border-b border-slate-200 cursor-pointer text-slate-400"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Top Header Mode Switcher */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                YTC Campus Navigator
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Satara Map
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setNavMode('explore');
                setRouteResult(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                navMode === 'explore'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Browse Campus POIs
            </button>
            <button
              onClick={() => setNavMode('directions')}
              className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                navMode === 'directions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              Get Directions
            </button>
          </div>
        </div>

        {/* Mode A: BROWSE CAMPUS POIS & SEARCH */}
        {navMode === 'explore' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Input Box */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search labs, classrooms, canteen, library..."
                  className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'academic', label: 'Academic' },
                  { id: 'department', label: 'AI&DS' },
                  { id: 'library', label: 'Library' },
                  { id: 'canteen', label: 'Canteen' },
                  { id: 'sports', label: 'Sports' },
                  { id: 'parking', label: 'Parking' },
                  { id: 'gate', label: 'Gates' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                      activeCategory === c.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List: Autocomplete Results OR POI Categories */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {searchResults.length > 0 ? (
                <>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
                    Matching Locations ({searchResults.length})
                  </div>
                  {searchResults.map((res) => (
                    <div
                      key={`${res.category}-${res.id}`}
                      onClick={() => {
                        const poi = pointsOfInterest.find((p) => p.id === res.id);
                        if (poi) setSelectedPOI(poi);
                        const bldg = buildings.find((b) => b.id === res.building_id);
                        if (bldg) setSelectedBuilding(bldg);
                        addSearch(res.title);
                      }}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{res.title}</div>
                          <div className="text-[11px] text-slate-500">{res.subtitle}</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDestId(res.id);
                          setNavMode('directions');
                        }}
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                        title="Route to this location"
                      >
                        <Route className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* Saved Frequently Visited Destinations */}
                  {savedLocations.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <span className="flex items-center gap-1">
                          <BookmarkCheck className="w-3 h-3 text-amber-500" /> Saved Locations
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {savedLocations.slice(0, 3).map((saved) => (
                          <div
                            key={saved.id}
                            onClick={() => {
                              const poi = pointsOfInterest.find((p) => p.id === saved.id);
                              if (poi) setSelectedPOI(poi);
                            }}
                            className="p-2.5 rounded-xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 flex items-center justify-between cursor-pointer text-xs"
                          >
                            <span className="font-semibold text-slate-800 truncate">{saved.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDestId(saved.id);
                                setNavMode('directions');
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:underline"
                            >
                              Route →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campus POIs List */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
                      Campus POIs ({filteredPOIs.length})
                    </div>
                    {filteredPOIs.map((poi) => {
                      const isTarget = selectedPOI?.id === poi.id;
                      const saved = isSaved(poi.id);

                      return (
                        <div
                          key={poi.id}
                          onClick={() => setSelectedPOI(poi)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isTarget
                              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                              : 'bg-white hover:bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-slate-900">{poi.name}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{poi.description}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (saved) removeLocation(poi.id);
                                else saveLocation({ id: poi.id, name: poi.name, category: poi.category, latitude: poi.latitude, longitude: poi.longitude });
                              }}
                              className="p-1 text-slate-400 hover:text-amber-500"
                              title={saved ? "Remove bookmark" : "Bookmark location"}
                            >
                              {saved ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">{poi.category}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDestId(poi.id);
                                setNavMode('directions');
                              }}
                              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                            >
                              Directions <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mode B: DIRECTIONS & SHORTEST WALKING ROUTES */}
        {navMode === 'directions' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Waypoint Selectors Form */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/60">
              {/* Origin Selection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Starting Location
                  </span>
                  <button
                    onClick={() => {
                      getCurrentLocation().then((coords) => {
                        if (coords) setUseCurrentLocationAsSource(true);
                      });
                    }}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <LocateFixed className="w-3 h-3" /> My GPS
                  </button>
                </div>

                {useCurrentLocationAsSource ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <LocateFixed className="w-3.5 h-3.5 text-emerald-600" /> My Current Location (GPS)
                    </span>
                    <button
                      onClick={() => setUseCurrentLocationAsSource(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="gate_main">Main Entrance &amp; Security Gate</option>
                    <option value="parking_a">Vehicle Parking Area A</option>
                    <option value="bldg_a_entrance">Main Admin Building Entrance</option>
                    <option value="bldg_b_entrance">Engineering Block Entrance (AI&amp;DS)</option>
                    <option value="lib_entrance">Central Library Entrance</option>
                    <option value="workshop_entrance">Workshop &amp; Innovation Hub Entrance</option>
                    <option value="canteen_entrance">Student Cafeteria Entrance</option>
                    <option value="sports_ground">Athletic &amp; Sports Ground</option>
                    {pointsOfInterest.map((p) => (
                      <option key={`src-${p.id}`} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Reverse Button */}
              <div className="flex items-center justify-center -my-1">
                <button
                  onClick={handleReverseRoute}
                  className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 shadow-sm transition-all"
                  title="Reverse starting and destination points"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Destination
                </label>
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="bldg_b_entrance">Engineering Block (AI &amp; DS Dept)</option>
                  <option value="lib_entrance">Central Library Knowledge Hub</option>
                  <option value="bldg_a_entrance">Main Admin &amp; Directorate</option>
                  <option value="canteen_entrance">Student Cafeteria &amp; Canteen</option>
                  <option value="workshop_entrance">Central Workshop &amp; Robotics Lab</option>
                  <option value="sports_ground">Sports Ground &amp; Athletic Track</option>
                  <option value="gate_main">Main Campus Gate</option>
                  {pointsOfInterest.map((p) => (
                    <option key={`dst-${p.id}`} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Options: Algorithm & Wheelchair */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[10px] uppercase text-slate-400">Algo:</span>
                  <button
                    onClick={() => setAlgorithm(algorithm === 'dijkstra' ? 'astar' : 'dijkstra')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-bold text-blue-600"
                  >
                    {algorithm === 'dijkstra' ? 'Dijkstra' : 'A* Heuristic'}
                  </button>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[11px]">
                  <input
                    type="checkbox"
                    checked={wheelchairOnly}
                    onChange={(e) => setWheelchairOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <Accessibility className="w-3.5 h-3.5 text-blue-600" /> Accessible
                </label>
              </div>
            </div>

            {/* Route Details Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {routeResult && routeResult.found ? (
                <div className="space-y-4">
                  {/* Route Metrics Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-premium space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold uppercase tracking-wider">
                      <span>{routeResult.algorithm_used || 'Optimal Route'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        Mapped Pathway
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Distance</div>
                        <div className="text-xl font-extrabold text-white mt-0.5">
                          {routeResult.total_distance_meters} m
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Est. Walk Time</div>
                        <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                          ~{routeResult.estimated_walk_time_minutes} min
                        </div>
                      </div>
                    </div>

                    {/* Start Navigation Toggle */}
                    <div className="pt-2">
                      {isNavigatingLive ? (
                        <button
                          onClick={handleStopLiveNavigation}
                          className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                        >
                          <Square className="w-4 h-4 fill-white" />
                          <span>Stop Live Navigation Mode</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStartLiveNavigation}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-600/25 cursor-pointer active:scale-98"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Start Voice Navigation &amp; Directions</span>
                        </button>
                      )}
                    </div>

                    {/* Outdoor to Indoor Seamless Handoff */}
                    <div className="pt-2 border-t border-slate-700/80">
                      <button
                        onClick={() => {
                          let targetBldg = 'bldg-b';
                          let targetFloor = 2;
                          if (destId.includes('admin') || destId.includes('bldg_a')) {
                            targetBldg = 'bldg-a';
                            targetFloor = 0;
                          } else if (destId.includes('lib')) {
                            targetBldg = 'bldg-d';
                            targetFloor = 0;
                          } else if (destId.includes('pharm')) {
                            targetBldg = 'bldg-c';
                            targetFloor = 0;
                          }
                          navigate(`/indoor?building=${targetBldg}&floor=${targetFloor}&fromOutdoor=true`);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold flex items-center justify-between transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-left">
                          <Layers className="w-4 h-4 text-amber-300 shrink-0" />
                          <div>
                            <div className="text-[10px] text-blue-200 uppercase font-extrabold tracking-wider">Arrival Handoff</div>
                            <div className="text-xs font-black">Continue Inside Building</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Step-by-Step Directions */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      Step-by-Step Directions ({routeResult.steps.length})
                    </div>
                    <div className="space-y-2">
                      {routeResult.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-800 leading-snug">{step.instruction}</div>
                            {step.bearing && step.bearing !== 'Arrive' && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Direction: <span className="font-semibold text-blue-600">{step.bearing}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 text-xs text-slate-500">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Route className="w-5 h-5" />
                  </div>
                  <div>Select your starting point and destination to compute optimal route.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* RIGHT MAIN MAP AREA                                      */}
      {/* ======================================================== */}
      <div className="flex-1 h-full min-h-[400px] relative overflow-hidden">
        {/* Google Maps Style Turn-by-Turn Voice Navigation HUD */}
        {isNavigatingLive && routeResult && (
          <LiveNavigationHUD
            routeResult={routeResult}
            destinationName={
              pointsOfInterest.find((x) => x.id === destId)?.name ||
              buildings.find((x) => x.id === destId || `${x.id.replace('-', '_')}_entrance` === destId)?.name ||
              'Campus Destination'
            }
            destinationBuildingId={selectedBuilding?.id || (destId.includes('bldg') ? destId : undefined)}
            onExit={handleStopLiveNavigation}
            onStepChange={(_stepIdx, coord) => {
              setLiveNavCoord(coord);
            }}
            onContinueIndoor={() => {
              handleStopLiveNavigation();
              let targetBldg = 'bldg-b';
              let targetFloor = 2;
              if (destId.includes('admin') || destId.includes('bldg_a')) {
                targetBldg = 'bldg-a';
                targetFloor = 0;
              } else if (destId.includes('lib')) {
                targetBldg = 'bldg-d';
                targetFloor = 0;
              } else if (destId.includes('pharm')) {
                targetBldg = 'bldg-c';
                targetFloor = 0;
              }
              navigate(`/indoor?building=${targetBldg}&floor=${targetFloor}&fromOutdoor=true`);
            }}
          />
        )}

        <CampusMap
          buildings={buildings}
          facilities={facilities}
          pointsOfInterest={pointsOfInterest}
          campusBoundary={campusBoundary}
          paths={paths}
          selectedBuilding={selectedBuilding}
          selectedPOI={selectedPOI}
          onSelectBuilding={(b) => setSelectedBuilding(b)}
          onSelectPOI={(poi) => {
            setSelectedPOI(poi);
            setDestId(poi.id);
          }}
          activeRouteGeometry={routeResult?.geometry}
          routeOrigin={routeOriginCoord}
          routeDestination={routeDestCoord}
          userLocation={
            isNavigatingLive && liveNavCoord
              ? { latitude: liveNavCoord[0], longitude: liveNavCoord[1], accuracy: 5 }
              : position
              ? { latitude: position.latitude, longitude: position.longitude, accuracy: position.accuracy }
              : null
          }
          isLocating={isTracking || isNavigatingLive}
          onTriggerLocate={() => {
            getCurrentLocation();
          }}
        />
      </div>
    </div>
  );
};
