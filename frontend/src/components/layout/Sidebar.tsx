import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Search,
  Layers,
  Route,
  FolderTree,
  Building,
  Info,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { summary, userRole } = useCampus();

  const navigationItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Campus', path: '/explore', icon: Compass },
    { name: 'Find a Location', path: '/find', icon: Search },
    { name: 'Indoor Navigation', path: '/indoor', icon: Layers },
    { name: 'My Routes', path: '/routes', icon: Route },
    { name: 'Campus Directory', path: '/directory', icon: FolderTree },
    { name: 'Facilities', path: '/facilities', icon: Building },
    { name: 'About Campus', path: '/about', icon: Info },
    { name: 'Admin Panel', path: '/admin', icon: ShieldAlert, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a1128] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & Department Branding */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-[#070d20]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white leading-none">
              YTC NAVIGATOR
            </div>
            <div className="text-[10px] text-blue-400 font-medium tracking-wide mt-1">
              AI &amp; DATA SCIENCE PROJECT
            </div>
          </div>
        </div>

        {/* Institution Badge */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Institution
          </div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5 line-clamp-1">
            {summary?.institution_name || 'Yashoda Technical Campus'}
          </div>
          <div className="text-[11px] text-slate-400 line-clamp-1">
            Wadhe Phata, Satara
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.adminOnly && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    userRole === 'admin' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {userRole === 'admin' ? 'Active' : 'Auth'}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Academic Info & Quick Link */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070d20]/50 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              TY AI &amp; DS Project
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              v1.0.0
            </span>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-[11px] text-slate-300 font-medium border border-slate-800 transition-colors"
          >
            <span>FastAPI Swagger Docs</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </aside>
    </>
  );
};
