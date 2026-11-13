import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { Building, Facility, PointOfInterest, CampusBoundary, CampusPath } from '../../types/campus';
import {
  Compass,
  Layers,
  LocateFixed,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Navigation,
  Sparkles,
  BookOpen,
  Coffee,
  Trophy,
  Car,
  Home,
  DoorOpen,
  Briefcase,
  Map as MapIcon,
  Satellite,
  Mountain,
  Globe,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type MapStyleType = 'google_hybrid' | 'google_streets' | 'google_terrain' | 'osm' | 'carto_light';

// Custom Map Panner & Bounds Controller
const MapController: React.FC<{
  center?: [number, number];
  zoom?: number;
  fitBoundsCoords?: [number, number][];
}> = ({ center, zoom, fitBoundsCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (fitBoundsCoords && fitBoundsCoords.length > 1) {
      const bounds = L.latLngBounds(fitBoundsCoords.map((c) => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18, animate: true });
    } else if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, fitBoundsCoords, map]);

  return null;
};

// Category SVG Icons generator for Markers
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'academic':
    case 'academic_engineering':
      return { bg: '#2563eb', border: '#ffffff', glow: 'rgba(37, 99, 235, 0.4)' };
    case 'department':
      return { bg: '#4f46e5', border: '#ffffff', glow: 'rgba(79, 70, 229, 0.4)' };
    case 'laboratory':
      return { bg: '#7c3aed', border: '#ffffff', glow: 'rgba(124, 58, 237, 0.4)' };
    case 'library':
      return { bg: '#0284c7', border: '#ffffff', glow: 'rgba(2, 132, 199, 0.4)' };
    case 'admin':
    case 'administrative_academic':
      return { bg: '#0f172a', border: '#ffffff', glow: 'rgba(15, 23, 42, 0.4)' };
    case 'hostel':
    case 'residential':
      return { bg: '#ea580c', border: '#ffffff', glow: 'rgba(234, 88, 12, 0.4)' };
    case 'canteen':
    case 'amenity':
      return { bg: '#d97706', border: '#ffffff', glow: 'rgba(217, 119, 6, 0.4)' };
    case 'sports':
      return { bg: '#16a34a', border: '#ffffff', glow: 'rgba(22, 163, 74, 0.4)' };
    case 'parking':
      return { bg: '#475569', border: '#ffffff', glow: 'rgba(71, 85, 105, 0.4)' };
    case 'gate':
      return { bg: '#dc2626', border: '#ffffff', glow: 'rgba(220, 38, 38, 0.4)' };
    default:
      return { bg: '#059669', border: '#ffffff', glow: 'rgba(5, 150, 105, 0.4)' };
  }
};

