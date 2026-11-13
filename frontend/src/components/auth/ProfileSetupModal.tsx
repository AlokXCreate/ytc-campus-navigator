import React, { useState } from 'react';
import {
  User as UserIcon,
  Building,
  Phone,
  MapPin,
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Users,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { User } from '../../types/campus';
import { getAssetUrl } from '../../utils/assets';

interface ProfileSetupModalProps {
  isOpen: boolean;
  user: User | null;
  onComplete: () => void;
}

// High-resolution academic avatar presets
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  user,
  onComplete
}) => {
  const { updateProfile } = useCampus();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [collegeName, setCollegeName] = useState(user?.college_name || 'Yashoda Technical Campus, Satara');
  const [role, setRole] = useState(user?.role || 'student');
  const [department, setDepartment] = useState(user?.department || 'Artificial Intelligence & Data Science');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '+91 ');
  const [address, setAddress] = useState(user?.address || 'Satara, Maharashtra');
  const [gender, setGender] = useState<string>(user?.gender || 'male');
  const [rollNumber, setRollNumber] = useState(user?.roll_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile_photo || PRESET_AVATARS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const profileData: Partial<User> = {
      full_name: fullName,
      college_name: collegeName,
      role: role as any,
      department,
      email,
      phone_number: phoneNumber,
      address,
      gender,
      roll_number: rollNumber,
      profile_photo: avatarUrl
    };

    updateProfile(profileData);

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-6">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 px-6 py-5 text-white flex items-center justify-between border-b border-blue-700/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-amber-400/60 shadow-md">
              <img
                src={getAssetUrl('/icons/ytc-college-logo.png')}
                alt="YTC Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 2 of 2: Account Onboarding</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white">
                Complete Your Campus Profile
              </h2>
            </div>
          </div>
          <span className="hidden sm:inline-block bg-white/10 text-blue-200 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
            YTC Satara
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

          {/* Profile Photo Section */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar Preview */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-blue-500/30 shrink-0 bg-white">
              <img
                src={avatarUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/40 hover:bg-black/50 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                Change
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Presets & Upload Button */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Choose Profile Avatar</span>
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  Upload Custom Photo
                </label>
              </div>

              {/* Avatar Preset Circles */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                      avatarUrl === preset ? 'border-blue-600 scale-110 shadow-sm' : 'border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
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

            {/* College Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College / Institution Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Yashoda Technical Campus, Satara"
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role / Designation
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
              >
                <option value="student">Student (B.Tech / Diploma / MBA)</option>
                <option value="faculty">Faculty Member / Professor</option>
                <option value="visitor">Campus Visitor / Parent / Guest</option>
                <option value="admin">Campus Facility Administrator</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department / Program
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
              >
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence &amp; Data Science</option>
                <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                <option value="Pharmacy (B.Pharm / D.Pharm)">Pharmacy (B.Pharm / D.Pharm)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                <option value="Central Administration">Central Administration</option>
                <option value="Other / General">Other / General</option>
              </select>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@ytc.edu.in"
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>
            </div>

            {/* Address / City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Satara, Maharashtra"
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {['male', 'female', 'other', 'prefer_not_to_say'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                      gender === g
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g === 'prefer_not_to_say' ? 'Other' : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Roll / PRN Number or Cabin */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'faculty' ? 'Staff ID / Cabin Room' : 'Roll Number / PRN (Optional)'}
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder={role === 'faculty' ? 'e.g. CABIN-204' : 'e.g. YTC/2024/AIDS/042'}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Finalizing Profile...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Save Profile &amp; Launch Campus Navigator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              You can update your personal information or avatar anytime from the top-right profile menu.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

