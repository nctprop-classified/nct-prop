import React from 'react';
import { Building2, Shield, Heart } from 'lucide-react';
import { DELHI_NCR_CITIES } from '@nctprop/shared';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">NCT<span className="text-brand-500">prop</span>.com</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Delhi-NCR's transparent, 100% free property classifieds portal. Connect directly with owners and trusted agents across Delhi, Gurgaon, Noida, Ghaziabad, and Faridabad via WhatsApp.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
              <Shield className="w-4 h-4 text-brand-500" />
              <span>Zero brokerage options • No spam calls</span>
            </div>
          </div>

          {/* Delhi-NCR Cities */}
          <div>
            <h4 className="font-bold text-slate-100 text-sm mb-3">Popular Regions</h4>
            <ul className="space-y-2">
              {DELHI_NCR_CITIES.map((city) => (
                <li key={city.name}>
                  <button
                    onClick={() => onNavigate('search', { city: city.name })}
                    className="hover:text-white transition-colors"
                  >
                    Properties in {city.displayName}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-100 text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('search', { type: 'rent' })} className="hover:text-white">
                  Flats for Rent in Delhi-NCR
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search', { type: 'sale' })} className="hover:text-white">
                  Flats & Plots for Sale
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search', { posted_by: 'owner' })} className="hover:text-white text-emerald-400">
                  Direct Owner Listings (Zero Brokerage)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('post-property')} className="hover:text-white font-semibold text-brand-400">
                  + Post Free Property Ad
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('neighborhood-guides')} className="hover:text-white">
                  Delhi-NCR Area Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & AdSense Compliance */}
          <div>
            <h4 className="font-bold text-slate-100 text-sm mb-3">Legal & Support</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white">About NCTprop.com</button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-white">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-white">Terms of Service</button>
              </li>
              <li>
                <button onClick={() => onNavigate('disclaimer')} className="hover:text-white">Real Estate Disclaimer</button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white">Contact & Support</button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} NCTprop.com. All rights reserved. Made for Delhi-NCR.</p>

          {/* GrowthMachine Studio Credit Badge */}
          <div>
            <a
              href="https://www.growthmachinestudio.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Web Design Company in Delhi | GrowthMachine Studio"
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/95 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 shadow-md hover:shadow-emerald-950/30 transition-all duration-200"
            >
              {/* Pulsing / Blinking Circle */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              <span className="text-[11px] font-medium text-slate-300 group-hover:text-white transition-colors tracking-wide">
                Designed by{' '}
                <span className="font-bold text-emerald-400 group-hover:text-emerald-300">
                  GrowthMachine Studio
                </span>
              </span>
              <span className="text-amber-400 text-xs group-hover:scale-125 transition-transform">⚡</span>
            </a>
          </div>

          <p className="flex items-center space-x-1">
            <span>Serverless on Cloudflare</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center text-brand-400">
              <Heart className="w-3 h-3 text-rose-500 inline mx-1 fill-rose-500" /> Free for all users
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
