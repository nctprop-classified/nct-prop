import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, MapPin, Building, ShieldCheck, X, RotateCcw } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { AdSlot } from '../components/AdSlot';
import { DELHI_NCR_CITIES, Listing, ListingFilter, getLocalitiesByCity } from '@nctprop/shared';
import { fetchListings } from '../lib/api';

interface SearchResultsPageProps {
  initialFilters: ListingFilter;
  onNavigate: (page: string, params?: any) => void;
  onCityChange: (city: string) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ initialFilters, onNavigate, onCityChange }) => {
  const [filters, setFilters] = useState<ListingFilter>(initialFilters);
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      try {
        const res = await fetchListings(filters);
        if (res.success) {
          setListings(res.data || []);
          setTotalCount(res.pagination?.total || 0);
          setTotalPages(res.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [filters]);

  const updateFilter = (key: keyof ListingFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1 // Reset page on filter change
    }));
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 15 });
  };

  const localities = filters.city ? getLocalitiesByCity(filters.city) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {filters.city ? `Properties in ${filters.city}` : 'Delhi-NCR Properties'}
            {filters.type && ` for ${filters.type.toUpperCase()}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing <span className="font-bold text-slate-800">{totalCount}</span> verified listings
            {filters.posted_by === 'owner' && ' (Direct Owner Only)'}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={filters.sort || 'recent'}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-white border border-slate-300 text-xs font-semibold text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="recent">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-1.5 font-bold text-sm text-slate-900">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filter Search</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Owner Only Toggle */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.posted_by === 'owner'}
                onChange={(e) => updateFilter('posted_by', e.target.checked ? 'owner' : undefined)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Owner Only Listings</span>
                </span>
                <p className="text-[10px] text-emerald-600 mt-0.5">Filter out brokers & avoid brokerage charges</p>
              </div>
            </label>
          </div>

          {/* Type (Rent / Sale) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Purpose</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: '', label: 'All' },
                { id: 'rent', label: 'Rent' },
                { id: 'sale', label: 'Buy' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateFilter('type', t.id || undefined)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    (filters.type || '') === t.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
            <select
              value={filters.city || ''}
              onChange={(e) => {
                updateFilter('city', e.target.value);
                updateFilter('locality', undefined);
                onCityChange(e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Delhi-NCR</option>
              {DELHI_NCR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>{c.displayName}</option>
              ))}
            </select>
          </div>

          {/* Locality */}
          {localities.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sector / Locality</label>
              <select
                value={filters.locality || ''}
                onChange={(e) => updateFilter('locality', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Sectors</option>
                {localities.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          )}

          {/* Bedrooms / BHK */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Bedrooms (BHK)</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: undefined, label: 'Any' },
                { id: 1, label: '1 BHK' },
                { id: 2, label: '2 BHK' },
                { id: 3, label: '3 BHK' },
                { id: 4, label: '4+ BHK' }
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => updateFilter('bedrooms', b.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    filters.bedrooms === b.id
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Categories</option>
              <option value="residential">Residential Apartment / Floor</option>
              <option value="commercial">Commercial Shop / Office</option>
              <option value="plot">Plot / Land</option>
              <option value="pg">PG / Co-Living</option>
            </select>
          </div>
        </aside>

        {/* Results Main Section */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    onClick={(id) => onNavigate('listing-detail', { id })}
                  />
                ))}
              </div>

              {/* In-feed AdSlot */}
              <AdSlot slotId="search-results-infeed" className="mt-8" />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    disabled={(filters.page || 1) <= 1}
                    onClick={() => updateFilter('page', (filters.page || 1) - 1)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-600 font-semibold px-2">
                    Page {filters.page || 1} of {totalPages}
                  </span>
                  <button
                    disabled={(filters.page || 1) >= totalPages}
                    onClick={() => updateFilter('page', (filters.page || 1) + 1)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No properties found matching your criteria</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your price range, clearing specific sector filters, or browse all Delhi-NCR listings.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => onNavigate('post-property')}
                  className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 shadow"
                >
                  Post Property in this Area
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-base">Filter Search</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Same mobile filter options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg text-sm"
                >
                  <option value="">All Delhi-NCR</option>
                  {DELHI_NCR_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg text-sm"
                >
                  <option value="">Rent or Buy</option>
                  <option value="rent">Rent Only</option>
                  <option value="sale">Buy Only</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  checked={filters.posted_by === 'owner'}
                  onChange={(e) => updateFilter('posted_by', e.target.checked ? 'owner' : undefined)}
                />
                <span>Owner Only (0 Brokerage)</span>
              </label>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-brand-600 text-white font-bold text-sm rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
