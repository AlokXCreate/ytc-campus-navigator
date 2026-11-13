import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Building,
  Facility,
  Room,
  PointOfInterest,
  CampusBoundary,
  CampusSummary,
  User
} from '../types/campus';
import { api } from '../services/api';
import { firebaseAuthService } from '../services/firebaseAuth';

export type OnboardingStep = 'intro' | 'auth' | 'profile_setup' | 'ready';

interface CampusContextType {
  summary: CampusSummary | null;
  buildings: Building[];
  facilities: Facility[];
  pointsOfInterest: PointOfInterest[];
  campusBoundary: CampusBoundary | null;
  selectedBuilding: Building | null;
  selectedFacility: Facility | null;
  selectedRoom: Room | null;
  selectedPOI: PointOfInterest | null;
  isOnline: boolean;
  isLoading: boolean;
  showIntro: boolean;
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;
  userRole: 'student' | 'faculty' | 'visitor' | 'admin' | 'superadmin' | 'campus_admin' | 'viewer';
  currentUser: User | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  loginUser: (user: User, token?: string) => void;
  loginAdmin: (token: string, user: User) => void;
  updateProfile: (data: Partial<User>) => void;
  logoutUser: () => void;
  logoutAdmin: () => void;
  setUserRole: (role: 'student' | 'faculty' | 'visitor' | 'admin' | 'superadmin' | 'campus_admin' | 'viewer') => void;
  setSelectedBuilding: (b: Building | null) => void;
  setSelectedFacility: (f: Facility | null) => void;
  setSelectedRoom: (r: Room | null) => void;
  setSelectedPOI: (poi: PointOfInterest | null) => void;
  dismissIntro: () => void;
  replayIntro: () => void;
  refreshData: () => Promise<void>;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summary, setSummary] = useState<CampusSummary | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [campusBoundary, setCampusBoundary] = useState<CampusBoundary | null>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // User auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('ytc_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'visitor' | 'admin' | 'superadmin' | 'campus_admin' | 'viewer'>(() => {
    try {
      const stored = localStorage.getItem('ytc_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        return u.role || 'student';
      }
      return 'student';
    } catch {
      return 'student';
    }
  });

  // Intro & Onboarding state
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const seen = sessionStorage.getItem('ytc_intro_seen');
      return seen !== 'true';
    } catch {
      return false;
    }
  });

  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(() => {
    try {
      const storedUser = localStorage.getItem('ytc_auth_user');
      if (storedUser) return 'ready';
      const seen = sessionStorage.getItem('ytc_intro_seen');
      return seen === 'true' ? 'ready' : 'intro';
    } catch {
      return 'intro';
    }
  });

  const loginUser = (user: User, token?: string) => {
    const validToken = token || `token_${Date.now()}`;
    api.setAuthToken(validToken);
    setCurrentUser(user);
    setUserRole(user.role as any);
    try {
      localStorage.setItem('ytc_auth_user', JSON.stringify(user));
    } catch {}
  };

  const loginAdmin = (token: string, user: User) => {
    loginUser(user, token);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, ...data };
    setCurrentUser(updated);
    if (data.role) setUserRole(data.role as any);
    try {
      localStorage.setItem('ytc_auth_user', JSON.stringify(updated));
    } catch {}
  };

  const logoutUser = () => {
    api.setAuthToken(null);
    firebaseAuthService.logout();
    setCurrentUser(null);
    setUserRole('student');
    try {
      localStorage.removeItem('ytc_auth_user');
    } catch {}
  };

  const logoutAdmin = () => {
    logoutUser();
  };

  const dismissIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('ytc_intro_seen', 'true');
    } catch {}
    // If not authenticated, prompt auth/guest choice
    if (!currentUser) {
      setOnboardingStep('auth');
    } else {
      setOnboardingStep('ready');
    }
  };

  const replayIntro = () => {
    setShowIntro(true);
    setOnboardingStep('intro');
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, bldgRes, facRes, poiRes, boundRes] = await Promise.all([
        api.getCampusSummary(),
        api.getBuildings(),
        api.getFacilities(),
        api.getMapPoints(),
        api.getMapBoundary(),
      ]);

      setSummary(sumRes.data);
      setBuildings(bldgRes.data);
      setFacilities(facRes.data);
      setPointsOfInterest(poiRes.data);
      setCampusBoundary(boundRes.data);
      setIsOnline(!sumRes.fromCache && navigator.onLine);
    } catch (err) {
      console.warn("Campus data sync warning:", err);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshData();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <CampusContext.Provider
      value={{
        summary,
        buildings,
        facilities,
        pointsOfInterest,
        campusBoundary,
        selectedBuilding,
        selectedFacility,
        selectedRoom,
        selectedPOI,
        isOnline,
        isLoading,
        showIntro,
        onboardingStep,
        setOnboardingStep,
        userRole,
        currentUser,
        authModalOpen,
        setAuthModalOpen,
        profileModalOpen,
        setProfileModalOpen,
        loginUser,
        loginAdmin,
        updateProfile,
        logoutUser,
        logoutAdmin,
        setUserRole,
        setSelectedBuilding,
        setSelectedFacility,
        setSelectedRoom,
        setSelectedPOI,
        dismissIntro,
        replayIntro,
        refreshData,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = (): CampusContextType => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
