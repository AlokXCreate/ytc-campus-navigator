import React, { useState, useEffect } from 'react';
import { CampusPath } from '../../types/campus';
import { api } from '../../services/api';
import {
  Route,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface AdminPathsProps {
  onRefresh: () => void;
}

export const AdminPaths: React.FC<AdminPathsProps> = ({ onRefresh }) => {
  const [paths, setPaths] = useState<CampusPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<CampusPath | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<Partial<CampusPath>>({
    id: '',
    source_node: '',
    destination_node: '',
    distance: 25.0,
    path_type: 'pedestrian_paved',
    accessibility: 'fully_accessible'
  });

  const loadPaths = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMapPaths();
      setPaths(res.data);
    } catch (err) {
      console.warn('Failed to load paths:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaths();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      id: `path-ext-${Date.now().toString().slice(-4)}`,
      source_node: 'gate_main',
      destination_node: 'bldg_b_entrance',
      distance: 35.0,
      path_type: 'pedestrian_paved',
      accessibility: 'fully_accessible'
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (pathObj: CampusPath) => {
    setEditingPath(pathObj);
    setFormData({ ...pathObj });
    setErrorMsg('');
  };

  const handleSavePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (editingPath) {
        await api.updatePath(editingPath.id, formData);
        setEditingPath(null);
      } else {
        await api.createPath(formData);
        setIsAddModalOpen(false);
      }
      loadPaths();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save pathway');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePath = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deletePath(id);
      setDeletingId(null);
      loadPaths();
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = paths.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.source_node.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.destination_node.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Route className="w-5 h-5 text-purple-600" />
            Outdoor Campus Pathway Topology
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure pedestrian paved walkways, accessibility flags, and edge connections for outdoor Dijkstra routing.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-purple-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Pathway Link
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by node identifier (e.g., gate_main, bldg_b_entrance)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 shadow-subtle"
        />
      </div>

      {/* Pathways Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Pathway ID</th>
                <th className="py-3 px-4">Node Connection (Source ↔ Destination)</th>
                <th className="py-3 px-4">Walking Distance</th>
                <th className="py-3 px-4">Pavement Type</th>
                <th className="py-3 px-4">Accessibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading outdoor pathways...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No pathways match your search.</td></tr>
              ) : (
                filtered.map((pathObj) => (
                  <tr key={pathObj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{pathObj.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {pathObj.source_node}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {pathObj.destination_node}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{pathObj.distance} meters</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {pathObj.path_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {pathObj.accessibility === 'fully_accessible' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Wheelchair Accessible
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Pedestrian Only / Steps
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          title="Edit Pathway"
                          onClick={() => handleOpenEditModal(pathObj)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Pathway"
                          onClick={() => setDeletingId(pathObj.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingPath) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Route className="w-5 h-5 text-purple-600" />
                {editingPath ? `Edit Pathway ${editingPath.id}` : 'Create Outdoor Pathway Link'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPath(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSavePath} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Pathway ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingPath}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Source Node ID</label>
                  <input
                    type="text"
                    required
                    placeholder="gate_main"
                    value={formData.source_node}
                    onChange={(e) => setFormData({ ...formData, source_node: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Destination Node ID</label>
                  <input
                    type="text"
                    required
                    placeholder="bldg_b_entrance"
                    value={formData.destination_node}
                    onChange={(e) => setFormData({ ...formData, destination_node: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Distance (meters)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) || 10 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Accessibility</label>
                  <select
                    value={formData.accessibility}
                    onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    <option value="fully_accessible">Fully Accessible</option>
                    <option value="pedestrian_only">Pedestrian / Stairs</option>
                    <option value="restricted">Restricted Access</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Pavement Surface</label>
                <select
                  value={formData.path_type}
                  onChange={(e) => setFormData({ ...formData, path_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                >
                  <option value="pedestrian_paved">Pedestrian Paved Interlock</option>
                  <option value="asphalt_roadway">Campus Asphalt Roadway</option>
                  <option value="garden_trail">Garden Paver Trail</option>
                  <option value="staircase_ramp">Ramp / Step Bridge</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPath(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingPath ? 'Update Pathway' : 'Create Pathway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Confirm Pathway Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete walkway segment <strong>{deletingId}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePath(deletingId)}
                disabled={isSaving}
                className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                {isSaving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
