import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { CampusMap } from '../components/navigation/CampusMap';
import {
  Compass,
  Building2,
  MapPin,
  Search,
  ExternalLink,
  Layers,
  ChevronRight,
  Route
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExploreCampusPage: React.FC = () => {
  const navigate = useNavigate();
  const { buildings, facilities, selectedBuilding, setSelectedBuilding } = useCampus();
  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'academic' | 'facility'>('all');

  const filteredBuildings = buildings.filter((b) =>
    b.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    b.building_code.toLowerCase().includes(filterQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredFacilities = facilities.filter((f) =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    f.facility_type.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-8 h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle shrink-0">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Explore Yashoda Technical Campus
          </h1>
          <p className="text-xs text-slate-500">
            Interactive outdoor campus map • Tap markers to inspect buildings and facilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/indoor')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            Indoor Floors
          </button>
          <button
            onClick={() => navigate('/routes')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Route className="w-4 h-4" />
            Get Directions
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout: Sidebar Directory + Leaflet Map */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Left Side: Searchable Location List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter locations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {(['all', 'academic', 'facility'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location Scroll List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {/* Buildings */}
            {(activeCategory === 'all' || activeCategory === 'academic') && (
              <>
                <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Buildings ({filteredBuildings.length})
                </div>
                {filteredBuildings.map((b) => {
                  const isSelected = selectedBuilding?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBuilding(b)}
                      className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900">{b.name}</div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {b.building_code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{b.description}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{b.total_floors} Floors</span>
                        <span className="text-blue-600 font-semibold hover:underline" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBuilding(b);
                          navigate('/indoor');
                        }}>
                          View Indoor →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Facilities */}
            {(activeCategory === 'all' || activeCategory === 'facility') && (
              <>
                <div className="px-2 pt-3 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Facilities ({filteredFacilities.length})
                </div>
                {filteredFacilities.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900">{f.name}</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        {f.facility_type}
                      </span>
                    </div>
                    {f.opening_information && (
                      <div className="text-[10px] text-slate-500 mt-1">⏱ {f.opening_information}</div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Side: Leaflet Interactive Map */}
        <div className="lg:col-span-3 h-full min-h-[400px]">
          <CampusMap
            buildings={filteredBuildings}
            facilities={filteredFacilities}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={(b) => setSelectedBuilding(b)}
          />
        </div>
      </div>
    </div>
  );
};
