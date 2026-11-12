import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampus } from '../context/CampusContext';
import {
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  Shield,
  Coffee,
  Car,
  HeartPulse,
  CreditCard,
  Trophy
} from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { facilities } = useCampus();

  const getFacilityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'canteen': return Coffee;
      case 'parking': return Car;
      case 'medical': return HeartPulse;
      case 'banking': return CreditCard;
      case 'sports': return Trophy;
      default: return MapPin;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <MapPin className="w-4 h-4" /> Amenities &amp; Services
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Campus Facilities &amp; Utilities
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Essential student services, visitor access gates, cafeteria, healthcare, banking, and parking stations.
        </p>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {facilities.map((fac) => {
          const IconComponent = getFacilityIcon(fac.facility_type);
          return (
            <div
              key={fac.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle hover:border-emerald-300 hover:shadow-premium transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {fac.facility_type}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {fac.name}
                  </h3>
                  {fac.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {fac.description}
                    </p>
                  )}
                </div>

                {fac.opening_information && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{fac.opening_information}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 font-semibold">
                  Lat: {fac.latitude.toFixed(4)}, Lng: {fac.longitude.toFixed(4)}
                </div>
                <button
                  onClick={() => navigate('/explore')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Show Pin
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
