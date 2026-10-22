import React, { useState } from 'react';
import { Building2, PlusCircle, User as UserIcon, LogOut, MapPin, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { DELHI_NCR_CITIES } from '@nctprop/shared';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, selectedCity, onCityChange, currentPage }) => {
  const { user, logout, loginWithPhone } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    loginWithPhone(phoneInput, nameInput || 'Property Owner');
    setShowLoginModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & City Selector */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('home')} 
                className="flex items-center space-x-2 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-brand-500 font-bold text-xl group-hover:scale-105 transition-transform shadow-sm">
                  <Building2 className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-extrabold text-xl text-slate-900 tracking-tight">NCT<span className="text-brand-600">prop</span><span className="text-xs text-slate-400 font-medium">.com</span></span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider hidden sm:block">Delhi-NCR Property Classifieds</p>
                </div>
              </button>

              {/* City Quick Picker */}
              <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-brand-600 ml-1.5" />
                <select
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 py-1 px-2 focus:outline-none cursor-pointer"
                >
                  <option value="">All Delhi-NCR</option>
                  {DELHI_NCR_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.displayName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => onNavigate('search', { type: 'rent' })}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${currentPage === 'search' ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Rent
              </button>
              <button
                onClick={() => onNavigate('search', { type: 'sale' })}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Buy
              </button>
              <button
                onClick={() => onNavigate('search', { posted_by: 'owner' })}
                className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Owner Listings</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => onNavigate('my-listings')}
                    className="flex items-center space-x-1.5 text-sm font-semibold text-slate-700 hover:text-brand-600 py-1.5 px-2 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>My Listings</span>
                  </button>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Log In
                </button>
              )}

              {/* Primary Call-to-Action */}
              <button
                onClick={() => onNavigate('post-property')}
                className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Free Property</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => onNavigate('post-property')}
                className="bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                Post Free
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">City Region</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  onCityChange(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-700 py-2 px-3 rounded-lg"
              >
                <option value="">All Delhi-NCR</option>
                {DELHI_NCR_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.displayName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => { onNavigate('search', { type: 'rent' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Rent Properties
            </button>
            <button
              onClick={() => { onNavigate('search', { type: 'sale' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Buy Properties
            </button>
            <button
              onClick={() => { onNavigate('search', { posted_by: 'owner' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
            >
              Direct Owner Listings (Zero Brokerage)
            </button>

            {user ? (
              <>
                <button
                  onClick={() => { onNavigate('my-listings'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  My Listings
                </button>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Logout ({user.phone})
                </button>
              </>
            ) : (
              <button
                onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 text-sm font-semibold text-brand-700 bg-brand-50 rounded-lg"
              >
                Log In with Phone OTP
              </button>
            )}
          </div>
        )}
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Welcome to NCTprop.com</h3>
              <p className="text-xs text-slate-500 mt-1">100% Free Property Classifieds for Delhi-NCR</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikas Gupta"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (WhatsApp Enabled) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm font-semibold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">We respect your privacy. No broker spam calls.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow transition-all"
              >
                Continue / Sign In
              </button>

              <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Protected by Firebase Secure Phone Auth</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
