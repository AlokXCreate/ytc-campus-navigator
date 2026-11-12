import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { FloorPlanViewer } from '../components/navigation/FloorPlanViewer';
import { api } from '../services/api';
import { FloorPlan, Room } from '../types/campus';
import {
  Layers,
  Building2,
  AlertCircle,
  Sparkles,
  Info,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IndoorNavPage: React.FC = () => {
  const navigate = useNavigate();
  const { buildings, selectedBuilding, setSelectedBuilding, selectedRoom, setSelectedRoom } = useCampus();
  
  // Default to Engineering Block (Building B) where AI & DS Dept is located
  const currentBuilding = selectedBuilding || buildings.find(b => b.id === 'bldg-b') || buildings[0];
  const [selectedFloor, setSelectedFloor] = useState<number>(() => {
    return currentBuilding?.available_floors.includes(2) ? 2 : (currentBuilding?.available_floors[0] ?? 0);
  });
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  useEffect(() => {
    if (!currentBuilding) return;

    const loadData = async () => {
      setIsLoadingPlans(true);
      const [plansRes, roomsRes] = await Promise.all([
        api.getFloorPlans(currentBuilding.id),
        api.getRooms({ building_id: currentBuilding.id })
      ]);
      setFloorPlans(plansRes.data);
      setRooms(roomsRes.data);
      setIsLoadingPlans(false);
    };

    loadData();
  }, [currentBuilding]);

  if (!currentBuilding) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading campus building data...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Layers className="w-4 h-4" /> Multi-Storey Indoor Navigator
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Indoor Navigation • {currentBuilding.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select floors to view classrooms, laboratories, and departmental cabins.
          </p>
        </div>

        <button
          onClick={() => navigate('/explore')}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <Compass className="w-4 h-4 text-blue-600" />
          Switch to Outdoor Map
        </button>
      </div>

      {/* Architectural Blueprint Accuracy Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Demonstration Disclaimer:</span> These floor plans are illustrative schematics generated for academic demonstration of the indoor navigation engine. They do not constitute official architectural CAD blueprints.
        </div>
      </div>

      {/* Main Floor Plan Viewer Component */}
      <div className="h-[650px]">
        <FloorPlanViewer
          buildings={buildings}
          currentBuilding={currentBuilding}
          floorPlans={floorPlans}
          selectedFloor={selectedFloor}
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectBuilding={(b) => {
            setSelectedBuilding(b);
            setSelectedFloor(b.available_floors[0] ?? 0);
          }}
          onSelectFloor={(fl) => setSelectedFloor(fl)}
          onSelectRoom={(r) => setSelectedRoom(r)}
        />
      </div>
    </div>
  );
};
