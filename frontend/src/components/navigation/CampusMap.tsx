import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building, Facility, CampusPath } from '../../types/campus';
import {
  Navigation,
  Compass,
  Building2,
  MapPin,
  Layers,
  Maximize2,
  LocateFixed,
  Info,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom Map Panner Component
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Create custom DOM markers
const createBuildingIcon = (code: string, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-building-marker',
    html: `
      <div style="
        background: ${isSelected ? '#2563eb' : '#0f172a'};
        color: white;
        border: 2px solid ${isSelected ? '#ffffff' : '#60a5fa'};
        border-radius: 8px;
        padding: 3px 6px;
        font-family: Inter, sans-serif;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#38bdf8;"></span>
        ${code}
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });
};

const createFacilityIcon = (type: string) => {
  return L.divIcon({
    className: 'custom-facility-marker',
    html: `
      <div style="
        background: #059669;
        color: white;
        border: 2px solid #ffffff;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(5, 150, 105, 0.4);
        transform: translate(-50%, -50%);
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

interface CampusMapProps {
  buildings: Building[];
  facilities: Facility[];
  paths?: CampusPath[];
  selectedBuilding?: Building | null;
  onSelectBuilding?: (b: Building) => void;
  center?: [number, number];
  zoom?: number;
  activeRouteGeometry?: [number, number][];
}

export const CampusMap: React.FC<CampusMapProps> = ({
  buildings,
  facilities,
  paths = [],
  selectedBuilding,
  onSelectBuilding,
  center = [17.7215, 74.0205],
  zoom = 17,
  activeRouteGeometry,
}) => {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showWalkways, setShowWalkways] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (selectedBuilding) {
      setMapCenter([selectedBuilding.latitude, selectedBuilding.longitude]);
      setMapZoom(18);
    }
  }, [selectedBuilding]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
          setMapZoom(18);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation note:", err.message);
          // Default to campus entrance demonstration point if permission denied
          setUserLocation([17.7210, 74.0190]);
          setMapCenter([17.7210, 74.0190]);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100">
      {/* Map Control Overlay (Top-Right) */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
        {/* Layer Toggle Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-float border border-slate-200/90 space-y-1.5 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Map Layers
          </div>
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
              checked={showFacilities}
              onChange={(e) => setShowFacilities(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            Facilities ({facilities.length})
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={showWalkways}
              onChange={(e) => setShowWalkways(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            Walkways &amp; Paths
          </label>
        </div>

        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-800 p-2.5 rounded-xl shadow-float border border-slate-200/90 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          title="Current GPS Location"
        >
          <LocateFixed className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Coordinate & Accuracy Notice (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[500] max-w-xs bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-subtle text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">YTC Satara Campus Map:</span> Structured editable coordinates. Replaceable with surveyed campus benchmarks.
        </div>
      </div>

      {/* Actual Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* OpenStreetMap Basemap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Walkway Paths Layer */}
        {showWalkways &&
          paths.map((p) => {
            if (!p.geometry || p.geometry.length < 2) return null;
            return (
              <Polyline
                key={p.id}
                positions={p.geometry}
                pathOptions={{
                  color: '#94a3b8',
                  weight: 3,
                  dashArray: '4, 4',
                  opacity: 0.7,
                }}
              />
            );
          })}

        {/* Active Route Highlight (if provided) */}
        {activeRouteGeometry && activeRouteGeometry.length > 1 && (
          <Polyline
            positions={activeRouteGeometry}
            pathOptions={{
              color: '#2563eb',
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}

        {/* Building Markers */}
        {showBuildings &&
          buildings.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <Marker
                key={b.id}
                position={[b.latitude, b.longitude]}
                icon={createBuildingIcon(b.building_code, isSelected)}
                eventHandlers={{
                  click: () => onSelectBuilding && onSelectBuilding(b),
                }}
              >
                <Popup>
                  <div className="space-y-2 p-1 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      <Building2 className="w-3.5 h-3.5" />
                      {b.building_code} • {b.total_floors} Floors
                    </div>
                    <div className="font-bold text-slate-900 text-sm leading-tight">
                      {b.name}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {b.description}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
                      <button
                        onClick={() => navigate(`/indoor`)}
                        className="flex-1 py-1 px-2 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        Indoor Floors
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => navigate(`/routes`)}
                        className="py-1 px-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                      >
                        Route Here
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Facility Markers */}
        {showFacilities &&
          facilities.map((f) => (
            <Marker
              key={f.id}
              position={[f.latitude, f.longitude]}
              icon={createFacilityIcon(f.facility_type)}
            >
              <Popup>
                <div className="space-y-1.5 p-1 min-w-[180px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {f.facility_type}
                  </div>
                  <div className="font-bold text-slate-900 text-sm leading-tight">
                    {f.name}
                  </div>
                  {f.description && (
                    <p className="text-xs text-slate-600">{f.description}</p>
                  )}
                  {f.opening_information && (
                    <div className="text-[11px] text-slate-500 font-medium bg-slate-50 p-1.5 rounded-md border border-slate-100">
                      ⏱ {f.opening_information}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'user-pos-marker',
              html: `
                <div style="
                  background: #ef4444;
                  border: 3px solid #ffffff;
                  border-radius: 50%;
                  width: 18px;
                  height: 18px;
                  box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.35);
                  transform: translate(-50%, -50%);
                "></div>
              `,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-900">Your Current Position</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
