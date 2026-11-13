import React, { useState } from 'react';
import { api } from '../../services/api';
import { GeoJSONValidationResult, GeoJSONImportResult } from '../../types/campus';
import {
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminImportExportProps {
  onRefresh: () => void;
}

export const AdminImportExport: React.FC<AdminImportExportProps> = ({ onRefresh }) => {
  // GeoJSON Import state
  const [geoJSONText, setGeoJSONText] = useState('');
  const [validationResult, setValidationResult] = useState<GeoJSONValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importResult, setImportResult] = useState<GeoJSONImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [targetType, setTargetType] = useState<'auto' | 'poi' | 'path' | 'boundary'>('auto');
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  // Export state
  const [exportEntity, setExportEntity] = useState('buildings');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'geojson'>('json');
  const [isExporting, setIsExporting] = useState(false);

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
        onRefresh();
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

  const loadSampleGeoJSON = () => {
    const sample = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "poi-new-canteen-annex",
          geometry: { type: "Point", coordinates: [74.0215, 17.7218] },
          properties: {
            name: "Cafeteria Terrace Garden",
            category: "canteen",
            description: "Outdoor seating garden area."
          }
        },
        {
          type: "Feature",
          id: "path-annex-connector",
          geometry: {
            type: "LineString",
            coordinates: [[74.0205, 17.7215], [74.0215, 17.7218]]
          },
          properties: {
            source_node: "bldg_b_entrance",
            destination_node: "cafe_terrace",
            distance_meters: 42.0,
            accessible: true
          }
        }
      ]
    };
    setGeoJSONText(JSON.stringify(sample, null, 2));
  };

  const handleDownloadExport = async () => {
    setIsExporting(true);
    try {
      const blob = await api.exportCampusData(exportEntity, exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ytc_${exportEntity}.${exportFormat === 'geojson' ? 'geojson' : exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Campus Data Import & Export Center
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Exchange surveyed geographic data using standard GeoJSON collections, CSV spreadsheets, and structured JSON schemas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: GeoJSON Import with Validation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              GeoJSON Batch Import
            </h3>
            <button
              onClick={loadSampleGeoJSON}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
            >
              Load Sample Data
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Paste a valid GeoJSON FeatureCollection containing Point (POIs/Gates), LineString (walkways), or Polygon (boundaries) features.
          </p>

          <textarea
            rows={9}
            value={geoJSONText}
            onChange={(e) => setGeoJSONText(e.target.value)}
            placeholder='{\n  "type": "FeatureCollection",\n  "features": [...]\n}'
            className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Entity</label>
              <select
                value={targetType}
                onChange={(e: any) => setTargetType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800"
              >
                <option value="auto">Auto-detect from Geometry</option>
                <option value="poi">Points of Interest (Points)</option>
                <option value="path">Walkway Paths (LineStrings)</option>
                <option value="boundary">Campus Boundary (Polygons)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-[11px]">Overwrite if ID exists</span>
              </label>
            </div>
          </div>

          {/* Validation Report */}
          {validationResult && (
            <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              validationResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {validationResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                {validationResult.valid ? 'GeoJSON Validated Successfully' : 'Validation Errors Detected'}
              </div>
              <div className="text-[11px] text-slate-600 flex gap-3">
                <span>Features: {validationResult.feature_count}</span>
                <span>Points: {validationResult.points_count}</span>
                <span>Lines: {validationResult.lines_count}</span>
                <span>Polygons: {validationResult.polygons_count}</span>
              </div>
              {validationResult.errors.length > 0 && (
                <ul className="list-disc list-inside text-[11px] text-red-700 space-y-0.5">
                  {validationResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Import Result Feedback */}
          {importResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <div className="font-bold">
                {importResult.success ? `Import Complete: ${importResult.imported_count} features saved.` : 'Import Encountered Issues'}
              </div>
              <div className="text-[11px] text-blue-700">
                Points: {importResult.summary.points} | Paths: {importResult.summary.paths} | Rejected: {importResult.rejected_count}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleValidateGeoJSON}
              disabled={isValidating || !geoJSONText.trim()}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              {isValidating ? 'Validating...' : 'Validate GeoJSON'}
            </button>
            <button
              onClick={handleImportGeoJSON}
              disabled={isImporting || !validationResult?.valid}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm"
            >
              {isImporting ? 'Importing...' : 'Commit to Database'}
            </button>
          </div>
        </div>

        {/* SECTION 2: Data Export Center */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                Structured Campus Export
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Download structured backups of campus spatial datasets for offline GIS analysis or external reports.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Select Dataset</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'buildings', label: 'Buildings Block Directory' },
                    { id: 'floors', label: 'Storey Level Definitions' },
                    { id: 'rooms', label: 'Classrooms & Laboratories' },
                    { id: 'facilities', label: 'Campus Amenities & POIs' },
                    { id: 'paths', label: 'Outdoor Walkway Edges' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExportEntity(item.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        exportEntity === item.id
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'json', label: 'JSON Document', icon: FileCode },
                    { id: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet },
                    { id: 'geojson', label: 'GeoJSON Spatial', icon: Globe }
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setExportFormat(fmt.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                          exportFormat === fmt.id
                            ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 font-bold shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span className="text-[11px]">{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleDownloadExport}
              disabled={isExporting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Preparing Export...' : `Download ${exportEntity.toUpperCase()} (${exportFormat.toUpperCase()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

