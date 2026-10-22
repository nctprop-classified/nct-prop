import React, { useState } from 'react';
import { AuthProvider } from './lib/auth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { PostPropertyPage } from './pages/PostPropertyPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { StaticPages } from './pages/StaticPages';
import { ListingFilter } from '@nctprop/shared';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState<ListingFilter>({});
  const [activeListingId, setActiveListingId] = useState<string>('');
  const [staticPageType, setStaticPageType] = useState<'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact' | 'neighborhood-guides'>('about');

  const handleNavigate = (page: string, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'search') {
      const newFilters = { ...params };
      if (selectedCity && !newFilters.city) {
        newFilters.city = selectedCity;
      }
      setSearchFilters(newFilters);
      setCurrentPage('search');
    } else if (page === 'listing-detail') {
      setActiveListingId(params?.id || '');
      setCurrentPage('listing-detail');
    } else if (['about', 'privacy', 'terms', 'disclaimer', 'contact', 'neighborhood-guides'].includes(page)) {
      setStaticPageType(page as any);
      setCurrentPage('static');
    } else {
      setCurrentPage(page);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (currentPage === 'search') {
      setSearchFilters((prev) => ({ ...prev, city: city || undefined, locality: undefined, page: 1 }));
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        
        {/* Navigation Bar */}
        <Navbar
          onNavigate={handleNavigate}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          currentPage={currentPage}
        />

        {/* Content Body */}
        <main className="flex-1">
          {currentPage === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
            />
          )}

          {currentPage === 'search' && (
            <SearchResultsPage
              initialFilters={searchFilters}
              onNavigate={handleNavigate}
              onCityChange={handleCityChange}
            />
          )}

          {currentPage === 'listing-detail' && (
            <ListingDetailPage
              id={activeListingId}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'post-property' && (
            <PostPropertyPage
              onNavigate={handleNavigate}
              onSuccess={(newId) => handleNavigate('listing-detail', { id: newId })}
            />
          )}

          {currentPage === 'my-listings' && (
            <MyListingsPage
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'static' && (
            <StaticPages
              page={staticPageType}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer onNavigate={handleNavigate} />

      </div>
    </AuthProvider>
  );
}

export default App;