const createPOIIcon = (category: string, name: string, isSelected: boolean) => {
  const { bg, border, glow } = getCategoryColor(category);
  const size = isSelected ? 34 : 28;

  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
        <div style="
          background: ${bg};
          color: white;
          border: 2px solid ${isSelected ? '#fbbf24' : border};
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px ${glow};
          transition: transform 0.2s ease;
          ${isSelected ? 'transform: scale(1.15);' : ''}
        ">
          <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
          </svg>
        </div>
        <div style="
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(4px);
          color: #f8fafc;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          margin-top: 3px;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${name}
        </div>
      </div>
    `,
    iconSize: [size, size + 20],
    iconAnchor: [size / 2, size + 20],
  });
};

const createRouteEndpointIcon = (type: 'start' | 'end') => {
  const isStart = type === 'start';
  const color = isStart ? '#10b981' : '#ef4444';
  const label = isStart ? 'A' : 'B';

  return L.divIcon({
    className: 'route-endpoint-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%);
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface CampusMapProps {
  center?: [number, number];
  zoom?: number;
  buildings?: Building[];
  facilities?: Facility[];
  pointsOfInterest?: PointOfInterest[];
  campusBoundary?: CampusBoundary | null;
  paths?: CampusPath[];
  selectedBuilding?: Building | null;
  selectedPOI?: PointOfInterest | null;
  activeRouteGeometry?: [number, number][];
  routeOrigin?: [number, number] | null;
  routeDestination?: [number, number] | null;
  userLocation?: { latitude: number; longitude: number; accuracy?: number } | null;
  onSelectBuilding?: (building: Building) => void;
  onSelectPOI?: (poi: PointOfInterest) => void;
  onTriggerLocate?: () => void;
  isLocating?: boolean;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  center = [17.7215, 74.0205],
  zoom = 17,
  buildings = [],
  facilities = [],
  pointsOfInterest = [],
  campusBoundary = null,
  paths = [],
  selectedBuilding = null,
  selectedPOI = null,
  activeRouteGeometry = [],
  routeOrigin,
  routeDestination,
  userLocation,
  onSelectBuilding,
  onSelectPOI,
  onTriggerLocate,
  isLocating = false,
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map Basemap Style
  const [mapStyle, setMapStyle] = useState<MapStyleType>('google_hybrid');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Layer Toggles
  const [showPOIs, setShowPOIs] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showWalkways, setShowWalkways] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showRoutePolyline, setShowRoutePolyline] = useState(true);

  // Controls UI State
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // Dynamic map center & zoom
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);
  const [fitBoundsCoords, setFitBoundsCoords] = useState<[number, number][] | undefined>(undefined);

  // Update bounds when route geometry changes
  useEffect(() => {
    if (activeRouteGeometry && activeRouteGeometry.length > 1) {
      setFitBoundsCoords(activeRouteGeometry);
    }
  }, [activeRouteGeometry]);

  // Center on selected building or POI
  useEffect(() => {
    if (selectedPOI) {
      setMapCenter([selectedPOI.latitude, selectedPOI.longitude]);
      setMapZoom(18);
    } else if (selectedBuilding) {
      setMapCenter([selectedBuilding.latitude, selectedBuilding.longitude]);
      setMapZoom(18);
    }
  }, [selectedPOI, selectedBuilding]);

  const handleResetMap = () => {
    setFitBoundsCoords(undefined);
    setMapCenter(center);
    setMapZoom(17);
  };

  const handleToggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Convert GeoJSON boundary polygon coordinates if available
  const boundaryPolygonCoords: [number, number][] = React.useMemo(() => {
    if (!campusBoundary?.geojson_data?.geometry?.coordinates) return [];
    try {
      const ring = (campusBoundary.geojson_data.geometry.coordinates as any)[0];
      return ring.map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
    } catch {
      return [];
    }
  }, [campusBoundary]);

  return (
    <div
      ref={mapContainerRef}
      className={`relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900 ${
        isFullscreen ? 'rounded-none border-0' : ''
      }`}
    >
      {/* Top-Left Floating Map Style Selector Bar (Google Maps Hybrid / Streets / OSM) */}
      <div className="absolute top-4 left-4 z-[500] flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-float border border-slate-200/90 text-xs font-bold">
        <button
          onClick={() => setMapStyle('google_hybrid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            mapStyle === 'google_hybrid'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Google Maps Crystal-Clear Satellite Hybrid"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Google Satellite</span>
        </button>

        <button
          onClick={() => setMapStyle('google_streets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            mapStyle === 'google_streets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Google Maps Standard Streets"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Google Streets</span>
        </button>

        <button
          onClick={() => setMapStyle('osm')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
            mapStyle === 'osm'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="OpenStreetMap Classic"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden md:inline">OSM</span>
        </button>

        {/* External Google Maps Button */}
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=17.7215,74.0205"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-300 transition-colors"
          title="Open Campus in Google Maps App"
        >
          <ExternalLink className="w-3 h-3 text-amber-700" />
          <span className="hidden lg:inline text-[11px]">Open Google Maps</span>
        </a>
      </div>

      {/* Floating Action Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
        {/* Layer Selector Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayersDropdown(!showLayersDropdown)}
            className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-700 rounded-xl shadow-float border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Map Features &amp; Layers"
          >
            <Layers className="w-4 h-4 text-blue-600" />
          </button>

          {showLayersDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-float border border-slate-200/90 space-y-2 text-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100">
                Visible Layers
              </div>
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={showPOIs}
                  onChange={(e) => setShowPOIs(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                Campus POIs ({pointsOfInterest.length})
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={showBuildings}
                  onChange={(e) => setShowBuildings(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                Buildings ({buildings.length})
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={showWalkways}
                  onChange={(e) => setShowWalkways(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                Walkways ({paths.length})
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={(e) => setShowBoundary(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                Campus Perimeter
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={showRoutePolyline}
                  onChange={(e) => setShowRoutePolyline(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                Active Route Path
              </label>
            </div>
          )}
        </div>

        {/* Locate Me (GPS) Button */}
        <button
          onClick={onTriggerLocate}
          disabled={isLocating}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-700 rounded-xl shadow-float border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Locate my position (GPS)"
        >
          <LocateFixed className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        {/* Reset / Fit Bounds Button */}
        <button
          onClick={handleResetMap}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-700 rounded-xl shadow-float border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Reset to Campus Center"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-700 rounded-xl shadow-float border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Map Legend Toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-700 rounded-xl shadow-float border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Map Legend"
        >
          <Info className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Map Legend Drawer (Bottom-Right) */}
      {showLegend && (
        <div className="absolute bottom-12 right-4 z-[500] w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-float border border-slate-200/90 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-bold uppercase tracking-wider text-[10px] text-slate-400">
            <span>Campus Map Legend</span>
            <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Academic Block</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Department</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Research Lab</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-600" /> Central Library</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-900" /> Admin Office</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Cafeteria</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600" /> Student Hostel</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Sports Complex</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Campus Gate</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Parking Area</span>
          </div>
        </div>
      )}

      {/* Accuracy & Ground-truth Notice (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[500] max-w-sm bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-subtle text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">YTC Wadhe Phata Campus:</span> High-resolution geospatial tiles &amp; pedestrian network.
        </div>
      </div>

      {/* Main Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={mapCenter} zoom={mapZoom} fitBoundsCoords={fitBoundsCoords} />

        {/* Dynamically Swapped Tile Layer */}
        {mapStyle === 'google_hybrid' && (
          <TileLayer
            attribution='&copy; Google Maps Hybrid Imagery'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {mapStyle === 'google_streets' && (
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {mapStyle === 'google_terrain' && (
          <TileLayer
            attribution='&copy; Google Maps Terrain'
            url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}

        {mapStyle === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {mapStyle === 'carto_light' && (
          <TileLayer
            attribution='&copy; CartoDB Positron'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        )}

        {/* Campus Boundary Polygon */}
        {showBoundary && boundaryPolygonCoords.length > 2 && (
          <Polygon
            positions={boundaryPolygonCoords}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#60a5fa',
              fillOpacity: 0.12,
              weight: 2.5,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Walkway Paths Network */}
        {showWalkways &&
          paths.map((p) => {
            if (!p.geometry || p.geometry.length < 2) return null;
            return (
              <Polyline
                key={p.id}
                positions={p.geometry}
                pathOptions={{
                  color: mapStyle === 'google_hybrid' ? '#67e8f9' : '#334155',
                  weight: 3.5,
                  dashArray: '5, 5',
                  opacity: 0.85,
                }}
              />
            );
          })}

        {/* Active Walking Route Polyline */}
        {showRoutePolyline && activeRouteGeometry && activeRouteGeometry.length > 1 && (
          <>
            <Polyline
              positions={activeRouteGeometry}
              pathOptions={{
                color: '#38bdf8',
                weight: 6.5,
                opacity: 0.95,
              }}
            />
            {/* Route Waypoint Dots */}
            {activeRouteGeometry.map((coord, i) => (
              <Circle
                key={`wp-${i}`}
                center={coord}
                radius={1.5}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#0284c7',
                  fillOpacity: 1,
                  weight: 2,
                }}
              />
            ))}
          </>
        )}

        {/* Route Origin Marker (A) */}
        {routeOrigin && (
          <Marker position={routeOrigin} icon={createRouteEndpointIcon('start')}>
            <Popup>
              <div className="text-xs font-bold text-emerald-700">Route Origin Point (Start)</div>
            </Popup>
          </Marker>
        )}

        {/* Route Destination Marker (B) */}
        {routeDestination && (
          <Marker position={routeDestination} icon={createRouteEndpointIcon('end')}>
            <Popup>
              <div className="text-xs font-bold text-red-700">Route Destination Point (End)</div>
            </Popup>
          </Marker>
        )}

        {/* Points of Interest Markers */}
        {showPOIs &&
          pointsOfInterest.map((poi) => {
            const isSelected = selectedPOI?.id === poi.id;
            return (
              <Marker
                key={poi.id}
                position={[poi.latitude, poi.longitude]}
                icon={createPOIIcon(poi.category, poi.name, isSelected)}
                eventHandlers={{
                  click: () => onSelectPOI && onSelectPOI(poi),
                }}
              >
                <Popup>
                  <div className="space-y-2 p-1 min-w-[210px]">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      <span>{poi.category}</span>
                      {poi.building_name && <span className="text-slate-400 truncate max-w-[100px]">{poi.building_name}</span>}
                    </div>
                    <div className="font-bold text-slate-900 text-sm leading-tight">
                      {poi.name}
                    </div>
                    {poi.description && (
                      <p className="text-xs text-slate-600 leading-snug">
                        {poi.description}
                      </p>
                    )}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
                      <button
                        onClick={() => onSelectPOI && onSelectPOI(poi)}
                        className="flex-1 py-1 px-2.5 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        Navigate Here
                      </button>
                      {poi.building_id && (
                        <button
                          onClick={() => navigate('/indoor')}
                          className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                        >
                          Floor Plan
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* GPS Live User Location & Accuracy Circle */}
        {userLocation && (
          <>
            {userLocation.accuracy && userLocation.accuracy > 0 && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#60a5fa',
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '3, 3',
                }}
              />
            )}
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={L.divIcon({
                className: 'user-gps-marker',
                html: `
                  <div style="position: relative; width: 22px; height: 22px;">
                    <div style="
                      position: absolute;
                      width: 22px;
                      height: 22px;
                      border-radius: 50%;
                      background: rgba(37, 99, 235, 0.4);
                      animation: pulse 2s infinite;
                    "></div>
                    <div style="
                      position: absolute;
                      top: 3px;
                      left: 3px;
                      width: 16px;
                      height: 16px;
                      border-radius: 50%;
                      background: #0284c7;
                      border: 3px solid #ffffff;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    "></div>
                  </div>
                `,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              })}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="text-xs font-bold text-slate-900">Your Current Position</div>
                  <div className="text-[11px] text-slate-500">
                    Accuracy: ±{Math.round(userLocation.accuracy || 10)} meters
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};
