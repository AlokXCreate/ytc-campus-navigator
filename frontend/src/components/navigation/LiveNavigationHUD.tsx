import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  X,
  Compass,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  Flag,
  Navigation,
  CheckCircle2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { RouteStep, RouteResult } from '../../types/campus';
import { voiceNavigation } from '../../services/voiceNavigation';

interface LiveNavigationHUDProps {
  routeResult: RouteResult;
  destinationName: string;
  destinationBuildingId?: string;
  onExit: () => void;
  onStepChange?: (stepIndex: number, currentCoord: [number, number]) => void;
  onContinueIndoor?: () => void;
}

export const LiveNavigationHUD: React.FC<LiveNavigationHUDProps> = ({
  routeResult,
  destinationName,
  destinationBuildingId,
  onExit,
  onStepChange,
  onContinueIndoor
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(voiceNavigation.getMuted());
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x or 2x
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = routeResult.steps || [];
  const totalSteps = steps.length;
  const currentStep: RouteStep | undefined = steps[currentStepIndex];
  const nextStep: RouteStep | undefined = steps[currentStepIndex + 1];

  // Calculate remaining distance and time from current step to end
  const remainingDistance = Math.round(
    steps.slice(currentStepIndex).reduce((acc, s) => acc + (s.distance_meters || 0), 0)
  );
  const remainingMinutes = Math.max(1, Math.round(remainingDistance / 75)); // ~75m per min walk

  // Compute Estimated Time of Arrival (ETA)
  const etaString = React.useMemo(() => {
    const d = new Date(Date.now() + remainingMinutes * 60 * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [remainingMinutes]);

  // Determine maneuver icon based on instruction text and bearing
  const getManeuverIcon = (step?: RouteStep) => {
    if (!step) return ArrowUp;
    const text = step.instruction.toLowerCase();
    const bearing = (step.bearing || '').toLowerCase();

    if (text.includes('arrive') || text.includes('destination') || bearing.includes('arrive')) {
      return Flag;
    }
    if (text.includes('sharp left')) return CornerUpLeft;
    if (text.includes('sharp right')) return CornerUpRight;
    if (text.includes('left') || bearing.includes('west')) return ArrowUpLeft;
    if (text.includes('right') || bearing.includes('east')) return ArrowUpRight;
    return ArrowUp;
  };

  const ManeuverIcon = getManeuverIcon(currentStep);

  // Announce route start once on mount
  useEffect(() => {
    voiceNavigation.announceRouteStart(
      destinationName,
      routeResult.total_distance_meters,
      routeResult.estimated_walk_time_minutes
    );
  }, [destinationName, routeResult]);

  // When step changes, speak the maneuver and update parent coordinate
  useEffect(() => {
    if (!currentStep) return;

    if (currentStepIndex === totalSteps - 1 || currentStep.instruction.toLowerCase().includes('arrive')) {
      voiceNavigation.announceArrival(destinationName);
    } else {
      voiceNavigation.announceManeuver(currentStep.instruction, currentStep.distance_meters);
    }

    // Pass coordinate to parent map to pan/center
    if (onStepChange && routeResult.geometry) {
      // Find approximate coordinate for this step
      const geomIndex = Math.min(
        Math.floor((currentStepIndex / Math.max(1, totalSteps - 1)) * (routeResult.geometry.length - 1)),
        routeResult.geometry.length - 1
      );
      const coord = routeResult.geometry[geomIndex];
      if (coord) {
        onStepChange(currentStepIndex, coord);
      }
    }
  }, [currentStepIndex]);

  // Handle Simulation Auto-Walk Loop
  useEffect(() => {
    if (!isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      return;
    }

    simulationTimerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          setIsSimulating(false);
          return prev;
        }
      });
    }, (4500 / simSpeed));

    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isSimulating, simSpeed, totalSteps]);

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const toggleVoiceMute = () => {
    const muted = voiceNavigation.toggleMute();
    setIsMuted(muted);
  };

  const handleRepeatVoice = () => {
    if (currentStep) {
      voiceNavigation.speak(currentStep.instruction, true);
    }
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / Math.max(1, totalSteps)) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none z-[1000] flex flex-col justify-between p-3 sm:p-5">
      {/* 1. TOP MANEUVER BANNER (Google Maps Style) */}
      <div className="pointer-events-auto max-w-xl w-full mx-auto animate-in slide-in-from-top-4 duration-300">
        <div className="bg-gradient-to-r from-[#0a192f] via-[#0d2347] to-[#0a192f] border-2 border-emerald-400/80 rounded-3xl p-4 sm:p-5 text-white shadow-2xl shadow-black/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            
            {/* Maneuver Big Arrow Badge */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <ManeuverIcon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-pulse" />
            </div>

            {/* Turn & Distance Guidance Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                  {currentStep?.distance_meters ? `In ${Math.round(currentStep.distance_meters)} m` : 'Now'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight truncate mt-0.5">
                {currentStep?.instruction || 'Follow walking path towards destination'}
              </h2>

              {nextStep && (
                <p className="text-[11px] text-slate-300 truncate mt-1 flex items-center gap-1.5 opacity-90">
                  <span className="text-slate-400">Then:</span>
                  <span>{nextStep.instruction}</span>
                </p>
              )}
            </div>

            {/* Audio Voice Control Buttons */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={toggleVoiceMute}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                    : 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-md shadow-emerald-500/20'
                }`}
                title={isMuted ? 'Unmute Voice Navigation' : 'Mute Voice Navigation'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
              </button>

              <button
                onClick={handleRepeatVoice}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 transition-colors cursor-pointer"
                title="Repeat Spoken Direction"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-300 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. BOTTOM FLOATING NAVIGATION COCKPIT */}
      <div className="pointer-events-auto max-w-xl w-full mx-auto space-y-2 animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Optional Indoor Transition Pill (if nearing building) */}
        {destinationBuildingId && (currentStepIndex >= totalSteps - 2) && onContinueIndoor && (
          <div className="flex justify-center">
            <button
              onClick={onContinueIndoor}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-xl flex items-center gap-2 border border-blue-300/40 animate-bounce cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>Nearing Entrance • Switch to Indoor Floor Blueprint</span>
            </button>
          </div>
        )}

        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/80 text-white">
          <div className="flex items-center justify-between gap-4">
            
            {/* Travel Time, Remaining Distance & ETA */}
            <div className="flex items-center gap-3">
              <div className="text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 leading-none">
                    {remainingMinutes}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">min</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1 flex items-center gap-2">
                  <span>{remainingDistance} m remaining</span>
                  <span>&bull;</span>
                  <span className="text-amber-300 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {etaString}
                  </span>
                </div>
              </div>
            </div>

            {/* Center Controls: Prev/Next & Simulation */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors cursor-pointer"
                title="Previous Turn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Simulation Auto-Walk Button */}
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSimulating
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
                title={isSimulating ? 'Pause Walk Simulation' : 'Simulate GPS Walking Animation'}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Walking...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Simulate Walk</span>
                    <span className="sm:hidden">Sim</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStepIndex >= totalSteps - 1}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors cursor-pointer"
                title="Next Turn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Exit Navigation Red Button */}
            <button
              onClick={() => {
                if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
                voiceNavigation.setMuted(true);
                onExit();
              }}
              className="p-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0 shadow-md"
              title="Exit Navigation"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
