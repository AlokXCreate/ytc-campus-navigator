import React, { useState } from 'react';
import { Facility } from '../../types/campus';
import { api } from '../../services/api';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Coffee,
  Shield,
  Car,
  HeartPulse,
  CreditCard,
  BookOpen
} from 'lucide-react';

interface AdminFacilitiesProps {
  facilities: Facility[];
  onRefresh: () => void;
}

export const AdminFacilities: React.FC<AdminFacilitiesProps> = ({
  facilities,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<Partial<Facility>>({
    id: '',
    name: '',
    facility_type: 'canteen',
    building_id: undefined,
    latitude: 17.7215,
    longitude: 74.0205,
    description: '',
    opening_information: 'Mon-Sat: 8:00 AM - 6:00 PM',
    image_url: '/images/fac-canteen.jpg'
  });

  const filtered = facilities.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || f.facility_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOpenAddModal = () => {
    setFormData({
      id: `fac-${Date.now().toString().slice(-4)}`,
      name: '',
      facility_type: 'canteen',
      building_id: undefined,
      latitude: 17.7215,
      longitude: 74.0205,
      description: '',
      opening_information: 'Mon-Sat: 8:00 AM - 6:00 PM',
      image_url: '/images/fac-canteen.jpg'
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (fac: Facility) => {
    setEditingFacility(fac);
    setFormData({ ...fac });
    setErrorMsg('');
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (editingFacility) {
        await api.updateFacility(editingFacility.id, formData);
        setEditingFacility(null);
      } else {
        await api.createFacility(formData);
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save facility');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteFacility(id);
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
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            Campus Facilities & Amenities Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student amenities, cafeterias, medical centers, parking, and utility kiosks.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Facility
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search facility name, canteen, parking, medical..."
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
            <option value="all">All Types</option>
            <option value="canteen">Canteen & Cafeteria</option>
            <option value="gate">Entrance Gates</option>
            <option value="parking">Parking Lots</option>
            <option value="medical">Medical & First Aid</option>
            <option value="banking">ATM & Stationery</option>
            <option value="sports">Sports Ground</option>
          </select>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Facility Name / ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Operating Schedule</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No facilities found.
                  </td>
                </tr>
              ) : (
                filtered.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{fac.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">ID: {fac.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">
                        {fac.facility_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {fac.latitude.toFixed(5)}, {fac.longitude.toFixed(5)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {fac.opening_information || 'Standard Hours'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          title="Edit Facility"
                          onClick={() => handleOpenEditModal(fac)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Facility"
                          onClick={() => setDeletingId(fac.id)}
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
      {(isAddModalOpen || editingFacility) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                {editingFacility ? `Edit ${editingFacility.name}` : 'Register New Campus Amenity'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingFacility(null);
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

            <form onSubmit={handleSaveFacility} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Facility ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingFacility}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Campus Cafeteria"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Facility Type</label>
                <select
                  value={formData.facility_type}
                  onChange={(e) => setFormData({ ...formData, facility_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                >
                  <option value="canteen">Canteen & Cafeteria</option>
                  <option value="gate">Entrance / Exit Gate</option>
                  <option value="parking">Vehicle Parking</option>
                  <option value="medical">Health & First Aid</option>
                  <option value="banking">ATM / Utility Store</option>
                  <option value="sports">Sports / Ground</option>
                  <option value="utility">Drinking Water / Restroom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Latitude</label>
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
                  <label className="text-xs font-bold text-slate-700">Longitude</label>
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

              <div>
                <label className="text-xs font-bold text-slate-700">Operating Information / Hours</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Sat: 8:00 AM – 7:00 PM"
                  value={formData.opening_information || ''}
                  onChange={(e) => setFormData({ ...formData, opening_information: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingFacility(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingFacility ? 'Update Facility' : 'Register Facility'}
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
              Confirm Facility Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete facility <strong>{deletingId}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFacility(deletingId)}
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
