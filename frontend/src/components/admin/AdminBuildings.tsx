import React, { useState } from 'react';
import { Building } from '../../types/campus';
import { api } from '../../services/api';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  MapPin,
  Layers,
  ExternalLink
} from 'lucide-react';

interface AdminBuildingsProps {
  buildings: Building[];
  onRefresh: () => void;
  onSelectBuildingForFloors?: (buildingId: string) => void;
}

export const AdminBuildings: React.FC<AdminBuildingsProps> = ({
  buildings,
  onRefresh,
  onSelectBuildingForFloors
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Building>>({
    id: '',
    name: '',
    building_code: '',
    description: '',
    latitude: 17.7215,
    longitude: 74.0205,
    entrance_latitude: 17.7215,
    entrance_longitude: 74.0205,
    total_floors: 1,
    available_floors: [0],
    building_type: 'academic',
    is_active: true
  });

  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.building_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || b.building_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOpenAddModal = () => {
    setFormData({
      id: `bldg-${Date.now().toString().slice(-4)}`,
      name: '',
      building_code: '',
      description: '',
      latitude: 17.7215,
      longitude: 74.0205,
      entrance_latitude: 17.7215,
      entrance_longitude: 74.0205,
      total_floors: 1,
      available_floors: [0],
      building_type: 'academic',
      is_active: true
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (bldg: Building) => {
    setEditingBuilding(bldg);
    setFormData({ ...bldg });
    setErrorMsg('');
  };

  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (editingBuilding) {
        await api.updateBuilding(editingBuilding.id, formData);
        setEditingBuilding(null);
      } else {
        await api.createBuilding(formData);
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save building');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBuilding = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteBuilding(id);
      setDeletingId(null);
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Campus Building Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure physical building blocks, GPS entrance pins, and floor distribution.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Building Block
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by building name or code (e.g., Engineering, BLDG-B)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 shadow-subtle"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="library">Library</option>
            <option value="workshop">Workshop</option>
            <option value="hostel">Hostel</option>
            <option value="amenity">Amenity</option>
          </select>
        </div>
      </div>

      {/* Buildings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Code / Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Floors</th>
                <th className="py-3 px-4">Center GPS Coordinates</th>
                <th className="py-3 px-4">Entrance Coordinates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No campus buildings match your search query.
                  </td>
                </tr>
              ) : (
                filteredBuildings.map((bldg) => (
                  <tr key={bldg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{bldg.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {bldg.building_code} • ID: {bldg.id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {bldg.building_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        {bldg.total_floors} Floor{bldg.total_floors > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {bldg.latitude.toFixed(5)}, {bldg.longitude.toFixed(5)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {bldg.entrance_latitude && bldg.entrance_longitude ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                          {bldg.entrance_latitude.toFixed(5)}, {bldg.entrance_longitude.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-sans">
                          Not Defined
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {bldg.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {onSelectBuildingForFloors && (
                          <button
                            title="Manage Floors"
                            onClick={() => onSelectBuildingForFloors(bldg.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          title="Edit Details"
                          onClick={() => handleOpenEditModal(bldg)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Building"
                          onClick={() => setDeletingId(bldg.id)}
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

      {/* Add / Edit Building Modal */}
      {(isAddModalOpen || editingBuilding) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                {editingBuilding ? `Edit ${editingBuilding.name}` : 'Register New Campus Building'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingBuilding(null);
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

            <form onSubmit={handleSaveBuilding} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Building ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingBuilding}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Building Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BLDG-B"
                    value={formData.building_code}
                    onChange={(e) => setFormData({ ...formData, building_code: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Building Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering & Technology Block"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={formData.building_type}
                  onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                >
                  <option value="academic">Academic Engineering</option>
                  <option value="administrative">Administrative</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="library">Library</option>
                  <option value="workshop">Workshop</option>
                  <option value="hostel">Hostel</option>
                  <option value="amenity">Amenity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Center Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Center Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Main Entrance Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.entrance_latitude || ''}
                    onChange={(e) => setFormData({ ...formData, entrance_latitude: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Main Entrance Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.entrance_longitude || ''}
                    onChange={(e) => setFormData({ ...formData, entrance_longitude: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Total Storeys / Floors</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.total_floors || 1}
                  onChange={(e) => setFormData({ ...formData, total_floors: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Departments, laboratories, or administrative offices housed here..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bldg_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="bldg_active" className="text-xs font-semibold text-slate-700">
                  Building is open and navigable on campus map
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBuilding(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingBuilding ? 'Update Building' : 'Register Building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Confirm Building Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete building <strong>{deletingId}</strong>? This will also remove its associated floors, rooms, and indoor pathways.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBuilding(deletingId)}
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
