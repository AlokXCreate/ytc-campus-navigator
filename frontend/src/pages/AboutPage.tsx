import React from 'react';
import {
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Layers,
  Code2,
  HeartHandshake,
  ExternalLink
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Institution Banner */}
      <div className="bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#1e293b] text-white p-8 md:p-12 rounded-3xl shadow-premium border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          Institutional Overview
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Yashoda Technical Campus, Satara
        </h1>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
          An integrated technical educational campus affiliated with Dr. Babasaheb Ambedkar Technological University (DBATU), Lonere, and approved by AICTE, New Delhi.
        </p>

        <div className="pt-2 flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
          <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white">Campus Postal Address:</div>
            <div>NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra, India.</div>
          </div>
        </div>
      </div>

      {/* Project Attribution Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-subtle space-y-6">
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Academic Project Specification
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            YTC Campus Navigator System
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            This project is designed and implemented as a Third-Year Capstone Project within the <span className="font-semibold text-slate-900">Department of Artificial Intelligence and Data Science</span> at Yashoda Technical Campus, Satara.
          </p>
        </div>

        {/* Technical Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Code2 className="w-4 h-4 text-blue-600" /> System Architecture
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decoupled client-server design combining React 18, TypeScript, and Tailwind CSS with a high-performance Python FastAPI routing backend and SQLite database.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Layers className="w-4 h-4 text-emerald-600" /> Algorithms &amp; Data Structures
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dijkstra and A* shortest path algorithms executed over NetworkX graph topology representations of campus walkways, pedestrian corridors, and building entrances.
            </p>
          </div>
        </div>

        {/* Development Ethics Notice */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Survey Integrity Note:</span> To prevent fabrication of official campus facilities, coordinates, or room numbers, all campus points are defined in structured JSON schemas and seeded into the database as demonstrative benchmarks. Real-world surveyed measurements can be calibrated at any time.
          </div>
        </div>
      </div>
    </div>
  );
};
