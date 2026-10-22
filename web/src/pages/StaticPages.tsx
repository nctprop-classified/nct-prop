import React from 'react';
import { ShieldCheck, Mail, MapPin, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

interface StaticPageProps {
  page: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact' | 'neighborhood-guides';
  onNavigate: (page: string, params?: any) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
        
        {page === 'about' && (
          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <div className="border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">About NCTprop.com</h1>
              <p className="text-xs text-slate-500 mt-1">Delhi-NCR's Dedicated 100% Free Property Classifieds Portal</p>
            </div>

            <p>
              <strong>NCTprop.com</strong> was founded with a straightforward mission: to eliminate the frustrating broker paywalls, spam phone calls, and high listing fees plaguing the real estate market across the National Capital Region (NCR).
            </p>

            <h3 className="text-base font-bold text-slate-900 pt-2">Our Coverage Across Delhi-NCR</h3>
            <p>
              While "NCT" honors the National Capital Territory of Delhi, our platform spans the entire economic corridor of Delhi-NCR:
            </p>
            <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-800 list-disc list-inside bg-slate-50 p-4 rounded-xl">
              <li>Delhi (Dwarka, Rohini, South Delhi, West Delhi)</li>
              <li>Gurugram (Cyber City, DLF Phases, Sohna Rd, Sectors 1-115)</li>
              <li>Noida & Greater Noida (Sectors 1-168, Noida Expressway, Gaur City)</li>
              <li>Ghaziabad (Indirapuram, Vaishali, Vasundhara, Raj Nagar Ext.)</li>
              <li>Faridabad (Neharpar, Sectors 14-89, Green Field Colony)</li>
            </ul>

            <h3 className="text-base font-bold text-slate-900 pt-2">Why We Are Free</h3>
            <p>
              We believe classified advertising for genuine owners, tenants, and verified local consultants should be accessible without restrictive paywalls. We monetize transparently through non-intrusive Google AdSense advertising and future optional premium featured placements.
            </p>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <div className="border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
              <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026</p>
            </div>

            <p>
              At NCTprop.com, accessible from https://nctprop.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by NCTprop.com and how we use it.
            </p>

            <h3 className="text-base font-bold text-slate-900">1. Information We Collect</h3>
            <p>
              When you post a property listing or register an account, we collect your name, mobile phone number, and city/locality details. We collect mobile numbers solely for enabling prospective buyers and tenants to connect with you via WhatsApp or telephone calls.
            </p>

            <h3 className="text-base font-bold text-slate-900">2. Google AdSense & Cookies</h3>
            <p>
              Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.nctprop.com and other sites on the internet. Visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy.
            </p>

            <h3 className="text-base font-bold text-slate-900">3. Direct WhatsApp Connect</h3>
            <p>
              When a buyer uses our "Chat on WhatsApp" feature, communication occurs directly via WhatsApp's end-to-end encrypted protocol. NCTprop does not eavesdrop on your private chats.
            </p>

            <h3 className="text-base font-bold text-slate-900">4. Contact Us</h3>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>privacy@nctprop.com</strong>.
            </p>
          </div>
        )}

        {page === 'terms' && (
          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <div className="border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Terms of Service</h1>
              <p className="text-xs text-slate-500 mt-1">User Agreement for NCTprop.com</p>
            </div>

            <p>
              By accessing or using NCTprop.com, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
            </p>

            <h3 className="text-base font-bold text-slate-900">1. Accurate Listings</h3>
            <p>
              Users agree to post only authentic, available properties in the Delhi-NCR region. Posting deceptive pricing, duplicate ads, or properties for which you do not have owner/authorized broker authorization is strictly prohibited and results in immediate ban.
            </p>

            <h3 className="text-base font-bold text-slate-900">2. Free Classifieds & Expiry</h3>
            <p>
              Listings are provided free of charge and remain active for 45 days. Users may renew active listings indefinitely without fees. We reserve the right to remove any spam or expired listing without notice.
            </p>
          </div>
        )}

        {page === 'disclaimer' && (
          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <div className="border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Real Estate & RERA Disclaimer</h1>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <strong>Important Notice:</strong> NCTprop.com is an online advertising and classifieds platform. We are not real estate agents, brokers, or legal escrows.
            </div>

            <p>
              Users are advised to independently verify all property documentation, ownership title deeds, local municipal sanctions (DDA, NOIDA, GMDA), and RERA registration numbers prior to entering into any financial transaction or signing lease agreements.
            </p>
          </div>
        )}

        {page === 'contact' && (
          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <div className="border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Contact & Support</h1>
              <p className="text-xs text-slate-500 mt-1">Get in touch with the NCTprop team</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <Mail className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">General Inquiries & AdSense</h3>
                <p className="text-xs text-slate-500">support@nctprop.com</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Headquarters</h3>
                <p className="text-xs text-slate-500">Connaught Place, New Delhi 110001, India</p>
              </div>
            </div>
          </div>
        )}

        {page === 'neighborhood-guides' && (
          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <div className="border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Delhi-NCR Locality Guides</h1>
              <p className="text-xs text-slate-500 mt-1">Comprehensive guides to living and investing across Delhi-NCR</p>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Noida Expressway & Sector 137/143</h3>
                <p className="text-xs text-slate-600">
                  Known for excellent connectivity via the Aqua Line Metro, wide 6-lane expressways, corporate IT hubs (Advant Navis, Oxygen Park), and affordable 2-3 BHK high-rise gated societies. Average rental range: ₹18,000 - ₹35,000/month.
                </p>
                <button
                  onClick={() => onNavigate('search', { city: 'Noida', locality: 'Sector 137' })}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View Sector 137 Listings →
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Gurugram: DLF Phase 3 & Cyber City</h3>
                <p className="text-xs text-slate-600">
                  The primary destination for millennial IT and management professionals working in Cyber Hub. Offers a vibrant mix of private builder floors, fully furnished 1RK/1BHK studio apartments, and shared accommodations. Average 1 BHK rent: ₹16,000 - ₹28,000/month.
                </p>
                <button
                  onClick={() => onNavigate('search', { city: 'Gurugram', locality: 'DLF Phase 3' })}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View DLF Phase 3 Listings →
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Dwarka, New Delhi</h3>
                <p className="text-xs text-slate-600">
                  One of Asia's largest planned residential sub-cities, featuring DDA housing societies, high-end private builder floors, and direct Blue Line & Airport Express metro links. Popular among defense, aviation, and central government employees.
                </p>
                <button
                  onClick={() => onNavigate('search', { city: 'Delhi', locality: 'Dwarka' })}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View Dwarka Listings →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
