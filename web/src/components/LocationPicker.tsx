import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Check, X, PlusCircle, Loader2 } from 'lucide-react';
import { DELHI_NCR_CITIES } from '@nctprop/shared';

interface LocationPickerProps {
  selectedCity: string;
  selectedLocality: string;
  onSelect: (city: string, locality: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
}

interface LocalityItem {
  city: string;
  locality: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedCity,
  selectedLocality,
  onSelect,
  placeholder = 'Search locality or colony (e.g. Chander Vihar, Sector 62)...',
  allowCustom = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(selectedLocality || '');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize internal text when external prop changes
  useEffect(() => {
    setSearchQuery(selectedLocality || '');
  }, [selectedLocality]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build searchable index of all localities across Delhi-NCR
  const allLocalities: LocalityItem[] = [];
  DELHI_NCR_CITIES.forEach((c) => {
    c.localities.forEach((loc) => {
      allLocalities.push({ city: c.name, locality: loc });
    });
  });

  // Filter based on search query and city
  const query = searchQuery.trim().toLowerCase();
  let filtered = allLocalities.filter((item) => {
    // If a specific city is selected and not empty, prioritize/filter by that city
    if (selectedCity && selectedCity !== 'All Delhi-NCR' && item.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (!query) return true;
    return item.locality.toLowerCase().includes(query) || item.city.toLowerCase().includes(query);
  });

  // Exact match check
  const hasExactMatch = filtered.some((f) => f.locality.toLowerCase() === query);

  const handleSelect = (city: string, locality: string) => {
    setSearchQuery(locality);
    onSelect(city, locality);
    setIsOpen(false);
  };

  // 100% Free HTML5 + OpenStreetMap Geolocation detection
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // OpenStreetMap Nominatim reverse geocode (Free & Open Source)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const detectedArea = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || 'My Locality';
            
            // Map detected state/city to Delhi-NCR city
            let detectedCity = 'Delhi';
            const cityText = (addr.city || addr.town || addr.county || addr.state_district || addr.state || '').toLowerCase();
            if (cityText.includes('noida') || cityText.includes('gautam buddha')) {
              detectedCity = cityText.includes('greater') ? 'Greater Noida' : 'Noida';
            } else if (cityText.includes('gurgaon') || cityText.includes('gurugram')) {
              detectedCity = 'Gurugram';
            } else if (cityText.includes('ghaziabad')) {
              detectedCity = 'Ghaziabad';
            } else if (cityText.includes('faridabad')) {
              detectedCity = 'Faridabad';
            }

            handleSelect(detectedCity, detectedArea);
          }
        } catch (err) {
          console.warn('Geolocation reverse lookup failed:', err);
          alert('Could not detect exact locality name. Please type your locality.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        alert('Location permission was denied or unavailable. Please type your location manually.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative">
        <MapPin className="w-4 h-4 text-brand-600 absolute left-3 top-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 placeholder:font-normal"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onSelect(selectedCity, '');
            }}
            className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          
          {/* Top Bar: Free GPS Auto-detect */}
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-brand-600" />
                  <span>📍 Use Current Location (Auto-detect)</span>
                </>
              )}
            </button>
          </div>

          {/* Custom Locality Option (When typed something not in list, e.g. Chander Vihar Block B) */}
          {allowCustom && query.length > 1 && !hasExactMatch && (
            <div className="p-2 border-b border-emerald-100 bg-emerald-50/70">
              <button
                type="button"
                onClick={() => handleSelect(selectedCity || 'Delhi', searchQuery.trim())}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-emerald-100/70 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Use "{searchQuery.trim()}"
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Add as custom locality in {selectedCity || 'Delhi-NCR'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                  Select
                </span>
              </button>
            </div>
          )}

          {/* Results List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 text-xs">
            {filtered.length > 0 ? (
              filtered.slice(0, 30).map((item, idx) => {
                const isSelected = selectedLocality.toLowerCase() === item.locality.toLowerCase();
                return (
                  <button
                    key={`${item.city}-${item.locality}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(item.city, item.locality)}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                      isSelected ? 'bg-brand-50 text-brand-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-semibold text-slate-800 block text-xs">{item.locality}</span>
                        <span className="text-[10px] text-slate-400">{item.city}, Delhi-NCR</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-500">
                <p className="font-semibold text-xs text-slate-700">No matching preset locality found</p>
                {allowCustom && query && (
                  <button
                    type="button"
                    onClick={() => handleSelect(selectedCity || 'Delhi', searchQuery.trim())}
                    className="mt-3 px-3.5 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 shadow"
                  >
                    Select "{searchQuery.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
