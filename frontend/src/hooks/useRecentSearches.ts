import { useState } from 'react';

const RECENT_KEY = 'ytc_recent_searches';

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [
        'AI & DS Lab',
        'Central Library',
        'Director Office',
        'Cafeteria'
      ];
    } catch {
      return ['AI & DS Lab', 'Central Library', 'Director Office', 'Cafeteria'];
    }
  });

  const addSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8); // Keep last 8 searches
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  return { recentSearches, addSearch, addRecentSearch: addSearch, removeSearch, clearAllSearches };
};
