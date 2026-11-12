import React, { useEffect, useState } from 'react';
import { Compass, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface IntroSplashProps {
  onDismiss: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onDismiss }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000; // 4 seconds subtle intro

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(timer);
        onDismiss();
      }
    }, 40);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#1e293b] text-white p-6 overflow-hidden">
      {/* Background Subtle Geometric Circles */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-blue-500/10 animate-pulse pointer-events-none" />
      <div className="absolute w-[900px] h-[900px] rounded-full border border-indigo-500/5 pointer-events-none" />

      <div className="relative max-w-xl w-full text-center space-y-6">
        {/* Animated Compass Logo Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-2xl shadow-blue-500/20">
            <div className="w-full h-full bg-[#0f172a] rounded-3xl flex items-center justify-center">
              <Compass className="w-12 h-12 text-blue-400 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
        </div>

        {/* Institution and Project Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AI &amp; Data Science Academic Initiative
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
            YTC CAMPUS NAVIGATOR
          </h1>
          <p className="text-sm md:text-base font-medium text-slate-300">
            Yashoda Technical Campus, Satara
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto pt-1">
            Smart indoor &amp; outdoor location discovery, floor-wise building navigation, and shortest walking routes.
          </p>
        </div>

        {/* Department & Attribution Tag */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official Academic Project
          </span>
          <span>•</span>
          <span>Wadhe Phata, Satara</span>
        </div>

        {/* Progress Bar & Skip Intro Control */}
        <div className="pt-4 space-y-3">
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full transition-all duration-75 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Loading campus map data...</span>
            <button
              onClick={onDismiss}
              className="group inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Skip Intro
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
