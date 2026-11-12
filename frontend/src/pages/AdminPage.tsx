import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { api } from '../services/api';
import { GeoJSONValidationResult, GeoJSONImportResult } from '../types/campus';
import {
  ShieldAlert,
  Lock,
  Building2,
  DoorOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  LogOut,
  Upload,
  FileCode,
  Check,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { userRole, setUserRole, buildings, facilities, pointsOfInterest, summary, refreshData } = useCampus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GeoJSON Import state
  const [geoJSONText, setGeoJSONText] = useState('');
  const [validationResult, setValidationResult] = useState<GeoJSONValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importResult, setImportResult] = useState<GeoJSONImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [targetType, setTargetType] = useState<'auto' | 'poi' | 'path' | 'boundary'>('auto');
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (email.trim().toLowerCase() === 'admin@ytc.edu.in' && (password === 'admin123' || password === 'ytcadmin2026')) {
        setUserRole('admin');
        setSuccessMsg('Successfully authenticated as Campus Administrator.');
      } else {
        setErrorMsg('Invalid administrative credentials. Hint: admin@ytc.edu.in / admin123');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleLogout = () => {
    setUserRole('student');
    setEmail('');
    setPassword('');
  };

  const handleValidateGeoJSON = async () => {
    if (!geoJSONText.trim()) return;
    setIsValidating(true);
    setValidationResult(null);
    setImportResult(null);

    try {
      const parsed = JSON.parse(geoJSONText);
      const res = await api.validateGeoJSON(parsed);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        valid: false,
        feature_count: 0,
        points_count: 0,
        lines_count: 0,
        polygons_count: 0,
        errors: [`JSON Syntax Error: ${err.message}`],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImportGeoJSON = async () => {
    if (!validationResult || !validationResult.valid) return;
    setIsImporting(true);

    try {
      const parsed = JSON.parse(geoJSONText);
      const res = await api.importGeoJSON(parsed, targetType, overwriteExisting);
      setImportResult(res);
      if (res.success) {
        refreshData();
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        imported_count: 0,
        rejected_count: 0,
        summary: { points: 0, paths: 0, boundaries: 0 },
        messages: [`Import failed: ${err.message}`]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const loadSampleGeoJSONTemplate = () => {
    const sample = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "poi-new-gate",
          geometry: { type: "Point", coordinates: [74.0192, 17.7212] },
          properties: { name: "South Campus Gate", category: "gate", description: "Secondary pedestrian entry" }
        },
        {
          type: "Feature",
          id: "path-new-connector",
          geometry: {
            type: "LineString",
            coordinates: [[74.0192, 17.7212], [74.0202, 17.7216]]
          },
          properties: { source_node: "south_gate", destination_node: "bldg_a_entrance", distance_meters: 65, accessible: true }
        }
      ]
    };
    setGeoJSONText(JSON.stringify(sample, null, 2));
  };

  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-premium space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Campus Administration Portal
            </h1>
            <p className="text-xs text-slate-500">
              Restricted to authorized YTC facility managers and campus surveyors.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ytc.edu.in"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Verifying...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
            Demonstration credentials: <span className="font-semibold text-slate-600">admin@ytc.edu.in</span> / <span className="font-semibold text-slate-600">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Authenticated Administration Console
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            YTC Campus Spatial Management System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Import surveyed GeoJSON data, inspect pathway topology, and manage ground-truth coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Database State Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Buildings</div>
          <div className="text-2xl font-extrabold text-slate-900">{buildings.length}</div>
          <div className="text-[11px] text-slate-500">Configured Blocks</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus POIs</div>
          <div className="text-2xl font-extrabold text-blue-600">{pointsOfInterest.length}</div>
          <div className="text-[11px] text-slate-500">Points of Interest</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Classrooms &amp; Labs</div>
          <div className="text-2xl font-extrabold text-emerald-600">{summary?.total_rooms ?? 11}</div>
          <div className="text-[11px] text-slate-500">Indoor Destinations</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Walkway Paths</div>
          <div className="text-2xl font-extrabold text-purple-600">{summary?.total_paths ?? 15}</div>
          <div className="text-[11px] text-slate-500">Graph Segments</div>
        </div>
      </div>

      {/* GeoJSON Spatial Importer Module */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <FileCode className="w-4 h-4" /> Spatial Importer
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Import Ground-Truth GeoJSON
            </h2>
            <p className="text-xs text-slate-500">
              Paste surveyed campus GeoJSON (Points, LineStrings, or Polygon boundary) to update the live navigation graph.
            </p>
          </div>

          <button
            onClick={loadSampleGeoJSONTemplate}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold self-start"
          >
            Load Sample Template
          </button>
        </div>

        {/* Textarea for GeoJSON */}
        <div className="space-y-2">
          <textarea
            rows={8}
            value={geoJSONText}
            onChange={(e) => setGeoJSONText(e.target.value)}
            placeholder='Paste GeoJSON FeatureCollection here (e.g. {"type": "FeatureCollection", "features": [...]})'
            className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <span>Target:</span>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs"
              >
                <option value="auto">Auto-Detect</option>
                <option value="poi">Points of Interest</option>
                <option value="path">Walkway Paths</option>
                <option value="boundary">Perimeter Boundary</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              Overwrite existing IDs
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleValidateGeoJSON}
              disabled={isValidating || !geoJSONText.trim()}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors"
            >
              {isValidating ? 'Validating...' : 'Validate GeoJSON'}
            </button>

            <button
              onClick={handleImportGeoJSON}
              disabled={isImporting || !validationResult?.valid}
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-all ${
                validationResult?.valid
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              {isImporting ? 'Importing...' : 'Import into Campus DB'}
            </button>
          </div>
        </div>

        {/* Validation Result Box */}
        {validationResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            validationResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {validationResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{validationResult.valid ? 'GeoJSON is Valid' : 'GeoJSON Validation Failed'}</span>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] font-semibold">
              <span>Features: {validationResult.feature_count}</span>
              <span>Points: {validationResult.points_count}</span>
              <span>LineStrings: {validationResult.lines_count}</span>
              <span>Polygons: {validationResult.polygons_count}</span>
            </div>

            {validationResult.errors.length > 0 && (
              <div className="text-[11px] text-red-700 space-y-1 pt-1">
                {validationResult.errors.map((e, idx) => (
                  <div key={idx}>• {e}</div>
                ))}
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="text-[11px] text-amber-700 space-y-1 pt-1">
                {validationResult.warnings.map((w, idx) => (
                  <div key={idx}>⚠️ {w}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Result Notification */}
        {importResult && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold">Import Status: {importResult.success ? 'Success' : 'Failed'}</div>
            <div>{importResult.messages.join(' ')}</div>
          </div>
        )}
      </div>

      {/* Points of Interest Registry Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campus POI Registry</h2>
            <p className="text-xs text-slate-500">Registered outdoor locations and routing nodes</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{pointsOfInterest.length} Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">POI Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">GPS Coordinates</th>
                <th className="px-5 py-3">Building Ref</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pointsOfInterest.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-mono text-[11px] text-blue-600 font-bold">{p.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-5 py-3 capitalize">{p.category}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                    {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.building_id || 'Outdoor'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
