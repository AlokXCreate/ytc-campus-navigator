import React, { useState } from 'react';
import { Building, Floor } from '../../types/campus';
import { api } from '../../services/api';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AdminFloorPlansProps {
  buildings: Building[];
  onRefresh: () => void;
}

export const AdminFloorPlans: React.FC<AdminFloorPlansProps> = ({
  buildings,
  onRefresh
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id ?? 'bldg-b');
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activeBuilding = buildings.find(b => b.id === selectedBuildingId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadError(`Invalid format "${ext}". Allowed: PNG, JPEG, WebP, SVG`);
      return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File size exceeds 10 MB limit (Got ${(file.size / (1024*1024)).toFixed(1)} MB)`);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await api.uploadFloorPlanFile(selectedBuildingId, selectedFloorNumber, selectedFile);
      setUploadSuccess(`Blueprint successfully published to ${res.image_url}`);
      setSelectedFile(null);
      setPreviewUrl(null);
      onRefresh();
    } catch (err: any) {
      setUploadError(err.message || 'Blueprint upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          Architectural Floor Plan & Blueprint Asset Manager
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload verified 2D architectural blueprints, vector SVG drawings, or campus CAD schematics for indoor wayfinding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Box */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Target Building & Level
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Building</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Floor Storey</label>
              <select
                value={selectedFloorNumber}
                onChange={(e) => setSelectedFloorNumber(parseInt(e.target.value) || 0)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={0}>Ground Floor (Level 0)</option>
                <option value={1}>First Floor (Level 1)</option>
                <option value={2}>Second Floor (Level 2)</option>
                <option value={3}>Third Floor (Level 3)</option>
              </select>
            </div>
          </div>

          {/* File Dropzone */}
          <div className="pt-2">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Select Blueprint File</label>
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
              <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Choose SVG or Image File</span>
              <span className="text-[10px] text-slate-400 mt-0.5">SVG, PNG, JPEG, WebP up to 10 MB</span>
              <input
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {selectedFile && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-indigo-900 truncate">{selectedFile.name}</div>
              <div className="text-[10px] text-indigo-600">
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'vector/image'}
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Publishing Blueprint...' : 'Upload & Publish Floor Plan'}
          </button>
        </div>

        {/* Blueprint Live Preview */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Live Preview & Resolution Check
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Target: {activeBuilding?.name} (Floor {selectedFloorNumber})
            </span>
          </div>

          <div className="flex-1 my-4 bg-slate-900/5 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[360px] overflow-hidden p-4 relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected Blueprint Preview"
                className="max-w-full max-h-[380px] object-contain shadow-md rounded-lg bg-white"
              />
            ) : (
              <div className="text-center space-y-2 text-slate-400">
                <FileCode className="w-10 h-10 mx-auto text-slate-300" />
                <div className="text-xs font-semibold">No Blueprint File Selected Yet</div>
                <div className="text-[11px]">Select an architectural drawing on the left to view preview.</div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All coordinate waypoints in YTC Campus Navigator use normalized relative values $[0.0, 1.0]$. Uploading a new high-resolution blueprint preserves existing room marker alignment automatically!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

