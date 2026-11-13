import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, X, CheckCircle2 } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

export const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = useCampus();
  const [dismissed, setDismissed] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
      setJustReconnected(false);
    } else {
      // Show brief reconnected pill
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (dismissed && !justReconnected) return null;

  if (!isOnline) {
    return (
      <aside aria-label="Offline Mode Notification" className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm z-30 transition-all">
        <div className="flex items-center space-x-2.5 max-w-5xl mx-auto w-full">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <WifiOff className="w-3.5 h-3.5 text-amber-100" />
          </div>
          <span className="truncate">
            <strong className="font-semibold">Offline Mode Active:</strong> You are currently disconnected. Yashoda Technical Campus cached maps, offline pathways, and indoor floor plans remain fully accessible.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition shrink-0 ml-2"
          aria-label="Dismiss offline banner"
        >
          <X className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  if (justReconnected) {
    return (
      <aside aria-label="Online Notification" className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-center space-x-2 shadow-sm z-30 animate-in fade-in slide-in-from-top-1 duration-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
        <span>Connection restored • Live YTC campus updates and dynamic routing enabled.</span>
      </aside>
    );
  }

  return null;
};
