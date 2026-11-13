import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Building2,
  DoorOpen,
  MapPin,
  Compass,
  Route,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { api } from '../services/api';
import { SearchResult } from '../types/campus';

export const FindLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { buildings, setSelectedBuilding, setSelectedRoom } = useCampus();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'building' | 'room' | 'facility'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setIsSearching(true);
      const query = searchTerm.trim() || ' ';
      const searchRes = await api.searchLocations(query);
      setResults(searchRes);
      setIsSearching(false);
    };

    const timer = setTimeout(fetchResults, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredResults = results.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleViewOnMap = (item: SearchResult) => {
    if (item.building_id) {
      const b = buildings.find((x) => x.id === item.building_id);
      if (b) setSelectedBuilding(b);
    }
    navigate('/explore');
  };

  const handleNavigateIndoor = (item: SearchResult) => {
    if (item.category === 'room') {
      const bldgId = item.building_id || 'bldg-b';
      const floorNum = item.floor !== undefined ? item.floor : 0;
      navigate(`/indoor?building=${bldgId}&floor=${floorNum}&room=${item.id}`);
    } else if (item.category === 'building') {
      navigate(`/indoor?building=${item.id}&floor=0`);
    } else {
      navigate('/routes');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Find a Campus Location
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Search across classrooms, AI &amp; DS laboratories, department offices, exam cells, libraries, and campus facilities.
          </p>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, room number (e.g. ENG-204), laboratory, or department..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
            {(['all', 'building', 'room', 'facility'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Results' : `${cat}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Disclaimers */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-bold text-slate-800">{filteredResults.length}</span> matching locations
        </span>
        <span className="hidden sm:inline">Case-insensitive multi-field search</span>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResults.map((item) => (
          <div
            key={`${item.category}-${item.id}`}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:border-blue-300 hover:shadow-premium transition-all p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.category === 'building'
                    ? 'bg-blue-50 text-blue-600'
                    : item.category === 'room'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {item.category === 'building' && <Building2 className="w-5 h-5" />}
                  {item.category === 'room' && <DoorOpen className="w-5 h-5" />}
                  {item.category === 'facility' && <MapPin className="w-5 h-5" />}
                </div>

                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  item.category === 'building'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : item.category === 'room'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {item.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {item.title}
                </h3>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {item.subtitle}
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleViewOnMap(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                View on Map
              </button>

              <button
                onClick={() => handleNavigateIndoor(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {item.category === 'room' ? (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    Indoor View
                  </>
                ) : (
                  <>
                    <Route className="w-3.5 h-3.5" />
                    Navigate
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredResults.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No matching locations found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with broader terms like "AI", "Lab", "ENG", "Library", or "Office".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
