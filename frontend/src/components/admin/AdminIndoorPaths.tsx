import React, { useState, useEffect } from 'react';
import { Building, Floor, IndoorNavigationNode, IndoorNavigationEdge } from '../../types/campus';
import { api } from '../../services/api';
import {
  Network,
  Plus,
  Trash2,
  X,
  Play,
  ArrowRight,
  Layers,
  Footprints,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminIndoorPathsProps {
  buildings: Building[];
  onRefresh: () => void;
}

export const AdminIndoorPaths: React.FC<AdminIndoorPathsProps> = ({
  buildings,
  onRefresh
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id ?? 'bldg-b');
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');

  const [nodes, setNodes] = useState<IndoorNavigationNode[]>([]);
  const [edges, setEdges] = useState<IndoorNavigationEdge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isAddEdgeOpen, setIsAddEdgeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Route Test Simulator
  const [simSource, setSimSource] = useState('');
  const [simDest, setSimDest] = useState('');
  const [simPreference, setSimPreference] = useState<'stairs' | 'lift' | 'accessible'>('stairs');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Forms
  const [nodeForm, setNodeForm] = useState({
    id: '',
    building_id: selectedBuildingId,
    floor_id: '',
    floor_number: 0,
    node_type: 'corridor',
    node_name: '',
    relative_x: 0.5,
    relative_y: 0.5
  });

  const [edgeForm, setEdgeForm] = useState({
    id: '',
    building_id: selectedBuildingId,
    floor_id: '',
    source_node_id: '',
    destination_node_id: '',
    distance: 12.0,
    movement_type: 'corridor',
    accessible: true
  });

  // Load floors
  useEffect(() => {
    if (selectedBuildingId) {
      api.getBuildingFloors(selectedBuildingId).then((res: { data: Floor[] }) => {
        setFloors(res.data);
        if (res.data.length > 0) {
          setSelectedFloorId(res.data[0].id);
        } else {
          setSelectedFloorId('');
        }
      });
    }
  }, [selectedBuildingId]);

  // Load nodes & edges
  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const activeFloor = floors.find(f => f.id === selectedFloorId);
      const [nRes, eRes] = await Promise.all([
        api.getIndoorNodes(selectedBuildingId, activeFloor ? activeFloor.floor_number : undefined),
        api.getIndoorEdges(selectedBuildingId)
      ]);
      setNodes(nRes.data);
      setEdges(eRes.data);
      if (nRes.data.length >= 2) {
        setSimSource(nRes.data[0].id);
        setSimDest(nRes.data[1].id);
      }
    } catch (err) {
      console.warn('Failed to load indoor graph:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBuildingId) {
      loadGraph();
    }
  }, [selectedBuildingId, selectedFloorId]);

  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      await api.createIndoorNode(nodeForm);
      setIsAddNodeOpen(false);
      loadGraph();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create node');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNode = async (id: string) => {
    try {
      await api.deleteIndoorNode(id);
      loadGraph();
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      await api.createIndoorEdge(edgeForm);
      setIsAddEdgeOpen(false);
      loadGraph();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create edge');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEdge = async (id: string) => {
    try {
      await api.deleteIndoorEdge(id);
      loadGraph();
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleRunSimulator = async () => {
    if (!simSource || !simDest) return;
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await api.calculateIndoorRoute({
        building_id: selectedBuildingId,
        source_node_id: simSource,
        destination_node_id: simDest,
        preferred_transition: simPreference,
        algorithm: 'dijkstra'
      });
      setSimResult(res);
    } catch (err: any) {
      setSimResult({
        found: false,
        message: err.message || 'Simulation execution failed'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-teal-600" />
            Indoor Navigation Graph & Topological Links
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-storey corridor waypoints, room doors, stairwell nodes, and elevator shafts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setNodeForm({
                id: `node_${selectedBuildingId.replace('bldg-', '')}_${Date.now().toString().slice(-4)}`,
                building_id: selectedBuildingId,
                floor_id: selectedFloorId,
                floor_number: floors.find(f => f.id === selectedFloorId)?.floor_number || 0,
                node_type: 'corridor',
                node_name: 'Corridor Node',
                relative_x: 0.5,
                relative_y: 0.5
              });
              setIsAddNodeOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Node
          </button>

          <button
            onClick={() => {
              setEdgeForm({
                id: `edge_${Date.now().toString().slice(-4)}`,
                building_id: selectedBuildingId,
                floor_id: selectedFloorId,
                source_node_id: nodes[0]?.id || '',
                destination_node_id: nodes[1]?.id || '',
                distance: 12.0,
                movement_type: 'corridor',
                accessible: true
              });
              setIsAddEdgeOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Edge
          </button>
        </div>
      </div>

      {/* Simulator Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-premium space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            Indoor Pathfinding Engine Simulator (Dijkstra / A*)
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            {nodes.length} Nodes • {edges.length} Edges
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Node</label>
            <select
              value={simSource}
              onChange={(e) => setSimSource(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.node_name} (Fl {n.floor_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Destination Node</label>
            <select
              value={simDest}
              onChange={(e) => setSimDest(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.node_name} (Fl {n.floor_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Vertical Preference</label>
            <select
              value={simPreference}
              onChange={(e: any) => setSimPreference(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
            >
              <option value="stairs">Prefer Stairs</option>
              <option value="lift">Prefer Elevator / Lift</option>
              <option value="accessible">Strict Wheelchair Accessible</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSimulator}
              disabled={isSimulating}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              {isSimulating ? 'Computing...' : 'Simulate Route'}
            </button>
          </div>
        </div>

        {/* Simulation Output */}
        {simResult && (
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className={`font-bold flex items-center gap-1.5 ${simResult.found ? 'text-emerald-400' : 'text-amber-400'}`}>
                {simResult.found ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {simResult.found ? `Path Computed: ${simResult.total_distance_meters}m • ~${simResult.estimated_walk_time_minutes} min` : 'No Navigable Path'}
              </span>
              {simResult.is_multi_floor && (
                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-500/30">
                  Multi-Floor Route (Floors {simResult.floors_traversed.join(', ')})
                </span>
              )}
            </div>

            {simResult.instructions && simResult.instructions.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-700/80">
                {simResult.instructions.map((step: string, i: number) => (
                  <div key={i} className="text-slate-300 text-[11px] flex items-start gap-2">
                    <span className="font-mono text-slate-500">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nodes & Edges Two-Column Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nodes List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Graph Nodes ({nodes.length})
            </h3>
            <span className="text-[11px] text-slate-400">Vertices in Graph</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {nodes.map(n => (
              <div key={n.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-800">{n.node_name}</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {n.id} • Floor {n.floor_number} • ({n.relative_x.toFixed(2)}, {n.relative_y.toFixed(2)})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {n.node_type}
                  </span>
                  <button
                    onClick={() => handleDeleteNode(n.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edges List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Corridor Connections ({edges.length})
            </h3>
            <span className="text-[11px] text-slate-400">Walkway Links</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {edges.map(e => (
              <div key={e.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1 font-mono text-[11px]">
                    <span className="text-blue-600">{e.source_node_id}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-indigo-600">{e.destination_node_id}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dist: {e.distance}m • {e.movement_type} • {e.accessible ? 'Accessible' : 'Stairs'}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEdge(e.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Node Modal */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Add Indoor Navigation Node</h3>
              <button onClick={() => setIsAddNodeOpen(false)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveNode} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Node ID</label>
                <input
                  type="text"
                  required
                  value={nodeForm.id}
                  onChange={(e) => setNodeForm({ ...nodeForm, id: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Node Label</label>
                <input
                  type="text"
                  required
                  value={nodeForm.node_name}
                  onChange={(e) => setNodeForm({ ...nodeForm, node_name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Node Type</label>
                <select
                  value={nodeForm.node_type}
                  onChange={(e) => setNodeForm({ ...nodeForm, node_type: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="corridor">Corridor Walkway</option>
                  <option value="intersection">Intersection</option>
                  <option value="room">Room Entrance</option>
                  <option value="staircase">Staircase Transition</option>
                  <option value="lift">Elevator / Lift</option>
                  <option value="entrance">Building Main Entrance</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddNodeOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 rounded-xl">Create Node</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Edge Modal */}
      {isAddEdgeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Add Corridor Connection Edge</h3>
              <button onClick={() => setIsAddEdgeOpen(false)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveEdge} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Source Node</label>
                <select
                  value={edgeForm.source_node_id}
                  onChange={(e) => setEdgeForm({ ...edgeForm, source_node_id: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.node_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Destination Node</label>
                <select
                  value={edgeForm.destination_node_id}
                  onChange={(e) => setEdgeForm({ ...edgeForm, destination_node_id: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.node_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Distance (meters)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={edgeForm.distance}
                  onChange={(e) => setEdgeForm({ ...edgeForm, distance: parseFloat(e.target.value) || 10 })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddEdgeOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl">Connect Nodes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
