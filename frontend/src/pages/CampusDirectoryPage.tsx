import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampus } from '../context/CampusContext';
import {
  FolderTree,
  Building2,
  BookOpen,
  Coffee,
  Trophy,
  Car,
  Home,
  Briefcase,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

export const CampusDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { buildings, facilities, setSelectedBuilding } = useCampus();
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'admin' | 'amenity' | 'residential' | 'sports'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const directoryCategories = [
    { id: 'all', label: 'All Sections', icon: FolderTree },
    { id: 'academic', label: 'Academic & Engineering', icon: Building2 },
    { id: 'admin', label: 'Administrative Cells', icon: Briefcase },
    { id: 'amenity', label: 'Library & Canteen', icon: Coffee },
    { id: 'residential', label: 'Student Hostels', icon: Home },
    { id: 'sports', label: 'Sports & Parking', icon: Trophy },
  ];

  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.building_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.description.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'academic') return b.building_type.includes('academic') || b.building_type.includes('workshop');
    if (activeTab === 'admin') return b.building_type.includes('administrative');
    if (activeTab === 'amenity') return b.building_type === 'library' || b.building_type === 'amenity';
    if (activeTab === 'residential') return b.building_type === 'residential';
    if (activeTab === 'sports') return b.building_type === 'sports';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <FolderTree className="w-4 h-4" /> Comprehensive Index
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            YTC Campus Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Classified index of academic blocks, administrative offices, departments, libraries, and amenities.
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search directory by name, block, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {directoryCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-all ${
                    activeTab === cat.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBuildings.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-blue-300 transition-all p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  {b.building_type.replace('_', ' ')}
                </span>
                <span className="text-xs font-extrabold text-slate-400">
                  {b.building_code}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {b.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {b.available_floors.map((fl) => (
                  <span
                    key={fl}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200"
                  >
                    {fl === 0 ? 'Ground' : `Floor ${fl}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedBuilding(b);
                  navigate('/explore');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1"
              >
                Outdoor Pin <ExternalLink className="w-3 h-3" />
              </button>

              <button
                onClick={() => {
                  setSelectedBuilding(b);
                  navigate('/indoor');
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                Floor Navigator
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
