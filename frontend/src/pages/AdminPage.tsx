import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { api } from '../services/api';
import { AdminStats } from '../types/campus';

// Admin Sub-Modules
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminBuildings } from '../components/admin/AdminBuildings';
import { AdminFloors } from '../components/admin/AdminFloors';
import { AdminRooms } from '../components/admin/AdminRooms';
import { AdminFacilities } from '../components/admin/AdminFacilities';
import { AdminPaths } from '../components/admin/AdminPaths';
import { AdminIndoorPaths } from '../components/admin/AdminIndoorPaths';
import { AdminFloorPlans } from '../components/admin/AdminFloorPlans';
import { AdminImportExport } from '../components/admin/AdminImportExport';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminLogs } from '../components/admin/AdminLogs';
import { AdminSettings } from '../components/admin/AdminSettings';

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
  Upload,
  Layers,
  Route,
  Network,
  Users,
  History,
  Settings,
  ChevronRight
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { buildings, facilities, currentUser, loginAdmin, logoutAdmin, refreshData } = useCampus();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Cross-tab deep links
  const [targetBuildingForFloors, setTargetBuildingForFloors] = useState<string | undefined>();
  const [targetRoomFloor, setTargetRoomFloor] = useState<{ buildingId: string; floorId: string } | undefined>();

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load admin stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const authData = await api.login(email.trim(), password);
      loginAdmin(authData.access_token, authData.user);
      loadStats();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Hint: admin@ytc.edu.in / admin123');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setEmail('');
    setPassword('');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Database, badge: null },
    { id: 'buildings', label: 'Buildings', icon: Building2, badge: stats?.total_buildings },
    { id: 'floors', label: 'Floors & Levels', icon: Layers, badge: stats?.total_floors },
    { id: 'rooms', label: 'Classrooms & Labs', icon: DoorOpen, badge: stats?.total_rooms },
    { id: 'facilities', label: 'Facilities & POIs', icon: MapPin, badge: stats ? stats.total_facilities + stats.total_pois : null },
    { id: 'outdoor_paths', label: 'Outdoor Walkways', icon: Route, badge: stats?.total_outdoor_paths },
    { id: 'indoor_paths', label: 'Indoor Graph Links', icon: Network, badge: stats?.total_indoor_nodes },
    { id: 'floor_plans', label: 'Floor Plan Blueprints', icon: Upload, badge: null },
    { id: 'import_export', label: 'Import / Export Data', icon: Database, badge: null },
    { id: 'users', label: 'User Accounts (RBAC)', icon: Users, badge: stats?.total_users },
    { id: 'logs', label: 'Activity Audit Trail', icon: History, badge: null },
    { id: 'settings', label: 'System Settings', icon: Settings, badge: null },
  ];

  // If unauthenticated or guest, show modern login card
  const isAuthenticatedAdmin = currentUser && ['superadmin', 'campus_admin', 'admin', 'viewer'].includes(currentUser.role);

  if (!isAuthenticatedAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-premium space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Campus Administration Portal
            </h1>
            <p className="text-xs text-slate-500">
              Restricted to authorized YTC facility surveyors and campus system administrators.
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
              {isSubmitting ? 'Verifying session...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700">Default Demonstration Credentials:</div>
            <div>• Super Admin: <span className="font-mono text-slate-800 font-semibold">admin@ytc.edu.in</span> / <span className="font-mono text-slate-800 font-semibold">admin123</span></div>
            <div>• Campus Admin: <span className="font-mono text-slate-800 font-semibold">manager@ytc.edu.in</span> / <span className="font-mono text-slate-800 font-semibold">manager123</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Authenticated Administration Session
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            YTC Campus Spatial Management Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <strong>{currentUser.full_name}</strong> ({currentUser.email}) • Role: <span className="capitalize font-bold text-slate-700">{currentUser.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadStats();
              refreshData();
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Sync Database
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

      {/* Main Layout: Left Navigation + Active Sub-Module */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Sub-Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-subtle space-y-1 h-fit">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Admin Sections
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Active Content Panel */}
        <div className="lg:col-span-4 min-w-0">
          {activeTab === 'overview' && (
            <AdminOverview
              stats={stats}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onQuickAction={(action) => {
                if (action === 'add_building') setActiveTab('buildings');
                if (action === 'add_room') setActiveTab('rooms');
              }}
            />
          )}

          {activeTab === 'buildings' && (
            <AdminBuildings
              buildings={buildings}
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
              onSelectBuildingForFloors={(bldgId) => {
                setTargetBuildingForFloors(bldgId);
                setActiveTab('floors');
              }}
            />
          )}

          {activeTab === 'floors' && (
            <AdminFloors
              buildings={buildings}
              initialBuildingId={targetBuildingForFloors}
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
              onOpenRoomEditor={(bldgId, floorId) => {
                setTargetRoomFloor({ buildingId: bldgId, floorId });
                setActiveTab('rooms');
              }}
            />
          )}

          {activeTab === 'rooms' && (
            <AdminRooms
              buildings={buildings}
              initialBuildingId={targetRoomFloor?.buildingId}
              initialFloorId={targetRoomFloor?.floorId}
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
            />
          )}

          {activeTab === 'facilities' && (
            <AdminFacilities
              facilities={facilities}
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
            />
          )}

          {activeTab === 'outdoor_paths' && (
            <AdminPaths
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
            />
          )}

          {activeTab === 'indoor_paths' && (
            <AdminIndoorPaths
              buildings={buildings}
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
            />
          )}

          {activeTab === 'floor_plans' && (
            <AdminFloorPlans
              buildings={buildings}
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
            />
          )}

          {activeTab === 'import_export' && (
            <AdminImportExport
              onRefresh={() => {
                loadStats();
                refreshData();
              }}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers
              currentUser={currentUser}
            />
          )}

          {activeTab === 'logs' && (
            <AdminLogs />
          )}

          {activeTab === 'settings' && (
            <AdminSettings />
          )}
        </div>
      </div>
    </div>
  );
};
