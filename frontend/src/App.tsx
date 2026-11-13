import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampusProvider, useCampus } from './context/CampusContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { IntroSplash } from './components/common/IntroSplash';
import { NetworkStatusBanner } from './components/common/NetworkStatusBanner';

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

const AppContent: React.FC = () => {
  const { showIntro, dismissIntro } = useCampus();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Subtle Intro Opening Screen (4s auto or skip, session remembered) */}
      {showIntro && <IntroSplash onDismiss={dismissIntro} />}

      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Offline / Online Network Status Bar */}
        <NetworkStatusBanner />

        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
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
