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
import { getAssetUrl } from '../../utils/assets';

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
        {/* Top Logo & College Branding */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80 bg-[#070d20]">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-amber-400/50 shrink-0">
            <img
              src={getAssetUrl('/icons/ytc-college-logo.png')}
              alt="Yashoda Technical Campus"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm tracking-tight text-white leading-tight truncate">
              YTC NAVIGATOR
            </div>
            <div className="text-[10px] text-amber-400 font-bold tracking-wide mt-0.5 truncate">
              YASHODA SATARA
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
          <div className="text-[10px] text-slate-400 mt-0.5">
            Wadhe Phata, Satara &bull; AI&amp;DS
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Sanskrit Motto & Help Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 text-center">
            <div className="text-[11px] font-bold text-amber-300">
              ॥ ज्ञानम् जीवनस्य भूषणम् ॥
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Knowledge is the ornament of life
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
