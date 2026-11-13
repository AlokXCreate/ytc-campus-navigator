import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Layers,
  Route,
  ArrowRight,
  ShieldCheck,
  Building2,
  BookOpen,
  Sparkles,
  Search,
  CheckCircle2,
  Satellite,
  ExternalLink
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { getAssetUrl } from '../utils/assets';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, replayIntro, setAuthModalOpen, currentUser } = useCampus();

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070e24] via-[#0b173d] to-[#122256] text-white p-8 md:p-12 shadow-2xl border border-blue-900/40">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-5">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>YSPM's Yashoda Technical Campus, Satara &bull; AI&amp;DS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Intelligent Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Wayfinding</span> &amp; Indoor Discovery
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
              High-definition Google Maps Satellite outdoor navigation coupled with vector architectural floor plans. Discover classrooms, AI labs, seminar halls, and optimal walking paths at YTC Satara.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/explore')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Satellite className="w-4 h-4 text-amber-300" />
                <span>Explore Google Satellite Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/indoor')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Indoor Floor Plans</span>
              </button>

              {!currentUser && (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-400/40 transition-colors cursor-pointer"
                >
                  Sign In / Register
                </button>
              )}

              <button
                onClick={replayIntro}
                className="px-3 py-3 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Replay Intro
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-slate-300 border-t border-white/10">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Google Maps High-Res Satellite
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Multi-Storey Indoor Graphs
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Offline-First PWA
              </span>
            </div>
          </div>

          {/* College Logo Showcase in Hero */}
          <div className="shrink-0 flex flex-col items-center text-center">
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-tr from-amber-400/20 to-blue-500/20 p-1 border-2 border-amber-400/50 shadow-2xl backdrop-blur-md">
              <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center p-3">
                <img
                  src={getAssetUrl('/icons/ytc-college-logo.png')}
                  alt="Yashoda Technical Campus Emblem"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)]"
                />
              </div>
            </div>
            <div className="mt-3 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              ॥ ज्ञानम् जीवनस्य भूषणम् ॥
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Core Capabilities
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Engineered for Yashoda Technical Campus
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Third-year Artificial Intelligence &amp; Data Science academic project delivering precision indoor-outdoor navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/explore')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Satellite className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Google Maps &amp; Aerial Satellite
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crystal-clear aerial satellite imagery combined with OpenStreetMap. View campus boundaries, gates, roads, sports grounds, and buildings.
            </p>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-1">
              Launch Satellite Map <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => navigate('/indoor')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Multi-Storey Floor Plans
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vector architectural blueprints with normalized coordinates $[0, 1]$. Discover AI labs, faculty cabins, and navigate via stairs and lifts.
            </p>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-1">
              Browse Floor Plans <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => navigate('/routes')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Route className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Dijkstra &amp; A* Shortest Routes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              NetworkX graph routing computing walking distance in meters, walk times, and wheelchair accessibility modes across pedestrian paths.
            </p>
            <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-1">
              Plan Walking Path <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Accreditation Card */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Building2 className="w-4 h-4" />
            Yashoda Technical Campus, Satara
          </div>
          <h3 className="text-xl font-bold text-white">
            Department of Artificial Intelligence &amp; Data Science
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Approved by AICTE, DTE Maharashtra; Affiliated to Shivaji University / DBATU. S. No. 242/1, NH-4, Wadhe Phata, Satara – 415011, Maharashtra.
          </p>
        </div>

        <a
          href="https://www.google.com/maps/dir/?api=1&destination=17.7215,74.0205"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span>Open Campus in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </section>
    </div>
  );
};
