import React, { useState, useEffect } from 'react';
import { Building, FloorPlan, Room } from '../../types/campus';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  DoorOpen,
  Info,
  Building2,
  Sparkles,
  MapPin
} from 'lucide-react';

interface FloorPlanViewerProps {
  buildings: Building[];
  currentBuilding: Building;
  floorPlans: FloorPlan[];
  selectedFloor: number;
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectBuilding: (b: Building) => void;
  onSelectFloor: (floor: number) => void;
  onSelectRoom: (room: Room | null) => void;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  buildings,
  currentBuilding,
  floorPlans,
  selectedFloor,
  rooms,
  selectedRoom,
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [activePlan, setActivePlan] = useState<FloorPlan | null>(null);

  useEffect(() => {
    const match = floorPlans.find(
      (p) => p.building_id === currentBuilding.id && p.floor_number === selectedFloor
    );
    setActivePlan(match || null);
  }, [currentBuilding, selectedFloor, floorPlans]);

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomScale(1);

  // Filter rooms belonging to current building and floor
  const floorRooms = rooms.filter(
    (r) => r.building_id === currentBuilding.id && r.floor === selectedFloor
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Controls Toolbar */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
        {/* Building Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Building:</span>
          </div>
          <select
            value={currentBuilding.id}
            onChange={(e) => {
              const b = buildings.find((x) => x.id === e.target.value);
              if (b) {
                onSelectBuilding(b);
                onSelectFloor(b.available_floors[0] ?? 0);
              }
            }}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.building_code})
              </option>
            ))}
          </select>
        </div>

        {/* Floor Level Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
          {currentBuilding.available_floors.map((fl) => (
            <button
              key={fl}
              onClick={() => onSelectFloor(fl)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFloor === fl
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {fl === 0 ? 'Ground' : `Floor ${fl}`}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-500 w-12 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Floor-Plan Display Area */}
      <div className="relative flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4 min-h-[420px]">
        {activePlan ? (
          <div
            className="relative transition-transform duration-200 ease-out shadow-2xl rounded-xl overflow-hidden bg-white max-w-4xl w-full"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
          >
            {/* SVG Floor Plan Background */}
            <img
              src={activePlan.image_path}
              alt={`Floor Plan ${activePlan.floor_label || selectedFloor}`}
              className="w-full h-auto block select-none pointer-events-none"
            />

            {/* Interactive Room Pins Overlay */}
            {floorRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const leftPct = `${room.relative_x * 100}%`;
              const topPct = `${room.relative_y * 100}%`;

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(isSelected ? null : room)}
                  style={{ left: leftPct, top: topPct }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-150 focus:outline-none`}
                >
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-white ring-4 ring-blue-400/40 scale-110'
                        : 'bg-slate-900/90 text-white border-slate-700 hover:scale-105 hover:bg-blue-600'
                    }`}
                  >
                    <DoorOpen className="w-3 h-3 text-blue-300" />
                    <span>{room.room_number}</span>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900 text-white p-2 rounded-xl text-[11px] shadow-float z-30 pointer-events-none text-center">
                    <div className="font-bold">{room.room_name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{room.room_type.replace('_', ' ')}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Floor Plan Under Survey
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Indoor architectural blueprint for <span className="font-semibold text-slate-700">{currentBuilding.name} - Floor {selectedFloor}</span> is being digitized.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  const demoBldg = buildings.find((b) => b.id === 'bldg-b');
                  if (demoBldg) {
                    onSelectBuilding(demoBldg);
                    onSelectFloor(2);
                  }
                }}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                View Engineering Block (Floor 2 - AI&amp;DS)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Room Details Drawer */}
      {selectedRoom && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                Room {selectedRoom.room_number} • {selectedRoom.room_type.replace('_', ' ').toUpperCase()}
              </div>
              <div className="text-sm font-bold text-slate-900">
                {selectedRoom.room_name}
              </div>
              {selectedRoom.description && (
                <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                  {selectedRoom.description}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectRoom(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
