import React from 'react';
import { AdminStats } from '../../types/campus';
import {
  Building2,
  Layers,
  DoorOpen,
  MapPin,
  Route,
  Network,
  Users,
  AlertTriangle,
  History,
  Plus,
  Upload,
  ArrowRight
} from 'lucide-react';

interface AdminOverviewProps {
  stats: AdminStats | null;
  onNavigateTab: (tab: string) => void;
  onQuickAction: (action: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  onNavigateTab,
  onQuickAction
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
        Loading real-time campus spatial metrics...
      </div>
    );
  }

  const statCards = [
    { label: 'Buildings', value: stats.total_buildings, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', tab: 'buildings' },
    { label: 'Floors', value: stats.total_floors, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50', tab: 'floors' },
    { label: 'Classrooms & Rooms', value: stats.total_rooms, icon: DoorOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'rooms' },
    { label: 'Facilities & POIs', value: stats.total_facilities + stats.total_pois, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'facilities' },
    { label: 'Outdoor Walkways', value: stats.total_outdoor_paths, icon: Route, color: 'text-purple-600', bg: 'bg-purple-50', tab: 'outdoor_paths' },
    { label: 'Indoor Nodes & Links', value: `${stats.total_indoor_nodes} / ${stats.total_indoor_edges}`, icon: Network, color: 'text-teal-600', bg: 'bg-teal-50', tab: 'indoor_paths' },
    { label: 'Vertical Transitions', value: stats.total_floor_transitions, icon: Layers, color: 'text-cyan-600', bg: 'bg-cyan-50', tab: 'indoor_paths' },
    { label: 'Registered Admins', value: stats.total_users, icon: Users, color: 'text-slate-700', bg: 'bg-slate-100', tab: 'users' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 rounded-3xl p-6 text-white shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-sm mb-2">
            Campus Administrator Console • YTC Satara
          </span>
          <h2 className="text-2xl font-black tracking-tight">
            Spatial Navigation Management System
          </h2>
          <p className="text-white/80 text-xs mt-1 max-w-xl leading-relaxed">
            Manage building blueprints, place classroom markers, maintain Dijkstra walking paths, and import official civil survey data.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickAction('add_building')}
            className="px-3.5 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Building
          </button>
          <button
            onClick={() => onQuickAction('add_room')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Room
          </button>
          <button
            onClick={() => onNavigateTab('floor_plans')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Blueprint
          </button>
          <button
            onClick={() => onNavigateTab('import_export')}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            Import GeoJSON
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-3">{card.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Incomplete Data Alert + Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incomplete Data Warnings & Status */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Data Health & Verification
            </h3>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stats.incomplete_records > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {stats.incomplete_records > 0 ? `${stats.incomplete_records} Incomplete` : 'All Verified'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Campus positioning accuracy depends on precise entrance coordinates and visual room coordinates.
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-800">Uncalibrated Room Pins</div>
                <div className="text-[11px] text-slate-500">Rooms with default (0.5, 0.5) center position.</div>
              </div>
              <button
                onClick={() => onNavigateTab('rooms')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
              >
                Calibrate
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-800">Demonstration Dataset</div>
                <div className="text-[11px] text-slate-500">Current layout is marked as illustrative demonstration.</div>
              </div>
              <button
                onClick={() => onNavigateTab('import_export')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 shrink-0"
              >
                Upload CAD
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Log Cards */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Recent Administrative Activity Logs
            </h3>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All Logs
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recent_activities.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No recent activity logged yet.</div>
            ) : (
              stats.recent_activities.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/50">
                        {log.action}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="text-[10px] text-slate-400">
                          #{log.entity_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {log.summary}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 shrink-0 text-right">
                    <div>{log.user_email?.split('@')[0] || 'Admin'}</div>
                    <div className="text-[10px]">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
