import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampusProvider, useCampus } from './context/CampusContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NetworkStatusBanner } from './components/common/NetworkStatusBanner';
import { ProfileDrawer } from './components/auth/ProfileDrawer';
import { User } from './types/campus';

// Dedicated Full-Screen Onboarding Flow Pages
import { IntroPage } from './pages/IntroPage';
import { AuthPage } from './pages/AuthPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';

// Main Application Pages
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

const AppContent: React.FC = () => {
  const {
    onboardingStep,
    setOnboardingStep,
    currentUser,
    loginUser
  } = useCampus();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(currentUser);

  // STAGE 1: Full-Screen Cinematic Intro (College Emblem & Sanskrit Motto)
  if (onboardingStep === 'intro') {
    return <IntroPage onComplete={() => setOnboardingStep('auth')} />;
  }

  // STAGE 2: Full-Screen Login / Sign Up / Guest Access Page
  if (onboardingStep === 'auth') {
    return (
      <AuthPage
        onSuccess={(user) => {
          setPendingUser(user);
          setOnboardingStep('profile_setup');
        }}
        onGuest={(guestUser) => {
          setPendingUser(guestUser);
          setOnboardingStep('profile_setup');
        }}
        onBackToIntro={() => setOnboardingStep('intro')}
      />
    );
  }

  // STAGE 3: Full-Screen Create Account & Profile Setup Page
  if (onboardingStep === 'profile_setup') {
    return (
      <ProfileSetupPage
        initialUser={pendingUser || currentUser}
        onComplete={(finalUser) => {
          loginUser(finalUser);
          setOnboardingStep('ready');
        }}
      />
    );
  }

  // STAGE 4: Main Campus Navigation Application
  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Slide-out Profile Details Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onEditProfile={() => setOnboardingStep('profile_setup')}
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
            <Route path="/" element={<ExploreCampusPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExploreCampusPage />} />
            <Route path="/find" element={<FindLocationPage />} />
            <Route path="/indoor" element={<IndoorNavPage />} />
            <Route path="/routes" element={<MyRoutesPage />} />
            <Route path="/directory" element={<CampusDirectoryPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<AdminPage />} />
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
