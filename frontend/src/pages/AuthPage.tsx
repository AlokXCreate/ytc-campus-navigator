import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  AlertCircle,
  MapPin,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuth';
import { getAssetUrl } from '../utils/assets';
import { User } from '../types/campus';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onGuest: (guestUser: User) => void;
  onBackToIntro?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onGuest, onBackToIntro }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'visitor' | 'admin'>('student');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await firebaseAuthService.signInWithGoogle(selectedRole);
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    setIsLoading(true);
    try {
      const guestUser = firebaseAuthService.continueAsGuest();
      guestUser.role = selectedRole;
      onGuest(guestUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        const user = await firebaseAuthService.signUpWithEmail(email, password, fullName, selectedRole);
        onSuccess(user);
      } else {
        const user = await firebaseAuthService.loginWithEmail(email, password);
        user.role = selectedRole;
        onSuccess(user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleCards = [
    {
      id: 'student',
      title: 'Student',
      desc: 'B.Tech / Pharmacy / MBA / MCA',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'faculty',
      title: 'Faculty',
      desc: 'Teaching Staff & Professors',
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'visitor',
      title: 'Visitor',
      desc: 'Parents, Guests & Recruiters',
      icon: Users,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'admin',
      title: 'Admin',
      desc: 'Campus Staff & Facility Mgrs',
      icon: ShieldCheck,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#08101e] text-slate-100 overflow-y-auto">
      {/* Left Column: Institutional Brand & Map Preview Showcase */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#0c182f] via-[#081224] to-[#040813] border-b lg:border-b-0 lg:border-r border-white/10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-2 border border-amber-300/30 shadow-lg shadow-amber-500/10 flex items-center justify-center backdrop-blur-md">
              <img
                src={getAssetUrl('/icons/ytc-college-logo.png')}
                alt="Yashoda Technical Campus"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                ॥ ज्ञानम् जीवनस्य भूषणम् ॥
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                YASHODA TECHNICAL CAMPUS
              </h2>
              <p className="text-xs text-slate-300 font-medium">Satara, Maharashtra, India</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Smart Outdoor &amp; Multi-Storey Indoor Navigation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step-by-step turn guidance across university grounds, crystal-clear Google Maps Satellite view, vector architectural blueprints, and classroom finding.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Compass className="w-4 h-4" />
                <span>Google Maps Satellite</span>
              </div>
              <p className="text-[11px] text-slate-400">High-definition aerial imagery with roads &amp; buildings</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <Layers className="w-4 h-4" />
                <span>Indoor Floor Plans</span>
              </div>
              <p className="text-[11px] text-slate-400">Normalized coordinates across multi-storey blocks</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <MapPin className="w-4 h-4" />
                <span>Dijkstra Algorithm</span>
              </div>
              <p className="text-[11px] text-slate-400">Optimal shortest pedestrian walking calculations</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Role Personalization</span>
              </div>
              <p className="text-[11px] text-slate-400">Custom routing for Students, Staff, Visitors &amp; Admin</p>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="relative pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>AI &amp; Data Science Dept • 2026-27</span>
          {onBackToIntro && (
            <button
              onClick={onBackToIntro}
              className="hover:text-amber-400 underline transition-colors cursor-pointer"
            >
              ← Replay Intro
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Interactive Authentication & Role Selector */}
      <div className="lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center relative">
        <div className="max-w-xl w-full space-y-6">
          {/* Header */}
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Portal Gateway</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to YTC Navigator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your campus identity to customize your navigation permissions and shortcuts.
            </p>
          </div>

          {/* Role Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Choose Your Campus Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roleCards.map((rc) => {
                const Icon = rc.icon;
                const isSelected = selectedRole === rc.id;
                return (
                  <button
                    key={rc.id}
                    type="button"
                    onClick={() => setSelectedRole(rc.id as any)}
                    className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400 shadow-md shadow-blue-500/20 ring-1 ring-blue-400'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{rc.title}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{rc.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action 1: Google Sign-In */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google as {selectedRole.toUpperCase()}</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="shrink-0 mx-3 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Or Continue with Email
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alok Patil"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">College or Personal Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@yes.edu.in"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span>{mode === 'signup' ? 'Create Account & Continue' : 'Sign In with Email'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Prominent Instant Guest Access Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGuestContinue}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div>Continue as Guest / Direct Explorer</div>
                    <div className="text-[10px] text-amber-400/80 font-normal">1-Click instant access without registration</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Security Note */}
          <p className="text-[10px] text-slate-500 text-center">
            Integrated with Firebase Authentication • AES-256 session encryption • Yashoda Technical Campus Satara
          </p>
        </div>
      </div>
    </div>
  );
};
