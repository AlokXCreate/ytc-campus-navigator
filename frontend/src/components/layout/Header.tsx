import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  User,
  Menu,
  X,
  Compass,
  Building2,
  DoorOpen,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { api } from '../../services/api';
import { SearchResult } from '../../types/campus';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const navigate = useNavigate();
  const { isOnline, userRole, setUserRole, setSelectedBuilding, setSelectedRoom } = useCampus();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await api.searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowResultsDropdown(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResultsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: SearchResult) => {
    setShowResultsDropdown(false);
    setSearchQuery('');

    if (item.category === 'building') {
      navigate('/explore');
      api.getBuildingById(item.id).then(b => {
        if (b) setSelectedBuilding(b);
      });
    } else if (item.category === 'room') {
      navigate('/indoor');
      // Set room selection
      api.getRooms({ building_id: item.building_id || undefined, floor: item.floor !== null ? item.floor : undefined }).then(res => {
        const found = res.data.find(r => r.id === item.id);
        if (found) setSelectedRoom(found);
      });
    } else {
      navigate('/explore');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Institutional Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-tight text-slate-900 leading-none">
              YTC NAVIGATOR
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Yashoda Tech Campus, Satara
            </div>
          </div>
        </div>
      </div>

      {/* Center: Global Location Search */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowResultsDropdown(true)}
            placeholder="Search buildings, AI&DS labs, classrooms, canteen..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResultsDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-float border border-slate-200/90 py-2 max-h-80 overflow-y-auto z-50">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      item.category === 'building'
                        ? 'bg-blue-50 text-blue-600'
                        : item.category === 'room'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.category === 'building' && <Building2 className="w-4 h-4" />}
                      {item.category === 'room' && <DoorOpen className="w-4 h-4" />}
                      {item.category === 'facility' && <MapPin className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 leading-tight">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.subtitle}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching locations found for "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Connection Badge, Notification, Role Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Indicator */}
        <div
          title={isOnline ? "Connected to live FastAPI backend" : "Offline mode (Serving cached campus data)"}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live API</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Cached</span>
            </>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Campus updates"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-float border border-slate-200/90 p-3 z-50">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-2 border-b border-slate-100">
                Campus Updates
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="font-semibold text-blue-900">AI &amp; DS Dept Seminar</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">Seminar Hall A1 at 2:00 PM today.</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-800">Library Digital Section</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">Floor 1 high-speed network updated.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Role Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-medium text-slate-700"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
              {userRole[0].toUpperCase()}
            </div>
            <span className="capitalize hidden sm:inline">{userRole}</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-float border border-slate-200/90 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                Select View Role
              </div>
              {(['student', 'faculty', 'visitor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 capitalize font-medium flex items-center justify-between ${
                    userRole === r ? 'text-blue-600 font-semibold' : 'text-slate-700'
                  }`}
                >
                  {r}
                  {userRole === r && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
