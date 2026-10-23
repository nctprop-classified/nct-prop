import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, ShieldCheck, ArrowRight, Home, Sparkles, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { AdSlot } from '../components/AdSlot';
import { LocationPicker } from '../components/LocationPicker';
import { DELHI_NCR_CITIES, Listing, getLocalitiesByCity } from '@nctprop/shared';
import { fetchListings } from '../lib/api';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, selectedCity, onCityChange }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'rent' | 'sale' | 'pg'>('rent');
  const [searchCity, setSearchCity] = useState(selectedCity || 'Noida');
  const [searchLocality, setSearchLocality] = useState('');
  const [ownerOnly, setOwnerOnly] = useState(false);
  const [bedrooms, setBedrooms] = useState<number | ''>('');

  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCity) setSearchCity(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [featuredRes, recentRes] = await Promise.all([
          fetchListings({ featured: true, limit: 3 }),
          fetchListings({ limit: 6 })
        ]);
        if (featuredRes.success) setFeaturedListings(featuredRes.data || []);
        if (recentRes.success) setRecentListings(recentRes.data || []);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search', {
      type: activeTab === 'all' || activeTab === 'pg' ? undefined : activeTab,
      category: activeTab === 'pg' ? 'pg' : undefined,
      city: searchCity || undefined,
      locality: searchLocality || undefined,
      posted_by: ownerOnly ? 'owner' : undefined,
      bedrooms: bedrooms !== '' ? bedrooms : undefined
    });
  };

  const localitiesForSelected = getLocalitiesByCity(searchCity);

  return (
    <div className="space-y-12">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-400 mb-2">
            <Zap className="w-3.5 h-3.5 fill-brand-400" />
            <span>100% Free for Buyers, Tenants & Property Owners in Delhi-NCR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Find Your Next Home in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">Delhi-NCR</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Zero brokerage fees, direct WhatsApp contact with owners and verified local agents across Delhi, Noida, Gurgaon, Ghaziabad & Faridabad.
          </p>

          {/* Search Box Card */}
          <div className="mt-8 bg-white rounded-2xl p-4 sm:p-6 text-slate-800 shadow-2xl max-w-4xl mx-auto text-left">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-4 pb-1 space-x-2 sm:space-x-4">
              {[
                { id: 'rent', label: 'Rent Flat / Floor' },
                { id: 'sale', label: 'Buy Property' },
                { id: 'pg', label: 'PG / Co-Living' },
                { id: 'all', label: 'All Listings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">City / Region</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={searchCity}
                    onChange={(e) => {
                      setSearchCity(e.target.value);
                      setSearchLocality('');
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">All Delhi-NCR</option>
                    {DELHI_NCR_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Locality Search Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sector / Locality</label>
                <LocationPicker
                  selectedCity={searchCity}
                  selectedLocality={searchLocality}
                  onSelect={(detectedCity, newLocality) => {
                    if (detectedCity) setSearchCity(detectedCity);
                    setSearchLocality(newLocality);
                  }}
                  placeholder="e.g. Chander Vihar, Sector 62..."
                  allowCustom={true}
                />
              </div>

              {/* BHK Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">BHK Requirement</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>
            </form>

            {/* Quick Toggle: Direct Owner Only */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <label className="inline-flex items-center space-x-2 cursor-pointer font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  checked={ownerOnly}
                  onChange={(e) => setOwnerOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-emerald-300"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Show Direct Owner Listings Only (Zero Brokerage)</span>
              </label>

              <span className="text-slate-400 hidden sm:inline">
                Covering: Noida, Greater Noida, Gurugram, Delhi, Ghaziabad, Faridabad
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick City Navigation Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Explore by Delhi-NCR Region</h2>
            <p className="text-xs sm:text-sm text-slate-500">Pick your preferred city to view verified homes & commercial units</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DELHI_NCR_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                onCityChange(city.name);
                onNavigate('search', { city: city.name });
              }}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-500 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-700 group-hover:text-brand-600 mb-2 transition-colors">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600">{city.name}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{city.localities.length}+ Major Hubs</p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Properties</h2>
            </div>
            <button
              onClick={() => onNavigate('search', { featured: '1' })}
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All Featured</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                onClick={(id) => onNavigate('listing-detail', { id })}
              />
            ))}
          </div>
        </section>
      )}

      {/* AdSense Slot 1 (Mid-page) */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId="home-mid-banner" />
      </div>

      {/* Recent Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Fresh Listings in Delhi-NCR</h2>
            <p className="text-xs sm:text-sm text-slate-500">Recently added flats, builder floors, and independent houses</p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : recentListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentListings.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                onClick={(id) => onNavigate('listing-detail', { id })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold">No active listings yet.</p>
            <p className="text-slate-400 text-xs mt-1">Be the first to post your property on NCTprop.com!</p>
            <button
              onClick={() => onNavigate('post-property')}
              className="mt-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Post Free Property Ad
            </button>
          </div>
        )}
      </section>

      {/* Why Choose NCTprop.com Value Proposition Section */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold">Why Delhi-NCR Trusts NCTprop.com</h2>
          <p className="text-slate-400 text-sm">
            Tired of aggressive broker spam calls and expensive portal listing fees? NCTprop is built differently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">100% Free Forever</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No hidden charges for property owners or tenants. Post unlimited residential and commercial listings with up to 5 photos for free.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-12 h-12 bg-brand-500/10 text-brand-400 rounded-xl flex items-center justify-center font-bold">
              <Zap className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-lg font-bold">Direct WhatsApp Connect</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Skip email forms that no one checks. Buyers connect straight to the owner or agent's WhatsApp with one tap.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold">No Stale / Dead Listings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Listings automatically expire after 45 days unless actively renewed by the owner. You only see currently available properties.
            </p>
          </div>
        </div>
      </section>

      {/* SEO & Locality Editorial Section (Crucial for Google AdSense Approval) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-600 text-xs leading-relaxed space-y-4">
        <h3 className="text-sm font-bold text-slate-800">About Delhi-NCR Real Estate & NCTprop Classifieds</h3>
        <p>
          The National Capital Region (NCR) comprises NCT of Delhi along with key urban growth engines including Gurugram (Gurgaon), Noida, Greater Noida, Ghaziabad, and Faridabad. Whether you are looking for ready-to-move builder floors in South Delhi or Dwarka, modern high-rise gated societies on Noida Expressway and Gaur City, or luxury condominiums along Golf Course Extension Road in Gurugram, NCTprop.com brings you verified, up-to-date listings with transparent pricing and zero brokerage options.
        </p>
        <p>
          All listings on NCTprop.com are published directly by individual house owners, NRIs, verified local property consultants, and authorized developers.
        </p>
      </section>

    </div>
  );
};
