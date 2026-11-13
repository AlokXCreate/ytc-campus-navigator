import React, { useState, useEffect } from 'react';
import { Building, Floor } from '../../types/campus';
import { api } from '../../services/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Upload,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

interface AdminFloorsProps {
  buildings: Building[];
  initialBuildingId?: string;
  onRefresh: () => void;
  onOpenRoomEditor?: (buildingId: string, floorId: string) => void;
}

export const AdminFloors: React.FC<AdminFloorsProps> = ({
  buildings,
  initialBuildingId,
  onRefresh,
  onOpenRoomEditor
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    initialBuildingId || (buildings[0]?.id ?? 'bldg-b')
  );
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Floor>>({
    id: '',
    building_id: selectedBuildingId,
    floor_number: 0,
    floor_label: 'Ground Floor',
    floor_plan_image: '/floor-plans/engineering/ground.svg',
    image_width: 1000,
    image_height: 600,
    is_approximate: true,
    is_active: true
  });

  const loadFloorsForBuilding = async (bldgId: string) => {
    setIsLoadingFloors(true);
    try {
      const res = await api.getBuildingFloors(bldgId);
      setFloors(res.data);
    } catch (err) {
      console.warn('Failed to load floors:', err);
    } finally {
      setIsLoadingFloors(false);
    }
  };

  useEffect(() => {
    if (selectedBuildingId) {
      loadFloorsForBuilding(selectedBuildingId);
    }
  }, [selectedBuildingId]);

  const handleOpenAddModal = () => {
    const nextFloorNum = floors.length > 0 ? Math.max(...floors.map(f => f.floor_number)) + 1 : 0;
    setFormData({
      id: `${selectedBuildingId}-fl-${nextFloorNum}`,
      building_id: selectedBuildingId,
      floor_number: nextFloorNum,
      floor_label: nextFloorNum === 0 ? 'Ground Floor' : `Floor ${nextFloorNum}`,
      floor_plan_image: '/floor-plans/engineering/ground.svg',
      image_width: 1000,
      image_height: 600,
      is_approximate: true,
      is_active: true
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (floor: Floor) => {
    setEditingFloor(floor);
    setFormData({ ...floor });
    setErrorMsg('');
  };

  const handleSaveFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (editingFloor) {
        await api.updateFloor(editingFloor.id, formData);
        setEditingFloor(null);
      } else {
        await api.createFloor(formData);
        setIsAddModalOpen(false);
      }
      loadFloorsForBuilding(selectedBuildingId);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save floor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFloor = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteFloor(id);
      setDeletingId(null);
      loadFloorsForBuilding(selectedBuildingId);
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const activeBuilding = buildings.find(b => b.id === selectedBuildingId);

  return (
    <div className="space-y-6">
      {/* Header & Building Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Building Floor Levels & Layouts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure storey levels, architectural plans, and dimensions for {activeBuilding?.name || 'campus buildings'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.building_code})
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Floor Level
          </button>
        </div>
      </div>

      {/* Floor Cards Grid */}
      {isLoadingFloors ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Loading floor levels for {activeBuilding?.name}...
        </div>
      ) : floors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-subtle space-y-3">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Floors Configured for this Building</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &ldquo;Add Floor Level&rdquo; above to register Ground Floor or upper storeys.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Create Ground Floor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {floors.map((floor) => (
            <div
              key={floor.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              {/* Floor Plan Thumbnail / Preview */}
              <div className="h-44 bg-slate-900/5 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                <img
                  src={floor.floor_plan_image}
                  alt={floor.floor_label || `Floor ${floor.floor_number}`}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/floor-plans/engineering/ground.svg';
                  }}
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase text-slate-800 shadow-sm">
                  Floor {floor.floor_number}
                </span>
                {floor.is_approximate && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold shadow-sm">
                    Approximate
                  </span>
                )}
              </div>

              {/* Floor Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {floor.floor_label || `Floor Level ${floor.floor_number}`}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    ID: {floor.id} • {floor.image_width}×{floor.image_height}px
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate" title={floor.floor_plan_image}>
                    Asset: <span className="font-mono text-[11px]">{floor.floor_plan_image}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {onOpenRoomEditor && (
                      <button
                        onClick={() => onOpenRoomEditor(floor.building_id, floor.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                      >
                        Pin Rooms
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      title="Edit Floor"
                      onClick={() => handleOpenEditModal(floor)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete Floor"
                      onClick={() => setDeletingId(floor.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Floor Modal */}
      {(isAddModalOpen || editingFloor) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                {editingFloor ? `Edit Floor: ${editingFloor.floor_label}` : 'Add New Floor Level'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingFloor(null);
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

            <form onSubmit={handleSaveFloor} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Floor ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingFloor}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Floor Number</label>
                  <input
                    type="number"
                    required
                    value={formData.floor_number}
                    onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Floor Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Second Floor (AI & DS)"
                    value={formData.floor_label || ''}
                    onChange={(e) => setFormData({ ...formData, floor_label: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Floor Plan Image / SVG Path</label>
                <input
                  type="text"
                  required
                  placeholder="/floor-plans/engineering/first.svg"
                  value={formData.floor_plan_image || ''}
                  onChange={(e) => setFormData({ ...formData, floor_plan_image: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Canvas Width (px)</label>
                  <input
                    type="number"
                    value={formData.image_width || 1000}
                    onChange={(e) => setFormData({ ...formData, image_width: parseInt(e.target.value) || 1000 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Canvas Height (px)</label>
                  <input
                    type="number"
                    value={formData.image_height || 600}
                    onChange={(e) => setFormData({ ...formData, image_height: parseInt(e.target.value) || 600 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fl_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="fl_active" className="text-xs font-semibold text-slate-700">
                  Floor is open and available for navigation
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingFloor(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingFloor ? 'Update Floor' : 'Create Floor'}
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
              Confirm Floor Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete floor <strong>{deletingId}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFloor(deletingId)}
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

