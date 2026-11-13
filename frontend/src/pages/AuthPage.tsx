import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampus } from '../context/CampusContext';
import { AuthOnboardingModal } from '../components/auth/AuthOnboardingModal';
import { ProfileSetupModal } from '../components/auth/ProfileSetupModal';
import { User } from '../types/campus';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useCampus();

  const [authModalOpen, setAuthModalOpen] = useState(!currentUser);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(currentUser);

  const handleAuthSuccess = (user: User, needsProfileSetup: boolean) => {
    setPendingUser(user);
    setAuthModalOpen(false);

    if (needsProfileSetup || !user.phone_number) {
      setProfileModalOpen(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleProfileComplete = () => {
    setProfileModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <AuthOnboardingModal
        isOpen={authModalOpen}
        onSuccess={handleAuthSuccess}
        onClose={() => navigate('/dashboard')}
      />

      <ProfileSetupModal
        isOpen={profileModalOpen}
        user={pendingUser}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};
