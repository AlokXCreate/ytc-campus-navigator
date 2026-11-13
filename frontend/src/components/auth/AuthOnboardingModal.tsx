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
  AlertCircle
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { firebaseAuthService } from '../../services/firebaseAuth';
import { getAssetUrl } from '../../utils/assets';
import { User } from '../../types/campus';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onSuccess: (user: User, needsProfileSetup: boolean) => void;
  onClose?: () => void;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onSuccess,
  onClose
}) => {
  const { loginUser } = useCampus();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'visitor' | 'admin'>('student');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await firebaseAuthService.signInWithGoogle(selectedRole);
      loginUser(user);
      // For Google users, proceed to profile setup to confirm phone/dept/gender
      onSuccess(user, true);
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
      loginUser(guestUser);
      onSuccess(guestUser, false);
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
        if (!email || !password || !fullName) {
          throw new Error('Please enter your full name, email, and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const newUser = await firebaseAuthService.signUpWithEmail(
          email,
          password,
          fullName,
          selectedRole
        );
        loginUser(newUser);
        onSuccess(newUser, true);
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        const user = await firebaseAuthService.loginWithEmail(email, password);
        loginUser(user);
        onSuccess(user, false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-8">

        {/* Top Decorative Gradient Banner with College Emblem */}
        <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 px-6 pt-7 pb-6 text-white text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none" />

          {/* Logo Badge */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-amber-400/60">
              <img
                src={getAssetUrl('/icons/ytc-college-logo.png')}
                alt="Yashoda Technical Campus"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="absolute -bottom-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              YTC SATARA
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            {mode === 'login' ? 'Sign In to Campus Navigator' : 'Create Student / Faculty Account'}
          </h2>
          <p className="text-xs text-blue-200/90 mt-1">
            Yashoda Technical Campus &bull; Smart Indoor &amp; Outdoor Navigation
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">

          {/* Role Switcher Pill Bar */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Your Role / Identity
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'faculty', label: 'Faculty', icon: Briefcase },
                { id: 'visitor', label: 'Visitor', icon: Users },
                { id: 'admin', label: 'Admin', icon: ShieldCheck }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedRole(id as any)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Sign-In Options */}
          <div className="space-y-2.5">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs md:text-sm rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
            >
              {/* Google Colored Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            {/* Guest One-Click Access Button */}
            <button
              type="button"
              onClick={handleGuestContinue}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-50 hover:bg-amber-100/80 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Explore as Guest / Visitor (Instant Access)</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alok Deshmukh"
                    className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@ytc.edu.in"
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-9 pr-9 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Demo Admin: admin@ytc.edu.in</span>
                  <span className="font-mono text-slate-600">ytcadmin2026</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs md:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Continue to Profile Setup'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Signup */}
          <div className="text-center pt-1 border-t border-slate-100">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600">
                New to Yashoda Technical Campus?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Create an Account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign In instead
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

