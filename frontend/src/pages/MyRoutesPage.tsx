import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { api } from '../services/api';
import { RouteResult, CampusPath } from '../types/campus';
import { CampusMap } from '../components/navigation/CampusMap';
import {
  Route,
  Navigation,
  Clock,
  Milestone,
  CheckCircle2,
  Accessibility,
  ArrowRight,
  MapPin,
  Compass
} from 'lucide-react';

export const MyRoutesPage: React.FC = () => {
  const { buildings, facilities } = useCampus();

  const nodeOptions = [
    { id: 'gate_main', label: 'Main Entrance & Security Gate' },
    { id: 'parking_a', label: 'Vehicle Parking Area A' },
    { id: 'bldg_a_entrance', label: 'Main Admin Building (Entrance)' },
    { id: 'bldg_b_entrance', label: 'Engineering Block (AI & DS Entrance)' },
    { id: 'lib_entrance', label: 'Central Library (Entrance)' },
    { id: 'workshop_entrance', label: 'Central Workshop Hub (Entrance)' },
    { id: 'canteen_entrance', label: 'Student Cafeteria (Entrance)' },
    { id: 'sports_ground', label: 'Athletic & Sports Ground' },
  ];

  const [sourceNode, setSourceNode] = useState('gate_main');
  const [destNode, setDestNode] = useState('bldg_b_entrance');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [paths, setPaths] = useState<CampusPath[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    api.getPaths().then((res) => setPaths(res.data));
  }, []);

  const handleCalculateRoute = async () => {
    setIsCalculating(true);
    const result = await api.calculateRoute(sourceNode, destNode, wheelchairOnly);
    setRouteData(result);
    setIsCalculating(false);
  };

  useEffect(() => {
    handleCalculateRoute();
  }, [sourceNode, destNode, wheelchairOnly]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Route className="w-4 h-4" /> Pathfinding Algorithm
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campus Walking Route Planner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dijkstra shortest path calculation across structured YTC campus walkways.
          </p>
        </div>
      </div>

      {/* Main Grid: Control Panel + Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Planner Controls & Turn-by-Turn Steps */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Waypoints
            </h2>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Start Point:
              </label>
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              >
                {nodeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} disabled={opt.id === destNode}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Destination Point:
              </label>
              <select
                value={destNode}
                onChange={(e) => setDestNode(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              >
                {nodeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} disabled={opt.id === sourceNode}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Wheelchair Accessible Toggle */}
            <label className="flex items-center gap-2.5 pt-1 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={wheelchairOnly}
                onChange={(e) => setWheelchairOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <Accessibility className="w-4 h-4 text-blue-600" />
              Wheelchair accessible paths only
            </label>
          </div>

          {/* Route Summary Card */}
          {routeData && routeData.found && (
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-premium space-y-4">
              <div className="flex items-center justify-between text-xs text-blue-300 font-bold uppercase tracking-wider">
                <span>Dijkstra Shortest Path</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Optimal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Milestone className="w-3.5 h-3.5 text-blue-400" /> Distance
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {routeData.total_distance_meters} m
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Walk Time
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-1">
                    ~{routeData.estimated_walk_time_minutes} min
                  </div>
                </div>
              </div>

              {/* Turn-by-turn steps */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Walking Directions ({routeData.steps.length} steps)
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {routeData.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-800/40 p-2 rounded-xl">
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <div>
                        <div>{st.instruction}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Cols: Interactive Map with Highlighted Route Polyline */}
        <div className="lg:col-span-2 h-[550px]">
          <CampusMap
            buildings={buildings}
            facilities={facilities}
            paths={paths}
            activeRouteGeometry={routeData?.geometry}
          />
        </div>
      </div>
    </div>
  );
};
