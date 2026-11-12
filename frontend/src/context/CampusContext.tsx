import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building, Facility, Room, CampusSummary } from '../types/campus';
import { api } from '../services/api';

interface CampusContextType {
  summary: CampusSummary | null;
  buildings: Building[];
  facilities: Facility[];
  selectedBuilding: Building | null;
  selectedFacility: Facility | null;
  selectedRoom: Room | null;
  isOnline: boolean;
  isLoading: boolean;
  showIntro: boolean;
  userRole: 'student' | 'faculty' | 'visitor' | 'admin';
  setUserRole: (role: 'student' | 'faculty' | 'visitor' | 'admin') => void;
  setSelectedBuilding: (b: Building | null) => void;
  setSelectedFacility: (f: Facility | null) => void;
  setSelectedRoom: (r: Room | null) => void;
  dismissIntro: () => void;
  replayIntro: () => void;
  refreshData: () => Promise<void>;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summary, setSummary] = useState<CampusSummary | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'visitor' | 'admin'>('student');

  // Check introductory animation session state
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
    } catch {
      // ignore
    }
  };

  const replayIntro = () => {
    setShowIntro(true);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, bldgRes, facRes] = await Promise.all([
        api.getCampusSummary(),
        api.getBuildings(),
        api.getFacilities(),
      ]);

      setSummary(sumRes.data);
      setBuildings(bldgRes.data);
      setFacilities(facRes.data);
      setIsOnline(!sumRes.fromCache);
    } catch (err) {
      console.warn("Campus data sync note:", err);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <CampusContext.Provider
      value={{
        summary,
        buildings,
        facilities,
        selectedBuilding,
        selectedFacility,
        selectedRoom,
        isOnline,
        isLoading,
        showIntro,
        userRole,
        setUserRole,
        setSelectedBuilding,
        setSelectedFacility,
        setSelectedRoom,
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
