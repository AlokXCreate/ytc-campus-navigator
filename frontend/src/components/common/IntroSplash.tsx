import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Layers, Compass } from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

interface IntroSplashProps {
  onDismiss: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onDismiss }) => {
  const [progress, setProgress] = useState(0);
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const milestones = [
    { text: "Initializing Geospatial GIS Engine...", icon: MapPin },
    { text: "Loading Architectural Vector Blueprints...", icon: Layers },
    { text: "Calibrating Multi-Storey Indoor Graphs...", icon: Compass },
    { text: "Welcome to Yashoda Technical Campus, Satara", icon: Sparkles }
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4200; // 4.2s cinematic intro

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 30) setMilestoneIndex(0);
      else if (pct < 65) setMilestoneIndex(1);
      else if (pct < 90) setMilestoneIndex(2);
      else setMilestoneIndex(3);

      if (elapsed >= duration) {
        clearInterval(timer);
        handleExit();
      }
    }, 40);

    return () => clearInterval(timer);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 450);
  };

  const CurrentIcon = milestones[milestoneIndex].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #0F1F38 0%, #0A1428 50%, #050B17 100%)'
      }}
    >
      {/* Background Ambient Glow & Sacred Geometry Rings */}
      <div className="absolute w-[340px] md:w-[680px] h-[340px] md:h-[680px] rounded-full bg-amber-500/10 blur-[90px] animate-pulse pointer-events-none" />
      <div className="absolute w-[500px] md:w-[850px] h-[500px] md:h-[850px] rounded-full border border-blue-400/10 pointer-events-none" />
      <div className="absolute w-[700px] md:w-[1100px] h-[700px] md:h-[1100px] rounded-full border border-amber-400/5 pointer-events-none" />

      {/* Main Glassmorphic Showcase Card */}
      <div className="relative max-w-xl w-full text-center space-y-6 md:space-y-7 backdrop-blur-2xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/60">

        {/* Official College Emblem with Radiant Sun Glow */}
        <div className="relative inline-flex items-center justify-center">
          {/* Rotating Sun / Diya Aura */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/30 via-yellow-300/20 to-amber-500/30 blur-md animate-pulse" />

          {/* Golden Badge Container */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-b from-amber-400/20 via-white/10 to-transparent p-1 shadow-2xl shadow-amber-500/20 border border-amber-300/30">
            <div className="w-full h-full bg-[#0a1428]/90 rounded-[22px] flex flex-col items-center justify-center p-3 overflow-hidden backdrop-blur-md">
              <img
                src={getAssetUrl('/icons/ytc-college-logo.png')}
                alt="Yashoda Technical Campus Emblem"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(234,179,8,0.4)] transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Sanskrit Tag Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-3 py-0.5 rounded-full text-[11px] shadow-lg tracking-wide border border-amber-300/40">
            ॥ ज्ञानम् जीवनस्य भूषणम् ॥
          </div>
        </div>

        {/* Title & Institutional Typography */}
        <div className="space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-400/20 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>YSPM's Yashoda Technical Campus, Satara</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            YTC CAMPUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">NAVIGATOR</span>
          </h1>

          <p className="text-xs md:text-sm font-medium text-slate-300 max-w-md mx-auto leading-relaxed">
            Faculty of Engineering &bull; Department of Artificial Intelligence &amp; Data Science
          </p>

          <p className="text-[11px] md:text-xs text-slate-400 max-w-sm mx-auto">
            High-precision outdoor walking maps, multi-storey indoor floor navigation, and instant classroom discovery.
          </p>
        </div>

        {/* Milestone Status & Progress Bar */}
        <div className="pt-2 space-y-3 max-w-md mx-auto">
          {/* Milestone Status Pill */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 py-1.5 px-4 rounded-xl">
            <CurrentIcon className="w-3.5 h-3.5 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
            <span className="transition-all duration-300">{milestones[milestoneIndex].text}</span>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/60 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 via-amber-400 to-yellow-300 h-full transition-all duration-75 ease-out rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="text-[11px] text-slate-400">AY 2026-2027 &bull; v2.0 Production</span>
            <button
              onClick={handleExit}
              className="group inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-all text-xs cursor-pointer shadow-sm hover:border-white/30"
            >
              <span>Enter Campus</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
