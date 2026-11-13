import React, { useState } from 'react';
import { useCampus } from '../../context/CampusContext';
import {
  Settings,
  Shield,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Save
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { summary, refreshData } = useCampus();
  const [successMsg, setSuccessMsg] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [institutionName, setInstitutionName] = useState('Yashoda Technical Campus');
  const [shortName, setShortName] = useState('YTC Satara');
  const [address, setAddress] = useState('NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra, India');
  const [department, setDepartment] = useState('Artificial Intelligence and Data Science');
  const [defaultLat, setDefaultLat] = useState(17.7215);
  const [defaultLng, setDefaultLng] = useState(74.0205);
  const [walkingSpeed, setWalkingSpeed] = useState(1.2);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Campus application parameters updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearLocalCache = () => {
    if (!window.confirm('Clear all local browser offline cache and reset to default dataset?')) return;
    setIsResetting(true);
    try {
      localStorage.removeItem('ytc_recent_searches');
      localStorage.removeItem('ytc_saved_locations');
      sessionStorage.clear();
      setSuccessMsg('Local browser caches cleared.');
      refreshData();
    } catch {}
    setIsResetting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          Campus Navigation & Application Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Global institutional settings, algorithm parameters, and spatial caching options.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Institutional Metadata
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Institution Full Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Short Brand Name</label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Project Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Campus Physical Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Campus Center Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={defaultLat}
                  onChange={(e) => setDefaultLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Campus Center Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={defaultLng}
                  onChange={(e) => setDefaultLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Average Walking Speed (m/s)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="2.5"
                value={walkingSpeed}
                onChange={(e) => setWalkingSpeed(parseFloat(e.target.value) || 1.2)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard human pedestrian pace is 1.1 to 1.3 meters/sec (approx 4.3 km/h).
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Configuration Parameters
            </button>
          </form>
        </div>

        {/* Caching & Diagnostics */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Offline Caching & Client Storage
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              YTC Campus Navigator maintains a local cache of campus buildings, room indexes, and SVG blueprints to allow uninterrupted offline wayfinding during network drops.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleClearLocalCache}
                disabled={isResetting}
                className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Clear Local Browser Cache & Storage
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              System Environment & Version
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Application Version</span>
                <span className="font-mono font-bold text-slate-800">v4.0.0 (Production Release)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database Engine</span>
                <span className="font-mono font-bold text-slate-800">SQLite 3 (Migrated & Seeded)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pathfinding Algorithm</span>
                <span className="font-mono font-bold text-slate-800">NetworkX Dijkstra & A*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Map Rendering</span>
                <span className="font-mono font-bold text-slate-800">Leaflet.js & OpenStreetMap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
