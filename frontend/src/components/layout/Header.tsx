import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  User as UserIcon,
  Menu,
  X,
  Building2,
  DoorOpen,
  MapPin,
  ChevronRight,
  Sun,
  CloudSun,
  Sparkles,
  LogIn
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { api } from '../../services/api';
import { SearchResult } from '../../types/campus';
import { getAssetUrl } from '../../utils/assets';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  onOpenProfileDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  onOpenProfileDrawer
}) => {
  const navigate = useNavigate();
  const {
    isOnline,
    userRole,
    currentUser,
    setAuthModalOpen,
    setSelectedBuilding,
    setSelectedRoom
  } = useCampus();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

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
      api.getBuildingById(item.id).then((b) => {
        if (b) setSelectedBuilding(b);
      });
    } else if (item.category === 'room') {
      navigate('/indoor');
      api.getRooms({ building_id: item.building_id || undefined, floor: item.floor !== null ? item.floor : undefined }).then((res) => {
        const found = res.data.find((r) => r.id === item.id);
        if (found) setSelectedRoom(found);
      });
    } else {
      navigate('/explore');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Institutional Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-amber-400/80 shadow-xs flex items-center justify-center shrink-0">
            <img
              src={getAssetUrl('/icons/ytc-college-logo.png')}
              alt="YTC Satara"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
              YTC CAMPUS NAVIGATOR
            </div>
            <div className="text-[10px] text-amber-600 font-bold leading-tight mt-0.5">
              Yashoda Tech Campus, Satara
            </div>
          </div>
        </div>
      </div>

      {/* Center: Global Location Search */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowResultsDropdown(true)}
            placeholder="Search AI labs, classrooms, library, buildings..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResultsDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 max-h-80 overflow-y-auto z-50">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                        item.category === 'building'
                          ? 'bg-blue-50 text-blue-600'
                          : item.category === 'room'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
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

      {/* Right Controls: Weather, Status, Notifications & Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">

        {/* Live Weather & Time Badge (Satara, MH) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-900 border border-amber-300/40 rounded-xl text-xs font-bold">
          <CloudSun className="w-4 h-4 text-amber-600" />
          <span>28&deg;C &bull; Satara, MH</span>
          <span className="text-slate-400">&bull;</span>
          <span className="font-mono text-slate-600">{currentTime}</span>
        </div>

        {/* Live API / Offline Badge */}
        <div
          title={isOnline ? "Connected to live FastAPI backend" : "Offline mode (Serving cached campus data)"}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Campus</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Campus updates"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 z-50">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Campus Updates</span>
                <span className="text-[10px] font-normal text-slate-500">Live</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                  <div className="font-bold text-blue-900">AI &amp; DS Dept Seminar</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">Seminar Hall A1 at 2:00 PM today.</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                  <div className="font-bold text-amber-900">Central Library Notice</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">Digital Reading Hall extended to 9:00 PM.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Sign-In Button */}
        {currentUser ? (
          <button
            onClick={onOpenProfileDrawer}
            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-all border border-slate-200/80 cursor-pointer shadow-xs"
            title="Open Account Profile"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/30 bg-slate-100 shrink-0">
              <img
                src={currentUser.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                {currentUser.full_name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold capitalize leading-none">
                {currentUser.role}
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

      </div>
    </header>
  );
};
