import React, { useState, useEffect, useRef } from 'react';
import { Building, Floor, Room, IndoorNavigationNode } from '../../types/campus';
import { getAssetUrl } from '../../utils/assets';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  DoorOpen,
  Building2,
  Sparkles,
  MapPin,
  Move,
  Footprints,
  Compass,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';

interface FloorPlanViewerProps {
  buildings: Building[];
  currentBuilding: Building;
  floors: Floor[];
  selectedFloor: number;
  rooms: Room[];
  selectedRoom: Room | null;
  routeCoordinates?: [number, number][]; // [[x, y], [x, y], ...] in normalized [0, 1]
  indoorNodes?: IndoorNavigationNode[];
  onSelectBuilding: (b: Building) => void;
  onSelectFloor: (floor: number) => void;
  onSelectRoom: (room: Room | null) => void;
  onSelectNode?: (nodeId: string) => void;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  buildings,
  currentBuilding,
  floors,
  selectedFloor,
  rooms,
  selectedRoom,
  routeCoordinates = [],
  indoorNodes = [],
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
  onSelectNode
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Floor object
  const activeFloor = floors.find(
    (f) => f.building_id === currentBuilding.id && f.floor_number === selectedFloor
  ) || (floors.length > 0 && floors[0].building_id === currentBuilding.id ? floors[0] : null);

  // Reset zoom & pan when switching building or floor
  useEffect(() => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  }, [currentBuilding.id, selectedFloor]);

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetView = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filter rooms belonging to current building and floor
  const floorRooms = rooms.filter(
    (r) => r.building_id === currentBuilding.id && r.floor === selectedFloor
  );

  // Filter nodes belonging to current floor (Stairs, Lifts, Entrance)
  const floorSpecialNodes = indoorNodes.filter(
    (n) => n.building_id === currentBuilding.id &&
           n.floor_number === selectedFloor &&
           ['staircase', 'lift', 'entrance'].includes(n.node_type)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full select-none">
      {/* Top Toolbar */}
      <div className="p-3 md:p-4 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        {/* Building Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Building:</span>
          </div>
          <select
            value={currentBuilding.id}
            onChange={(e) => {
              const b = buildings.find((x) => x.id === e.target.value);
              if (b) {
                onSelectBuilding(b);
                const bFloors = floors.filter(f => f.building_id === b.id);
                onSelectFloor(bFloors[0]?.floor_number ?? 0);
              }
            }}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 shadow-sm cursor-pointer"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.building_code})
              </option>
            ))}
          </select>
        </div>

        {/* Floor Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl overflow-x-auto max-w-full">
          {floors
            .filter((f) => f.building_id === currentBuilding.id)
            .sort((a, b) => a.floor_number - b.floor_number)
            .map((fl) => (
              <button
                key={fl.id}
                onClick={() => onSelectFloor(fl.floor_number)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  selectedFloor === fl.floor_number
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {fl.floor_label || (fl.floor_number === 0 ? 'Ground' : `Floor ${fl.floor_number}`)}
              </button>
            ))}
        </div>

        {/* Pan/Zoom Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 w-12 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            title="Reset Pan &amp; Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 bg-slate-100/90 overflow-hidden flex items-center justify-center min-h-[460px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {activeFloor ? (
          <div
            className="relative transition-transform duration-75 ease-out shadow-2xl rounded-2xl overflow-hidden bg-white max-w-4xl w-full border border-slate-200"
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
              transformOrigin: 'center center'
            }}
          >
            {/* SVG Floor Plan Background */}
            <img
              src={getAssetUrl(activeFloor.floor_plan_image)}
              alt={`Floor Plan ${activeFloor.floor_label || selectedFloor}`}
              className="w-full h-auto block select-none pointer-events-none"
              draggable={false}
            />

            {/* SVG Route Polyline Overlay */}
            {routeCoordinates.length > 1 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 1000 600"
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.5"/>
                  </filter>
                </defs>

                {/* Background Shadow Polyline */}
                <polyline
                  points={routeCoordinates.map(([x, y]) => `${x * 1000},${y * 600}`).join(' ')}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.3"
                />

                {/* Active Animated Polyline */}
                <polyline
                  points={routeCoordinates.map(([x, y]) => `${x * 1000},${y * 600}`).join(' ')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8,6"
                  filter="url(#routeGlow)"
                  className="animate-pulse"
                />

                {/* Waypoint Dots */}
                {routeCoordinates.map(([x, y], idx) => (
                  <circle
                    key={idx}
                    cx={x * 1000}
                    cy={y * 600}
                    r={idx === 0 || idx === routeCoordinates.length - 1 ? 7 : 4}
                    fill={idx === 0 ? '#10b981' : idx === routeCoordinates.length - 1 ? '#ef4444' : '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                ))}
              </svg>
            )}

            {/* Special Facility Markers (Stairs, Lifts, Entrance) */}
            {floorSpecialNodes.map((node) => {
              const leftPct = `${node.relative_x * 100}%`;
              const topPct = `${node.relative_y * 100}%`;

              const isStair = node.node_type === 'staircase';
              const isLift = node.node_type === 'lift';

              return (
                <div
                  key={node.id}
                  style={{ left: leftPct, top: topPct }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-none"
                >
                  <div
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 shadow-md border ${
                      isStair
                        ? 'bg-sky-50 text-sky-700 border-sky-400'
                        : isLift
                        ? 'bg-amber-50 text-amber-700 border-amber-400'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-400'
                    }`}
                  >
                    <span>{node.node_name}</span>
                  </div>
                </div>
              );
            })}

            {/* Interactive Room Pins Overlay */}
            {floorRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const leftPct = `${room.relative_x * 100}%`;
              const topPct = `${room.relative_y * 100}%`;

              return (
                <button
                  key={room.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoom(isSelected ? null : room);
                  }}
                  style={{ left: leftPct, top: topPct }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-150 focus:outline-none"
                >
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-amber-300 ring-4 ring-blue-500/30 scale-110 shadow-blue-500/50'
                        : 'bg-slate-900/90 text-white border-slate-700 hover:scale-105 hover:bg-blue-600'
                    }`}
                  >
                    <DoorOpen className="w-3.5 h-3.5 text-blue-300" />
                    <span>{room.room_number}</span>
                  </div>

                  {/* Room Name Badge underneath */}
                  <div className="text-[9px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded-md shadow-xs mt-1 border border-slate-200/60 max-w-[120px] truncate">
                    {room.room_name}
                  </div>

                  {/* Hover Tooltip Card */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-2xl z-30 pointer-events-none text-center border border-slate-700">
                    <div className="font-bold text-white text-[12px]">{room.room_name}</div>
                    <div className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider mt-0.5">
                      {room.room_type.replace('_', ' ')} • Room {room.room_number}
                    </div>
                    {room.description && (
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {room.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Floor Plan Under Survey
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Architectural blueprint for <span className="font-semibold text-slate-700">{currentBuilding.name} - Floor {selectedFloor}</span> is being prepared.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  const engBldg = buildings.find((b) => b.id === 'bldg-b');
                  if (engBldg) {
                    onSelectBuilding(engBldg);
                    onSelectFloor(2);
                  }
                }}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                View Engineering Block (Floor 2 - AI&amp;DS)
              </button>
            </div>
          </div>
        )}

        {/* Floating Pan/Drag Notice */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 shadow-xs flex items-center gap-1.5 pointer-events-none">
          <Move className="w-3 h-3 text-slate-400" />
          <span>Click &amp; drag to pan • Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};
