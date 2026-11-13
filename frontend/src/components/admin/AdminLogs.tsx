import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types/campus';
import { api } from '../../services/api';
import {
  History,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  User as UserIcon
} from 'lucide-react';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActivityLogs(100, entityFilter === 'all' ? undefined : entityFilter);
      setLogs(data);
    } catch (err) {
      console.warn('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  const filtered = logs.filter(l =>
    l.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.user_email && l.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.entity_id && l.entity_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">CREATE</span>;
      case 'update':
        return <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">UPDATE</span>;
      case 'delete':
        return <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px] border border-red-200">DELETE</span>;
      case 'upload':
        return <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded text-[10px] border border-purple-200">UPLOAD</span>;
      case 'import':
        return <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">IMPORT</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200">LOGIN</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Administrative Activity Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all building, room, blueprint, and survey modification operations.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity summaries, user email, entity IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 shadow-subtle"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
          >
            <option value="all">All Entity Types</option>
            <option value="building">Buildings</option>
            <option value="floor">Floors</option>
            <option value="room">Rooms</option>
            <option value="facility">Facilities</option>
            <option value="pathway">Outdoor Pathways</option>
            <option value="indoor_pathway">Indoor Graph</option>
            <option value="floor_plan">Floor Plans</option>
            <option value="user">User Accounts</option>
            <option value="geojson">GeoJSON Data</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Operation Summary</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading audit trail...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No activity logs recorded.</td></tr>
              ) : (
                filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">{getActionBadge(l.action)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 capitalize">{l.entity_type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{l.entity_id || '—'}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-md">{l.summary}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 font-mono">{l.user_email || 'System'}</td>
                    <td className="py-3 px-4 text-right text-[11px] text-slate-500">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

