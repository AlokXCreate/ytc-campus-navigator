import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  MapPin,
  Route,
  ArrowRight,
  Sparkles,
  Compass,
  Clock,
  TrendingUp,
  Search,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, buildings, facilities, setSelectedBuilding } = useCampus();

  const quickShortcuts = [
    { label: 'AI & DS Department', buildingId: 'bldg-b', floor: 2, icon: Sparkles, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Central Library', buildingId: 'bldg-d', floor: 0, icon: Building2, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'Principal Office', buildingId: 'bldg-a', floor: 0, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Student Cafeteria', buildingId: 'bldg-f', floor: 0, icon: MapPin, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/90 shadow-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Campus Navigation Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to YTC Campus Navigator
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Yashoda Technical Campus, Satara • Third Year AI &amp; Data Science Academic Project
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/explore')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
          >
            Open Interactive Map
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Statistics Cards (Derived from Seeded Database) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Buildings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary?.total_buildings ?? buildings.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active Academic &amp; Admin Blocks</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Classrooms &amp; Labs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary?.total_rooms ?? 11}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Mapped Classrooms &amp; Research Labs</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Facilities</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary?.total_facilities ?? facilities.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Canteen, Parking, Sports, ATM</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Indoor Blueprints</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary?.total_floor_plans ?? 2}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Digitized Multi-Level Floor Plans</div>
          </div>
        </div>
      </div>

      {/* Quick Location Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Quick Navigation Shortcuts
          </h2>
          <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('/directory')}>
            View full directory
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickShortcuts.map((sc) => (
            <button
              key={sc.label}
              onClick={() => {
                const b = buildings.find((x) => x.id === sc.buildingId);
                if (b) setSelectedBuilding(b);
                navigate('/indoor');
              }}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-subtle transition-all flex items-center gap-3 text-left group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${sc.color}`}>
                <sc.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {sc.label}
                </div>
                <div className="text-[11px] text-slate-500">Floor {sc.floor} • Tap to view</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Campus Directory Preview & Map Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Registered Buildings Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Buildings Directory</h3>
              <p className="text-xs text-slate-500">Seeded institutional locations with GPS coordinates &amp; floor counts</p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Map View <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {buildings.slice(0, 6).map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedBuilding(b);
                  navigate('/explore');
                }}
                className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {b.building_code.split('-')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{b.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{b.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">{b.total_floors} Floors</span>
                    <span className="text-blue-600">Lat: {b.latitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Academic Info & Ground-Truth Calibration Box */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-premium space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ground-Truth Survey Notice
            </div>
            <h4 className="text-lg font-bold text-white">Demonstrative Calibration</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstration points are calibrated around Wadhe Phata / Satara. Actual surveyed GPS coordinates and room benchmarks can be updated directly via the administrative portal or database seeder.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/about')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Institutional PRD &amp; Details
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-600" /> Route Pathfinder
            </div>
            <p className="text-xs text-slate-500">
              Calculate walking distance and time between any two campus points using Dijkstra's shortest path algorithm.
            </p>
            <button
              onClick={() => navigate('/routes')}
              className="w-full py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Route className="w-4 h-4 text-blue-600" />
              Open Walking Route Planner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
