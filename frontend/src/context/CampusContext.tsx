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
  userRole: 'student' | 'faculty' | 'visitor' | 'admin' | 'superadmin' | 'campus_admin' | 'viewer';
  currentUser: User | null;
  loginAdmin: (token: string, user: User) => void;
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

  const loginAdmin = (token: string, user: User) => {
    api.setAuthToken(token);
    setCurrentUser(user);
    setUserRole(user.role as any);
    try {
      localStorage.setItem('ytc_auth_user', JSON.stringify(user));
    } catch {}
  };

  const logoutAdmin = () => {
    api.setAuthToken(null);
    setCurrentUser(null);
    setUserRole('student');
    try {
      localStorage.removeItem('ytc_auth_user');
    } catch {}
  };

  // Check intro session state
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const seen = sessionStorage.getItem('ytc_intro_seen');
      return seen !== 'true';
    } catch {
      return false;
    }
  });

  const dismissIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('ytc_intro_seen', 'true');
    } catch {}
  };

  const replayIntro = () => {
    setShowIntro(true);
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
        userRole,
        currentUser,
        loginAdmin,
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
