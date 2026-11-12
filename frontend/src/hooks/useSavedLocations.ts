import { useState, useEffect } from 'react';
import { SavedLocation } from '../types/campus';

const STORAGE_KEY = 'ytc_saved_locations';

const defaultSaved: SavedLocation[] = [
  {
    id: 'poi-aids-dept',
    name: 'AI & Data Science Dept (Floor 2)',
    category: 'department',
    latitude: 17.7222,
    longitude: 74.0207,
    building_name: 'Engineering & Technology Block',
    created_at: Date.now(),
  },
  {
    id: 'poi-library',
    name: 'Central Library Knowledge Hub',
    category: 'library',
    latitude: 17.7213,
    longitude: 74.0211,
    building_name: 'Central Library',
    created_at: Date.now(),
  },
  {
    id: 'poi-canteen',
    name: 'Student Cafeteria & Food Court',
    category: 'canteen',
    latitude: 17.7209,
    longitude: 74.0199,
    building_name: 'Student Cafeteria',
    created_at: Date.now(),
  },
];

export const useSavedLocations = () => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultSaved;
    } catch {
      return defaultSaved;
    }
  });

  const saveLocation = (location: Omit<SavedLocation, 'created_at'>) => {
    setSavedLocations((prev) => {
      if (prev.some((item) => item.id === location.id)) {
        return prev;
      }
      const updated = [{ ...location, created_at: Date.now() }, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeLocation = (id: string) => {
    setSavedLocations((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isSaved = (id: string) => savedLocations.some((item) => item.id === id);

  return { savedLocations, saveLocation, removeLocation, isSaved };
};
