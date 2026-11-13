import React, { useState, useEffect, useRef } from 'react';
import { Building, Floor, Room } from '../../types/campus';
import { api } from '../../services/api';
import {
  DoorOpen,
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
  Crosshair,
  Save,
  Check
} from 'lucide-react';

interface AdminRoomsProps {
  buildings: Building[];
  initialBuildingId?: string;
  initialFloorId?: string;
  onRefresh: () => void;
}

export const AdminRooms: React.FC<AdminRoomsProps> = ({
  buildings,
  initialBuildingId,
  initialFloorId,
  onRefresh
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    initialBuildingId || (buildings[0]?.id ?? 'bldg-b')
  );
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // View Mode: 'table' | 'visual_picker'
  const [viewMode, setViewMode] = useState<'table' | 'visual_picker'>('visual_picker');

  // Room Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('all');

  // Visual Pin Positioner State
  const [activeRoomForPinning, setActiveRoomForPinning] = useState<Room | null>(null);
  const [pinnedCoords, setPinnedCoords] = useState<{ x: number; y: number } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const planContainerRef = useRef<HTMLDivElement>(null);

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<Partial<Room>>({
    id: '',
    room_name: '',
    room_number: '',
    building_id: selectedBuildingId,
    floor_id: '',
    floor: 0,
    room_type: 'classroom',
    description: '',
    relative_x: 0.5,
    relative_y: 0.5,
    is_accessible: true,
    is_active: true
  });

  // Load floors for active building
  useEffect(() => {
    if (selectedBuildingId) {
      api.getBuildingFloors(selectedBuildingId).then((res: { data: Floor[] }) => {
        setFloors(res.data);
        if (res.data.length > 0) {
          const match = initialFloorId && res.data.find((f: Floor) => f.id === initialFloorId);
          setSelectedFloorId(match ? match.id : res.data[0].id);
        } else {
          setSelectedFloorId('');
        }
      });
    }
  }, [selectedBuildingId, initialFloorId]);

  // Load rooms for active floor / building
  const loadRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await api.getRooms({
        building_id: selectedBuildingId,
        floor_id: selectedFloorId || undefined
      });
      setRooms(res.data);
    } catch (err) {
      console.warn('Failed to load rooms:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (selectedBuildingId) {
      loadRooms();
    }
  }, [selectedBuildingId, selectedFloorId]);

  const activeFloor = floors.find(f => f.id === selectedFloorId) || floors[0];

  // Visual Pin Click Handler
  const handleFloorPlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!planContainerRef.current || !activeRoomForPinning) return;
    const rect = planContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const relX = Math.max(0.02, Math.min(0.98, clickX / rect.width));
    const relY = Math.max(0.02, Math.min(0.98, clickY / rect.height));

    setPinnedCoords({ x: parseFloat(relX.toFixed(3)), y: parseFloat(relY.toFixed(3)) });
  };

  const handleSavePinnedCoordinates = async () => {
    if (!activeRoomForPinning || !pinnedCoords) return;
    setIsSaving(true);
    try {
      await api.updateRoom(activeRoomForPinning.id, {
        relative_x: pinnedCoords.x,
        relative_y: pinnedCoords.y
      });
      setSaveSuccessMsg(`Saved position (${pinnedCoords.x}, ${pinnedCoords.y}) for ${activeRoomForPinning.room_name}`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      loadRooms();
      onRefresh();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    const nextRoomId = `rm-${selectedBuildingId.replace('bldg-', '')}-${Date.now().toString().slice(-3)}`;
    setFormData({
      id: nextRoomId,
      room_name: '',
      room_number: '',
      building_id: selectedBuildingId,
      floor_id: selectedFloorId || (activeFloor?.id ?? ''),
      floor: activeFloor?.floor_number ?? 0,
      room_type: 'classroom',
      description: '',
      relative_x: 0.5,
      relative_y: 0.5,
      is_accessible: true,
      is_active: true
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({ ...room });
    setErrorMsg('');
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, formData);
        setEditingRoom(null);
      } else {
        await api.createRoom(formData);
        setIsAddModalOpen(false);
      }
      loadRooms();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save room');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteRoom(id);
      setDeletingId(null);
      loadRooms();
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch =
      r.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedRoomType === 'all' || r.room_type === selectedRoomType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-emerald-600" />
            Classroom, Lab & Room Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage room directory, specifications, and calibrate visual pin markers on floor plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              onClick={() => setViewMode('visual_picker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'visual_picker'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 inline mr-1" />
              Visual Pin Editor
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Building Block
          </label>
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.building_code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Floor Level
          </label>
          <select
            value={selectedFloorId}
            onChange={(e) => setSelectedFloorId(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
          >
            {floors.map(f => (
              <option key={f.id} value={f.id}>
                {f.floor_label || `Floor ${f.floor_number}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Room Category
          </label>
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
          >
            <option value="all">All Room Types</option>
            <option value="classroom">Classroom</option>
            <option value="laboratory">Laboratory</option>
            <option value="office">Department Office</option>
            <option value="faculty">Faculty Room</option>
            <option value="seminar">Seminar Hall</option>
            <option value="amenity">Amenity / Washroom</option>
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: VISUAL PIN POSITIONING CANVAS */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'visual_picker' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Room Selection Sidebar for Pinning */}
          <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col h-[560px]">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Select Room to Pin</span>
                <span className="text-emerald-600 font-bold">{filteredRooms.length} Rooms</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Select a room below, then click on the floor plan canvas to place its marker.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 my-2 pr-1 space-y-1">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No rooms found.</div>
              ) : (
                filteredRooms.map((room) => {
                  const isSelected = activeRoomForPinning?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        setActiveRoomForPinning(room);
                        setPinnedCoords({ x: room.relative_x, y: room.relative_y });
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{room.room_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Room {room.room_number} • {room.room_type}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60 shrink-0">
                        {room.relative_x.toFixed(2)}, {room.relative_y.toFixed(2)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pin Save Controls */}
            {activeRoomForPinning && pinnedCoords && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                  <div className="font-bold text-slate-800 truncate">{activeRoomForPinning.room_name}</div>
                  <div className="text-slate-600 font-mono text-[10px]">
                    Relative X: <span className="font-bold">{pinnedCoords.x}</span> | Y: <span className="font-bold">{pinnedCoords.y}</span>
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                    <Check className="w-3.5 h-3.5" /> {saveSuccessMsg}
                  </div>
                )}

                <button
                  onClick={handleSavePinnedCoordinates}
                  disabled={isSaving}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving Pin...' : 'Save Room Coordinates'}
                </button>
              </div>
            )}
          </div>

          {/* Interactive Clickable Floor Plan Canvas */}
          <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-800">
                  {activeFloor?.floor_label || 'Floor Plan'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeFloor?.floor_plan_image}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {activeRoomForPinning
                  ? `Click to position "${activeRoomForPinning.room_name}"`
                  : 'Select a room on the left to start calibrating coordinates.'}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-900/5 rounded-xl mt-3 select-none">
              <div
                ref={planContainerRef}
                onClick={handleFloorPlanClick}
                className="relative max-w-full max-h-full cursor-crosshair border border-slate-200/80 shadow-md bg-white rounded-lg overflow-hidden"
                style={{ width: '100%', height: '100%', maxWidth: '850px', maxHeight: '460px' }}
              >
                {/* SVG Blueprint */}
                <img
                  src={activeFloor?.floor_plan_image || '/floor-plans/engineering/ground.svg'}
                  alt="Floor Plan"
                  className="w-full h-full object-contain pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/floor-plans/engineering/ground.svg';
                  }}
                />

                {/* Existing Room Markers on this floor */}
                {filteredRooms.map((r) => {
                  const isCurrentActive = activeRoomForPinning?.id === r.id;
                  const displayX = isCurrentActive && pinnedCoords ? pinnedCoords.x : r.relative_x;
                  const displayY = isCurrentActive && pinnedCoords ? pinnedCoords.y : r.relative_y;

                  return (
                    <div
                      key={r.id}
                      style={{
                        position: 'absolute',
                        left: `${displayX * 100}%`,
                        top: `${displayY * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="pointer-events-none transition-all duration-150"
                    >
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                          isCurrentActive
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40 scale-125 z-30'
                            : 'bg-slate-900/80 text-white border border-white/40 z-10'
                        }`}
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{r.room_number || r.room_name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: FULL DATA TABLE VIEW */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredRooms.length} rooms
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Room No. / Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Floor</th>
                  <th className="py-3 px-4">Normalized Pin (X, Y)</th>
                  <th className="py-3 px-4">Accessibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No rooms registered for this floor.
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{room.room_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Room {room.room_number} • ID: {room.id}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {room.room_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        Floor {room.floor}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {room.relative_x.toFixed(2)}, {room.relative_y.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {room.is_accessible ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Accessible
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Stairs Only
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            title="Position Pin on Canvas"
                            onClick={() => {
                              setActiveRoomForPinning(room);
                              setPinnedCoords({ x: room.relative_x, y: room.relative_y });
                              setViewMode('visual_picker');
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition-colors"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Edit Details"
                            onClick={() => handleOpenEditModal(room)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Room"
                            onClick={() => setDeletingId(room.id)}
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
      )}

      {/* Add / Edit Room Modal */}
      {(isAddModalOpen || editingRoom) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-emerald-600" />
                {editingRoom ? `Edit ${editingRoom.room_name}` : 'Register New Classroom / Lab'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingRoom(null);
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

            <form onSubmit={handleSaveRoom} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Room ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRoom}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 202"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Deep Learning Lab"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Room Type</label>
                  <select
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="office">Department Office</option>
                    <option value="faculty">Faculty Cabin</option>
                    <option value="seminar">Seminar Hall</option>
                    <option value="amenity">Washroom / Amenity</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Floor Level</label>
                  <select
                    value={formData.floor_id || ''}
                    onChange={(e) => {
                      const fId = e.target.value;
                      const fObj = floors.find(f => f.id === fId);
                      setFormData({
                        ...formData,
                        floor_id: fId,
                        floor: fObj ? fObj.floor_number : 0
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    {floors.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.floor_label || `Floor ${f.floor_number}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Normalized X (0.0 to 1.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.relative_x}
                    onChange={(e) => setFormData({ ...formData, relative_x: parseFloat(e.target.value) || 0.5 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Normalized Y (0.0 to 1.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.relative_y}
                    onChange={(e) => setFormData({ ...formData, relative_y: parseFloat(e.target.value) || 0.5 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Seating capacity, equipment installed, or department affiliation..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rm_accessible"
                  checked={formData.is_accessible}
                  onChange={(e) => setFormData({ ...formData, is_accessible: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="rm_accessible" className="text-xs font-semibold text-slate-700">
                  Wheelchair accessible from elevators and corridors
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingRoom ? 'Update Room' : 'Register Room'}
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
              Confirm Room Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete room <strong>{deletingId}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRoom(deletingId)}
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
