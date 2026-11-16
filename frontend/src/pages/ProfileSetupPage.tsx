import React, { useState } from 'react';
import {
  User as UserIcon,
  Building,
  Mail,
  Phone,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { User } from '../types/campus';
import { getAssetUrl } from '../utils/assets';

interface ProfileSetupPageProps {
  initialUser: User | null;
  onComplete: (user: User) => void;
}

export const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({
  initialUser,
  onComplete
}) => {
  const [fullName, setFullName] = useState(initialUser?.full_name || '');
  const [collegeName, setCollegeName] = useState(
    initialUser?.college_name || 'Yashoda Technical Campus, Satara'
  );
  const [email, setEmail] = useState(initialUser?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(initialUser?.phone_number || '');
  const [address, setAddress] = useState(initialUser?.address || 'Satara, Maharashtra');
  const [gender, setGender] = useState<string>(initialUser?.gender || 'Prefer not to say');
  const [department, setDepartment] = useState(
    initialUser?.department || 'Artificial Intelligence & Data Science'
  );
  const [rollNumber, setRollNumber] = useState(initialUser?.roll_number || '');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    initialUser?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  const [isLoading, setIsLoading] = useState(false);

  const presetAvatars = [
    { label: 'Scholar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Scholar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Scholar 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { label: 'Scholar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updatedUser: User = {
      ...(initialUser || {
        id: `user_${Date.now()}`,
        role: 'student',
        is_active: true
      }),
      full_name: fullName.trim() || 'Campus Explorer',
      college_name: collegeName.trim() || 'Yashoda Technical Campus, Satara',
      email: email.trim(),
      phone_number: phoneNumber.trim(),
      address: address.trim(),
      gender,
      department,
      roll_number: rollNumber.trim(),
      profile_photo: profilePhoto
    };

    setTimeout(() => {
      setIsLoading(false);
      onComplete(updatedUser);
    }, 350);
  };

  const departmentsList = [
    'Artificial Intelligence & Data Science',
    'Computer Science & Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Faculty of Pharmacy',
    'Faculty of MBA / Management',
    'Faculty of MCA',
    'Basic Sciences & Humanities',
    'Campus Administration & Operations',
    'Guest / Visitor'
  ];

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#08101e] text-slate-100 overflow-y-auto">
      <div className="max-w-2xl w-full my-6 bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-7">
        
        {/* Step Indicator & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 p-1.5 border border-amber-300/30 shadow-md flex items-center justify-center">
              <img
                src={getAssetUrl('/icons/ytc-college-logo.png')}
                alt="YTC Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Step 2 of 2 • Account Creation
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Setup Your Navigator Profile
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-400/20 w-max">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role: {(initialUser?.role || 'Student').toUpperCase()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Profile Photo Picker */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Photo &amp; Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              {/* Photo Preview Circle */}
              <div className="relative w-20 h-20 rounded-full border-2 border-blue-400 p-0.5 shrink-0 overflow-hidden shadow-lg shadow-blue-500/20">
                <img
                  src={profilePhoto}
                  alt="Profile Preview"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Upload & Presets */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Preset Avatar Circles */}
                  <div className="flex items-center gap-1.5">
                    {presetAvatars.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfilePhoto(p.url)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                          profilePhoto === p.url ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/20'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Select a preset scholar avatar or upload a picture from your device.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Primary Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alok Patil"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* College Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">College / Institution *</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Yashoda Technical Campus, Satara"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alok@yes.edu.in"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Mobile Number *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400 flex items-center gap-1">
                  <span>🇮🇳</span> +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-16 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Department / Wing</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#0d1627] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Roll / Staff ID */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Roll No. / Faculty ID / Badge</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. YTC/2026/AIDS/042"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Gender Selector Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Gender</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {genderOptions.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                    gender === g
                      ? 'bg-blue-600/30 border-blue-400 text-white font-bold ring-1 ring-blue-400'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.07]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Residential Address / City */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Residential Address / City / Hometown</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Satara City, Maharashtra 415001"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <span>Complete Setup &amp; Launch Navigator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

