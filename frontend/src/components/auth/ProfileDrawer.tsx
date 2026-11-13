import React from 'react';
import {
  X,
  User as UserIcon,
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  LogOut,
  Edit3,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { getAssetUrl } from '../../utils/assets';
import { Link } from 'react-router-dom';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onEditProfile
}) => {
  const { currentUser, logoutUser, userRole } = useCampus();

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">

        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-5 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-white">
              <img
                src={currentUser.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {currentUser.role}
              </div>
              <h3 className="text-base font-bold text-white leading-tight mt-1">
                {currentUser.full_name}
              </h3>
              <p className="text-xs text-blue-200 truncate max-w-[200px]">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700">

          <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block">Institution</span>
                <span className="font-bold text-slate-800">{currentUser.college_name || 'Yashoda Technical Campus, Satara'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block">Department</span>
                <span className="font-bold text-slate-800">{currentUser.department || 'AI & Data Science'}</span>
              </div>
            </div>

            {currentUser.phone_number && (
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block">Phone</span>
                  <span className="font-bold text-slate-800">{currentUser.phone_number}</span>
                </div>
              </div>
            )}

            {currentUser.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block">Location / City</span>
                  <span className="font-bold text-slate-800">{currentUser.address}</span>
                </div>
              </div>
            )}

            {currentUser.roll_number && (
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block">ID / Roll Number</span>
                  <span className="font-bold text-slate-800 font-mono">{currentUser.roll_number}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onEditProfile();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100/70 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile Information
              </span>
              <span className="text-xs">&rarr;</span>
            </button>

            {['admin', 'superadmin', 'campus_admin'].includes(currentUser.role) && (
              <Link
                to="/admin"
                onClick={onClose}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Admin Dashboard Portal
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            )}
          </div>

        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              logoutUser();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors border border-rose-200/80"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Campus Navigator</span>
          </button>
        </div>

      </div>
    </div>
  );
};
