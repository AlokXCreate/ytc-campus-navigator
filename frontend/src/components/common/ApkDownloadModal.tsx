import React from 'react';
import {
  X,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Sparkles,
  Zap,
  Volume2,
  Layers
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const apkDownloadUrl = getAssetUrl('/downloads/ytc-campus-navigator.apk');

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Android Emblem */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-3 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Smartphone className="w-10 h-10 text-slate-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Android Mobile Release
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              YTC Campus Navigator APK
            </h2>
            <p className="text-xs text-slate-400">
              Native Android Package (APK) for Yashoda Technical Campus
            </p>
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <Volume2 className="w-4 h-4" />
              <span>Voice Navigation</span>
            </div>
            <p className="text-[10px] text-slate-400">Hands-free turn-by-turn spoken audio guidance</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
              <Zap className="w-4 h-4" />
              <span>Real-time GPS</span>
            </div>
            <p className="text-[10px] text-slate-400">Low-latency location snapping on campus walkways</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <Layers className="w-4 h-4" />
              <span>Indoor Blueprints</span>
            </div>
            <p className="text-[10px] text-slate-400">Multi-storey classroom &amp; lab wayfinding</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline First</span>
            </div>
            <p className="text-[10px] text-slate-400">Navigates smoothly even during cellular drops</p>
          </div>
        </div>

        {/* APK Meta Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-emerald-300">Package: com.ytc.campusnavigator</div>
            <div className="text-[11px] text-slate-400">Build: v1.0.0 (Release APK) &bull; Universal Android 8.0+</div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
            ~4.5 MB
          </span>
        </div>

        {/* Direct Download Button */}
        <div className="space-y-3 pt-1">
          <a
            href={apkDownloadUrl}
            download="ytc-campus-navigator.apk"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download Android APK File (.apk)</span>
          </a>

          {/* Quick Installation Instructions */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>How to Install on Your Android Phone:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 pl-1">
              <li>Tap <strong>Download Android APK</strong> above to save the file.</li>
              <li>Open your phone's <em>Downloads</em> and tap <code>ytc-campus-navigator.apk</code>.</li>
              <li>When prompted by Android, tap <em>Allow / Install Anyway</em>.</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
};
