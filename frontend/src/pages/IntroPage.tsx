import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Layers, Compass, Play } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

interface IntroPageProps {
  onComplete: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const milestones = [
    { text: 'Calibrating Satellite GIS Coordinates (Satara, MH)...', icon: MapPin },
    { text: 'Loading Yashoda Campus Architectural Blueprints...', icon: Layers },
    { text: 'Initializing Multi-Storey Indoor Graphs & Walkways...', icon: Compass },
    { text: 'Welcome to Yashoda Technical Campus, Satara', icon: Sparkles }
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000; // 4-second cinematic intro

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
      onComplete();
    }, 400);
  };

  const CurrentIcon = milestones[milestoneIndex].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #0d1e38 0%, #081121 55%, #030712 100%)'
      }}
    >
      {/* Dynamic Background Aura & Architectural Rings */}
      <div className="absolute w-[450px] md:w-[850px] h-[450px] md:h-[850px] rounded-full bg-gradient-to-tr from-amber-500/15 via-blue-600/15 to-transparent blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[600px] md:w-[1050px] h-[600px] md:h-[1050px] rounded-full border border-blue-400/10 pointer-events-none" />
      <div className="absolute w-[850px] md:w-[1350px] h-[850px] md:h-[1350px] rounded-full border border-amber-400/5 pointer-events-none" />

      {/* Main Glassmorphic Showcase Card */}
      <div className="relative max-w-2xl w-full text-center space-y-7 md:space-y-8 backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl shadow-black/80">
        
        {/* Official College Emblem with Radiant Glow */}
        <div className="relative inline-flex items-center justify-center">
          {/* Ambient Diya/Sun Radiant Aura */}
          <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 blur-xl animate-pulse" />

          {/* Golden Badge Frame */}
          <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-gradient-to-b from-amber-300/30 via-white/10 to-transparent p-1 shadow-2xl shadow-amber-500/20 border border-amber-300/40">
            <div className="w-full h-full bg-[#071120]/95 rounded-[22px] flex flex-col items-center justify-center p-3 overflow-hidden backdrop-blur-md">
              <img
                src={getAssetUrl('/icons/ytc-college-logo.png')}
                alt="Yashoda Technical Campus Emblem"
                className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(245,158,11,0.5)] transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Sacred Sanskrit Motto Badge */}
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black px-4 py-1 rounded-full text-xs md:text-sm shadow-xl tracking-wide border border-amber-200">
            ॥ ज्ञानम् जीवनस्य भूषणम् ॥
          </div>
        </div>

        {/* Institutional Titles & Accreditation */}
        <div className="space-y-2.5 pt-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-400/25 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Yashoda Shikshan Prasarak Mandal's</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            YASHODA TECHNICAL CAMPUS
          </h1>

          <div className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 tracking-wide">
            CAMPUS NAVIGATOR
          </div>

          <p className="text-xs md:text-sm font-medium text-slate-300 max-w-lg mx-auto leading-relaxed">
            Faculty of Engineering &bull; Department of Artificial Intelligence &amp; Data Science
          </p>

          <p className="text-[11px] md:text-xs text-slate-400 max-w-md mx-auto">
            High-definition Google Maps Satellite outdoor walkways, multi-storey indoor blueprints, and turn-by-turn classroom discovery.
          </p>
        </div>

        {/* Milestone Indicator & Animated Progress Track */}
        <div className="pt-2 space-y-4 max-w-lg mx-auto">
          {/* Milestone Status Chip */}
          <div className="flex items-center justify-center gap-2.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 py-2 px-4 rounded-2xl shadow-inner">
            <CurrentIcon className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
            <span className="transition-all duration-300">{milestones[milestoneIndex].text}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden border border-slate-700/80 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 via-amber-400 to-yellow-300 h-full transition-all duration-75 ease-out rounded-full shadow-[0_0_12px_rgba(245,158,11,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Control Actions Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="text-[11px] text-slate-400">Satara, Maharashtra • AY 2026-27</span>
            <button
              onClick={handleExit}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl border border-amber-300/40 transition-all text-xs cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>Enter Campus Portal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

