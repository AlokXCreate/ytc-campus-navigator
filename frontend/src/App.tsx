import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampusProvider, useCampus } from './context/CampusContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { IntroSplash } from './components/common/IntroSplash';
import { NetworkStatusBanner } from './components/common/NetworkStatusBanner';
import { AuthOnboardingModal } from './components/auth/AuthOnboardingModal';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { ProfileDrawer } from './components/auth/ProfileDrawer';
import { User } from './types/campus';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExploreCampusPage } from './pages/ExploreCampusPage';
import { FindLocationPage } from './pages/FindLocationPage';
import { IndoorNavPage } from './pages/IndoorNavPage';
import { MyRoutesPage } from './pages/MyRoutesPage';
import { CampusDirectoryPage } from './pages/CampusDirectoryPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';

const AppContent: React.FC = () => {
  const {
    showIntro,
    dismissIntro,
    onboardingStep,
    setOnboardingStep,
    currentUser,
    authModalOpen,
    setAuthModalOpen,
    profileModalOpen,
    setProfileModalOpen
  } = useCampus();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(currentUser);

  const handleAuthSuccess = (user: User, needsProfileSetup: boolean) => {
    setPendingUser(user);
    setAuthModalOpen(false);

    if (needsProfileSetup || !user.phone_number) {
      setOnboardingStep('profile_setup');
    } else {
      setOnboardingStep('ready');
    }
  };

  const handleProfileComplete = () => {
    setOnboardingStep('ready');
    setProfileModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* 1. Cinematic Intro Screen (Golden Emblem, Sacred Sanskrit Motto, Vector Milestones) */}
      {showIntro && <IntroSplash onDismiss={dismissIntro} />}

      {/* 2. Onboarding Auth Modal (Sign in with Google, Email, or Guest) */}
      {(onboardingStep === 'auth' || authModalOpen) && (
        <AuthOnboardingModal
          isOpen={true}
          onSuccess={handleAuthSuccess}
          onClose={() => {
            setAuthModalOpen(false);
            if (onboardingStep === 'auth') setOnboardingStep('ready');
          }}
        />
      )}

      {/* 3. Profile Setup Modal (Full Name, College, Dept, Phone, Address, Gender, Photo) */}
      {(onboardingStep === 'profile_setup' || profileModalOpen) && (
        <ProfileSetupModal
          isOpen={true}
          user={pendingUser || currentUser}
          onComplete={handleProfileComplete}
        />
      )}

      {/* 4. Slide-out Profile Details Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onEditProfile={() => setProfileModalOpen(true)}
      />

      {/* Persistent Left Navigation Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Network Status Banner */}
        <NetworkStatusBanner />

        {/* Global Navigation Header with Clock, Weather, Search & User Avatar */}
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExploreCampusPage />} />
            <Route path="/find" element={<FindLocationPage />} />
            <Route path="/indoor" element={<IndoorNavPage />} />
            <Route path="/routes" element={<MyRoutesPage />} />
            <Route path="/directory" element={<CampusDirectoryPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <HashRouter>
      <CampusProvider>
        <AppContent />
      </CampusProvider>
    </HashRouter>
  );
}

export default App;
