import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  ShieldAlert,
  Lock,
  Building2,
  DoorOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  LogOut,
  Plus
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { userRole, setUserRole, buildings, facilities, summary, refreshData } = useCampus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (email.trim().toLowerCase() === 'admin@ytc.edu.in' && (password === 'admin123' || password === 'ytcadmin2026')) {
        setUserRole('admin');
        setSuccessMsg('Successfully authenticated as Campus Administrator.');
      } else {
        setErrorMsg('Invalid administrative credentials. Hint: admin@ytc.edu.in / admin123');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleLogout = () => {
    setUserRole('student');
    setEmail('');
    setPassword('');
  };

  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-premium space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Campus Administration Portal
            </h1>
            <p className="text-xs text-slate-500">
              Restricted to authorized YTC facility managers and campus surveyors.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ytc.edu.in"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Verifying...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
            Demonstration credentials: <span className="font-semibold text-slate-600">admin@ytc.edu.in</span> / <span className="font-semibold text-slate-600">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Authenticated Administration Session
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            YTC Campus Data Management Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage building coordinates, room associations, and ground-truth survey points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Database State Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{buildings.length}</div>
            <div className="text-xs text-slate-500">Registered Buildings</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{summary?.total_rooms ?? 11}</div>
            <div className="text-xs text-slate-500">Classrooms &amp; Laboratories</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{facilities.length}</div>
            <div className="text-xs text-slate-500">Amenities &amp; Utilities</div>
          </div>
        </div>
      </div>

      {/* Campus Buildings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered Buildings</h2>
            <p className="text-xs text-slate-500">Coordinate and floor configuration records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Building Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Floors</th>
                <th className="px-5 py-3">GPS Coordinates</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-blue-600">{b.building_code}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{b.name}</td>
                  <td className="px-5 py-3.5 capitalize">{b.building_type.replace('_', ' ')}</td>
                  <td className="px-5 py-3.5">{b.total_floors} Floors</td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                    {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
