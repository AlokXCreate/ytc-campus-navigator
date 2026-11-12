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
  CheckCircle2
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, replayIntro } = useCampus();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#1e293b] text-white p-8 md:p-14 shadow-premium border border-slate-800">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Smart Campus Discovery System • Yashoda Technical Campus, Satara</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Seamless Navigation across <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">YTC Satara</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            A web-based campus navigation system engineered for students, faculty, visitors, and admissions at Yashoda Technical Campus. Discover classrooms, laboratories, administrative cells, and the shortest walking pathways.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              Explore Campus Map
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/find')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 flex items-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" />
              Find a Location
            </button>

            <button
              onClick={replayIntro}
              className="px-4 py-3 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Replay Intro
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Interactive Outdoor Map
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Indoor Floor-Wise Discovery
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Offline Resilient Caching
            </span>
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
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Engineered for Real Campus Needs
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Built as a third-year Artificial Intelligence and Data Science project to solve wayfinding challenges across multi-building campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/explore')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-blue-200 transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Outdoor Campus Discovery
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Locate academic buildings, engineering blocks, pharmacy complex, central library, sports grounds, and parking spots with precise markers.
            </p>
            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 pt-2">
              Launch outdoor map <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => navigate('/indoor')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-blue-200 transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Indoor Floor-by-Floor Plans
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore multi-storey building interiors. Browse Ground, First, and Second floors to pinpoint AI&amp;DS labs, HOD chambers, and classrooms.
            </p>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 pt-2">
              Open floor navigator <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => navigate('/routes')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-blue-200 transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Route className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Shortest Walking Routes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Dijkstra pathfinding over campus walkway graphs. Get turn-by-turn walking instructions, distance, and estimated walk time.
            </p>
            <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1 pt-2">
              Plan walking route <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Attribution Card */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Building2 className="w-4 h-4" />
            Academic Project Accreditation
          </div>
          <h3 className="text-xl font-bold text-white">
            Department of Artificial Intelligence &amp; Data Science
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Yashoda Technical Campus, NH-4, S. No. 242/1, VN Rd / Wadhe Phata, Wadhe, Satara – 415011, Maharashtra.
          </p>
        </div>

        <button
          onClick={() => navigate('/about')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors shrink-0"
        >
          View Campus Details
        </button>
      </section>
    </div>
  );
};
